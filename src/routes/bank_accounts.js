const express = require('express');
const { validateBankAccount, validateBankPatchAccount } = require('../middleware/validator.js');
const BankAccountController = require('../controllers/bank_accounts');

const router = express.Router();
const restrict = require('../middleware/restrict');

router.use(restrict); // add jwt authenticate

router.get("/", (req, res, next) => BankAccountController.getAllBankAccounts(req, res, next));
router.post('/', validateBankAccount, (req, res, next) => BankAccountController.createAccount(req, res, next));
router.get("/:id", (req, res, next) => BankAccountController.getBankAccountById(req, res, next));
router.delete('/:id', (req, res, next) => BankAccountController.deleteAccountById(req, res, next));
router.patch('/:id', validateBankPatchAccount, (req, res, next) => BankAccountController.updateAccount(req, res, next));
router.patch('/:id/withdraw', (req, res, next) => BankAccountController.withdraw(req, res, next));
router.patch('/:id/deposit', (req, res, next) => BankAccountController.deposit(req, res, next));

module.exports = router;
