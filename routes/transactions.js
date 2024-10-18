const express = require('express');
const router = express.Router();
const { validateTransaction } = require('../middleware/validator.js');
const Transaction = require('../services/transactions.js');

router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.getAllTransactions();

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions were found.' });
    }
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', validateTransaction, async (req, res) => {
  const { sourceAccountId, destinationAccountId, amount } = req.body;

  try {
    const transaction = new Transaction({ sourceAccountId, destinationAccountId, amount });

    const transactionResult = await transaction.createTransaction();

    return res.status(201).json({
      message: 'Transaction successful',
      transaction: transactionResult,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;

    const transaction = await Transaction.getTransactionById(transactionId);
    if (!transaction || transaction.length === 0) {
      return res.status(404).json({ message: 'No transactions were found.' });
    }

    res.status(200).json({ transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});

module.exports = router;
