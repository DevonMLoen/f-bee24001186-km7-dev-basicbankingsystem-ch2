const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require("../db"); 
const { JWT_SECRET } = process.env;
const restrict = require('../middleware/restrict');

class Auth {
  async login(email, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { userEmail: email },
      });

      if (!user) {
        throw new Error('Incorrect email or password');
      }

      const isMatch = await bcrypt.compare(password, user.userPassword);
      if (!isMatch) {
        throw new Error('Incorrect email or password');
      }

      const token = this.generateToken(user);
      return { token, userId: user.userId, userRole: user.userRole };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async logout() {
    try {
      return { message: 'Logout successful' };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
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
      throw new Error(`Reset password failed: ${error.message}`);
    }
  }

  async forgotPassword(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { userEmail: email },
      });

      if (!user) {
        throw new Error('Email not found');
      }
      return { message: 'Password reset email has been sent' }; // Implement email sending logic here
    } catch (error) {
      throw new Error(`Forgot password failed: ${error.message}`);
    }
  }

  generateToken(user) {
    return jwt.sign({ id: user.userId, email : user.userEmail }, JWT_SECRET, {
      expiresIn: '1h', 
    });
  }
}

module.exports = Auth;
