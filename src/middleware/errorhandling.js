class HttpError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
    }
}

class UnauthorizedError extends Error {
constructor(message = "You're not authorized") {
    super(message);
    this.statusCode = 401;
    this.status = false;
    this.data = null;
}
}  
  
module.exports = {HttpError,UnauthorizedError};
  