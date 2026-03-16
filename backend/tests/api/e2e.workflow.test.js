const request = require("supertest");
const app = require("../../server");
const { expect } = require("chai");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Cart = require("../../models/CartItemModel");
const Order = require("../../models/OrderModel");

/**
 * End-to-End Test: Full User Workflow
 *
 * Tests the complete user journey:
 * 1. Browse menu (public, no auth)
 * 2. Register a new account
 * 3. Login with OTP verification
 * 4. Add items to cart
 * 5. Place an order
 * 6. View orders
 * 7. Cancel an order
 */
describe("E2E: Full User Workflow", function () {
    this.timeout(15000);

    const testUser = {
        name: "E2E Test User",
        email: "e2e_test_user@example.com",
        password: "testpass123",
        phone: "9876543210",
    };

    let authToken;
    let userId;
    let categoryId;
    let menuItemId;
    let orderId;

    // Cleanup before and after
    before(async () => {
        await User.deleteMany({ email: testUser.email });
    });

    after(async () => {
        await User.deleteMany({ email: testUser.email });
        if (userId) {
            await Cart.deleteMany({ userId });
            await Order.deleteMany({ userId });
        }
    });

    describe("Step 1: Browse Menu (Public)", () => {
        it("should fetch categories without authentication", async () => {
            const res = await request(app).get("/api/user/categories");
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");

            if (res.body.length > 0) {
                categoryId = res.body[0]._id;
                expect(res.body[0]).to.have.property("categoryName");
            }
        });

        it("should fetch menu items by category without authentication", async () => {
            if (!categoryId) return;

            const res = await request(app).get(`/api/user/menu/${categoryId}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");

            if (res.body.length > 0) {
                menuItemId = res.body[0]._id;
                expect(res.body[0]).to.have.property("name");
                expect(res.body[0]).to.have.property("price");
            }
        });
    });

    describe("Step 2: Register", () => {
        it("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/api/user/register")
                .send(testUser);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("message", "User registered successfully");
            expect(res.body.user).to.have.property("email", testUser.email);
        });

        it("should reject duplicate registration", async () => {
            const res = await request(app)
                .post("/api/user/register")
                .send(testUser);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("User already exists");
        });
    });

    describe("Step 3: Login", () => {
        it("should validate credentials and send OTP", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({ email: testUser.email, password: testUser.password });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("OTP sent to your registered email");
            expect(res.body).to.have.property("requiresOtp", true);
        });

        it("should verify OTP and return a JWT token", async () => {
            const user = await User.findOne({ email: testUser.email });

            const res = await request(app)
                .post("/api/user/verify-otp")
                .send({ email: testUser.email, otp: user.otp });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("token");
            expect(res.body.message).to.equal("Login successful");

            authToken = res.body.token;

            const jwt = require("jsonwebtoken");
            const decoded = jwt.decode(authToken);
            userId = decoded.id;
        });

        it("should reject login with wrong password", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({ email: testUser.email, password: "wrongpassword" });

            expect(res.status).to.equal(401);
        });
    });

    describe("Step 4: Add to Cart", () => {
        it("should reject adding to cart without a token", async () => {
            const res = await request(app)
                .post("/api/user/cart")
                .send({ userId, items: [] });

            expect(res.status).to.equal(401);
        });

        it("should add an item to cart with a valid token", async () => {
            const itemId = menuItemId || new mongoose.Types.ObjectId().toString();

            const res = await request(app)
                .post("/api/user/cart")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    userId,
                    items: [{
                        itemId,
                        name: "Test Pizza",
                        price: 350,
                        quantity: 2,
                    }],
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("message", "Item added to cart");
        });

        it("should fetch cart items for the logged-in user", async () => {
            const res = await request(app)
                .get(`/api/user/cart/${userId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.greaterThan(0);
        });
    });

    describe("Step 5: Place Order", () => {
        it("should place an order successfully", async () => {
            const res = await request(app)
                .post("/api/user/order")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    userId,
                    addressId: new mongoose.Types.ObjectId().toString(),
                    items: [{
                        itemId: menuItemId || new mongoose.Types.ObjectId().toString(),
                        name: "Test Pizza",
                        price: 350,
                        quantity: 2,
                    }],
                    totalAmount: 700,
                    deliveryMode: "delivery",
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("order");
            expect(res.body.order).to.have.property("orderStatus", "pending");
            orderId = res.body.order._id;
        });
    });

    describe("Step 6: View Orders", () => {
        it("should fetch the user's orders", async () => {
            const res = await request(app)
                .get(`/api/user/orders/${userId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.greaterThan(0);

            const found = res.body.find((o) => o._id === orderId);
            expect(found).to.exist;
        });
    });

    describe("Step 7: Cancel Order", () => {
        it("should cancel the order", async () => {
            const res = await request(app)
                .put(`/api/user/order/cancel/${orderId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.order).to.have.property("orderStatus", "cancelled");
        });
    });
});
