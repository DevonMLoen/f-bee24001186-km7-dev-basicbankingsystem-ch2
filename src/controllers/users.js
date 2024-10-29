const User = require('../services/users');

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await User.getAllUsers();

      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users were found.' });
      }
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const userId = req.params.id;

      const user = await User.getUserById(userId);
      if (!user || user.length === 0) {
        return res.status(404).json({ message: 'No users were found.' });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred on the server.' });
    }
  }

  async renderUser(req, res) {
    try {
      const userId = req.params.id;

      const user = await User.getUserById(userId);
      if (!user || user.length === 0) {
        return res.status(404).json({ message: 'No users were found.' });
      }

      res.render('users', { user }); // renders
    } catch (error) {
      res.status(500).json({ message: 'An error occurred on the server.' });
    }
  }
}

module.exports = new UserController();
