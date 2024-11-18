const express = require('express');
const restrict = require('../middleware/restrict');
const { validateUser, validateLogin, validateResetPassword , validateEmail} = require("../middleware/validator");
const AuthController = require('../controllers/auth');
const restrictForgot = require('../middleware/restrictforgot')

const router = express.Router();

router.post('/login', validateLogin, (req, res , next) => AuthController.login(req, res, next));
router.post('/logout', (req, res) => AuthController.logout(req, res));
router.post('/reset-password', restrictForgot, validateResetPassword, (req, res ,next) => AuthController.resetPassword(req, res , next));
router.post('/forgot-password', validateEmail , (req, res , next) => AuthController.forgotPassword(req, res , next));
router.get('/whoami', restrict, (req, res) => AuthController.whoami(req, res));
router.post("/signup", validateUser, (req, res, next) => AuthController.signup(req, res, next));

module.exports = router;
