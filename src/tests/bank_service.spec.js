const BankAccount = require("../services/bank_accounts");
require("../utils/create-app");

jest.mock("../db", () => ({
  user: {
    findUnique: jest.fn(),
  },
  bankAccount: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe("bankService", () => {
  const mockBank = {
    balance: 1000,
    bankAccountId: 1,
    bankAccountNumber: "9876543210",
    bankName: "Bank ABC",
    userId: 2,
  };
  const bank = new BankAccount({ id: "", name: "", number: "", balance: "" });
  const mockPrisma = require("../db");
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("should success if user is found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(true);

      await bank.validateUser();
    });

    it("should return an error if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(bank.validateUser()).rejects.toThrow("User not Found");
    });
  });

  describe("createAccount", () => {
    it("should successfully create an account", async () => {
      const data = {
        userId: 1,
        bankName: "test",
        bankAccountNumber: 123456,
        balance: 123456,
      };
      const bank = new BankAccount(data);
      mockPrisma.user.findUnique.mockResolvedValue(true);
      mockPrisma.bankAccount.create.mockResolvedValue(mockBank);
      const bankSpy = jest.spyOn(mockPrisma.bankAccount, "create");

      const result = await bank.createAccount();

      expect(result).toStrictEqual(mockBank);
      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({ data });
      expect(bankSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(bank.createAccount()).rejects.toThrow("User not Found");
    });
  });

  describe("getAllBankAccounts", () => {
    it("should return all bank accounts", async () => {
      const expected = [
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
      const bankSpy = jest.spyOn(mockPrisma.bankAccount, "findMany");
      mockPrisma.bankAccount.findMany.mockResolvedValue(expected);

      const result = await BankAccount.getAllBankAccounts();

      expect(result).toStrictEqual(expected);
      expect(bankSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if there is no bank accounts", async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue(null);

      await expect(BankAccount.getAllBankAccounts()).rejects.toThrow(
        "Bank accounts not found"
      );
    });
  });

  describe("getBankAccountById", () => {
    it("should return bank account", async () => {
      const expected = {
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
      mockPrisma.bankAccount.findUnique.mockResolvedValue(expected);
      const bankSpy = jest.spyOn(mockPrisma.bankAccount, "findUnique");

      const result = await BankAccount.getBankAccountById(1);

      expect(result).toStrictEqual(expected);
      expect(bankSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if no bank account found", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(BankAccount.getBankAccountById(2)).rejects.toThrow(
        "Bank account not found"
      );
    });
  });

  describe("deleteAccountById", () => {
    it("should delete account successfully", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBank);
      mockPrisma.bankAccount.delete.mockResolvedValue(true);
      const bankSpy = jest.spyOn(mockPrisma.bankAccount, "delete");
      const accountToDelete = 1;
      const result = await BankAccount.deleteAccountById(accountToDelete);

      expect(result).toStrictEqual({
        message: "Bank account successfully deleted",
      });
      expect(mockPrisma.bankAccount.delete).toHaveBeenCalledWith({
        where: { bankAccountId: accountToDelete },
      });
      expect(bankSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if bank account not found", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(BankAccount.deleteAccountById(2)).rejects.toThrow(
        "Failed to delete Bank account"
      );
      expect(mockPrisma.bankAccount.delete).not.toHaveBeenCalled();
    });
  });

  describe("updateAccount", () => {
    it("should successfully update account", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBank);
      const updatedData = {
        bankAccountNumber: "1234567890",
        bankName: "Bank XYZ",
        balance: 1500,
      };
      const expected = {
        account: {
          bankAccountId: 2,
          userId: 1,
          ...updatedData,
        },
        message: "Bank account successfully updated",
      };
      mockPrisma.bankAccount.update.mockResolvedValue(expected, updatedData);
      const bankSpy = jest.spyOn(mockPrisma.bankAccount, "update");
      const result = await BankAccount.updateAccount(1, updatedData);

      expect(result).toStrictEqual(expected);
      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { bankAccountId: 1 },
        data: updatedData,
      });
      expect(bankSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if bank account not found", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(null);
      const updatedData = {
        bankAccountNumber: "1234567890",
        bankName: "Bank XYZ",
        balance: 1500,
      };
      await expect(BankAccount.updateAccount(2, updatedData)).rejects.toThrow(
        "Failed to update bank account"
      );
      expect(mockPrisma.bankAccount.update).not.toHaveBeenCalled();
    });
  });

  describe("withdraw", () => {
    const mockBank = {
      balance: 500,
      bankAccountId: 1,
      bankAccountNumber: "1234567890",
      bankName: "Bank XYZ",
      userId: 1,
    };
    it("should successfully withdraw", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBank);
      const initialBalance = mockBank.balance;
      const amount = 100;
      const updatedMockBank = { ...mockBank };
      updatedMockBank.balance -= amount;
      mockPrisma.bankAccount.update.mockResolvedValue(updatedMockBank);
      const bankSpy = jest.spyOn(mockPrisma.bankAccount, "update");
      const result = await BankAccount.withdraw(1, amount);

      expect(result).toStrictEqual(updatedMockBank);
      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { bankAccountId: 1 },
        data: { balance: initialBalance - amount },
      });
      expect(bankSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if bank account not found", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(BankAccount.withdraw(1, 100)).rejects.toThrow(
        "Failed to withdraw from bank account"
      );
      expect(mockPrisma.bankAccount.update).not.toHaveBeenCalled();
    });

    it("should return an error if amount is negative", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBank);
      const amount = -1;

      await expect(BankAccount.withdraw(1, amount)).rejects.toThrow(
        "Failed to withdraw from bank account : Amount must be greater than zero"
      );
      expect(mockPrisma.bankAccount.update).not.toHaveBeenCalled();
    });
    it("should return an error if trying to withdraw money greater than account balance", async () => {
      mockBank.balance = 50;
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBank);
      const amount = 100;
      const updatedMockBank = { ...mockBank };
      updatedMockBank.balance -= amount;

      await expect(BankAccount.withdraw(1, amount)).rejects.toThrow(
        "Failed to withdraw from bank account : Insufficient balance"
      );
      expect(mockPrisma.bankAccount.update).not.toHaveBeenCalled();
    });
  });

  describe("deposit", () => {
    const mockBank = {
      balance: 500,
      bankAccountId: 1,
      bankAccountNumber: "1234567890",
      bankName: "Bank XYZ",
      userId: 1,
    };
    it("should succesffully deposit", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBank);
      const initialBalance = mockBank.balance;
      const amount = 100;
      const updatedMockBank = { ...mockBank };
      updatedMockBank.balance += amount;
      mockPrisma.bankAccount.update.mockResolvedValue(updatedMockBank);
      const bankSpy = jest.spyOn(mockPrisma.bankAccount, "update");
      const result = await BankAccount.deposit(1, amount);

      expect(result).toStrictEqual(updatedMockBank);
      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { bankAccountId: 1 },
        data: { balance: initialBalance + amount },
      });
      expect(bankSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if bank account not found", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(BankAccount.deposit(1, 100)).rejects.toThrow(
        "Failed to deposit from bank account"
      );
      expect(mockPrisma.bankAccount.update).not.toHaveBeenCalled();
    });

    it("should return an error if amount is negative", async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBank);
      const amount = -1;

      await expect(BankAccount.deposit(1, amount)).rejects.toThrow(
        "Failed to deposit from bank account : Amount must be greater than zero"
      );
      expect(mockPrisma.bankAccount.update).not.toHaveBeenCalled();
    });
  });
});
