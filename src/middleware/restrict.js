const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            status: false,
            message: "you're not authorized",
            data: null
        });
    }

    const token = authorization.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: false,
                message: "you're not authorized",
                err: err.message,
                data: null
            });
        }

        req.user = decoded;
        next();
    });
};
