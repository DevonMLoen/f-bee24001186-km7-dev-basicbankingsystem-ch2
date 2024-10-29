const express = require('express');
const { validateTransaction } = require('../middleware/validator.js');
const TransactionController = require('../controllers/transactions');

const router = express.Router();
const restrict = require('../middleware/restrict');

router.use(restrict); // add jwt authenticate

router.get("/", (req, res) => TransactionController.getAllTransactions(req, res));
router.post('/', validateTransaction, (req, res) => TransactionController.createTransaction(req, res));
router.get("/:id", (req, res) => TransactionController.getTransactionById(req, res));

module.exports = router;
