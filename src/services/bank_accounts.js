const prisma = require("../db");
const { HttpError } = require("../middleware/errorhandling");

class BankAccount {
  static prisma = prisma;
  constructor(data) {
    this.userId = data.userId;
    this.bankName = data.bankName;
    this.bankAccountNumber = data.bankAccountNumber;
    this.balance = data.balance;
  }

  async validateUser() {
    const user = await BankAccount.prisma.user.findUnique({
      where: { userId: parseInt(this.userId) },
    });
    if (!user) {
      throw new HttpError("User not Found", 404);
    }
  }

  async createAccount() {
    try {
      await this.validateUser();

      const newAccount = await BankAccount.prisma.bankAccount.create({
        data: {
          userId: parseInt(this.userId),
          bankName: this.bankName,
          bankAccountNumber: this.bankAccountNumber,
          balance: this.balance,
        },
      });
      return newAccount;
    } catch (error) {
      throw new HttpError(
        "Failed to create bank account : " + error.message,
        error.statusCode
      );
    }
  }

  static async getAllBankAccounts() {
    try {
      const bankAccounts = await BankAccount.prisma.bankAccount.findMany({
        include: {
          user: true,
        },
      });

      if (!bankAccounts || bankAccounts.length == 0) {
        throw new HttpError("Bank accounts not found", 404);
      }

      return bankAccounts;
    } catch (error) {
      throw new HttpError(
        "Failed to get all bank accounts : " + error.message,
        error.statusCode
      );
    }
  }

  static async getBankAccountById(bankAccountId) {
    try {
      const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
        where: {
          bankAccountId: parseInt(bankAccountId),
        },
        include: {
          user: true,
        },
      });

      if (!bankAccount) {
        throw new HttpError("Bank account not found", 404);
      }

      return bankAccount;
    } catch (error) {
      throw new HttpError(
        "Failed to get Bank Account : " + error.message,
        error.statusCode
      );
    }
  }

  static async deleteAccountById(bankAccountId) {
    try {
      const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
        where: {
          bankAccountId: parseInt(bankAccountId),
        },
      });

      if (!bankAccount) {
        throw new HttpError("Bank Account not Found", 404);
      }

      await BankAccount.prisma.bankAccount.delete({
        where: {
          bankAccountId: parseInt(bankAccountId),
        },
      });

      return { message: "Bank account successfully deleted" };
    } catch (error) {
      throw new HttpError(
        "Failed to delete Bank account : " + error.message,
        error.statusCode
      );
    }
  }

  static async updateAccount(bankAccountId, updatedData) {
    try {
      const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
        where: {
          bankAccountId: parseInt(bankAccountId),
        },
      });

      if (!bankAccount) {
        throw new HttpError("Bank Account not Found", 404);
      }
      const updatedAccount = await BankAccount.prisma.bankAccount.update({
        where: {
          bankAccountId: parseInt(bankAccountId),
        },
        data: {
          bankName: updatedData.bankName,
          bankAccountNumber: updatedData.bankAccountNumber,
          balance: updatedData.balance,
        },
      });

      return updatedAccount;
    } catch (error) {
      throw new HttpError(
        "Failed to update bank account : " + error.message,
        error.statusCode
      );
    }
  }

  static async withdraw(bankAccountId, amount) {
    try {
      const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
        where: {
          bankAccountId: parseInt(bankAccountId),
        },
      });
      if (!bankAccount) {
        throw new HttpError("Bank Account not Found", 404);
      }

      if (amount <= 0) {
        throw new HttpError("Amount must be greater than zero", 403);
      }

      if (bankAccount.balance < amount) {
        throw new HttpError("Insufficient balance", 403);
      }

      const updatedAccount = await BankAccount.prisma.bankAccount.update({
        where: {
          bankAccountId: parseInt(bankAccountId),
        },
        data: {
          balance: bankAccount.balance - amount,
        },
      });

      return updatedAccount;
    } catch (error) {
      throw new HttpError(
        "Failed to withdraw from bank account : " + error.message,
        error.statusCode
      );
    }
  }

  static async deposit(bankAccountId, amount) {
    try {
      const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
        where: {
          bankAccountId: parseInt(bankAccountId),
        },
      });

      if (!bankAccount) {
        throw new HttpError("Bank Account not Found", 404);
      }

      if (amount <= 0) {
        throw new HttpError("Amount must be greater than zero", 404);
      }

      const updatedAccount = await BankAccount.prisma.bankAccount.update({
        where: {
          bankAccountId: parseInt(bankAccountId),
        },
        data: {
          balance: bankAccount.balance + amount,
        },
      });

      return updatedAccount;
    } catch (error) {
      throw new HttpError(
        "Failed to deposit from bank account : " + error.message,
        error.statusCode
      );
    }
  }
}

module.exports = BankAccount;
