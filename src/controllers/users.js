const User = require('../services/users');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await User.getAllUsers();

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const userId = req.params.id;

      const user = await User.getUserById(userId);

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async renderUser(req, res, next) {
    try {
      const userId = req.params.id;

      const user = await User.getUserById(userId);

      res.render('users', { user }); // renders
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
