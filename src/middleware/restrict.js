const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({
            status: false,
            message: 'you\'re not authorized',
            data: null
        });
    }

    jwt.verify(authorization, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: false,
                message: 'you\'re not authorized',
                err: err.message,
                data: null
            });
        }
        req.user = decoded;
        next();
    });
}
