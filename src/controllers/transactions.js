const Transaction = require("../services/transactions");

class TransactionController {
  async getAllTransactions(req, res, next) {
    try {
      const transactions = await Transaction.getAllTransactions();

      res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req, res, next) {
    const { sourceAccountId, destinationAccountId, amount } = req.body;

    try {
      const transaction = new Transaction({
        sourceAccountId,
        destinationAccountId,
        amount,
      });

      const transactionResult = await transaction.createTransaction();

      return res.status(201).json({
        message: "Transaction successful",
        transaction: transactionResult,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      const transactionId = req.params.id;

      const transaction = await Transaction.getTransactionById(transactionId);
      res.status(200).json({ transaction });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
