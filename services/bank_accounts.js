const prisma = require("../db"); 

class BankAccount {
    static prisma = prisma
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.number = data.number;
        this.balance = data.balance;
    }

    async validateUser() {
        const user = await BankAccount.prisma.user.findUnique({
            where: { userId: this.id },
        });
        if (!user) {
            throw new Error('User not found');
        }
    }

    async createAccount() {
        try {

            await this.validateUser();

            const newAccount = await BankAccount.prisma.bankAccount.create({
                data: {
                    userId: this.id,
                    bankName: this.name,
                    bankAccountNumber: this.number,
                    balance: this.balance,
                },
            });
            return newAccount;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to create bank account');
        }
    }

    static async getAllBankAccounts() {
        try {
            const bankAccounts = await BankAccount.prisma.bankAccount.findMany({
                include: {
                    user: true,
                },
            });

            return bankAccounts;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get all bank accounts');
        }
    }

    static async getAllAccountsByUserId(userId) {
        try {
            const accounts = await BankAccount.prisma.bankAccount.findMany({
                where: {
                    userId: userId,
                },
            });
            return accounts;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get bank accounts');
        }
    }

    static async getBankAccountById(bankAccountId) {
        try {
            const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
                where: {
                    bankAccountId: parseInt(bankAccountId),
                },
                include: {
                    user: true,
                },
            });

            return bankAccount;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get Bank Account');
        }
    }

    static async deleteAccountById(bankAccountId) {
        try {
            const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
                where: {
                    bankAccountId: parseInt(bankAccountId),
                },
            });

            if (!bankAccount) {
                throw new Error('Bank account not found');
            }

            await BankAccount.prisma.bankAccount.delete({
                where: {
                    bankAccountId: parseInt(bankAccountId),
                },
            });

            return { message: 'Bank account successfully deleted' };
        } catch (error) {
            console.error(error);
            throw new Error('Failed to delete bank account');
        }
    }

    static async updateAccount(bankAccountId, updatedData) {
        try {
            const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
                where: {
                    bankAccountId: parseInt(bankAccountId),
                },
            });

            if (!bankAccount) {
                throw new Error('Bank account not found');
            }

            const updatedAccount = await BankAccount.prisma.bankAccount.update({
                where: {
                    bankAccountId: parseInt(bankAccountId),
                },
                data: {
                    bankName: updatedData.bankName, 
                    bankAccountNumber: updatedData.bankAccountNumber, 
                    balance: updatedData.balance, 
                },
            });

            return updatedAccount;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to update bank account');
        }
    }

    static async withdraw(bankAccountId, amount) {
        try {
            const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
                where: {
                    bankAccountId: parseInt(bankAccountId),
                },
            });

            if (!bankAccount) {
                throw new Error('Bank account not found');
            }

            if (amount <= 0) {
                throw new Error('Amount must be greater than zero');
            }

            if (bankAccount.balance < amount) {
                throw new Error('Insufficient balance');
            }

            const updatedAccount = await BankAccount.prisma.bankAccount.update({
                where: {
                    bankAccountId: parseInt(bankAccountId),
                },
                data: {
                    balance: bankAccount.balance - amount,
                },
            });

            return updatedAccount; 
        } catch (error) {
            console.error(error);
            throw new Error('Failed to withdraw from bank account');
        }
    }

    static async deposit(bankAccountId, amount) {
        try {
            const bankAccount = await BankAccount.prisma.bankAccount.findUnique({
                where: {
                    bankAccountId: parseInt(bankAccountId),
                },
            });

            if (!bankAccount) {
                throw new Error('Bank account not found');
            }

            if (amount <= 0) {
                throw new Error('Amount must be greater than zero');
            }

            if (bankAccount.balance < amount) {
                throw new Error('Insufficient balance');
            }

            const updatedAccount = await BankAccount.prisma.bankAccount.update({
                where: {
                    bankAccountId: parseInt(bankAccountId),
                },
                data: {
                    balance: bankAccount.balance + amount,
                },
            });

            return updatedAccount; 
        } catch (error) {
            console.error(error);
            throw new Error('Failed to deposit from bank account');
        }
    }
}

module.exports = BankAccount;
