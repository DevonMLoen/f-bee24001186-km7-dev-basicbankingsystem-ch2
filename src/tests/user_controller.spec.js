const createApp = require("../utils/create-app.js");
createApp();
const userController = require("../controllers/users.js");
const { HttpError } = require("../middleware/errorhandling.js");
const User = require("../services/users.js");
jest.mock("../services/users.js");

describe("userController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 1, email: "test@example.com" },
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      render: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
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
      User.getAllUsers.mockResolvedValue(expected);
      await userController.getAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expected);
    });

    it("should return an error if no user found", async () => {
      const mockError = new HttpError(
        "Failed to get all users : No users were found.",
        404
      );

      User.getAllUsers.mockRejectedValue(mockError);

      await userController.getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
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
      req.params.id = 1;
      User.getUserById.mockResolvedValue(expected);

      await userController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: expected });
      expect(User.getUserById).toHaveBeenCalledWith(req.params.id);
    });

    it("should return an error if user not exist", async () => {
      const mockError = new HttpError(
        "Failed to get user : No user were found.",
        404
      );

      User.getUserById.mockRejectedValue(mockError);

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("renderUser", () => {
    it("should render user page", async () => {
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
      req.params.id = 1;
      User.getUserById.mockResolvedValue(expected);

      await userController.renderUser(req, res, next);

      expect(res.render).toHaveBeenCalledWith("users", { user: expected });
      expect(User.getUserById).toHaveBeenCalledWith(req.params.id);
    });

    it("should return an error if user not exist", async () => {
      const mockError = new HttpError(
        "Failed to get user : No user were found.",
        404
      );

      User.getUserById.mockRejectedValue(mockError);

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
