const express = require('express');
const { validateBankAccount, validateBankPatchAccount } = require('../middleware/validator.js');
const BankAccountController = require('../controllers/bank_accounts');

const router = express.Router();
const restrict = require('../middleware/restrict');

router.use(restrict); // add jwt authenticate

router.get("/", (req, res) => BankAccountController.getAllBankAccounts(req, res));
router.post('/', validateBankAccount, (req, res) => BankAccountController.createAccount(req, res));
router.get("/:id", (req, res) => BankAccountController.getBankAccountById(req, res));
router.delete('/:id', (req, res) => BankAccountController.deleteAccountById(req, res));
router.patch('/:id', validateBankPatchAccount, (req, res) => BankAccountController.updateAccount(req, res));
router.patch('/:id/withdraw', (req, res) => BankAccountController.withdraw(req, res));
router.patch('/:id/deposit', (req, res) => BankAccountController.deposit(req, res));

module.exports = router;
