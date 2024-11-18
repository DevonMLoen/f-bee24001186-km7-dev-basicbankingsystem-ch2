const Profile = require('../services/profiles');
const prisma = require('../db');
const { HttpError } = require('../middleware/errorhandling');

jest.mock('../db', () => ({
    profile: {
        create: jest.fn(),
        findUnique: jest.fn(),
    },
}));

describe('Profile Service', () => {
    describe('createProfile', () => {
        it('should create a profile successfully', async () => {
            const mockTx = {
                profile: {
                    create: jest.fn().mockResolvedValue({
                        profileId: 1,
                        profileType: 'example',
                        profileNumber: '123456789',
                        address: '123 Example St',
                    }),
                },
            };

            const profileData = {
                type: 'example',
                number: '123456789',
                address: '123 Example St',
            };

            const profile = new Profile(profileData);
            const result = await profile.createProfile(1, mockTx);

            expect(mockTx.profile.create).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    profileType: 'example',
                    profileNumber: '123456789',
                    address: '123 Example St',
                },
            });
            expect(result).toEqual({
                profileId: 1,
                profileType: 'example',
                profileNumber: '123456789',
                address: '123 Example St',
            });
        });

        it('should throw an error if profile creation fails', async () => {
            const mockTx = {
                profile: {
                    create: jest.fn().mockRejectedValue(new Error('Database error')),
                },
            };

            const profileData = {
                type: 'example',
                number: '123456789',
                address: '123 Example St',
            };

            const profile = new Profile(profileData);

            await expect(profile.createProfile(1, mockTx)).rejects.toThrow('Failed to create profile : Database error');
        });
    });

    describe('getProfile', () => {
        it('should return a profile by ID', async () => {
            const mockProfile = {
                profileId: 1,
                profileType: 'example',
                profileNumber: '123456789',
                address: '123 Example St',
            };

            prisma.profile.findUnique.mockResolvedValue(mockProfile);

            const profile = new Profile({});

            const result = await profile.getProfile(1);

            expect(result).toEqual(mockProfile);
            expect(prisma.profile.findUnique).toHaveBeenCalledWith({
                where: {
                    profileId: 1,
                },
            });
        });

        it('should throw an error if an error occurs while retrieving the profile', async () => {
            prisma.profile.findUnique.mockRejectedValue(new Error('Database error'));

            const profile = new Profile({});

            await expect(profile.getProfile(1)).rejects.toThrow('Failed to get profile : Database error');
        });

        it('should return null if the profile does not exist', async () => {
            prisma.profile.findUnique.mockResolvedValue(null);

            const profile = new Profile({});

            const result = await profile.getProfile(999);

            expect(result).toBeNull();
            expect(prisma.profile.findUnique).toHaveBeenCalledWith({
                where: {
                    profileId: 999,
                },
            });
        });
    });
});
