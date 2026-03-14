const request = require("supertest");
const app = require("../../server");
const { expect } = require("chai");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Order = require("../../models/OrderModel");

describe("Orders API", function() {
    this.timeout(10000);

    const userId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign({ id: userId, role: "customer" }, process.env.JWT_SECRET);
    let createdOrderId;

    // Cleanup test orders after all tests
    after(async () => {
        await Order.deleteMany({ userId });
    });

    describe("POST /api/user/order", () => {
        it("should place an order", async () => {
            const res = await request(app)
                .post("/api/user/order")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    addressId: new mongoose.Types.ObjectId().toString(),
                    items: [{ itemId: new mongoose.Types.ObjectId().toString(), name: "Test Pizza", price: 300, quantity: 1 }],
                    deliveryMode: "delivery"
                });
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("order");
            createdOrderId = res.body.order._id;
        });

        it("should return 401 without token", async () => {
            const res = await request(app).post("/api/user/order").send({});
            expect(res.status).to.equal(401);
        });
    });

    describe("GET /api/user/orders/:userId", () => {
        it("should fetch orders for user", async () => {
            const res = await request(app)
                .get(`/api/user/orders/${userId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
        });
    });
});
