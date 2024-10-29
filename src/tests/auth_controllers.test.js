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
      status: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('login', () => {
    it('should return a successful response on login', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { message: 'Login successful' };
      Auth.prototype.login.mockResolvedValue(expectedResult);

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should return an error response on login failure', async () => {

      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const expectedError = new Error('Invalid credentials');
      Auth.prototype.login.mockRejectedValue(expectedError);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: expectedError.message });
    });
  });

  describe('logout', () => {
    it('should return a successful response on logout', async () => {
      const expectedResult = { message: 'Logout successful' };
      Auth.prototype.logout.mockResolvedValue(expectedResult);

      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      req.body.newPassword = 'newpassword123';
      const expectedResult = { message: 'Password reset successful' };
      Auth.prototype.resetPassword.mockResolvedValue(expectedResult);

      await authController.resetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should return an error response on reset password failure', async () => {
      req.body.newPassword = 'newpassword123';
      const expectedError = new Error('Reset failed');
      Auth.prototype.resetPassword.mockRejectedValue(expectedError);

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expectedError.message });
    });
  });

  describe('forgotPassword', () => {
    it('should return a successful response on forgot password', async () => {
      const expectedResult = { message: 'Reset link sent' };
      Auth.prototype.forgotPassword.mockResolvedValue(expectedResult);

      await authController.forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should return an error response on forgot password failure', async () => {
      const expectedError = new Error('User not found');
      Auth.prototype.forgotPassword.mockRejectedValue(expectedError);

      await authController.forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: expectedError.message });
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

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
