const BankAccountController = require('../controllers/bank_accounts');
const BankAccount = require('../services/bank_Accounts');

jest.mock('../services/bank_Accounts');

describe('BankAccountController', () => {
  let bankAccountController;
  let req;
  let res;

  beforeEach(() => {
    bankAccountController = BankAccountController;

    req = {
      body: {},
      params: { id: 1 },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getAllBankAccounts', () => {
    it('should return all bank accounts', async () => {
      const mockAccounts = [{ id: 1, name: 'Bank A', number: '123456', balance: 1000 }];
      BankAccount.getAllBankAccounts.mockResolvedValue(mockAccounts);

      await bankAccountController.getAllBankAccounts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAccounts);
    });

    it('should return a 404 if no bank accounts are found', async () => {
      BankAccount.getAllBankAccounts.mockResolvedValue([]);

      await bankAccountController.getAllBankAccounts(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No bank accounts were found' });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      BankAccount.getAllBankAccounts.mockRejectedValue(mockError);

      await bankAccountController.getAllBankAccounts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
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

      await bankAccountController.createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockNewAccount);
    });

    it('should handle errors during account creation', async () => {
      req.body = {
        userId: 1,
        bankName: 'Bank A',
        bankAccountNumber: '123456',
        balance: 1000,
      };
      const mockError = new Error('Failed to create bank account');
      BankAccount.prototype.createAccount.mockRejectedValue(mockError);

      await bankAccountController.createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create bank account', error: mockError.message });
    });
  });

  describe('getBankAccountById', () => {
    it('should return a bank account by ID', async () => {
      const mockAccount = { id: 1, name: 'Bank A', number: '123456', balance: 1000 };
      BankAccount.getBankAccountById.mockResolvedValue(mockAccount);

      await bankAccountController.getBankAccountById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bankAccount: mockAccount });
    });

    it('should return a 404 if no bank account is found', async () => {
      BankAccount.getBankAccountById.mockResolvedValue(null);

      await bankAccountController.getBankAccountById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No bank accounts were found' });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      BankAccount.getBankAccountById.mockRejectedValue(mockError);

      await bankAccountController.getBankAccountById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'An error occurred on the server.' });
    });
  });

  describe('deleteAccountById', () => {
    it('should delete a bank account by ID', async () => {
      const mockResponse = { message: 'Bank account deleted' };
      BankAccount.deleteAccountById.mockResolvedValue(mockResponse);

      await bankAccountController.deleteAccountById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle errors during account deletion', async () => {
      const mockError = new Error('Failed to delete bank account');
      BankAccount.deleteAccountById.mockRejectedValue(mockError);

      await bankAccountController.deleteAccountById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: mockError.message });
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

      await bankAccountController.updateAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bank account successfully updated',
        account: mockUpdatedAccount,
      });
    });

    it('should handle errors during account update', async () => {
      req.body = {
        bankName: 'Updated Bank',
        bankAccountNumber: '654321',
        balance: 2000,
      };
      const mockError = new Error('Failed to update bank account');
      BankAccount.updateAccount.mockRejectedValue(mockError);

      await bankAccountController.updateAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });

  describe('withdraw', () => {
    it('should withdraw from a bank account', async () => {
      req.body.amount = 500;
      const mockUpdatedAccount = { id: 1, name: 'Bank A', number: '123456', balance: 500 };
      BankAccount.withdraw.mockResolvedValue(mockUpdatedAccount);

      await bankAccountController.withdraw(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bank account Withdraw successfully',
        account: mockUpdatedAccount,
      });
    });

    it('should handle errors during withdrawal', async () => {
      req.body.amount = 500;
      const mockError = new Error('Failed to withdraw');
      BankAccount.withdraw.mockRejectedValue(mockError);

      await bankAccountController.withdraw(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });

  describe('deposit', () => {
    it('should deposit into a bank account', async () => {
      req.body.amount = 500;
      const mockUpdatedAccount = { id: 1, name: 'Bank A', number: '123456', balance: 1500 };
      BankAccount.deposit.mockResolvedValue(mockUpdatedAccount);

      await bankAccountController.deposit(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bank account Deposit successfully',
        account: mockUpdatedAccount,
      });
    });

    it('should handle errors during deposit', async () => {
      req.body.amount = 500;
      const mockError = new Error('Failed to deposit');
      BankAccount.deposit.mockRejectedValue(mockError);

      await bankAccountController.deposit(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });
});
