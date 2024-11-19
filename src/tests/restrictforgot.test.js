const jwt = require('jsonwebtoken');
const restrict = require('../middleware/restrictforgot');
const { UnauthorizedError } = require('../middleware/errorhandling');

beforeAll(() => {
    process.env.JWT_SECRET_FORGOT = 'mock_secret';
});

describe('RestrictForgot Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            query: {},
        };
        res = {
            statusCode: 200,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: jest.fn(),
            _getData: function () {
                return this.json.mock.calls.length ? this.json.mock.calls[0][0] : {};
            },
        };
        next = jest.fn(); // Mock next function

        jest.spyOn(jwt, 'verify'); // Spy on jwt.verify method
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mock calls between tests
    });

    test('should call next if authorization header is present and token is valid', () => {
        const mockUser = { userId: 1, userEmail: 'test@example.com' };
        const token = jwt.sign(mockUser, process.env.JWT_SECRET_FORGOT);

        req.headers.authorization = `Bearer ${token}`;

        // Simulate the JWT verification method
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockUser); // Call callback with null error and mockUser
        });

        restrict(req, res, next);

        expect(next).toHaveBeenCalled(); // Ensure next is called
        expect(req.user).toEqual(mockUser); // Ensure req.user is populated with mockUser
    });

    test('should call next with UnauthorizedError if authorization header is missing', () => {
        restrict(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('should call next with UnauthorizedError if authorization header does not start with "Bearer "', () => {
        req.headers.authorization = 'invalid_token';

        restrict(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('should call next with UnauthorizedError if token is invalid', () => {
        req.headers.authorization = 'Bearer invalid_token';

        // Simulate an invalid token scenario
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null); // Simulate JWT verification failure
        });

        restrict(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('should call next with UnauthorizedError if the Authorization header is empty', () => {
        req.headers.authorization = 'Bearer ';

        restrict(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('should call next with UnauthorizedError if authorization header contains extra spaces', () => {
        req.headers.authorization = 'Bearer   ';

        restrict(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('should call next with UnauthorizedError if token is passed as query parameter and is invalid', () => {
        req.query.token = 'invalid_token';

        // Simulate an invalid token scenario
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null); // Simulate JWT verification failure
        });

        restrict(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('should call next if token is passed as query parameter and is valid', () => {
        const mockUser = { userId: 1, userEmail: 'test@example.com' };
        const token = jwt.sign(mockUser, process.env.JWT_SECRET_FORGOT);

        req.query.token = token;

        // Simulate the JWT verification method
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockUser); // Call callback with null error and mockUser
        });

        restrict(req, res, next);

        expect(next).toHaveBeenCalled(); // Ensure next is called
        expect(req.user).toEqual(mockUser); // Ensure req.user is populated with mockUser
    });

    test('should call next with UnauthorizedError if token is passed as query parameter but is empty', () => {
        req.query.token = '';

        restrict(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('should call next with UnauthorizedError if the token is expired (JWT verification failure)', () => {
        req.headers.authorization = 'Bearer expired_token';

        // Simulate an expired token scenario
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Token expired'), null); // Simulate token expiration
        });

        restrict(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
});
