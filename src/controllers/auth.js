const Auth = require("../services/auth.js");
const User = require("../services/users.js");
// const io = require("../index.js");

class AuthController {
  constructor() {
    this.auth = new Auth();
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.auth.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const result = await this.auth.logout();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return res.status(400).send("Passwords do not match");
      }

      const result = await this.auth.resetPassword(userId, newPassword);
      // io.emit(
      //   "newNotification",
      //   `User ${result.userName} has Reset Password Successfully!`
      // );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const email = req.body.email;
      const result = await this.auth.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  whoami(req, res) {
    return res.status(200).json({
      status: true,
      message: "OK",
      error: null,
      data: { user: req.user },
    });
  }

  async signup(req, res, next) {
    try {
      const value = { ...req.body };

      const userData = {
        name: value.userName,
        email: value.userEmail,
        password: value.userPassword,
      };

      const profileData = {
        type: value.profileType,
        number: value.profileNumber,
        address: value.address,
      };

      const user = new User(userData);

      const { newUser, newProfile } = await user.createUserWithProfile(
        profileData
      );
      // io.emit("newNotification", `User ${newUser.userName} has registered!`);

      res.status(201).json({ newUser, newProfile });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
