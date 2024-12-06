const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./errorhandling");
const { JWT_SECRET_FORGOT } = process.env;

module.exports = async (req, res, next) => {
  const authorization =
    req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!authorization) {
    return next(new UnauthorizedError());
  }

  const token = authorization;

  jwt.verify(token, JWT_SECRET_FORGOT, (err, decoded) => {
    if (err) {
      return next(new UnauthorizedError());
    }

    req.user = decoded;
    next();
  });
};
