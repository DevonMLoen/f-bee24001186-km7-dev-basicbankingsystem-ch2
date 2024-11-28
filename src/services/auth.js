const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../db");
const { HttpError } = require("../middleware/errorhandling");
const { JWT_SECRET, JWT_SECRET_FORGOT } = process.env;
const nodemailer = require("nodemailer");

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
      return { token, userId: user.userId };
    } catch (error) {
      throw new HttpError(`Login failed: ${error.message}`, error.statusCode);
    }
  }

  async logout() {
    // try {
    // implementasi code logout
    return { message: "Logout successful" };
    // } catch (error) {
    //   throw new Error(`Logout failed: ${error.message}`);
    // }
  }

  async resetPassword(userId, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { userId: userId },
      });

      if (!user) {
        throw new HttpError("User not found", 404);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { userId: parseInt(userId) },
        data: { userPassword: hashedPassword },
      });
      return { userName: user.userName };
    } catch (error) {
      throw new HttpError(
        "Reset password failed: : " + error.message,
        error.statusCode
      );
    }
  }

  async forgotPassword(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { userEmail: email },
      });

      if (!user) {
        throw new HttpError("Email not found", 404);
      }
      const token = this.generateTokenForgot(user);

      const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

      // const transporter = nodemailer.createTransport({
      //   host: 'smtp.mailtrap.io',
      //   port: 2525,
      //   auth: {
      //     user: process.env.MAILTRAP_USER,
      //     pass: process.env.MAILTRAP_PASS
      //   }
      // });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: "webdesign@gmail.com",
        to: email,
        subject: "Password Reset Request",
        text: `Click the link to reset your password: ${resetPasswordUrl}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log(`Email sent: ` + info.response);
        }
      });
    } catch (error) {
      throw new HttpError(
        "Forgot password failed: " + error.message,
        error.statusCode
      );
    }
  }

  generateToken(user) {
    return jwt.sign({ id: user.userId, email: user.userEmail }, JWT_SECRET, {
      expiresIn: "1h",
    });
  }

  generateTokenForgot(user) {
    return jwt.sign(
      { id: user.userId, email: user.userEmail },
      JWT_SECRET_FORGOT,
      {
        expiresIn: "5m",
      }
    );
  }
}

module.exports = Auth;
