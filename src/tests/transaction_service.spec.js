const TransactionService = require("./../services/transactions");
const { HttpError } = require("../middleware/errorhandling.js");
jest.mock("../db", () => ({
  transaction: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn().mockResolvedValue({
    bankAccount: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
  }),
}));

describe("transactionService", () => {
  const mockPrismaTransaction = {
    bankAccount: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
  const mockPrisma = require("../db");
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTransaction", () => {
    let transaction = new TransactionService({
      amount: 250,
      sourceAccountId: "1",
      destinationAccountId: "2",
    });
    let sourceAccount = {
      balance: 1500,
      bankAccountId: transaction.sourceAccountId,
      bankAccountNumber: "1234567890",
      bankName: "Bank XYZ",
      userId: 1,
    };
    let destinationAccount = {
      balance: 1500,
      bankAccountId: transaction.destinationAccountId,
      bankAccountNumber: "0987654321",
      bankName: "Bank XYZ",
      userId: 2,
    };

    beforeEach(() => {
      sourceAccount = {
        balance: 1500,
        bankAccountId: transaction.sourceAccountId,
        bankAccountNumber: "1234567890",
        bankName: "Bank XYZ",
        userId: 1,
      };
      destinationAccount = {
        balance: 1500,
        bankAccountId: transaction.destinationAccountId,
        bankAccountNumber: "0987654321",
        bankName: "Bank XYZ",
        userId: 2,
      };
    });
    it("should successfully create a transaction", async () => {
      const transactionService = new TransactionService({
        amount: 250,
        sourceAccountId: "1",
        destinationAccountId: "2",
      });

      const sourceAccount = {
        balance: 1500,
        bankAccountId: transactionService.sourceAccountId,
        bankAccountNumber: "1234567890",
        bankName: "Bank XYZ",
        userId: 1,
      };
      const destinationAccount = {
        balance: 1500,
        bankAccountId: transactionService.destinationAccountId,
        bankAccountNumber: "0987654321",
        bankName: "Bank XYZ",
        userId: 2,
      };
      mockPrismaTransaction.bankAccount.findUnique.mockResolvedValueOnce(
        sourceAccount
      );
      mockPrismaTransaction.bankAccount.findUnique.mockResolvedValueOnce(
        destinationAccount
      );
      mockPrismaTransaction.transaction.create.mockResolvedValue({
        transaction: {
          amount: 300,
          destinationAccountId: transactionService.destinationAccountId,
          sourceAccountId: transactionService.sourceAccountId,
          transactionId: 1,
        },
      });
      const transactionSpy = jest.spyOn(
        mockPrismaTransaction.transaction,
        "create"
      );
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaTransaction);
      });

      await transactionService.createTransaction();

      expect(
        mockPrismaTransaction.bankAccount.findUnique.mock.calls[0][0]
      ).toEqual({
        where: { bankAccountId: parseInt(transactionService.sourceAccountId) },
      });
      expect(
        mockPrismaTransaction.bankAccount.findUnique.mock.calls[1][0]
      ).toEqual({
        where: {
          bankAccountId: parseInt(transactionService.destinationAccountId),
        },
      });
      expect(mockPrismaTransaction.bankAccount.update.mock.calls[0][0]).toEqual(
        {
          where: {
            bankAccountId: parseInt(transactionService.sourceAccountId),
          },
          data: { balance: sourceAccount.balance - transactionService.amount },
        }
      );
      expect(mockPrismaTransaction.bankAccount.update.mock.calls[1][0]).toEqual(
        {
          where: {
            bankAccountId: parseInt(transactionService.destinationAccountId),
          },
          data: {
            balance: destinationAccount.balance + transactionService.amount,
          },
        }
      );
      expect(mockPrismaTransaction.transaction.create).toHaveBeenCalledWith({
        data: {
          sourceAccountId: parseInt(sourceAccount.bankAccountId),
          destinationAccountId: parseInt(destinationAccount.bankAccountId),
          amount: transactionService.amount,
        },
      });
      expect(transactionSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if source account balance is not enough", async () => {
      sourceAccount.balance = 100;
      mockPrismaTransaction.bankAccount.findUnique.mockResolvedValueOnce(
        sourceAccount
      );
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaTransaction);
      });

      await expect(transaction.createTransaction()).rejects.toThrow(
        "Failed to Create"
      );
      expect(mockPrismaTransaction.bankAccount.update).not.toHaveBeenCalled();
      expect(mockPrismaTransaction.transaction.create).not.toHaveBeenCalled();
    });

    it("should return an error when source account not found", async () => {
      sourceAccount.bankAccountId = -1;
      const mockError = new HttpError(
        `Account with ID ${sourceAccount.bankAccountId} not found`,
        404
      );
      mockPrismaTransaction.bankAccount.findUnique.mockRejectedValue(mockError);

      await expect(transaction.createTransaction()).rejects.toThrow(
        `Account with ID ${sourceAccount.bankAccountId} not found`
      );
      expect(mockPrismaTransaction.bankAccount.update).not.toHaveBeenCalled();
      expect(mockPrismaTransaction.transaction.create).not.toHaveBeenCalled();
    });
    it("should return an error when destination account not found", async () => {
      destinationAccount.bankAccountId = -1;
      const mockError = new HttpError(
        `Account with ID ${destinationAccount.bankAccountId} not found`,
        404
      );
      mockPrismaTransaction.bankAccount.findUnique.mockResolvedValue(
        sourceAccount
      );
      mockPrismaTransaction.bankAccount.findUnique.mockRejectedValue(mockError);

      await expect(transaction.createTransaction()).rejects.toThrow(
        `Account with ID ${destinationAccount.bankAccountId} not found`
      );
      expect(mockPrismaTransaction.bankAccount.update).not.toHaveBeenCalled();
      expect(mockPrismaTransaction.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe("getAccount", () => {
    let transactionService = new TransactionService({
      amount: 250,
      sourceAccountId: "1",
      destinationAccountId: "2",
    });
    let sourceAccount = {
      balance: 1500,
      bankAccountId: transactionService.sourceAccountId,
      bankAccountNumber: "1234567890",
      bankName: "Bank XYZ",
      userId: 1,
    };

    it("should return an account", async () => {
      mockPrismaTransaction.bankAccount.findUnique.mockResolvedValue(
        sourceAccount
      );
      const bankAccountSpy = jest.spyOn(
        mockPrismaTransaction.bankAccount,
        "findUnique"
      );

      await transactionService.getAccount(
        mockPrismaTransaction,
        sourceAccount.bankAccountId
      );
      expect(mockPrismaTransaction.bankAccount.findUnique).toHaveBeenCalledWith(
        {
          where: { bankAccountId: parseInt(sourceAccount.bankAccountId) },
        }
      );
      expect(bankAccountSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if bank account is not found", async () => {
      sourceAccount.bankAccountId = -1;
      mockPrismaTransaction.bankAccount.findUnique.mockResolvedValue(null);

      await expect(
        transactionService.getAccount(
          mockPrismaTransaction,
          sourceAccount.bankAccountId
        )
      ).rejects.toThrow(
        new HttpError(
          `Account with ID ${sourceAccount.bankAccountId} not found`,
          404
        )
      );
    });
  });

  describe("checkSufficientBalance", () => {
    let transactionService = new TransactionService({
      amount: 250,
      sourceAccountId: "1",
      destinationAccountId: "2",
    });
    let sourceAccount = {
      balance: 1500,
      bankAccountId: transactionService.sourceAccountId,
      bankAccountNumber: "1234567890",
      bankName: "Bank XYZ",
      userId: 1,
    };
    it("should work fine if sourceAccount balance is enough", () => {
      expect(() =>
        transactionService.checkSufficientBalance(sourceAccount)
      ).not.toThrow();
    });
    it("should return an error if sourceAccount balance is not enough", async () => {
      sourceAccount.balance = 1;
      transactionService.amount = 1000;
      await expect(() =>
        transactionService.checkSufficientBalance(sourceAccount)
      ).toThrowError(
        new HttpError("Insufficient balance in source account", 403)
      );
    });
  });
  describe("updateAccountBalance", () => {
    let transactionService = new TransactionService({
      amount: 250,
      sourceAccountId: "1",
      destinationAccountId: "2",
    });
    let sourceAccount = {
      balance: 1500,
      bankAccountId: transactionService.sourceAccountId,
      bankAccountNumber: "1234567890",
      bankName: "Bank XYZ",
      userId: 1,
    };
    it("should update account balance", async () => {
      await transactionService.updateAccountBalance(
        mockPrismaTransaction,
        sourceAccount.bankAccountId,
        sourceAccount.balance - transactionService.amount
      );

      expect(mockPrismaTransaction.bankAccount.update).toHaveBeenCalledWith({
        where: { bankAccountId: sourceAccount.bankAccountId },
        data: { balance: sourceAccount.balance - transactionService.amount },
      });
    });
  });
  describe("getAllTransaction", () => {
    it("should return all transactions", async () => {
      const expected = [
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
      mockPrisma.transaction.findMany.mockResolvedValue(expected);

      const result = await TransactionService.getAllTransactions();

      expect(result).toBe(expected);
    });

    it("should return an error if there is no transaction", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue(null);

      await expect(TransactionService.getAllTransactions()).rejects.toThrow(
        new HttpError(
          "Failed to retrieve transactions : No transactions were found.",
          404
        )
      );
    });
  });

  describe("getTransactionById", () => {
    it("should return an account", async () => {
      const expected = {
        transaction: {
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
      };
      mockPrisma.transaction.findUnique.mockResolvedValue(expected);

      const result = await TransactionService.getTransactionById(1);
      expect(result).toBe(expected);
    });
    it("should return an error if no account is found", async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(TransactionService.getTransactionById(-1)).rejects.toThrow(
        new HttpError(
          "Failed to get Transaction : No transactions were found.",
          404
        )
      );
    });
  });
});
