const createApp = require("../../utils/create-app");
const prisma = require("../../db/index");
const request = require("supertest");
const userService = require("../../services/users");
const authService = require("../../services/auth");

describe("userControllerIntegration test", () => {
  let app;
  let user;
  let authToken;

  beforeAll(async () => {
    user = await new userService({
      name: "test",
      email: "test@example.com",
      password: "1234567890",
    }).createUser();
    authToken = (
      await new authService().login("test@example.com", "1234567890")
    ).token;
    app = createApp();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });
  describe("GET /api/v1/users", () => {
    it("should return all users", async () => {
      const response = await request(app)
        .get("/api/v1/users")
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return an error if no user is found", async () => {
      await prisma.user.deleteMany();

      const response = await request(app)
        .get("/api/v1/users")
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return an user", async () => {
      const user = await new userService({
        name: "test",
        email: "test@example.com",
        password: "1234567890",
      }).createUser();

      const response = await request(app)
        .get(`/api/v1/users/${user.userId}`)
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.user).toHaveProperty("userId", user.userId);
    });

    it("should return an error if there is no user found", async () => {
      await prisma.user.deleteMany();
      const response = await request(app)
        .get(`/api/v1/users/-1`)
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(404);
    });
  });
});
