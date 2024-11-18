const Transaction = require('../services/transactions');
const TransactionController = require('../controllers/transactions');

jest.mock('../services/transactions'); // Mock the Transaction service

describe('TransactionController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {} }; // Mock request object
        res = {
            status: jest.fn().mockReturnThis(), // Mock response methods
            json: jest.fn(),
        };
        next = jest.fn(); // Mock next function
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear all mocks after each test
    });

    describe('getAllTransactions', () => {
        test('should return all transactions with status 200', async () => {
            const mockTransactions = [{ id: 1, amount: 100 }, { id: 2, amount: 200 }];
            Transaction.getAllTransactions.mockResolvedValue(mockTransactions);

            await TransactionController.getAllTransactions(req, res, next);

            expect(Transaction.getAllTransactions).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTransactions);
        });

        test('should call next with an error if service fails', async () => {
            const mockError = new Error('Failed to fetch transactions');
            Transaction.getAllTransactions.mockRejectedValue(mockError);

            await TransactionController.getAllTransactions(req, res, next);

            expect(next).toHaveBeenCalledWith(mockError);
        });
    });

    describe('createTransaction', () => {
        test('should create a transaction and return 201 with transaction data', async () => {
            const mockRequestBody = {
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 100,
            };
            const mockTransactionResult = { id: 1, ...mockRequestBody };
            req.body = mockRequestBody;

            Transaction.mockImplementation(() => ({
                createTransaction: jest.fn().mockResolvedValue(mockTransactionResult),
            }));

            await TransactionController.createTransaction(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Transaction successful',
                transaction: mockTransactionResult,
            });
        });

        test('should call next with an error if transaction creation fails', async () => {
            const mockRequestBody = {
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 100,
            };
            const mockError = new Error('Transaction failed');
            req.body = mockRequestBody;

            Transaction.mockImplementation(() => ({
                createTransaction: jest.fn().mockRejectedValue(mockError),
            }));

            await TransactionController.createTransaction(req, res, next);

            expect(next).toHaveBeenCalledWith(mockError);
        });
    });

    describe('getTransactionById', () => {
        test('should return transaction by ID with status 200', async () => {
            const mockTransaction = { id: 1, amount: 100 };
            req.params.id = '1';
            Transaction.getTransactionById.mockResolvedValue(mockTransaction);

            await TransactionController.getTransactionById(req, res, next);

            expect(Transaction.getTransactionById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ transaction: mockTransaction });
        });

        test('should call next with an error if service fails', async () => {
            const mockError = new Error('Transaction not found');
            req.params.id = '1';
            Transaction.getTransactionById.mockRejectedValue(mockError);

            await TransactionController.getTransactionById(req, res, next);

            expect(next).toHaveBeenCalledWith(mockError);
        });
    });
});
