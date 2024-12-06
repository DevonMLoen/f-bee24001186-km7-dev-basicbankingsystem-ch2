const createApp = require("../../utils/create-app");
const request = require("supertest");
const prisma = require("../../db/index");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_SECRET_FORGOT } = process.env;

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue("email sent"), // You can mock a successful response
  }),
}));
let userService = require("./../../services/users");
const Auth = require("../../services/auth");
userService = new userService({ name: "", email: "", password: "" });
describe("AuthContoller Integration test", () => {
  let app;
  let testUser = {};
  let authToken;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { userEmail: "test@example.com" },
    });
    app = createApp();
  });

  afterAll(async () => {});
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/signup", () => {
    const bcryptSpy = jest.spyOn(bcrypt, "hash");
    it("should create a new user and return the user data", async () => {
      const response = await request(app).post("/api/v1/auths/signup").send({
        userName: "test User",
        userEmail: "test@example.com",
        userPassword: "password123",
        profileType: "admin",
        profileNumber: "12345",
        address: "123 Main St",
      });
      expect(bcryptSpy).toHaveBeenCalled();
      expect(bcryptSpy).toHaveBeenCalledWith("password123", 10);
      expect(response.statusCode).toBe(201);
      expect(response.body.newUser.userName).toBe("test User");

      testUser.id = response.body.newUser.userId;
      testUser.email = response.body.newUser.userId;
    });

    it("should return an error if email already exist", async () => {
      const response = await request(app).post("/api/v1/auths/signup").send({
        userName: "test User",
        userEmail: "test@example.com",
        userPassword: "password123",
        profileType: "admin",
        profileNumber: "12345",
        address: "123 Main St",
      });
      expect(response.status).toBe(409);
      expect(response.body.status).toBe(false);
    });

    it("should return an error if userPassword less than 10 characters", async () => {
      const userServiceSpy = jest.spyOn(userService, "createUserWithProfile");
      const response = await request(app).post("/api/v1/auths/signup").send({
        userName: "test User",
        userEmail: "test1@example.com",
        userPassword: "123",
        profileType: "admin",
        profileNumber: "12345",
        address: "123 Main St",
      });
      expect(response.status).toBe(400);
      expect(userServiceSpy).not.toHaveBeenCalled();
    });

    it("should return an error if userEmail format is not valid", async () => {
      const userServiceSpy = jest.spyOn(userService, "createUserWithProfile");
      const response = await request(app).post("/api/v1/auths/signup").send({
        userName: "test User",
        userEmail: "test1xample.com",
        userPassword: "123",
        profileType: "admin",
        profileNumber: "12345",
        address: "123 Main St",
      });
      expect(response.status).toBe(400);
      expect(userServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/v1/auths/login", () => {
    it("should successfully login if data is valid", async () => {
      const jwtSpy = jest.spyOn(jwt, "sign");
      const response = await request(app).post("/api/v1/auths/login").send({
        email: "test@example.com",
        password: "password123",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(jwtSpy).toHaveBeenCalledWith(
        { id: testUser.id, email: "test@example.com" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
    });

    it("should return an error if email is invalid", async () => {
      const response = await request(app).post("/api/v1/auths/login").send({
        email: "invalid@example.com",
        password: "password123",
      });
      expect(response.status).toBe(401);
    });
    it("should return an error if password is invalid", async () => {
      const response = await request(app).post("/api/v1/auths/login").send({
        email: "test@example.com",
        password: "invalidpassword",
      });
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/auths/reset-password", () => {
    it("should succeed if Bearer exist", async () => {
      const updatedPassword = "newpassword123";
      const hashedPassword = "hashedpassword123";
      const bcryptSpy = jest.spyOn(bcrypt, "hash");
      bcryptSpy.mockResolvedValue(hashedPassword);
      const userSpy = jest.spyOn(prisma.user, "update");
      const response = await request(app)
        .post("/api/v1/auths/reset-password")
        .set(
          "Authorization",
          `Bearer ${jwt.sign(
            { id: testUser.id, email: testUser.email },
            process.env.JWT_SECRET_FORGOT,
            { expiresIn: "5m" }
          )}`
        )
        .send({
          newPassword: updatedPassword,
          confirmPassword: updatedPassword,
        });

      expect(response.status).toBe(200);
      expect(bcryptSpy).toHaveBeenCalledWith(updatedPassword, 10);
      expect(userSpy).toHaveBeenCalledWith({
        where: { userId: testUser.id },
        data: { userPassword: hashedPassword },
      });
    });
    it("should failed if Bearer token invalid ", async () => {
      const updatedPassword = "newpassword123";
      const response = await request(app)
        .post("/api/v1/auths/reset-password")
        .set(
          "Authorization",
          `Bearer ${jwt.sign(
            { id: testUser.id, email: testUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
          )}`
        )
        .send({
          newPassword: updatedPassword,
          confirmPassword: updatedPassword,
        });

      expect(response.status).toBe(401);
    });

    it("should failed if Bearer token not exist", async () => {
      const updatedPassword = "newpassword123";
      const response = await request(app)
        .post("/api/v1/auths/reset-password")
        .send({
          newPassword: updatedPassword,
          confirmPassword: updatedPassword,
        });

      expect(response.status).toBe(401);
    });

    it("should failed if newPassword and confirmPassword doesnt match", async () => {
      const updatedPassword = "newpassword123";
      const confirmPassword = "unmatchpassword123";
      const userSpy = jest.spyOn(prisma.user, "update");
      const response = await request(app)
        .post("/api/v1/auths/reset-password")
        .send({
          newPassword: updatedPassword,
          confirmPassword: confirmPassword,
        });

      expect(response.status).toBe(401);
      expect(userSpy).not.toHaveBeenCalled();
    });

    it("should failed if user id not found", async () => {
      const updatedPassword = "newpassword123";
      const confirmPassword = "newpassword123";
      const userSpy = jest.spyOn(prisma.user, "update");
      const response = await request(app)
        .post("/api/v1/auths/reset-password")
        .set(
          "Authorization",
          `Bearer ${jwt.sign(
            { id: "invalid-id", email: testUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
          )}`
        )
        .send({
          newPassword: updatedPassword,
          confirmPassword: confirmPassword,
        });

      expect(response.status).toBe(401);
      expect(userSpy).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/v1/forgot-password", () => {
    it("should successfully send an email", async () => {
      const transporter = nodemailer.createTransport();
      const nodeMailerSpy = jest.spyOn(transporter, "sendMail");
      const response = await request(app)
        .post("/api/v1/auths/forgot-password")
        .send({
          email: "test@example.com",
        });
      expect(response.status).toBe(200);
      expect(nodeMailerSpy).toHaveBeenCalled();
    });

    it("should return an error if user email is not found", async () => {
      const transporter = nodemailer.createTransport();
      const nodeMailerSpy = jest.spyOn(transporter, "sendMail");
      const response = await request(app)
        .post("/api/v1/auths/forgot-password")
        .send({ email: "invalid@example.com" });
      expect(response.status).toBe(404);
      expect(nodeMailerSpy).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/auths/whoami", () => {
    it("should success", async () => {
      const token = new Auth().generateToken({
        userId: "userid",
        userEmail: "test@example.com",
      });
      const response = await request(app)
        .get("/api/v1/auths/whoami")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
    });
  });
});
