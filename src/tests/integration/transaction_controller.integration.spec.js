const createApp = require("../../utils/create-app");
const prisma = require("../../db/index");
const request = require("supertest");
const userService = require("../../services/users");
const authService = require("../../services/auth");
const bankService = require("../../services/bank_accounts");
const transactionService = require("../../services/transactions");
describe("transactionControllerIntegration test", () => {
  let app;
  let user;
  let authToken;
  let sourceAccount;
  let destinationAccount;
  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.bankAccount.deleteMany();
    await prisma.transaction.deleteMany();
  });
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

    sourceAccount = await new bankService({
      userId: user.userId,
      bankName: "Bank XYZ",
      bankAccountNumber: "123456789",
      balance: 2500,
    }).createAccount();
    destinationAccount = await new bankService({
      userId: user.userId,
      bankName: "Bank ZYX",
      bankAccountNumber: "987654321",
      balance: 2500,
    }).createAccount();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("POST /api/v1/transactions", () => {
    it("should successfully create a transaction", async () => {
      const body = {
        amount: 250,
        destinationAccountId: destinationAccount.bankAccountId,
        sourceAccountId: sourceAccount.bankAccountId,
      };
      const response = await request(app)
        .post("/api/v1/transactions")
        .send(body)
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(201);
      expect(response.body.transaction).toMatchObject(body);
      expect(response.body.transaction.transactionId).toBeTruthy();
      const sourceAccountAfter = await prisma.bankAccount.findUnique({
        where: { bankAccountId: sourceAccount.bankAccountId },
      });
      const destinationAccountAfter = await prisma.bankAccount.findUnique({
        where: { bankAccountId: destinationAccount.bankAccountId },
      });

      expect(sourceAccountAfter.balance).toBe(
        sourceAccount.balance - body.amount
      );
      expect(destinationAccountAfter.balance).toBe(
        destinationAccount.balance + body.amount
      );
    });

    it("should return an error if sourceAccount not found", async () => {
      const body = {
        amount: 250,
        sourceAccountId: "9999",
        destinationAccountId: destinationAccount.bankAccountId,
      };
      const response = await request(app)
        .post("/api/v1/transactions")
        .send(body)
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(404);
    });
    it("should return an error if sourceAccount balance is not sufficient", async () => {
      const body = {
        amount: 99999,
        sourceAccountId: sourceAccount.bankAccountId,
        destinationAccountId: destinationAccount.bankAccountId,
      };
      const response = await request(app)
        .post("/api/v1/transactions")
        .send(body)
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(403);
    });

    it("should return an error if destinationAccount not found", async () => {
      const body = {
        amount: 250,
        sourceAccountId: sourceAccount.bankAccountId,
        destinationAccountId: "99999",
      };
      const response = await request(app)
        .post("/api/v1/transactions")
        .send(body)
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/transactions", () => {
    it("should return all transactions", async () => {
      const transaction = new transactionService({
        sourceAccountId: sourceAccount.bankAccountId,
        destinationAccountId: destinationAccount.bankAccountId,
        amount: 200,
      });
      await prisma.transaction.deleteMany();
      await transaction.createTransaction();
      await transaction.createTransaction();
      const response = await request(app)
        .get("/api/v1/transactions")
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it("should return an error if no transaction is found", async () => {
      await prisma.transaction.deleteMany();
      const response = await request(app)
        .get("/api/v1/transactions")
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/transactions/:id", () => {
    it("should return a transaction", async () => {
      const transaction = new transactionService({
        sourceAccountId: sourceAccount.bankAccountId,
        destinationAccountId: destinationAccount.bankAccountId,
        amount: 200,
      });
      await prisma.transaction.deleteMany();
      const transactionData = await transaction.createTransaction();
      const response = await request(app)
        .get(`/api/v1/transactions/${transactionData.transactionId}`)
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.transaction).toHaveProperty(
        "transactionId",
        transactionData.transactionId
      );
    });
    it("should return an error if no transaction found", async () => {
      await prisma.transaction.deleteMany();
      const response = await request(app)
        .get(`/api/v1/transactions/-1`)
        .set("authorization", `Bearer ${authToken}`);
      expect(response.statusCode).toBe(404);
    });
  });
});
