const createApp = require("../utils/create-app");
createApp();
const { HttpError } = require("../middleware/errorhandling");
const transactionController = require("../controllers/transactions");
const transactionService = require("../services/transactions");
jest.mock("../services/transactions");
describe("transactionController", () => {
  let req = {
    body: {},
    user: { id: 1, email: "test@example.com" },
    params: {},
  };
  let res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  let next = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getAllTransaction", () => {
    it("should return all transaction", async () => {
      const result = [
        {
          amount: 250,
          bankAccountDestination: {
            balance: 1250,
            bankAccountId: 3,
            bankAccountNumber: "9876543210",
            bankName: "Bank ABC",
            userId: 1,
          },
          bankAccountSource: {
            balance: 10250,
            bankAccountId: 2,
            bankAccountNumber: "1234567890",
            bankName: "Bank XYZ",
            userId: 1,
          },
          destinationAccountId: 3,
          sourceAccountId: 2,
          transactionId: 1,
        },
      ];
      transactionService.getAllTransactions.mockResolvedValue(result);
      await transactionController.getAllTransactions(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
    it("should return an error if transaction is not found", async () => {
      const mockError = new HttpError("No transactions were found.", 404);

      transactionService.getAllTransactions.mockRejectedValue(mockError);

      await transactionController.getAllTransactions(req, res, next);
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("createTransaction", () => {
    it("should succesffully create a transaction", async () => {
      req.body = {
        sourceAccountId: "1",
        destinationAccountId: "2",
        amount: 250,
      };

      const expected = {
        amount: 250,
        destinationAccountId: 3,
        sourceAccountId: 2,
        transactionId: 1,
      };
      transactionService.prototype.createTransaction.mockResolvedValue(
        expected
      );
      const transactionSpy = jest.spyOn(
        transactionService.prototype,
        "createTransaction"
      );
      await transactionController.createTransaction(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Transaction successful",
        transaction: {
          amount: 250,
          destinationAccountId: 3,
          sourceAccountId: 2,
          transactionId: 1,
        },
      });
      expect(transactionSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if account not found", async () => {
      const mockError = new HttpError((`Account with ID 1 not found`, 404));
      transactionService.prototype.createTransaction.mockRejectedValue(
        mockError
      );

      await transactionController.createTransaction(req, res, next);
      expect(next).toHaveBeenCalledWith(mockError);
    });

    it("should return an error if source account balance is not enough", async () => {
      const mockError = new HttpError(
        ("Insufficient balance in source account", 403)
      );
      transactionService.prototype.createTransaction.mockRejectedValue(
        mockError
      );
      await transactionController.createTransaction(req, res, next);
      expect(next).toHaveBeenCalledWith(mockError);
    });
    it("should return an error if source account balance is not enough", async () => {
      const mockError = new HttpError(
        ("Insufficient balance in source account", 403)
      );
      transactionService.prototype.createTransaction.mockRejectedValue(
        mockError
      );
      await transactionController.createTransaction(req, res, next);
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getTransactionById", () => {
    it("should return a transaction", async () => {
      const expected = {
        amount: 250,
        bankAccountDestination: {
          balance: 1250,
          bankAccountId: 3,
          bankAccountNumber: "9876543210",
          bankName: "Bank ABC",
          userId: 1,
        },
        bankAccountSource: {
          balance: 10250,
          bankAccountId: 2,
          bankAccountNumber: "1234567890",
          bankName: "Bank XYZ",
          userId: 1,
        },
        destinationAccountId: 3,
        sourceAccountId: 2,
        transactionId: 1,
      };

      transactionService.getTransactionById.mockResolvedValue(expected);

      await transactionController.getTransactionById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transaction: expected });
    });

    it("should return an error if account not found", async () => {
      const mockError = new HttpError("No transactions were found.", 404);
      transactionService.getTransactionById.mockRejectedValue(mockError);
      await transactionController.getTransactionById(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
