const { validateUser, validateBankAccount, validateTransaction, validateBankPatchAccount, validateLogin, validateResetPassword, validateEmail } = require('../middleware/validator');

describe('Validation Middleware', () => {

    // Pengujian untuk validateUser
    describe('validateUser', () => {
        it('should return error for invalid user input', () => {
            const req = {
                body: {
                    userName: '',
                    userEmail: 'invalid-email',
                    userPassword: 'short',
                    profileType: '',
                    profileNumber: '',
                    address: ''
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateUser(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('"userName" is not allowed to be empty') });
        });

        it('should call next for valid user input', () => {
            const req = {
                body: {
                    userName: 'validUser',
                    userEmail: 'user@example.com',
                    userPassword: 'validPassword123',
                    profileType: 'admin',
                    profileNumber: '123456',
                    address: '123 Main St'
                }
            };
            const res = {};
            const next = jest.fn();

            validateUser(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // Pengujian untuk validateBankAccount
    describe('validateBankAccount', () => {
        it('should validate bank account input successfully', () => {
            const req = {
                body: {
                    userId: 1,
                    bankName: 'Bank ABC',
                    bankAccountNumber: '1234567890',
                    balance: 100.00
                }
            };
            const res = {};
            const next = jest.fn();

            validateBankAccount(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should return error for invalid bank account input', () => {
            const req = {
                body: {
                    userId: -1,
                    bankName: 'AB',
                    bankAccountNumber: '123',
                    balance: -50
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateBankAccount(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('User ID must be a positive number.') });
        });

        it('should return error for invalid bank account balance (negative)', () => {
            const req = {
                body: {
                    userId: 1,
                    bankName: 'Bank ABC',
                    bankAccountNumber: '1234567890',
                    balance: -50
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateBankAccount(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Balance must be at least 0.' });
        });

        it('should return error for invalid bank account number (too short)', () => {
            const req = {
                body: {
                    userId: 1,
                    bankName: 'Bank ABC',
                    bankAccountNumber: '123',
                    balance: 100
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateBankAccount(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Bank account number must have at least 6 characters.' });
        });
    });

    // Pengujian untuk validateTransaction
    describe('validateTransaction', () => {
        it('should validate transaction input successfully', () => {
            const req = {
                body: {
                    sourceAccountId: 1,
                    destinationAccountId: 2,
                    amount: 50.00
                }
            };
            const res = {};
            const next = jest.fn();

            validateTransaction(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should return error for invalid transaction input', () => {
            const req = {
                body: {
                    sourceAccountId: -1,
                    destinationAccountId: -2,
                    amount: -10
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateTransaction(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('Source account ID must be a positive number.') });
        });

        it('should return error for invalid amount (negative)', () => {
            const req = {
                body: {
                    sourceAccountId: 1,
                    destinationAccountId: 2,
                    amount: -10
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateTransaction(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Amount must be a positive number.' });
        });
    });

    // Pengujian untuk validateBankPatchAccount
    describe('validateBankPatchAccount', () => {
        it('should validate bank patch account input successfully', () => {
            const req = {
                body: {
                    bankName: 'Bank XYZ',
                    bankAccountNumber: '9876543210',
                    balance: 200.00
                }
            };
            const res = {};
            const next = jest.fn();

            validateBankPatchAccount(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should return error for invalid bank patch account input', () => {
            const req = {
                body: {
                    bankName: 'XY',
                    bankAccountNumber: '123',
                    balance: -10
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateBankPatchAccount(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('Bank name must have at least 3 characters.') });
        });
    });

    // Pengujian untuk validateLogin
    describe('validateLogin', () => {
        it('should return error for invalid login input', () => {
            const req = {
                body: {
                    email: 'invalid-email',
                    password: ''
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateLogin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('Email must be a valid email address.') });
        });

        it('should call next for valid login input', () => {
            const req = {
                body: {
                    email: 'user@example.com',
                    password: 'validPassword123'
                }
            };
            const res = {};
            const next = jest.fn();

            validateLogin(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // Pengujian untuk validateResetPassword
    // Pengujian untuk validateResetPassword
    describe('validateResetPassword', () => {
        it('should return error for invalid reset password input', () => {
            const req = {
                body: {
                    newPassword: 'short'
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateResetPassword(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'New password must have at least 10 characters.' });
        });

        it('should call next for matching and valid passwords', () => {
            const req = {
                body: {
                    newPassword: 'newStrongPass123',
                    confirmPassword: 'newStrongPass123'
                }
            };
            const res = {};
            const next = jest.fn();

            validateResetPassword(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });


    // Pengujian untuk validateEmail
    describe('validateEmail', () => {
        it('should return error for invalid email format', () => {
            const req = {
                body: {
                    email: 'invalid-email-format'
                }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            validateEmail(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Please provide a valid email address' });
        });

        it('should call next for valid email', () => {
            const req = {
                body: {
                    email: 'user@example.com'
                }
            };
            const res = {};
            const next = jest.fn();

            validateEmail(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

});
