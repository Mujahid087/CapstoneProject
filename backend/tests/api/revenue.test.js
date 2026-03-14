const request = require("supertest");
const app = require("../../server");
const { expect } = require("chai");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

describe("Admin Revenue API", function() {
    this.timeout(10000);

    const adminToken = jwt.sign({ id: new mongoose.Types.ObjectId().toString(), role: "admin" }, process.env.JWT_SECRET);

    describe("GET /api/admin/revenue", () => {
        it("should fetch revenue stats for admin", async () => {
            const res = await request(app)
                .get("/api/admin/revenue")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("kpis");
        });

        it("should return 401 without token", async () => {
            const res = await request(app).get("/api/admin/revenue");
            expect(res.status).to.equal(401);
        });
    });

    describe("GET /api/admin/dashboard", () => {
        it("should fetch dashboard stats for admin", async () => {
            const res = await request(app)
                .get("/api/admin/dashboard")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("ordersTrend");
        });
    });
});
