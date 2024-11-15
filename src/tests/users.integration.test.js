const request = require('supertest');
const express = require('express');
const app = express();


const UserController = require('../controllers/users');
const User = require('../services/users');


app.get('/', (req, res) => UserController.getAllUsers(req, res));


jest.mock('../services/users');

describe('GET /', () => {
    afterEach(() => {
        jest.clearAllMocks(); 
    });

    it('should return a list of users', async () => {
        const mockUsers = [
            { userId: 1, userName: 'User1', userEmail: 'user1@example.com' },
            { userId: 2, userName: 'User2', userEmail: 'user2@example.com' },
        ];

        User.getAllUsers.mockResolvedValue(mockUsers); 

        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUsers);
    });

    it('should return 404 if no users are found', async () => {
        User.getAllUsers.mockResolvedValue([]); 

        const response = await request(app).get('/');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'No users were found.' });
    });

    it('should return 500 if there is an error', async () => {
        User.getAllUsers.mockRejectedValue(new Error('Database error')); 

        const response = await request(app).get('/');

        // expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Database error' });
    });
});
