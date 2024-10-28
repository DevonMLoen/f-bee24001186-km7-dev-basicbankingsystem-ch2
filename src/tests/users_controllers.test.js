const UserController = require('../controllers/users');
const User = require('../services/users');

jest.mock('../services/users');

describe('UserController', () => {
  let userController;
  let req;
  let res;

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
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: 1, userName: 'JohnDoe', userEmail: 'john@example.com' }];
      User.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return a 404 if no users are found', async () => {
      User.getAllUsers.mockResolvedValue([]);

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No users were found.' });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      User.getAllUsers.mockRejectedValue(mockError);

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser = { id: 1, userName: 'JohnDoe', userEmail: 'john@example.com' };
      User.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return a 404 if no user is found', async () => {
      User.getUserById.mockResolvedValue(null);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No users were found.' });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Server error');
      User.getUserById.mockRejectedValue(mockError);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'An error occurred on the server.' });
    });
  });

  describe('renderUser', () => {
    it('should render a user by ID', async () => {
      const mockUser = { id: 1, userName: 'JohnDoe', userEmail: 'john@example.com' };
      User.getUserById.mockResolvedValue(mockUser);

      await userController.renderUser(req, res);

      expect(res.render).toHaveBeenCalledWith('users', { user: mockUser });
    });

    it('should return a 404 if no user is found when rendering', async () => {
      User.getUserById.mockResolvedValue(null);

      await userController.renderUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No users were found.' });
    });

    it('should handle errors during rendering', async () => {
      const mockError = new Error('Server error');
      User.getUserById.mockRejectedValue(mockError);

      await userController.renderUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'An error occurred on the server.' });
    });
  });
});
