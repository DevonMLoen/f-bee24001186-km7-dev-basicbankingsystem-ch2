const User = require("../services/users");
const Profile = require("../services/profiles");
require("../utils/create-app");
const bcrypt = require("bcrypt");
const { HttpError } = require("../middleware/errorhandling");

jest.mock("bcrypt");
jest.mock("../services/profiles");
jest.mock("../db", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn().mockResolvedValue({
    user: {
      create: jest.fn(),
    },
  }),
}));

describe("userService", () => {
  const user = new User({
    name: "test",
    email: "test@example.com",
    password: "password",
  });
  const mockPrisma = require("../db");
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create an user", async () => {
      const user = new User({
        name: "test",
        email: "test@example.com",
        password: "password",
      });
      const hashedPassword = "hashedPassword";
      mockPrisma.user.findUnique.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      mockPrisma.user.create.mockResolvedValue({
        userEmail: "devondoe@example.com",
        userId: 2,
        userName: "Devon Doe",
      });
      const bcryptSpy = jest.spyOn(bcrypt, "hash");

      const result = await user.createUser();

      expect(result).toStrictEqual({
        userEmail: "devondoe@example.com",
        userId: 2,
        userName: "Devon Doe",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, 10);
      expect(bcryptSpy).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          userName: user.name,
          userEmail: user.email,
          userPassword: hashedPassword,
        },
      });
    });

    it("should return an error if email already exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(true);

      await expect(user.createUser()).rejects.toThrow(
        new HttpError("Email has already been used", 409)
      );
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });
  describe("createUserWithProfile", () => {
    it("should create user with profile data", async () => {
      const userData = {
        name: "test",
        email: "test@example.com",
        password: "password",
      };
      const user = new User(userData);
      const hashedPassword = "hashedPassword";
      mockPrisma.user.findUnique.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      const userExpected = {
        userEmail: "devondoe@example.com",
        userId: 2,
        userName: "Devon Doe",
      };
      mockPrisma.user.create.mockResolvedValue(userExpected);
      const profileExpected = {
        address: "123 Main St, Anytown, USA",
        profileNumber: "1234567890",
        profileType: "individual",
        profileId: 2,
        userId: 2,
      };
      Profile.prototype.createProfile.mockResolvedValue(profileExpected);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma);
      });
      const userSpy = jest.spyOn(mockPrisma.user, "create");
      const profileSpy = jest.spyOn(Profile.prototype, "createProfile");

      const result = await user.createUserWithProfile();

      expect(Profile.prototype.createProfile).toHaveBeenCalledWith(
        userExpected.userId,
        mockPrisma
      );
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          userName: userData.name,
          userEmail: userData.email,
          userPassword: hashedPassword,
        },
      });
      expect(userSpy).toHaveBeenCalledTimes(1);
      expect(profileSpy).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        newUser: userExpected,
        newProfile: profileExpected,
      });
    });

    it("should return an error if email already exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(true);

      await expect(user.createUserWithProfile()).rejects.toThrow(
        new HttpError(
          "Failed to create user with profile : Email has already been used",
          409
        )
      );
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(Profile.prototype.createProfile).not.toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("should return an user by id", async () => {
      const expected = {
        bankAccount: [
          {
            balance: 10250,
            bankAccountId: 2,
            bankAccountNumber: "1234567890",
            bankName: "Bank XYZ",
            transactionDestination: [],
            transactionSource: [
              {
                amount: 250,
                destinationAccountId: 3,
                sourceAccountId: 2,
                transactionId: 1,
              },
            ],
            userId: 1,
          },
          {
            balance: 1250,
            bankAccountId: 3,
            bankAccountNumber: "9876543210",
            bankName: "Bank ABC",
            transactionDestination: [
              {
                amount: 250,
                destinationAccountId: 3,
                sourceAccountId: 2,
                transactionId: 1,
              },
            ],
            transactionSource: [],
            userId: 1,
          },
        ],
        profile: [
          {
            address: "123 Main St",
            profileId: 1,
            profileNumber: "12345",
            profileType: "Personal",
            userId: 1,
          },
        ],
        userEmail: "john.doe@example.com",
        userId: 1,
        userName: "Jane Doe",
      };
      mockPrisma.user.findUnique.mockResolvedValue(expected);

      const result = await User.getUserById(expected.userId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: parseInt(expected.userId),
        },
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
      expect(result).toStrictEqual(expected);
    });

    it("should return an error if there is no user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(false);

      await expect(User.getUserById(-1)).rejects.toThrow(
        new HttpError("Failed to get user : No user were found.", 404)
      );
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const expected = [
        {
          profile: [
            {
              address: "123 Main St",
              profileId: 1,
              profileNumber: "12345",
              profileType: "Personal",
              userId: 1,
            },
          ],
          userEmail: "john.doe@example.com",
          userId: 1,
          userName: "Jane Doe",
          userPassword:
            "$2b$10$B7a02Ukb/oI7tAdwQSVoPeqoPVYg0LwdDrM0f43qbkJfyS6wjmBFC",
        },
        {
          profile: [
            {
              address: "123 Main St, Anytown, USA",
              profileId: 2,
              profileNumber: "1234567890",
              profileType: "individual",
              userId: 2,
            },
          ],
          userEmail: "devondoe@example.com",
          userId: 2,
          userName: "Devon Doe",
          userPassword:
            "$2b$10$VWq/AvAWGbU01X5v1PXXTuV7V9RV/wEGpZzDh3IkBSCVYXiZ7vUVS",
        },
      ];
      mockPrisma.user.findMany.mockResolvedValue(expected);

      const result = await User.getAllUsers();

      expect(result).toStrictEqual(result);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        include: {
          profile: true,
        },
      });
    });

    it("should return an error if no user found", async () => {
      mockPrisma.user.findMany.mockResolvedValue(false);

      await expect(User.getAllUsers()).rejects.toThrow(
        new HttpError("Failed to get all users : No users were found.", 404)
      );
    });
  });
});
