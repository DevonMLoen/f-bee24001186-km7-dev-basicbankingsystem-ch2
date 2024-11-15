const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require("../db"); 
const { HttpError } = require('../middleware/errorhandling');
const { JWT_SECRET } = process.env;

class Auth {
  async login(email, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { userEmail: email },
      });

      if (!user) {
        throw new HttpError("Invalid email or password", 401);
      }

      const isMatch = await bcrypt.compare(password, user.userPassword);
      if (!isMatch) {
        throw new HttpError("Invalid email or password", 401);
      }

      const token = this.generateToken(user);
      return { token, userId: user.userId, userRole: user.userRole };
    } catch (error) {
      throw new HttpError(`Login failed: ${error.message}`, error.statusCode)
    }
  }

  async logout() {
    // try {
    // implementasi code logout
      return { message: 'Logout successful' };
    // } catch (error) {
    //   throw new Error(`Logout failed: ${error.message}`);
    // }
  }

  async resetPassword(userId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { userId: parseInt(userId) },
        data: { userPassword: hashedPassword },
      });
      return { message: 'Password successfully reset' };
    } catch (error) {
      throw new HttpError(`Reset password failed: ${error.message}`, error.statusCode);
    }
  }

  async forgotPassword(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { userEmail: email },
      });

      if (!user) {
        throw new HttpError("Email not Found", 404);
      }
      return { message: 'Password reset email has been sent' }; // Implement email sending logic here
    } catch (error) {
        throw new HttpError(`Forgot password failed: ${error.message}`, error.statusCode);
    }
  }

  generateToken(user) {
    return jwt.sign({ id: user.userId, email : user.userEmail }, JWT_SECRET, {
      expiresIn: '1h', 
    });
  }
}

module.exports = Auth;
