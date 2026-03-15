const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { expect } = require("chai");
const app = require("../../server");
const Order = require("../../models/OrderModel");
const MenuItem = require("../../models/MenuItem");
const Category = require("../../models/CategoryModel");

describe("Orders API", function() {
    this.timeout(30000);

    const userId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign({ id: userId, role: "customer" }, process.env.JWT_SECRET);
    let category;
    let pickupItem;
    let deliveryItem;

    before(async () => {
        category = await Category.create({ categoryName: `Pizza-${Date.now()}` });
        pickupItem = await MenuItem.create({
            name: "Pickup Test Pizza",
            description: "Pickup order pizza",
            price: 300,
            categoryId: category._id,
            stock: 5,
            isAvailable: true,
        });
        deliveryItem = await MenuItem.create({
            name: "Delivery Test Pizza",
            description: "Delivery order pizza",
            price: 250,
            categoryId: category._id,
            stock: 1,
            isAvailable: true,
        });
    });

    after(async () => {
        await Order.deleteMany({ userId });
        if (pickupItem) await MenuItem.deleteOne({ _id: pickupItem._id });
        if (deliveryItem) await MenuItem.deleteOne({ _id: deliveryItem._id });
        if (category) await Category.deleteOne({ _id: category._id });
    });

    describe("POST /api/user/order", () => {
        it("should place a pickup order without an address and reduce stock", async () => {
            const res = await request(app)
                .post("/api/user/order")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    items: [{
                        itemId: pickupItem._id.toString(),
                        cartKey: `${pickupItem._id}::Small::Thin::`,
                        name: pickupItem.name,
                        price: 300,
                        quantity: 2,
                        customization: {
                            size: "Small",
                            crust: "Thin",
                            extras: []
                        }
                    }],
                    deliveryMode: "pickup"
                });

            expect(res.status).to.equal(201);
            expect(res.body.order).to.have.property("deliveryMode", "pickup");
            expect(res.body.order.addressId).to.be.undefined;
            expect(res.body.order.finalPrice).to.equal(630);

            const updatedItem = await MenuItem.findById(pickupItem._id);
            expect(updatedItem.stock).to.equal(3);
        });

        it("should reject delivery orders without an address", async () => {
            const res = await request(app)
                .post("/api/user/order")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    items: [{
                        itemId: deliveryItem._id.toString(),
                        cartKey: `${deliveryItem._id}::Small::Thin::`,
                        name: deliveryItem.name,
                        price: 250,
                        quantity: 1,
                        customization: {
                            size: "Small",
                            crust: "Thin",
                            extras: []
                        }
                    }],
                    deliveryMode: "delivery"
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("Delivery address is required for delivery orders");
        });

        it("should reject orders that exceed available stock", async () => {
            const res = await request(app)
                .post("/api/user/order")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    addressId: new mongoose.Types.ObjectId().toString(),
                    items: [{
                        itemId: deliveryItem._id.toString(),
                        cartKey: `${deliveryItem._id}::Large::Cheese Burst::Extra Cheese`,
                        name: deliveryItem.name,
                        price: 460,
                        quantity: 2,
                        customization: {
                            size: "Large",
                            crust: "Cheese Burst",
                            extras: ["Extra Cheese"]
                        }
                    }],
                    deliveryMode: "delivery"
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal(`Only 1 ${deliveryItem.name} available in stock`);
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
            expect(res.body).to.have.length.greaterThan(0);
        });
    });
});
