const BankAccount = require("../services/bank_accounts");
const prisma = require("../db");

// Mock Prisma
jest.mock("../db", () => ({
  user: {
    findUnique: jest.fn(),
  },
  bankAccount: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
}));

describe("BankAccount Class", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAccount", () => {
    test("should create a bank account successfully", async () => {
      prisma.user.findUnique.mockResolvedValue({ userId: 1 });
      prisma.bankAccount.create.mockResolvedValue({
        bankAccountId: 1,
        userId: 1,
        bankName: "Bank A",
        bankAccountNumber: "1234567890",
        balance: 1000,
      });

      const bankAccount = new BankAccount({
        id: 1,
        name: "Bank A",
        number: "1234567890",
        balance: 1000,
      });

      const result = await bankAccount.createAccount();
      expect(result).toHaveProperty("bankAccountId");
      expect(result.bankName).toBe("Bank A");
    });

    test("should throw error if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const bankAccount = new BankAccount({
        id: 999,
        name: "Bank A",
        number: "1234567890",
        balance: 1000,
      });

      await expect(bankAccount.createAccount()).rejects.toThrow("User not Found");
    });
  });

  describe("getAllBankAccounts", () => {
    test("should return all bank accounts", async () => {
      const mockAccounts = [
        { bankAccountId: 1, bankName: "Bank A", user: { userId: 1, userName: "User A" } },
      ];

      prisma.bankAccount.findMany.mockResolvedValue(mockAccounts);

      const accounts = await BankAccount.getAllBankAccounts();
      expect(accounts).toEqual(mockAccounts);
    });

    test("should throw error if fetch fails", async () => {
      prisma.bankAccount.findMany.mockRejectedValue(new Error("Database error"));

      await expect(BankAccount.getAllBankAccounts()).rejects.toThrow(
        "Failed to get all bank accounts : Database error"
      );
    });
  });

  describe("getBankAccountById", () => {
    test("should return a bank account by ID", async () => {
      const mockAccount = {
        bankAccountId: 1,
        bankName: "Bank A",
        user: { userId: 1, userName: "User A" },
      };

      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);

      const account = await BankAccount.getBankAccountById(1);
      expect(account).toEqual(mockAccount);
    });

    test("should throw error if bank account not found", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(BankAccount.getBankAccountById(999)).rejects.toThrow("Bank account not found");
    });
  });

  describe("deleteAccountById", () => {
    test("should delete a bank account successfully", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue({ bankAccountId: 1 });
      prisma.bankAccount.delete.mockResolvedValue({});

      const result = await BankAccount.deleteAccountById(1);
      expect(result.message).toBe("Bank account successfully deleted");
    });

    test("should throw error if bank account not found", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(BankAccount.deleteAccountById(999)).rejects.toThrow("Bank Account not Found");
    });
  });

  describe("updateAccount", () => {
    test("should update a bank account successfully", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue({ bankAccountId: 1 });
      prisma.bankAccount.update.mockResolvedValue({
        bankAccountId: 1,
        bankName: "Updated Bank",
        balance: 5000,
      });

      const result = await BankAccount.updateAccount(1, {
        bankName: "Updated Bank",
        balance: 5000,
      });

      expect(result.bankName).toBe("Updated Bank");
      expect(result.balance).toBe(5000);
    });

    test("should throw error if bank account not found", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(BankAccount.updateAccount(999, {})).rejects.toThrow("Bank Account not Found");
    });
  });

  describe("withdraw", () => {
    test("should throw error if bank account not found", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(BankAccount.withdraw(999, 100)).rejects.toThrow("Bank Account not Found");
    });

    test("should throw error if amount is invalid", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue({ bankAccountId: 1, balance: 1000 });

      await expect(BankAccount.withdraw(1, 0)).rejects.toThrow("Amount must be greater than zero");
      await expect(BankAccount.withdraw(1, -100)).rejects.toThrow("Amount must be greater than zero");
    });

    test("should throw error if insufficient balance", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue({ bankAccountId: 1, balance: 100 });

      await expect(BankAccount.withdraw(1, 200)).rejects.toThrow("Insufficient balance");
    });

    test("should withdraw successfully", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue({ bankAccountId: 1, balance: 1000 });
      prisma.bankAccount.update.mockResolvedValue({ bankAccountId: 1, balance: 900 });

      const result = await BankAccount.withdraw(1, 100);
      expect(result.balance).toBe(900);
    });
  });

  describe("deposit", () => {
    test("should deposit successfully", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue({ bankAccountId: 1, balance: 1000 });
      prisma.bankAccount.update.mockResolvedValue({ bankAccountId: 1, balance: 1500 });

      const result = await BankAccount.deposit(1, 500);
      expect(result.balance).toBe(1500);
    });

    test("should throw error if amount is invalid", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue({ bankAccountId: 1 });

      await expect(BankAccount.deposit(1, -500)).rejects.toThrow(
        "Amount must be greater than zero"
      );
    });

    test("should throw error if bank account is not found", async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(BankAccount.deposit(999, 500)).rejects.toThrow("Bank Account not Found");
    });
  });
});
