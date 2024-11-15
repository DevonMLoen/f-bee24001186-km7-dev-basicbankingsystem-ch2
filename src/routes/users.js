const express = require("express");
const UserController = require('../controllers/users');

const router = express.Router();
const restrict = require('../middleware/restrict');

router.use(restrict); // add jwt authenticate

router.get("/", (req, res, next) => UserController.getAllUsers(req, res, next));
router.get("/:id", (req, res, next) => UserController.getUserById(req, res, next));
router.get("/:id/views", (req, res, next) => UserController.renderUser(req, res, next));

module.exports = router;
