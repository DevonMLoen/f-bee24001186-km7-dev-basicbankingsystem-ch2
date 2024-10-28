const express = require('express');
const restrict = require('../middleware/restrict');
const { validateUser, validateLogin, validateResetPassword } = require("../middleware/validator");
const AuthController = require('../controllers/auth');

const router = express.Router();

router.post('/login', validateLogin, (req, res) => AuthController.login(req, res));
router.post('/logout', (req, res) => AuthController.logout(req, res));
router.post('/reset-password', restrict, validateResetPassword, (req, res) => AuthController.resetPassword(req, res));
router.post('/forgot-password', restrict, (req, res) => AuthController.forgotPassword(req, res));
router.get('/whoami', restrict, (req, res) => AuthController.whoami(req, res));
router.post("/signup", validateUser, (req, res, next) => AuthController.signup(req, res, next));

module.exports = router;
