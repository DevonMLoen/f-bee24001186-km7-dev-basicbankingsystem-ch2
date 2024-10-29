const Auth = require('../services/auth.js');
const User = require('../services/users.js');

class AuthController {
  constructor() {
    this.auth = new Auth();
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.auth.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async logout(req, res) {
    const result = await this.auth.logout();
    res.json(result);
  }

  async resetPassword(req, res) {
    const userId = req.user.id;
    const { newPassword } = req.body;
    try {
      const result = await this.auth.resetPassword(userId, newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const email = req.user.email;
      const result = await this.auth.forgotPassword(email);
      res.json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  whoami(req, res) {
    return res.status(200).json({
      status: true,
      message: "OK",
      error: null,
      data: { user: req.user }
    });
  }

  async signup(req, res, next) {
    try {
      const value = { ...req.body };

      const userData = {
        name: value.userName,
        email: value.userEmail,
        password: value.userPassword
      };

      const profileData = {
        type: value.profileType,
        number: value.profileNumber,
        address: value.address
      };

      const user = new User(userData);

      const { newUser, newProfile } = await user.createUserWithProfile(profileData);
      res.status(201).json({ newUser, newProfile });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
