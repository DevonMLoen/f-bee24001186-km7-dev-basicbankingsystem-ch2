const BankAccount = require('../services/bank_accounts');

class BankAccountController {
  async getAllBankAccounts(req, res, next) {
    try {
      const bankaccounts = await BankAccount.getAllBankAccounts();

      res.status(200).json(bankaccounts);
    } catch (error) {
      next(error);
    }
  }

  async createAccount(req, res, next) {
    try {
      const { userId, bankName, bankAccountNumber, balance } = req.body;

      const accountData = {
        id: userId,
        name: bankName,
        number: bankAccountNumber,
        balance: balance,
      };

      const account = new BankAccount(accountData);

      const newBankAccount = await account.createAccount();

      res.status(201).json(newBankAccount);
    } catch (error) {
      next(error);
    }
  }

  async getBankAccountById(req, res, next) {
    try {
      const bankAccountId = req.params.id;

      const bankAccount = await BankAccount.getBankAccountById(bankAccountId);

      res.status(200).json({ bankAccount });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccountById(req, res, next) {
    const id = req.params.id;

    try {
      const response = await BankAccount.deleteAccountById(id);
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateAccount(req, res, next) {
    const id = req.params.id;
    const { bankName, bankAccountNumber, balance } = req.body;

    try {
      const updatedAccount = await BankAccount.updateAccount(id, {
        bankName,
        bankAccountNumber,
        balance,
      });
      return res.status(200).json({
        message: 'Bank account successfully updated',
        account: updatedAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req, res, next) {
    const id = req.params.id;
    const { amount } = req.body;

    try {
      const updatedAccount = await BankAccount.withdraw(id, amount);
      return res.status(200).json({
        message: 'Bank account Withdraw successfully',
        account: updatedAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  async deposit(req, res, next) {
    const id = req.params.id;
    const { amount } = req.body;

    try {
      const updatedAccount = await BankAccount.deposit(id, amount);
      return res.status(200).json({
        message: 'Bank account Deposit successfully',
        account: updatedAccount,
      });
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new BankAccountController();
