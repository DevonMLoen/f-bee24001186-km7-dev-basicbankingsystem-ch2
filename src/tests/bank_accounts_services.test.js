const BankAccount = require('../services/bank_accounts');
const prisma = require('../db');

jest.mock('../db', () => {
    return {
        user: {
            findUnique: jest.fn(),
        },
        bankAccount: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        },
    };
});

describe('BankAccount Class', () => {
    afterEach(() => {
        jest.clearAllMocks(); 
    });

    describe('createAccount', () => {
        test('should create a bank account successfully', async () => {
            prisma.user.findUnique.mockResolvedValue({ userId: 1 });
            prisma.bankAccount.create.mockResolvedValue({
                bankAccountId: 1,
                userId: 1,
                bankName: 'Bank A',
                bankAccountNumber: '1234567890',
                balance: 1000,
            });

            const bankAccount = new BankAccount({
                id: 1,
                name: 'Bank A',
                number: '1234567890',
                balance: 1000,
            });

            const result = await bankAccount.createAccount();
            expect(result).toHaveProperty('bankAccountId');
            expect(result.bankName).toBe('Bank A');
        });

        test('should throw error if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null); 

            const bankAccount = new BankAccount({
                id: 999,
                name: 'Bank A',
                number: '1234567890',
                balance: 1000,
            });

            await expect(bankAccount.createAccount()).rejects.toThrow('User not found');
        });

        test('should throw error if account creation fails', async () => {
            prisma.user.findUnique.mockResolvedValue({ userId: 1 });
            prisma.bankAccount.create.mockRejectedValue(new Error('Failed to create bank account'));

            const bankAccount = new BankAccount({
                id: 1,
                name: 'Bank A',
                number: '1234567890',
                balance: 1000,
            });

            await expect(bankAccount.createAccount()).rejects.toThrow('Failed to create bank account : Failed to create bank account');
        });
    });

    describe('getAllBankAccounts', () => {
        test('should return an array of all bank accounts with user information', async () => {
            const mockAccounts = [
                { bankAccountId: 1, bankName: 'Bank A', user: { userId: 1, userName: 'User A' } },
                { bankAccountId: 2, bankName: 'Bank B', user: { userId: 2, userName: 'User B' } },
            ];
            
            BankAccount.prisma.bankAccount.findMany.mockResolvedValue(mockAccounts);
    
            const accounts = await BankAccount.getAllBankAccounts();
    
            expect(accounts).toEqual(mockAccounts);
            expect(BankAccount.prisma.bankAccount.findMany).toHaveBeenCalledWith({
                include: {
                    user: true,
                },
            });
        });
    
        test('should throw an error if Prisma client fails', async () => {
            BankAccount.prisma.bankAccount.findMany.mockRejectedValue(new Error('Database error'));
    
            await expect(BankAccount.getAllBankAccounts()).rejects.toThrow('Failed to get all bank accounts : Database error');
        });
    
        test('should return an empty array if no bank accounts are found', async () => {
            BankAccount.prisma.bankAccount.findMany.mockResolvedValue([]);
    
            const accounts = await BankAccount.getAllBankAccounts();
    
            expect(accounts).toEqual([]); 
            expect(BankAccount.prisma.bankAccount.findMany).toHaveBeenCalledWith({
                include: {
                    user: true,
                },
            });
        });
    });

    describe('getBankAccountById', () => {
        test('should return a bank account by ID', async () => {
            const bankAccountId = 1;
            prisma.bankAccount.findUnique.mockResolvedValue({
                bankAccountId: 1,
                bankName: 'Bank A',
                balance: 1000,
            });

            const account = await BankAccount.getBankAccountById(bankAccountId);
            expect(account).toHaveProperty('bankAccountId', bankAccountId);
        });

        test('should throw error if bank account not found', async () => {
            const bankAccountId = 999;
            prisma.bankAccount.findUnique.mockResolvedValue(null); 

            await expect(BankAccount.getBankAccountById(bankAccountId)).rejects.toThrow('Failed to get Bank Account : Bank account not found');
        });
    });

    describe('deleteAccountById', () => {
        test('should delete a bank account by ID', async () => {
            const bankAccountId = 1;
            prisma.bankAccount.findUnique.mockResolvedValue({ bankAccountId: 1 });
            prisma.bankAccount.delete.mockResolvedValue({ message: 'Bank account successfully deleted' });

            const result = await BankAccount.deleteAccountById(bankAccountId);
            expect(result).toEqual({ message: 'Bank account successfully deleted' });
        });

        test('should throw error if bank account not found for deletion', async () => {
            const bankAccountId = 999;
            prisma.bankAccount.findUnique.mockResolvedValue(null);

            await expect(BankAccount.deleteAccountById(bankAccountId)).rejects.toThrow('Bank account not found');
        });
    });

    describe('updateAccount', () => {
        test('should update a bank account', async () => {
            const bankAccountId = 1;
            const updatedData = { bankName: 'Updated Bank', bankAccountNumber: '9876543210', balance: 1500 };

            prisma.bankAccount.findUnique.mockResolvedValue({
                bankAccountId: 1,
                bankName: 'Bank A',
                balance: 1000,
            });

            prisma.bankAccount.update.mockResolvedValue({
                bankAccountId: 1,
                ...updatedData,
            });

            const result = await BankAccount.updateAccount(bankAccountId, updatedData);
            expect(result).toHaveProperty('bankAccountId', bankAccountId);
            expect(result.bankName).toBe('Updated Bank');
        });

        test('should throw error if bank account not found for update', async () => {
            const bankAccountId = 999;
            prisma.bankAccount.findUnique.mockResolvedValue(null); 

            await expect(BankAccount.updateAccount(bankAccountId, {})).rejects.toThrow('Bank account not found');
        });
    });

    describe('withdraw', () => {
        const bankAccountId = 1; 
        test('should throw an error when trying to withdraw zero or negative amount', async () => {
            BankAccount.prisma.bankAccount.findUnique.mockResolvedValue({
                bankAccountId ,
                balance: 500, 
            });
    
            await expect(BankAccount.withdraw(bankAccountId, 0)).rejects.toThrow('Failed to withdraw from bank account : Amount must be greater than zero');
    
            await expect(BankAccount.withdraw(bankAccountId, -100)).rejects.toThrow('Failed to withdraw from bank account : Amount must be greater than zero');
        });

        test('should withdraw amount successfully', async () => {
            const bankAccountId = 1;
            const amount = 100;

            prisma.bankAccount.findUnique.mockResolvedValue({
                bankAccountId: 1,
                balance: 1000,
            });

            prisma.bankAccount.update.mockResolvedValue({
                bankAccountId: 1,
                balance: 900,
            });

            const result = await BankAccount.withdraw(bankAccountId, amount);
            expect(result.balance).toBe(900);
        });

        test('should throw error if insufficient balance for withdrawal', async () => {
            const bankAccountId = 1;
            const amount = 2000;

            prisma.bankAccount.findUnique.mockResolvedValue({
                bankAccountId: 1,
                balance: 1000,
            });

            await expect(BankAccount.withdraw(bankAccountId, amount)).rejects.toThrow('Insufficient balance');
        });

        test('should throw error if account not found during withdrawal', async () => {
            const bankAccountId = 999;
            const amount = 100;

            prisma.bankAccount.findUnique.mockResolvedValue(null); 

            await expect(BankAccount.withdraw(bankAccountId, amount)).rejects.toThrow('Bank account not found');
        });
    });

    describe('deposit', () => {
        const bankAccountId = 1; 
        test('should throw an error when trying to deposit zero or negative amount', async () => {
            BankAccount.prisma.bankAccount.findUnique.mockResolvedValue({
                bankAccountId ,
                balance: 500, 
            });
    
            await expect(BankAccount.deposit(bankAccountId, 0)).rejects.toThrow('Failed to deposit from bank account : Amount must be greater than zero');
    
            await expect(BankAccount.deposit(bankAccountId, -100)).rejects.toThrow('Failed to deposit from bank account : Amount must be greater than zero');
        });

        test('should deposit amount successfully', async () => {
            const bankAccountId = 1;
            const amount = 500;

            prisma.bankAccount.findUnique.mockResolvedValue({
                bankAccountId: 1,
                balance: 1000,
            });

            prisma.bankAccount.update.mockResolvedValue({
                bankAccountId: 1,
                balance: 1500,
            });

            const result = await BankAccount.deposit(bankAccountId, amount);
            expect(result.balance).toBe(1500);
        });

        test('should throw error if account not found during deposit', async () => {
            const bankAccountId = 999;
            const amount = 500;

            prisma.bankAccount.findUnique.mockResolvedValue(null); 

            await expect(BankAccount.deposit(bankAccountId, amount)).rejects.toThrow('Bank account not found');
        });
    });
    
});
