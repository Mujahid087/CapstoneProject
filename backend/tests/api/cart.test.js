const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { expect } = require("chai");
const app = require("../../server");
const Cart = require("../../models/CartItemModel");
const MenuItem = require("../../models/MenuItem");
const Category = require("../../models/CategoryModel");

describe("Cart API", function() {
    this.timeout(30000);

    const userId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign({ id: userId, role: "customer" }, process.env.JWT_SECRET);
    let category;
    let pizzaItem;

    before(async () => {
        category = await Category.create({ categoryName: `Pizza-${Date.now()}` });
        pizzaItem = await MenuItem.create({
            name: "Test Pizza",
            description: "Cart test pizza",
            price: 299,
            categoryId: category._id,
            stock: 3,
            isAvailable: true,
        });
    });

    after(async () => {
        await Cart.deleteMany({ userId });
        if (pizzaItem) await MenuItem.deleteOne({ _id: pizzaItem._id });
        if (category) await Category.deleteOne({ _id: category._id });
    });

    describe("POST /api/user/cart", () => {
        it("should return 401 without token", async () => {
            const res = await request(app).post("/api/user/cart").send({});
            expect(res.status).to.equal(401);
        });

        it("should add customized variants as separate cart items", async () => {
            const firstRes = await request(app)
                .post("/api/user/cart")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    items: [{
                        itemId: pizzaItem._id.toString(),
                        cartKey: `${pizzaItem._id}::Small::Thin::`,
                        name: pizzaItem.name,
                        price: 299,
                        quantity: 1,
                        customization: {
                            size: "Small",
                            crust: "Thin",
                            extras: []
                        }
                    }]
                });

            expect(firstRes.status).to.equal(201);
            expect(firstRes.body.cartItem.items).to.have.length(1);

            const secondRes = await request(app)
                .post("/api/user/cart")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    items: [{
                        itemId: pizzaItem._id.toString(),
                        cartKey: `${pizzaItem._id}::Large::Cheese Burst::Olives`,
                        name: pizzaItem.name,
                        price: 499,
                        quantity: 1,
                        customization: {
                            size: "Large",
                            crust: "Cheese Burst",
                            extras: ["Olives"]
                        }
                    }]
                });

            expect(secondRes.status).to.equal(201);
            expect(secondRes.body.cartItem.items).to.have.length(2);
            expect(secondRes.body.cartItem.items.map((item) => item.cartKey)).to.include.members([
                `${pizzaItem._id}::Small::Thin::`,
                `${pizzaItem._id}::Large::Cheese Burst::Olives`,
            ]);
        });

        it("should reject cart additions that exceed available stock across variants", async () => {
            const res = await request(app)
                .post("/api/user/cart")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    items: [{
                        itemId: pizzaItem._id.toString(),
                        cartKey: `${pizzaItem._id}::Medium::Thin::Extra Cheese`,
                        name: pizzaItem.name,
                        price: 389,
                        quantity: 2,
                        customization: {
                            size: "Medium",
                            crust: "Thin",
                            extras: ["Extra Cheese"]
                        }
                    }]
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal(`Only 3 ${pizzaItem.name} available in stock`);
        });
    });

    describe("GET /api/user/cart/:userId", () => {
        it("should fetch cart for user", async () => {
            const res = await request(app)
                .get(`/api/user/cart/${userId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.length(2);
        });
    });
});
