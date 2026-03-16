const request = require("supertest");
const app = require("../../server");
const { expect } = require("chai");
const User = require("../../models/User");

describe("Auth API", function() {
    this.timeout(10000);

    const testUser = {
        name: "Test User",
        email: "authtest@example.com",
        password: "password123"
    };

    before(async () => {
        await User.deleteMany({ email: testUser.email });
    });

    after(async () => {
        await User.deleteMany({ email: testUser.email });
    });

    describe("POST /api/user/register", () => {
        it("should register a new user", async () => {
            const res = await request(app)
                .post("/api/user/register")
                .send(testUser);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("message", "User registered successfully");
            expect(res.body).to.have.property("user");
            expect(res.body.user.email).to.equal(testUser.email);
        });

        it("should return 400 for duplicate email", async () => {
            const res = await request(app)
                .post("/api/user/register")
                .send(testUser);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("User already exists");
        });

        it("should return 400 for missing required fields", async () => {
            const res = await request(app)
                .post("/api/user/register")
                .send({ name: "Incomplete" });

            expect(res.status).to.equal(400);
        });
    });

    describe("POST /api/user/login", () => {
        it("should validate credentials and send OTP", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({ email: testUser.email, password: testUser.password });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("OTP sent to your registered email");
            expect(res.body).to.have.property("requiresOtp", true);
            expect(res.body).to.have.property("email", testUser.email);
        });

        it("should verify OTP and return JWT", async () => {
            const user = await User.findOne({ email: testUser.email });

            const res = await request(app)
                .post("/api/user/verify-otp")
                .send({ email: testUser.email, otp: user.otp });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("token");
            expect(res.body.message).to.equal("Login successful");
        });

        it("should return 404 for non-existent user", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({ email: "nobody@example.com", password: "wrong" });

            expect(res.status).to.equal(404);
        });

        it("should return 401 for wrong password", async () => {
            const res = await request(app)
                .post("/api/user/login")
                .send({ email: testUser.email, password: "wrongpassword" });

            expect(res.status).to.equal(401);
        });
    });
});
