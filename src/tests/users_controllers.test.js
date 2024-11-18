const UserController = require('../controllers/users');
const User = require('../services/users');

jest.mock('../services/users');

describe('UserController', () => {
  let userController;
  let req;
  let res;
  let next;

  beforeEach(() => {
    userController = UserController;

    req = {
      params: { id: 1 },
    };

    res = {
      json: jest.fn(),
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    next = jest.fn(); // Mock next function
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: 1, userName: 'JohnDoe', userEmail: 'john@example.com' }];
      User.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      User.getAllUsers.mockRejectedValue(mockError);

      await userController.getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser = { id: 1, userName: 'JohnDoe', userEmail: 'john@example.com' };
      User.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      User.getUserById.mockRejectedValue(mockError);

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('renderUser', () => {
    it('should render a user by ID', async () => {
      const mockUser = { id: 1, userName: 'JohnDoe', userEmail: 'john@example.com' };
      User.getUserById.mockResolvedValue(mockUser);

      await userController.renderUser(req, res, next);

      expect(res.render).toHaveBeenCalledWith('users', { user: mockUser });
    });

    it('should render null if user is not found', async () => {
      User.getUserById.mockResolvedValue(null);

      await userController.renderUser(req, res, next);

      expect(res.render).toHaveBeenCalledWith('users', { user: null });
    });

    it('should handle errors during rendering', async () => {
      const mockError = new Error('Server error');
      User.getUserById.mockRejectedValue(mockError);

      await userController.renderUser(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
