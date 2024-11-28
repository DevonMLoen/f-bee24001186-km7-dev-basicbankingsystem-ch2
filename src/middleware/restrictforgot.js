const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./errorhandling");
const { JWT_SECRET } = process.env;

module.exports = async (req, res, next) => {
  const authorization =
    req.headers.authorization?.split(" ")[1] || req.query.token;
  console.log("authorization");
  console.log(authorization);
  if (!authorization) {
    return next(new UnauthorizedError());
  }

  const token = authorization;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    console.log("di dalam");
    if (err) {
      console.log("err");
      console.log(err);
      return next(new UnauthorizedError());
    }

    req.user = decoded;
    next();
  });
};
