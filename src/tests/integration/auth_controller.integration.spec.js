const createApp = require("../../utils/create-app");
const request = require("supertest");
const prisma = require("../../db/index");
const bcrypt = require("bcrypt");
let userService = require("./../../services/users");
userService = new userService({ name: "", email: "", password: "" });
describe("AuthContoller Integration test", () => {
  let app;
  let testUser;
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

  describe("POST /api/v1/auths/login", () => {});
});
