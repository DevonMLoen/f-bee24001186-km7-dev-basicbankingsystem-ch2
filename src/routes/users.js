const express = require("express");
const UserController = require('../controllers/users');

const router = express.Router();
const restrict = require('../middleware/restrict');

router.use(restrict); // add jwt authenticate

router.get("/", (req, res) => UserController.getAllUsers(req, res));
router.get("/:id", (req, res) => UserController.getUserById(req, res));
router.get("/:id/views", (req, res) => UserController.renderUser(req, res));

module.exports = router;
