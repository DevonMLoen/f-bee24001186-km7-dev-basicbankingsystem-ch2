const express = require('express');
const restrict = require('../middleware/restrict');
const { validateUser, validateLogin, validateResetPassword } = require("../middleware/validator");
const AuthController = require('../controllers/auth');

const router = express.Router();

router.post('/login', validateLogin, (req, res , next) => AuthController.login(req, res, next));
router.post('/logout', (req, res) => AuthController.logout(req, res));
router.post('/reset-password', restrict, validateResetPassword, (req, res ,next) => AuthController.resetPassword(req, res , next));
router.post('/forgot-password', restrict, (req, res , next) => AuthController.forgotPassword(req, res , next));
router.get('/whoami', restrict, (req, res) => AuthController.whoami(req, res));
router.post("/signup", validateUser, (req, res, next) => AuthController.signup(req, res, next));

module.exports = router;
