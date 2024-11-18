const request = require('supertest');
const express = require('express');
const app = express();

const UserController = require('../controllers/users');
const User = require('../services/users');
const { HttpError } = require('../middleware/errorhandling'); // Import HttpError

// Setup the route
app.get('/', (req, res, next) => UserController.getAllUsers(req, res, next));

// Mock the `getAllUsers` method in the service
jest.mock('../services/users');

// Custom error-handling middleware (for testing)
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  // Default to 500 for unhandled errors
  return res.status(500).json({ message: `Failed to get all users : ${err.message}` });
});

describe('GET /', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of users', async () => {
    // Mock response from service
    const mockUsers = [
      { userId: 1, userName: 'User1', userEmail: 'user1@example.com' },
      { userId: 2, userName: 'User2', userEmail: 'user2@example.com' },
    ];

    // Mock the service to resolve with mock users
    User.getAllUsers.mockResolvedValue(mockUsers);

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
  });

  it('should return 404 if no users are found', async () => {
    // Mock service to throw 404 error when no users are found
    const mockError = new HttpError('No users were found.', 404); // Use HttpError here
    User.getAllUsers.mockRejectedValue(mockError);

    const response = await request(app).get('/');

    expect(response.status).toBe(404);  // Check if it returns 404
    expect(response.body).toEqual({ message: 'No users were found.' });  // Check if correct error message is sent
  });

  it('should return 500 if there is a database error', async () => {
    // Mock service to throw a generic database error
    const errorMessage = 'Database error';
    const mockError = new Error(errorMessage);
    mockError.statusCode = 500;
    User.getAllUsers.mockRejectedValue(mockError);

    const response = await request(app).get('/');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: `Failed to get all users : ${errorMessage}` });
  });
});
