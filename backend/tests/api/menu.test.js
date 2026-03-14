const request = require("supertest");
const app = require("../../server");
const { expect } = require("chai");

describe("Menu API", function() {
    this.timeout(10000);

    describe("GET /api/user/categories", () => {
        it("should fetch all categories", async () => {
            const res = await request(app).get("/api/user/categories");
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
        });
    });

    describe("GET /api/user/menu/:categoryId", () => {
        it("should return empty array or items for a random categoryId", async () => {
            const res = await request(app).get("/api/user/menu/65b2f1e8a8b2c3d4e5f6a7b8");
            expect(res.status).to.be.oneOf([200, 404]);
        });
    });
});
