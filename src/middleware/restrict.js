const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./errorhandling");
const { JWT_SECRET } = process.env;

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new UnauthorizedError());
  }

  const token = authorization.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new UnauthorizedError());
    }

    req.user = decoded;
    next();
  });
};
