const express = require('express');
const Auth = require('../services/auth.js'); 
const User = require('../services/users');
const restrict = require('../middleware/restrict');
const { validateUser , validateLogin , validateResetPassword } = require("../middleware/validator");

const router = express.Router();
const auth = new Auth();

router.post('/login',validateLogin ,async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await auth.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.post('/logout', async (req, res) => {
  const result = await auth.logout();
  res.json(result);
});

router.post('/reset-password', restrict ,validateResetPassword ,async (req, res) => {
  const userId = req.user.id;
  const { newPassword } = req.body;
  try {
    const result = await auth.resetPassword(userId, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/forgot-password', restrict ,async (req, res) => {
  try {
    const email = req.user.email;
    const result = await auth.forgotPassword(email);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.get('/whoami', restrict, (req, res) => {
  return res.status(200).json({
    status : true,
    message : "OK",
    error : null,
    data: { user: req.user}
  })
});

router.post("/signup", validateUser, async (req, res, next) => {
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
});


module.exports = router;
