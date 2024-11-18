const BankAccountController = require('../controllers/bank_accounts');
const BankAccount = require('../services/bank_accounts');

jest.mock('../services/bank_accounts');

describe('BankAccountController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      params: { id: 1 },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('getAllBankAccounts', () => {
    it('should return all bank accounts', async () => {
      const mockAccounts = [{ id: 1, name: 'Bank A', number: '123456', balance: 1000 }];
      BankAccount.getAllBankAccounts.mockResolvedValue(mockAccounts);

      await BankAccountController.getAllBankAccounts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAccounts);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      BankAccount.getAllBankAccounts.mockRejectedValue(mockError);

      await BankAccountController.getAllBankAccounts(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createAccount', () => {
    it('should create a new bank account', async () => {
      req.body = {
        userId: 1,
        bankName: 'Bank A',
        bankAccountNumber: '123456',
        balance: 1000,
      };

      const mockNewAccount = { id: 1, name: 'Bank A', number: '123456', balance: 1000 };
      BankAccount.prototype.createAccount.mockResolvedValue(mockNewAccount);

      await BankAccountController.createAccount(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockNewAccount);
    });

    it('should handle errors during account creation', async () => {
      const mockError = new Error('Failed to create bank account');
      BankAccount.prototype.createAccount.mockRejectedValue(mockError);

      await BankAccountController.createAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getBankAccountById', () => {
    it('should return a bank account by ID', async () => {
      const mockAccount = { id: 1, name: 'Bank A', number: '123456', balance: 1000 };
      BankAccount.getBankAccountById.mockResolvedValue(mockAccount);

      await BankAccountController.getBankAccountById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bankAccount: mockAccount });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      BankAccount.getBankAccountById.mockRejectedValue(mockError);

      await BankAccountController.getBankAccountById(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteAccountById', () => {
    it('should delete a bank account by ID', async () => {
      const mockResponse = { message: 'Bank account deleted' };
      BankAccount.deleteAccountById.mockResolvedValue(mockResponse);

      await BankAccountController.deleteAccountById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle errors during account deletion', async () => {
      const mockError = new Error('Failed to delete bank account');
      BankAccount.deleteAccountById.mockRejectedValue(mockError);

      await BankAccountController.deleteAccountById(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateAccount', () => {
    it('should update a bank account', async () => {
      req.body = {
        bankName: 'Updated Bank',
        bankAccountNumber: '654321',
        balance: 2000,
      };

      const mockUpdatedAccount = { id: 1, name: 'Updated Bank', number: '654321', balance: 2000 };
      BankAccount.updateAccount.mockResolvedValue(mockUpdatedAccount);

      await BankAccountController.updateAccount(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bank account successfully updated',
        account: mockUpdatedAccount,
      });
    });

    it('should handle errors during account update', async () => {
      const mockError = new Error('Failed to update bank account');
      BankAccount.updateAccount.mockRejectedValue(mockError);

      await BankAccountController.updateAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('withdraw', () => {
    it('should withdraw from a bank account', async () => {
      req.body.amount = 500;

      const mockUpdatedAccount = { id: 1, name: 'Bank A', number: '123456', balance: 500 };
      BankAccount.withdraw.mockResolvedValue(mockUpdatedAccount);

      await BankAccountController.withdraw(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bank account Withdraw successfully',
        account: mockUpdatedAccount,
      });
    });

    it('should handle errors during withdrawal', async () => {
      const mockError = new Error('Failed to withdraw');
      BankAccount.withdraw.mockRejectedValue(mockError);

      await BankAccountController.withdraw(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deposit', () => {
    it('should deposit into a bank account', async () => {
      req.body.amount = 500;

      const mockUpdatedAccount = { id: 1, name: 'Bank A', number: '123456', balance: 1500 };
      BankAccount.deposit.mockResolvedValue(mockUpdatedAccount);

      await BankAccountController.deposit(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bank account Deposit successfully',
        account: mockUpdatedAccount,
      });
    });

    it('should handle errors during deposit', async () => {
      const mockError = new Error('Failed to deposit');
      BankAccount.deposit.mockRejectedValue(mockError);

      await BankAccountController.deposit(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
