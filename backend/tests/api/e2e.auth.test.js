const request = require("supertest");
const app = require("../../server");
const { expect } = require("chai");


describe("E2E: Auth Validation Flow", function () {
    this.timeout(10000);

    

    describe("Registration Validation", () => {
        it("should reject registration with missing email and password", async () => {
            const res = await request(app)
                .post("/api/user/register")
                .send({ name: "Incomplete User" });

            
            expect(res.status).to.be.oneOf([400, 500]);
        });

        it("should reject registration with empty body", async () => {
            const res = await request(app)
                .post("/api/user/register")
                .send({});

            expect(res.status).to.be.oneOf([400, 500]);
        });
    });

    

    describe("Login Validation", () => {
        it("should reject login for a non-existent user", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({ email: "nobody_exists@example.com", password: "somepassword" });

            expect(res.status).to.equal(404);
        });

        it("should reject login with no body", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({});

            expect(res.status).to.be.oneOf([400, 404, 500]);
        });
    });

    

    describe("Protected Route Access", () => {
        it("should return 401 for cart access without token", async () => {
            const res = await request(app).get("/api/user/cart/someuserid");
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal("No token provided");
        });

        it("should return 401 for order access without token", async () => {
            const res = await request(app).get("/api/user/orders/someuserid");
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal("No token provided");
        });

        it("should return 401 for profile access without token", async () => {
            const res = await request(app).get("/api/user/profile");
            expect(res.status).to.equal(401);
        });

        it("should return 401 with an invalid/malformed token", async () => {
            const res = await request(app)
                .get("/api/user/profile")
                .set("Authorization", "Bearer invalid.token.here");

            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal("Invalid token");
        });

        it("should allow public menu access without token", async () => {
            const res = await request(app).get("/api/user/categories");
            expect(res.status).to.equal(200);
        });
    });
});
