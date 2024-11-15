const Transaction = require('../services/transactions');
const prisma = require('../db');

jest.mock('../db', () => {
    return {
        transaction: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        bankAccount: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        $transaction: jest.fn(),
    };
});

describe('Transaction Service', () => {

    describe('createTransaction', () => {
        it('should create a transaction successfully', async () => {
            const transactionData = {
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 100,
            };

            const mockSourceAccount = { bankAccountId: 1, balance: 200 };
            const mockDestinationAccount = { bankAccountId: 2, balance: 100 };
            const mockNewTransaction = { transactionId: 1, ...transactionData };

            prisma.$transaction.mockImplementation(async (callback) => {
                return callback({
                    bankAccount: {
                        findUnique: jest.fn()
                            .mockResolvedValueOnce(mockSourceAccount)
                            .mockResolvedValueOnce(mockDestinationAccount),
                        update: jest.fn()
                            .mockResolvedValueOnce({ ...mockSourceAccount, balance: 100 })
                            .mockResolvedValueOnce({ ...mockDestinationAccount, balance: 200 }),
                    },
                    transaction: {
                        create: jest.fn().mockResolvedValue(mockNewTransaction),
                    },
                });
            });

            const transaction = new Transaction(transactionData);
            const result = await transaction.createTransaction();

            expect(prisma.$transaction).toHaveBeenCalled();
            expect(result).toEqual(mockNewTransaction);
        });

        it('should throw an error if the source account has insufficient balance', async () => {
            const transactionData = {
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 300,
            };

            const mockSourceAccount = { bankAccountId: 1, balance: 200 };
            const mockDestinationAccount = { bankAccountId: 2, balance: 100 };

            prisma.$transaction.mockImplementation(async (callback) => {
                return callback({
                    bankAccount: {
                        findUnique: jest.fn()
                            .mockResolvedValueOnce(mockSourceAccount)
                            .mockResolvedValueOnce(mockDestinationAccount),
                        update: jest.fn(),
                    },
                });
            });

            const transaction = new Transaction(transactionData);

            await expect(transaction.createTransaction()).rejects.toThrow('Insufficient balance in source account');
        });

        it('should throw an error if the source account is not found', async () => {
            const transactionData = {
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 100,
            };

            prisma.$transaction.mockImplementation(async (callback) => {
                return callback({
                    bankAccount: {
                        findUnique: jest.fn().mockResolvedValueOnce(null), // source account not found
                        update: jest.fn(),
                    },
                });
            });

            const transaction = new Transaction(transactionData);

            await expect(transaction.createTransaction()).rejects.toThrow('Account with ID 1 not found');
        });

        it('should throw an error if the destination account is not found', async () => {
            const transactionData = {
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 100,
            };

            const mockSourceAccount = { bankAccountId: 1, balance: 200 };

            prisma.$transaction.mockImplementation(async (callback) => {
                return callback({
                    bankAccount: {
                        findUnique: jest.fn()
                            .mockResolvedValueOnce(mockSourceAccount)
                            .mockResolvedValueOnce(null), // destination account not found
                        update: jest.fn(),
                    },
                });
            });

            const transaction = new Transaction(transactionData);

            await expect(transaction.createTransaction()).rejects.toThrow('Account with ID 2 not found');
        });

        it('should throw an error if an exception is thrown during the transaction', async () => {
            const transactionData = {
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 100,
            };

            prisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

            const transaction = new Transaction(transactionData);

            await expect(transaction.createTransaction()).rejects.toThrow('Failed to Create transactions : Transaction failed');
        });
    });

    describe('getAllTransactions', () => {
        it('should return a list of transactions with source and destination accounts', async () => {
            const mockTransactions = [
                {
                    transactionId: 1,
                    sourceAccountId: 1,
                    destinationAccountId: 2,
                    amount: 100,
                    bankAccountSource: { bankAccountId: 1, balance: 200 },
                    bankAccountDestination: { bankAccountId: 2, balance: 100 },
                },
                {
                    transactionId: 2,
                    sourceAccountId: 2,
                    destinationAccountId: 1,
                    amount: 50,
                    bankAccountSource: { bankAccountId: 2, balance: 150 },
                    bankAccountDestination: { bankAccountId: 1, balance: 250 },
                },
            ];

            prisma.transaction.findMany.mockResolvedValue(mockTransactions);

            const transactions = await Transaction.getAllTransactions();

            expect(transactions).toEqual(mockTransactions);
            expect(prisma.transaction.findMany).toHaveBeenCalledWith({
                include: {
                    bankAccountSource: true,
                    bankAccountDestination: true,
                },
            });
        });

        it('should throw an error if no transactions are found', async () => {
            prisma.transaction.findMany.mockResolvedValue([]);

            await expect(Transaction.getAllTransactions()).rejects.toThrow('No transactions were found.');
        });

        it('should throw an error if an error occurs during retrieval', async () => {
            prisma.transaction.findMany.mockRejectedValue(new Error('Database error'));

            await expect(Transaction.getAllTransactions()).rejects.toThrow('Failed to retrieve transactions : Database error');
        });
    });

    describe('getTransactionById', () => {
        it('should return transaction data with source and destination accounts', async () => {
            const mockTransaction = {
                transactionId: 1,
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 100,
                bankAccountSource: { bankAccountId: 1, balance: 200 },
                bankAccountDestination: { bankAccountId: 2, balance: 100 },
            };

            prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

            const transaction = await Transaction.getTransactionById(1);

            expect(transaction).toEqual(mockTransaction);
            expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
                where: {
                    transactionId: 1,
                },
                include: {
                    bankAccountSource: true,
                    bankAccountDestination: true,
                },
            });
        });

        it('should return null if transaction is not found', async () => {
            prisma.transaction.findUnique.mockResolvedValue(null);

            const transaction = await Transaction.getTransactionById(999); // non-existent transaction

            expect(transaction).toBeNull();
            expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
                where: {
                    transactionId: 999,
                },
                include: {
                    bankAccountSource: true,
                    bankAccountDestination: true,
                },
            });
        });

        it('should throw an error if an exception is thrown during retrieval', async () => {
            prisma.transaction.findUnique.mockRejectedValue(new Error('Database error'));

            await expect(Transaction.getTransactionById(1)).rejects.toThrow('Failed to get Transaction : Database error');
        });
    });
});
