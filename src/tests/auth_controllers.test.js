const AuthController = require('../controllers/auth');
const Auth = require('../services/auth.js');
const User = require('../services/users.js');

jest.mock('../services/auth.js');
jest.mock('../services/users.js');

describe('AuthController', () => {
  let authController;
  let req;
  let res;
  let next;

  beforeEach(() => {
    authController = AuthController;

    req = {
      body: {},
      user: { id: 1, email: 'test@example.com' },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(), // Mock return this to chain methods
    };

    next = jest.fn(); // Mock the next function
  });

  describe('login', () => {
    it('should return a successful response on login', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { status: true, message: 'Login successful', token: 'fake-jwt-token' };
      Auth.prototype.login.mockResolvedValue(expectedResult);

      await authController.login(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expectedResult);
      expect(res.status).not.toHaveBeenCalled(); // No status needed for success
    });

    it('should return an error response on login failure', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const expectedError = new Error('Invalid credentials');
      Auth.prototype.login.mockRejectedValue(expectedError);

      await authController.login(req, res, next);

      // Check if next(error) was called
      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const expectedResult = { status: true, message: 'Logout successful' };
      Auth.prototype.logout.mockResolvedValue(expectedResult);

      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith(expectedResult);
      expect(res.status).not.toHaveBeenCalled(); // No status needed for success
    });

    it('should handle logout failure', async () => {
      const expectedError = new Error('Logout failed');
      Auth.prototype.logout.mockRejectedValue(expectedError);

      await authController.logout(req, res, next);

      // Ensure that next is called with the error
      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      req.body.newPassword = 'newpassword123';
      const expectedResult = { status: true, message: 'Password reset successful' };
      Auth.prototype.resetPassword.mockResolvedValue(expectedResult);

      await authController.resetPassword(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should return an error response on reset password failure', async () => {
      req.body.newPassword = 'newpassword123';
      const expectedError = new Error('Reset failed');
      Auth.prototype.resetPassword.mockRejectedValue(expectedError);

      await authController.resetPassword(req, res, next);

      // Check if next(error) was called
      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('forgotPassword', () => {
    it('should return a successful response on forgot password', async () => {
      const expectedResult = { status: true, message: 'Reset link sent' };
      Auth.prototype.forgotPassword.mockResolvedValue(expectedResult);

      await authController.forgotPassword(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should return an error response on forgot password failure', async () => {
      const expectedError = new Error('User not found');
      Auth.prototype.forgotPassword.mockRejectedValue(expectedError);

      await authController.forgotPassword(req, res, next);

      // Check if next(error) was called
      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('whoami', () => {
    it('should return user information', () => {
      authController.whoami(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: true,
        message: "OK",
        error: null,
        data: { user: req.user }
      });
    });
  });

  describe('signup', () => {
    it('should create user and profile successfully', async () => {
      req.body = {
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userPassword: 'password123',
        profileType: 'basic',
        profileNumber: '1234567890',
        address: '123 Street Name',
      };

      const expectedUser = { id: 1, email: 'john@example.com' };
      const expectedProfile = { id: 1, type: 'basic' };
      User.prototype.createUserWithProfile.mockResolvedValue({ newUser: expectedUser, newProfile: expectedProfile });

      await authController.signup(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ newUser: expectedUser, newProfile: expectedProfile });
    });

    it('should call next with an error if signup fails', async () => {
      req.body = {
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userPassword: 'password123',
        profileType: 'basic',
        profileNumber: '1234567890',
        address: '123 Street Name',
      };

      const expectedError = new Error('Signup failed');
      User.prototype.createUserWithProfile.mockRejectedValue(expectedError);

      await authController.signup(req, res, next);

      // Ensure that next is called with the error
      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
