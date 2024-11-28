const AuthController = require("../controllers/auth");
const { HttpError } = require("../middleware/errorhandling.js");
const Auth = require("../services/auth.js");
const User = require("../services/users.js");

jest.mock("../services/auth.js");
jest.mock("../services/users.js");
describe("AuthContoller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 1, email: "test@example.com" },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.log("maamama");
  });

  describe("login", () => {
    it("should successfully login user with valid credentials", async () => {
      // Arrange
      req.body = {
        email: "valid@email.com",
        password: "valid-pasword",
      };
      const expectedResult = {
        token: "jwt-token",
        userId: "1",
      };
      Auth.prototype.login.mockResolvedValue(expectedResult);
      // Act
      await AuthController.login(req, res);

      // Assert
      expect(Auth.prototype.login).toHaveBeenCalledWith(
        req.body.email,
        req.body.password
      );
      expect(res.json).toHaveBeenCalledWith(expectedResult);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return an error with invalid credentials", async () => {
      // Arrange
      const mockError = new HttpError("Invalid Credentials");
      Auth.prototype.login.mockRejectedValue(mockError);

      // Act
      await AuthController.login(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const expectedResult = {
        message: "logout successful",
      };
      Auth.prototype.logout.mockResolvedValue(expectedResult);

      await AuthController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe("resetPassword", () => {
    it("should return status 400 when newPassword and confirmPassword do not match", async () => {
      req.body = {
        newPassword: "new_pass",
        confirmPassword: "not_the_same",
      };

      await AuthController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Passwords do not match");
    });

    it("should return an error if the user not found", async () => {
      const mockError = new HttpError("User not found", 404);
      req.user.id = "invalid-user-id";
      req.body = {
        newPassword: "new_pass",
        confirmPassword: "new_pass",
      };
      Auth.prototype.resetPassword.mockRejectedValue(mockError);

      await AuthController.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });

    it("should return the username when password is reseted", async () => {
      req.user.id = "valid-user-id";
      req.body = {
        newPassword: "new_pass",
        confirmPassword: "new_pass",
      };
      const expectedResult = { userName: "user-username" };
      Auth.prototype.resetPassword.mockResolvedValue(expectedResult);

      await AuthController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
      expect(Auth.prototype.resetPassword).toHaveBeenCalledWith(
        req.user.id,
        req.body.newPassword
      );
    });
  });

  describe("forgotPassword", () => {
    it("should return an error if email is not found", async () => {
      const mockError = new HttpError("Email not found", 404);
      req.body.email = "invalidEmail@gmail.com";
      Auth.prototype.forgotPassword.mockRejectedValue(mockError);

      await AuthController.forgotPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  it("should return status 200 when successful", async () => {
    req.body.email = "validemail@gmail.com";
    Auth.prototype.forgotPassword.mockResolvedValue();
    await AuthController.forgotPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  describe("whoami", () => {
    it("should return status 200", async () => {
      req.user = {
        userData: "userData",
      };

      await AuthController.whoami(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: true,
        message: "OK",
        error: null,
        data: { user: req.user },
      });
    });
  });

  describe("signup", () => {
    it("should return an error if email already exist", async () => {
      const mockError = new HttpError("Email has already been used", 409);
      User.prototype.createUserWithProfile.mockRejectedValue(mockError);

      await AuthController.signup(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });

    it("should create new user successfully", async () => {
      req.body = {
        userName: "john",
        userEmail: "johnDoe@gmail.com",
        userPassword: "123456",
        profileType: "individual",
        profileNumber: "123456789",
        address: "jln babalala",
      };
      const expectedResult = {
        newUser: {
          id: 1,
          name: "john",
          email: "johnDoe@gmail.com",
        },
        newProfile: {
          profileType: "individual",
          profileNumber: "123456789",
          address: "jln babalala",
        },
      };
      User.prototype.createUserWithProfile.mockResolvedValue(expectedResult);

      await AuthController.signup(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });
  });
});
