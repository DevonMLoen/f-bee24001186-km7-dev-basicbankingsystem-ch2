const jwt = require('jsonwebtoken');
const restrict = require('../middleware/restrict');

beforeAll(() => {
    process.env.JWT_SECRET = 'mock_secret'; 
});

describe('Restrict Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
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
        next = jest.fn(); 

        jest.spyOn(jwt, 'verify');
    });

    afterEach(() => {
        jest.clearAllMocks(); 
    });

    test('should call next if authorization header is present and token is valid', () => {
        const mockUser = { userId: 1, userEmail: 'test@example.com' };
        const token = jwt.sign(mockUser, process.env.JWT_SECRET); 

        req.headers.authorization = `Bearer ${token}`;

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockUser); 
        });

        restrict(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual(mockUser); 
    });

    test('should return 401 if authorization header is missing', () => {
        restrict(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getData()).toEqual({
            status: false,
            message: "you're not authorized",
            data: null
        });
    });

    test('should return 401 if authorization header does not start with "Bearer "', () => {
        req.headers.authorization = 'invalid_token';

        restrict(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getData()).toEqual({
            status: false,
            message: "you're not authorized",
            data: null
        });
    });

    test('should return 401 if token is invalid', () => {
        req.headers.authorization = 'Bearer invalid_token';

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null);
        });

        restrict(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getData()).toEqual({
            status: false,
            message: "you're not authorized",
            err: 'Invalid token', 
            data: null
        });
    });
});
