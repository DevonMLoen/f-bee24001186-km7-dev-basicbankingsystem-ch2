const createApp = require("../../utils/create-app");
const prisma = require("../../db/index");
const request = require("supertest");
const userService = require("../../services/users");
const authService = require("../../services/auth");
const bankService = require("../../services/bank_accounts");
describe("BankControllerIntegration test", () => {
  let app;
  let user;
  let authToken;
  let bank;
  beforeAll(async () => {
    await prisma.bankAccount.deleteMany();
    await prisma.user.deleteMany();

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/accounts", () => {
    let body;
    const bankSpy = jest.spyOn(prisma.bankAccount, "create");
    beforeEach(() => {
      body = {
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      };
    });
    it("should successfully create bank account", async () => {
      const response = await request(app)
        .post("/api/v1/accounts")
        .send(body)
        .set("Authorization", `Bearer ${authToken}`);
      bank = response.body;
      expect(response.statusCode).toBe(201);
      expect(bankSpy).toHaveBeenCalledTimes(1);
      expect(prisma.bankAccount.create).toHaveBeenCalledWith({ data: body });
    });
    it("should return an error if userId is invalid", async () => {
      body.userId = -1;
      const response = await request(app)
        .post("/api/v1/accounts")
        .send(body)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(prisma.bankAccount.create).not.toHaveBeenCalled();
    });
    it("should return an error if bankName is invalid", async () => {
      body.bankName = "ba";
      const response = await request(app)
        .post("/api/v1/accounts")
        .send(body)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(prisma.bankAccount.create).not.toHaveBeenCalled();
    });
    it("should return an error if bankName is invalid", async () => {
      body.bankAccountNumber = "12345";
      const response = await request(app)
        .post("/api/v1/accounts")
        .send(body)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(prisma.bankAccount.create).not.toHaveBeenCalled();
    });
    it("should return an error if balance is invalid", async () => {
      body.balance = null;
      const response = await request(app)
        .post("/api/v1/accounts")
        .send(body)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(prisma.bankAccount.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/accounts", () => {
    it("should return accounts", async () => {
      await prisma.bankAccount.deleteMany();
      const account = new bankService({
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      });
      await account.createAccount();
      const response = await request(app)
        .get("/api/v1/accounts")
        .set("Authorization", `Bearer ${authToken}`);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toBeTruthy();
      expect(response.body[0]).toMatchObject(account);
      expect(response.body[0].user).toMatchObject(user);
    });

    it("should return an error if no bank account is found", async () => {
      await prisma.bankAccount.deleteMany();
      const response = await request(app)
        .get("/api/v1/accounts")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(404);
      expect(response.body.data).toBe(null);
    });
  });
  describe("GET /api/v1/accounts/:id", () => {
    it("should return a bank account", async () => {
      await prisma.bankAccount.deleteMany();
      const data = {
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      };
      const account = new bankService(data);
      const createdAccount = await account.createAccount();
      const response = await request(app)
        .get(`/api/v1/accounts/${createdAccount.bankAccountId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.bankAccount).toMatchObject(data);
      expect(response.body.bankAccount.user).toMatchObject(user);
    });
    it("should return an error if there is no bank account", async () => {
      await prisma.bankAccount.deleteMany();
      const response = await request(app)
        .get(`/api/v1/accounts/-1`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(404);
      expect(response.body.data).toBe(null);
    });
  });
  describe("DELETE /api/v1/accounts/:id", () => {
    it("should successfully delete an account", async () => {
      await prisma.bankAccount.deleteMany();
      const data = {
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      };
      const account = new bankService(data);
      const createdAccount = await account.createAccount();
      const response = await request(app)
        .delete(`/api/v1/accounts/${createdAccount.bankAccountId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Bank account successfully deleted");
    });

    it("should return an error if bank account not found", async () => {
      await prisma.bankAccount.deleteMany();
      const response = await request(app)
        .delete(`/api/v1/accounts/-1`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/accounts/:id", () => {
    let body = {
      bankName: "",
      bankAccountNumber: "",
      balance: "",
    };
    let createdAccount;
    beforeEach(() => {
      body = {
        bankName: "Bank CBA",
        bankAccountNumber: "987654321",
        balance: 500,
      };
    });
    it("should successfully update an account", async () => {
      await prisma.bankAccount.deleteMany();
      const data = {
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      };
      const account = new bankService(data);
      createdAccount = await account.createAccount();

      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(body);
      expect(response.status).toBe(200);
      expect(response.body.account).toMatchObject(body);
    });
    it("should return an error if bankName is invalid", async () => {
      body.bankName = "ab";
      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(body);
      expect(response.status).toBe(400);
    });
    it("should return an error if bankAccountNumber is invalid", async () => {
      body.bankAccountNumber = "12345";
      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(body);
      expect(response.status).toBe(400);
    });
    it("should return an error if balance is invalid", async () => {
      body.balance = -500;
      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(body);
      expect(response.status).toBe(400);
    });
    it("should return an error if one of the dto is not exist", async () => {
      delete body.balance;
      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(body);
      expect(response.status).toBe(400);
    });
  });
  describe("PATCH /api/v1/accounts/:id/withdraw", () => {
    let createdAccount;

    it("should successfully withdraw money from account balance", async () => {
      await prisma.bankAccount.deleteMany();
      const data = {
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      };
      const account = new bankService(data);
      createdAccount = await account.createAccount();
      const amount = { amount: 100 };
      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}/withdraw`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(amount);
      expect(response.status).toBe(200);
      expect(response.body.account.balance).toBe(data.balance - amount.amount);
    });
    it("should return an error if amount is less than zero", async () => {
      await prisma.bankAccount.deleteMany();
      const data = {
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      };
      const account = new bankService(data);
      createdAccount = await account.createAccount();
      const amount = { amount: -1 };
      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}/withdraw`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(amount);
      expect(response.status).toBe(403);
    });
    it("should return an error if balance amount to be withdraw is not enough", async () => {
      await prisma.bankAccount.deleteMany();
      const data = {
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      };
      const account = new bankService(data);
      createdAccount = await account.createAccount();
      const amount = { amount: 1001 };
      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}/withdraw`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(amount);
      expect(response.status).toBe(403);
    });
    it("should return an error if bank account not found", async () => {
      await prisma.bankAccount.deleteMany();
      const amount = { amount: 1001 };
      const response = await request(app)
        .patch(`/api/v1/accounts/-1/withdraw`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(amount);
      expect(response.status).toBe(404);
    });
  });
  describe("PATCH /api/v1/accounts/:id/deposit", () => {
    it("should successfully deposit money to bank account", async () => {
      await prisma.bankAccount.deleteMany();
      const data = {
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      };
      const account = new bankService(data);
      const createdAccount = await account.createAccount();
      const amount = { amount: 100 };
      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}/deposit`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(amount);
      expect(response.status).toBe(200);
      expect(response.body.account.balance).toBe(data.balance + amount.amount);
    });
    it("should return an error if amount is less than zero", async () => {
      await prisma.bankAccount.deleteMany();
      const data = {
        balance: 1000,
        bankAccountNumber: "123456789",
        bankName: "Bank ABC",
        userId: user.userId,
      };
      const account = new bankService(data);
      const createdAccount = await account.createAccount();
      const amount = { amount: -1 };
      const response = await request(app)
        .patch(`/api/v1/accounts/${createdAccount.bankAccountId}/deposit`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(amount);
      expect(response.status).toBe(404);
    });
    it("should return an error if bank account not found", async () => {
      await prisma.bankAccount.deleteMany();
      const amount = { amount: -1 };
      const response = await request(app)
        .patch(`/api/v1/accounts/-1/deposit`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(amount);
      expect(response.status).toBe(404);
    });
  });
});
