const io = { emit: jest.fn() }; // Mock io di sini

// Mock index.js setelah io didefinisikan
jest.mock('../index.js', () => {
  const io = { emit: jest.fn() }; // Mock io di sini
  return { io };  // Pastikan untuk mengembalikan io dalam objek
});

jest.mock('../services/auth.js');
jest.mock('../services/users.js');

describe('AuthController', () => {
  let authController;
  let req;
  let res;
  let next;

  beforeEach(() => {
    authController = require('../controllers/auth'); // Pastikan authController diinisialisasi setelah mock

    req = {
      body: {
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userPassword: 'password123',
        profileType: 'basic',
        profileNumber: '1234567890',
        address: '123 Street Name',
      },
      user: { id: 1, email: 'test@example.com' },
    };

    res = {
      json: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('login', () => {
    it('should return a successful response on login', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { status: true, message: 'Login successful', token: 'fake-jwt-token' };
      require('../services/auth').prototype.login.mockResolvedValue(expectedResult);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should return an error response on login failure', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const expectedError = new Error('Invalid credentials');
      require('../services/auth').prototype.login.mockRejectedValue(expectedError);

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const expectedResult = { status: true, message: 'Logout successful' };
      require('../services/auth').prototype.logout.mockResolvedValue(expectedResult);

      await authController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle logout failure', async () => {
      const expectedError = new Error('Logout failed');
      require('../services/auth').prototype.logout.mockRejectedValue(expectedError);

      await authController.logout(req, res, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if passwords do not match', async () => {
      req.body.newPassword = 'newpassword123';
      req.body.confirmPassword = 'differentpassword123';

      await authController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Passwords do not match");
    });

    it('should return an error response on reset password failure', async () => {
      req.body.newPassword = 'newpassword123';
      req.body.confirmPassword = 'newpassword123';
      const expectedError = new Error('Reset failed');
      require('../services/auth').prototype.resetPassword.mockRejectedValue(expectedError);

      await authController.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('forgotPassword', () => {
    it('should return a successful response on forgot password', async () => {
      const expectedResult = { status: true, message: 'Reset link sent' };
      require('../services/auth').prototype.forgotPassword.mockResolvedValue(expectedResult);

      await authController.forgotPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should return an error response on forgot password failure', async () => {
      const expectedError = new Error('User not found');
      require('../services/auth').prototype.forgotPassword.mockRejectedValue(expectedError);

      await authController.forgotPassword(req, res, next);

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
    it('should handle signup failure', async () => {
      const expectedError = new Error('Signup failed');
      require('../services/users').prototype.createUserWithProfile.mockRejectedValue(expectedError);

      await authController.signup(req, res, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
