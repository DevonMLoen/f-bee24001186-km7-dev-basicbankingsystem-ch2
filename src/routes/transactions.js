const express = require('express');
const { validateTransaction } = require('../middleware/validator.js');
const TransactionController = require('../controllers/transactions');

const router = express.Router();
const restrict = require('../middleware/restrict');

router.use(restrict); // add jwt authenticate

router.get("/", (req, res, next) => TransactionController.getAllTransactions(req, res, next));
router.post('/', validateTransaction, (req, res, next) => TransactionController.createTransaction(req, res, next));
router.get("/:id", (req, res, next) => TransactionController.getTransactionById(req, res, next));

module.exports = router;
