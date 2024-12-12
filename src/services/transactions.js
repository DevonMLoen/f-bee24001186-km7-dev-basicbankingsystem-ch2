const prisma = require("../db");
const { HttpError } = require("../middleware/errorhandling");

class Transaction {
  static prisma = prisma;
  constructor(data) {
    this.sourceAccountId = data.sourceAccountId;
    this.destinationAccountId = data.destinationAccountId;
    this.amount = data.amount;
  }

  async createTransaction() {
    try {
      const transactionResult = await Transaction.prisma.$transaction(
        async (tx) => {
          const sourceAccount = await this.getAccount(tx, this.sourceAccountId);

          this.checkSufficientBalance(sourceAccount);

          const destinationAccount = await this.getAccount(
            tx,
            this.destinationAccountId
          );
          await this.updateAccountBalance(
            tx,
            parseInt(this.sourceAccountId),
            sourceAccount.balance - this.amount
          );

          await this.updateAccountBalance(
            tx,
            parseInt(this.destinationAccountId),
            destinationAccount.balance + this.amount
          );
          const newTransaction = await tx.transaction.create({
            data: {
              sourceAccountId: parseInt(this.sourceAccountId),
              destinationAccountId: parseInt(this.destinationAccountId),
              amount: this.amount,
            },
          });

          return newTransaction;
        }
      );
      return transactionResult;
    } catch (error) {
      throw new HttpError(
        "Failed to Create transactions : " + error.message,
        error.statusCode
      );
    }
  }

  async getAccount(tx, accountId) {
    const account = await tx.bankAccount.findUnique({
      where: { bankAccountId: parseInt(accountId) },
    });

    if (!account) {
      throw new HttpError(`Account with ID ${accountId} not found`, 404);
    }

    return account;
  }

  checkSufficientBalance(account) {
    if (account.balance < this.amount) {
      throw new HttpError("Insufficient balance in source account", 403);
    }
  }

  async updateAccountBalance(tx, accountId, newBalance) {
    await tx.bankAccount.update({
      where: { bankAccountId: accountId },
      data: { balance: newBalance },
    });
  }

  static async getAllTransactions() {
    try {
      const transactions = await Transaction.prisma.transaction.findMany({
        include: {
          bankAccountSource: true,
          bankAccountDestination: true,
        },
      });

      if (!transactions || transactions.length === 0) {
        throw new HttpError("No transactions were found.", 404);
      }
      return transactions;
    } catch (error) {
      throw new HttpError(
        "Failed to retrieve transactions : " + error.message,
        error.statusCode
      );
    }
  }

  static async getTransactionById(transactionId) {
    try {
      const transaction = await Transaction.prisma.transaction.findUnique({
        where: {
          transactionId: parseInt(transactionId),
        },
        include: {
          bankAccountSource: true,
          bankAccountDestination: true,
        },
      });

      if (!transaction || transaction.length === 0) {
        throw new HttpError("No transactions were found.", 404);
      }

      return transaction;
    } catch (error) {
      throw new HttpError(
        "Failed to get Transaction : " + error.message,
        error.statusCode
      );
    }
  }
}

module.exports = Transaction;
