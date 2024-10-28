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
            throw new Error('Failed to create bank account : ' + error.message);
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
            throw new Error('Failed to get all bank accounts : ' + error.message);
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

            if (!bankAccount) {
                throw new Error('Bank account not found');
            }

            return bankAccount;
        } catch (error) {
            throw new Error('Failed to get Bank Account : ' + error.message);
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
            throw new Error('Failed to delete bank account : ' + error.message);
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
            throw new Error('Failed to update bank account : ' + error.message);
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
            throw new Error('Failed to withdraw from bank account : ' + error.message);
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
            throw new Error('Failed to deposit from bank account : ' + error.message);
        }
    }
}

module.exports = BankAccount;
