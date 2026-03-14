const request = require("supertest");
const app = require("../../server");
const { expect } = require("chai");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Cart = require("../../models/CartItemModel");

describe("Cart API", function() {
    this.timeout(10000);

    const userId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign({ id: userId, role: "customer" }, process.env.JWT_SECRET);

    after(async () => {
        await Cart.deleteMany({ userId });
    });

    describe("POST /api/user/cart", () => {
        it("should return 401 without token", async () => {
            const res = await request(app).post("/api/user/cart").send({});
            expect(res.status).to.equal(401);
        });

        it("should add item to cart with valid token", async () => {
            const res = await request(app)
                .post("/api/user/cart")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    items: [{
                        itemId: new mongoose.Types.ObjectId().toString(),
                        name: "Test Pizza",
                        price: 299,
                        quantity: 1
                    }]
                });
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("message", "Item added to cart");
        });
    });

    describe("GET /api/user/cart/:userId", () => {
        it("should fetch cart for user", async () => {
            const res = await request(app)
                .get(`/api/user/cart/${userId}`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
        });
    });
});
