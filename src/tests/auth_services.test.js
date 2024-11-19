const Auth = require('../services/auth.js');
const bcrypt = require('bcrypt');
const prisma = require('../db');
const { HttpError } = require('../middleware/errorhandling');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn().mockResolvedValue('hashed_password'),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('fake_token'),
}));

jest.mock('../db', () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn((options, callback) => callback(null, { response: 'Email sent' })),
    }),
}));

describe('Auth Module', () => {
    let auth;

    beforeEach(() => {
        auth = new Auth();
        jest.clearAllMocks();
    });

    describe('Login Function', () => {
        test('should return token and user data if credentials are valid', async () => {
            const mockUser = { userId: 1, userEmail: 'user@example.com', userPassword: 'hashed_password', userRole: 'user' };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            const response = await auth.login('user@example.com', 'password123');

            expect(response).toEqual({ token: 'fake_token', userId: 1, userRole: 'user' });
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { userEmail: 'user@example.com' } });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
        });

        test('should throw an error if user is not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(auth.login('nonexistent@example.com', 'password123')).rejects.toThrow('Login failed: Invalid email or password');
        });

        test('should throw an error if password is incorrect', async () => {
            const mockUser = { userId: 1, userEmail: 'user@example.com', userPassword: 'hashed_password' };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(auth.login('user@example.com', 'wrongpassword')).rejects.toThrow('Login failed: Invalid email or password');
        });
    });

    describe('Logout Function', () => {
        test('should return success message', async () => {
            const response = await auth.logout();

            expect(response).toEqual({ message: 'Logout successful' });
        });

        test('should throw an error if logout fails', async () => {
            const errorMessage = 'Logout failed';
            auth.logout = jest.fn().mockRejectedValue(new Error(errorMessage));

            await expect(auth.logout()).rejects.toThrow(errorMessage);
        });
    });

    describe('Reset Password Function', () => {
        test('should reset the password successfully', async () => {
            const userId = 1;
            const newPassword = 'newPassword123';

            prisma.user.findUnique.mockResolvedValue({ userId: 1, userName: 'user' });
            bcrypt.hash.mockResolvedValue('new_hashed_password');
            prisma.user.update.mockResolvedValue({ userName: 'user' });

            const response = await auth.resetPassword(userId, newPassword);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { userId: 1 },
                data: { userPassword: 'new_hashed_password' },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(response).toEqual({ userName: 'user' });
        });

        test('should throw an error if password reset fails', async () => {
            prisma.user.update.mockRejectedValue(new Error('Database error'));

            await expect(auth.resetPassword(1, 'newPassword123')).rejects.toThrow('Reset password failed: : Database error');
        });

        test('should throw an error if user is not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(auth.resetPassword(999, 'newPassword123')).rejects.toThrow('Reset password failed: : User not found');
        });
    });

    describe('Forgot Password Function', () => {
        test('should send password reset email if email exists', async () => {
            const mockUser = { userId: 1, userEmail: 'user@example.com' };
            prisma.user.findUnique.mockResolvedValue(mockUser);
    
            const response = await auth.forgotPassword('user@example.com');
    
            expect(response).toBeUndefined();
            expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
        });
    
        test('should throw an error if email is not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
    
            await expect(auth.forgotPassword('nonexistent@example.com')).rejects.toThrow('Forgot password failed: Email not found');
        });
    
    
    });
    


    describe('Token Generation', () => {
        test('generateToken should return a valid JWT token', () => {
            const mockUser = { userId: 1, userEmail: 'user@example.com' };
            const token = auth.generateToken(mockUser);

            expect(token).toBe('fake_token');
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: mockUser.userId, email: mockUser.userEmail },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
        });

        test('generateTokenForgot should return a valid JWT token for password reset', () => {
            const mockUser = { userId: 1, userEmail: 'user@example.com' };
            const token = auth.generateTokenForgot(mockUser);

            expect(token).toBe('fake_token');
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: mockUser.userId, email: mockUser.userEmail },
                process.env.JWT_SECRET_FORGOT,
                { expiresIn: '5m' }
            );
        });
    });
});
