const express = require("express");
const User = require('../services/users');
const { validateUser } = require("../middleware/validator");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const users = await User.getAllUsers();

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users were found.' });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", validateUser, async (req, res, next) => {
    try {
        const value = { ...req.body };
        // console.log(value)

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
        // console.log('User and Profile created:', newUser, newProfile);
    } catch (error) {
        next(error);
    }
});


router.get("/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.getUserById(userId);
        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'No users were found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
});

router.get("/:id/views", async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.getUserById(userId);
        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'No users were found.' });
        }

        res.render('users', { user }); //// renders
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
});

module.exports = router;