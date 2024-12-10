const createApp = require("../utils/create-app");
createApp();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("./../services/auth");
const nodemailer = require("nodemailer");
const { HttpError } = require("../middleware/errorhandling");
jest.mock("../db", () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock("jsonwebtoken");
jest.mock("bcrypt");
jest.mock("nodemailer");

describe("AuthService", () => {
  const auth = new Auth();
  const mockPrisma = require("../db");
  const mockTransporter = {
    sendMail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    userId: 1,
    userName: "text",
    userEmail: "test@example.com",
    userPassword: "hashedPassword",
  };
  describe("login", () => {
    it("should return token and userId when credential is valid", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockResolvedValue("jwt-token");

      const result = await auth.login(mockUser.userEmail, "password");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userEmail: mockUser.userEmail },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password",
        mockUser.userPassword
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.userId,
          email: mockUser.userEmail,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(result).toStrictEqual({
        token: "jwt-token",
        userId: mockUser.userId,
      });
    });
    it("should return an error if user is not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        auth.login("invalid@example.com", "password")
      ).rejects.toThrow("Invalid email or password");
    });
    it("should return an error if password is incorrect", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        auth.login(mockUser.userEmail, "invalid-password")
      ).rejects.toThrow("Invalid email or password");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "invalid-password",
        mockUser.userPassword
      );
    });
  });

  describe("logout", () => {
    it("should return message", () => {
      const result = auth.logout();
      expect(result).toStrictEqual({ message: "Logout successful" });
    });
  });

  describe("resetPassword", () => {
    it("should successfully update user password", async () => {
      const hashedPassword = "hashedPassword";
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      const prismaUserSpy = jest.spyOn(mockPrisma.user, "update");
      const result = await auth.resetPassword(mockUser.userId, "newPassword");

      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
        data: { userPassword: hashedPassword },
      });
      expect(prismaUserSpy).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({ userName: mockUser.userName });
    });

    it("should return an error if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        auth.resetPassword("invalid-id", "newPassword")
      ).rejects.toThrow("User not found");
    });
  });

  describe("forgotPassword", () => {
    it("should send an email if success", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      nodemailer.createTransport.mockReturnValue(mockTransporter);
      jwt.sign.mockResolvedValue("mock-token");
      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { response: "Email sent" });
      });
      process.env.CLIENT_URL = "http://127.0.0.1";
      const nodemailerSpy = jest.spyOn(mockTransporter, "sendMail");

      await auth.forgotPassword(mockUser.userEmail);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        {
          from: "christiantiovantowork@gmail.com",
          to: mockUser.userEmail,
          subject: "Password Reset Request",
          text: `Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password?token=mock-token`,
        },
        expect.any(Function)
      );
      expect(nodemailerSpy).toHaveBeenCalledTimes(1);
    });

    it("should return an error if user email not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(auth.forgotPassword("invalid@example.com")).rejects.toThrow(
        "Email not found"
      );
    });
  });
  describe("generate Token", () => {
    it("should generate access token", () => {
      jwt.sign.mockReturnValue("accessToken");

      const token = auth.generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.userId, email: mockUser.userEmail },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(token).toBe("accessToken");
    });

    it("should generate forgot password token", () => {
      jwt.sign.mockReturnValue("forgotToken");

      const token = auth.generateTokenForgot(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.userId, email: mockUser.userEmail },
        process.env.JWT_SECRET_FORGOT,
        { expiresIn: "5m" }
      );
      expect(token).toBe("forgotToken");
    });
  });
});
