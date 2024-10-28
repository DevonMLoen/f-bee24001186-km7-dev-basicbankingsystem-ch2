const User = require('../services/users');
const bcrypt = require('bcrypt');

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'), 
}));

jest.mock('../db', () => {
    return {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(), 
        },
        $transaction: jest.fn(), 
    };
});

describe('User Service', () => {
    const prisma = require('../db');

    describe('getAllUsers', () => {
        it('should return a list of users with profiles', async () => {
            const mockUsers = [
                {
                    userId: 1,
                    userName: 'John Doe',
                    userEmail: 'john@example.com',
                    profile: [
                        {
                            profileId: 1,
                            userId: 1,
                            profileType: 'Type1',
                            profileNumber: '12345',
                            address: 'Address1',
                        },
                    ],
                },
                {
                    userId: 2,
                    userName: 'Jane Doe',
                    userEmail: 'jane@example.com',
                    profile: [
                        {
                            profileId: 2,
                            userId: 2,
                            profileType: 'Type2',
                            profileNumber: '67890',
                            address: 'Address2',
                        },
                    ],
                },
            ];

            prisma.user.findMany.mockResolvedValue(mockUsers);

            const users = await User.getAllUsers();

            expect(users).toEqual(mockUsers);
            expect(prisma.user.findMany).toHaveBeenCalledWith({ include: { profile: true } });
        });

        it('should return an empty array if no users found', async () => {
            prisma.user.findMany.mockResolvedValue([]);

            const users = await User.getAllUsers();

            expect(users).toEqual([]);
        });

        it('should throw an error if an error occurs', async () => {
            prisma.user.findMany.mockRejectedValue(new Error('Database error'));

            await expect(User.getAllUsers()).rejects.toThrow('Failed to get all users');
        });
    });

    describe('getUserById', () => {
        it('should return user data with profile and bank account transactions', async () => {
            const mockUser = {
                userId: 1,
                userName: 'John Doe',
                userEmail: 'john@example.com',
                profile: {
                    profileId: 1,
                    userId: 1,
                    profileType: 'Type1',
                    profileNumber: '12345',
                    address: 'Address1',
                },
                bankAccount: [
                    {
                        bankAccountId: 1,
                        userId: 1,
                        bankName: 'Bank A',
                        bankAccountNumber: '1234567890',
                        balance: 1000,
                        transactionSource: [{ transactionId: 1, amount: 500 }],
                        transactionDestination: [{ transactionId: 2, amount: 200 }],
                    },
                ],
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            const user = await User.getUserById(1);

            expect(user).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { userId: 1 },
                include: {
                    profile: true,
                    bankAccount: {
                        include: {
                            transactionSource: true,
                            transactionDestination: true,
                        },
                    },
                },
            });
        });

        it('should return null if user is not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const user = await User.getUserById(999); 

            expect(user).toBeNull();
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { userId: 999 },
                include: {
                    profile: true,
                    bankAccount: {
                        include: {
                            transactionSource: true,
                            transactionDestination: true,
                        },
                    },
                },
            });
        });

        it('should throw an error if database fails', async () => {
            prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

            await expect(User.getUserById(1)).rejects.toThrow('Failed to get user : Database error');
        });
    });

    describe('createUserWithProfile', () => {
        it('should create a user with a hashed password and profile', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };
            const profileData = {
                profileType: 'Type1',
                profileNumber: '12345',
                address: 'Address1',
            };

            const hashedPassword = 'hashed_password';

            bcrypt.hash.mockResolvedValue(hashedPassword);
            prisma.user.findUnique.mockResolvedValue(null);

            const mockNewUser = {
                userId: 1,
                userName: userData.name,
                userEmail: userData.email,
                userPassword: hashedPassword,
            };
            const mockNewProfile = {
                profileId: 1,
                userId: 1,
                profileType: 'Type1',
                profileNumber: '12345',
                address: 'Address1',
            };

            prisma.$transaction.mockImplementation(async (callback) => {
                return callback({
                    user: {
                        create: jest.fn().mockResolvedValue(mockNewUser),
                    },
                    profile: {
                        create: jest.fn().mockResolvedValue(mockNewProfile),
                    },
                });
            });

            const user = new User(userData);
            const result = await user.createUserWithProfile(profileData);

            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { userEmail: userData.email } });
            expect(prisma.$transaction).toHaveBeenCalled();
            expect(result).toEqual({ newUser: mockNewUser, newProfile: mockNewProfile });
        });

        it('should throw an error if transaction fails', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };
            const profileData = {
                profileType: 'Type1',
                profileNumber: '12345',
                address: 'Address1',
            };

            bcrypt.hash.mockResolvedValue('hashed_password');
            prisma.user.findUnique.mockResolvedValue(null);

            prisma.$transaction.mockRejectedValue(new Error('Database error'));

            const user = new User(userData);

            await expect(user.createUserWithProfile(profileData)).rejects.toThrow('Failed to create user with profile : Database error');
        });

        it('should throw an error if email already exists', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };
            const profileData = {
                profileType: 'Type1',
                profileNumber: '12345',
                address: 'Address1',
            };

            prisma.user.findUnique.mockResolvedValue({ userId: 1 });

            const user = new User(userData);

            await expect(user.createUserWithProfile(profileData)).rejects.toThrow('Email has already been used');
        });

        it('should throw an error if bcrypt fails to hash password', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };
            const profileData = {
                profileType: 'Type1',
                profileNumber: '12345',
                address: 'Address1',
            };

            bcrypt.hash.mockRejectedValue(new Error('Hashing error'));
            prisma.user.findUnique.mockResolvedValue(null);

            const user = new User(userData);

            await expect(user.createUserWithProfile(profileData)).rejects.toThrow('Failed to create user with profile');
        });
    });
});
