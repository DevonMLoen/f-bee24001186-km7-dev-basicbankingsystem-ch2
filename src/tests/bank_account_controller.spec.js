const createApp = require("../utils/create-app");
createApp();
const BankController = require("../controllers/bank_accounts");
const Bank = require("./../services/bank_accounts");
const { HttpError } = require("../middleware/errorhandling");
const { bankAccount } = require("../db");
jest.mock("../services/bank_accounts");
jest.mock("../db", () => ({
  bankAccount: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));
describe("BankController", () => {
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
  const mockPrisma = require("../db");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockBank = {
    balance: 1000,
    bankAccountId: 1,
    bankAccountNumber: "9876543210",
    bankName: "Bank ABC",
    userId: 2,
  };
  describe("getAllBankAccounts", () => {
    it("should return all bank accounts", async () => {
      const result = [
        {
          balance: 1000,
          bankAccountId: 1,
          bankAccountNumber: "9876543210",
          bankName: "Bank ABC",
          user: {
            userEmail: "devondoe@example.com",
            userId: 2,
            userName: "Devon Doe",
          },
          userId: 2,
        },
      ];
      Bank.getAllBankAccounts.mockResolvedValue(result);

      await BankController.getAllBankAccounts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it("should return an error if there is no bank accounts", async () => {
      const mockError = new HttpError("Bank accounts not found", 404);
      Bank.getAllBankAccounts.mockRejectedValue(mockError);

      await BankController.getAllBankAccounts(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("createAccount", () => {
    it("should successfully create a new account", async () => {
      req.body = {
        userId: 2,
        bankName: "BANK ABC",
        bankAccountNumber: "123456789",
        balance: 123456,
      };
      const result = {
        balance: 1000,
        bankAccountId: 1,
        bankAccountNumber: "9876543210",
        bankName: "Bank ABC",
        userId: 2,
      };
      const bankSpy = jest.spyOn(Bank.prototype, "createAccount");
      Bank.prototype.createAccount.mockResolvedValue(result);

      await BankController.createAccount(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(result);
      expect(bankSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error when user is not found", async () => {
      const mockError = new HttpError("User not Found", 404);
      Bank.prototype.createAccount.mockRejectedValue(mockError);
      await BankController.createAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(mockPrisma.bankAccount.create).not.toHaveBeenCalled();
    });
  });

  describe("getBankAccountById", () => {
    it("should succesffully return bank account", async () => {
      const result = {
        bankAccount: {
          balance: 1000,
          bankAccountId: 1,
          bankAccountNumber: "9876543210",
          bankName: "Bank ABC",
          user: {
            userEmail: "devondoe@example.com",
            userId: 2,
            userName: "Devon Doe",
          },
          userId: 2,
        },
      };
      req.params.id = 1;
      Bank.getBankAccountById.mockResolvedValue(result);

      await BankController.getBankAccountById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ bankAccount: result });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return an error if bank is not found", async () => {
      const mockError = new HttpError("Bank account not found", 404);
      Bank.getBankAccountById.mockRejectedValue(mockError);

      await BankController.getBankAccountById(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("deleteAccountById", () => {
    it("should succesffully deleted a bank account", async () => {
      req.params.id = 1;
      const result = {
        message: "Bank account successfully deleted",
      };
      Bank.deleteAccountById.mockResolvedValue(result);

      await BankController.deleteAccountById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it("should return an error if bank account not found", async () => {
      const mockError = new HttpError("Bank Account not Found", 404);
      Bank.deleteAccountById.mockRejectedValue(mockError);

      await BankController.deleteAccountById(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("updateAccount", () => {
    req.body = {
      bankName: "BANK XYZ",
      bankAccountNumber: "123456789",
      balance: 123456,
    };
    req.params.id = 1;

    it("should succesfully updated account", async () => {
      const result = {
        account: {
          balance: 1500,
          bankAccountId: 2,
          bankAccountNumber: "1234567890",
          bankName: "Bank XYZ",
          userId: 1,
        },
      };
      Bank.updateAccount.mockResolvedValue(result);

      await BankController.updateAccount(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Bank account successfully updated",
        account: result,
      });
    });

    it("should return an error if account is not found", async () => {
      const mockError = new HttpError("Bank Account not Found", 404);
      Bank.updateAccount.mockRejectedValue(mockError);

      await BankController.updateAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("withdraw", () => {
    req.body = {
      amount: 123,
    };
    req.params.id = 1;
    it("should withdraw successfully", async () => {
      const result = {
        account: {
          balance: 500,
          bankAccountId: 2,
          bankAccountNumber: "1234567890",
          bankName: "Bank XYZ",
          userId: 1,
        },
      };
      Bank.withdraw.mockResolvedValue(result);

      await BankController.withdraw(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Bank account Withdraw successfully",
        account: result,
      });
    });

    it("should failed if account not found", async () => {
      const mockError = new HttpError("Bank Account not Found", 404);
      Bank.withdraw.mockRejectedValue(mockError);

      await BankController.withdraw(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
    it("should failed if amount <= 0", async () => {
      const mockError = new HttpError("Amount must be greater than zero", 403);
      Bank.withdraw.mockRejectedValue(mockError);

      await BankController.withdraw(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
    it("should failed if account balance <= amount withdraw", async () => {
      const mockError = new HttpError("Insufficient balance", 403);
      Bank.withdraw.mockRejectedValue(mockError);

      await BankController.withdraw(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("deposit", () => {
    req.body = {
      amount: 123,
    };
    req.params.id = 1;

    it("should succesffully deposit", async () => {
      const result = {
        account: {
          balance: 10500,
          bankAccountId: 2,
          bankAccountNumber: "1234567890",
          bankName: "Bank XYZ",
          userId: 1,
        },
      };
      Bank.deposit.mockResolvedValue(result);

      await BankController.deposit(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Bank account Deposit successfully",
        account: result,
      });
    });
    it("should failed if account not found", async () => {
      const mockError = new HttpError("Bank Account not Found", 404);
      Bank.deposit.mockRejectedValue(mockError);

      await BankController.deposit(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
    it("should failed if amount <= 0", async () => {
      const mockError = new HttpError("Amount must be greater than zero", 403);
      Bank.deposit.mockRejectedValue(mockError);

      await BankController.deposit(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
