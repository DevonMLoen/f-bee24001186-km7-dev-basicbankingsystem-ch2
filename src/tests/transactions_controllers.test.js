const TransactionController = require('../controllers/transactions');
const Transaction = require('../services/transactions');

jest.mock('../services/transactions');

describe('TransactionController', () => {
  let transactionController;
  let req;
  let res;

  beforeEach(() => {
    transactionController = TransactionController; 

    req = {
      body: {},
      params: { id: 1 },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getAllTransactions', () => {
    it('should return all transactions', async () => {
      const mockTransactions = [{ id: 1, sourceAccountId: 1, destinationAccountId: 2, amount: 100 }];
      Transaction.getAllTransactions.mockResolvedValue(mockTransactions);

      await transactionController.getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    it('should return a 404 if no transactions are found', async () => {
      Transaction.getAllTransactions.mockResolvedValue([]);

      await transactionController.getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No transactions were found.' });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      Transaction.getAllTransactions.mockRejectedValue(mockError);

      await transactionController.getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      req.body = {
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 100,
      };
      const mockTransactionResult = { id: 1, sourceAccountId: 1, destinationAccountId: 2, amount: 100 };
      Transaction.prototype.createTransaction.mockResolvedValue(mockTransactionResult);

      await transactionController.createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Transaction successful',
        transaction: mockTransactionResult,
      });
    });

    it('should handle errors during transaction creation', async () => {
      req.body = {
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 100,
      };
      const mockError = new Error('Failed to create transaction');
      Transaction.prototype.createTransaction.mockRejectedValue(mockError);

      await transactionController.createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });

  describe('getTransactionById', () => {
    it('should return a transaction by ID', async () => {
      const mockTransaction = { id: 1, sourceAccountId: 1, destinationAccountId: 2, amount: 100 };
      Transaction.getTransactionById.mockResolvedValue(mockTransaction);

      await transactionController.getTransactionById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transaction: mockTransaction });
    });

    it('should return a 404 if no transaction is found', async () => {
      Transaction.getTransactionById.mockResolvedValue(null);

      await transactionController.getTransactionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No transactions were found.' });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      Transaction.getTransactionById.mockRejectedValue(mockError);

      await transactionController.getTransactionById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'An error occurred on the server.' });
    });
  });
});
