// routes/userAPI.js

const express = require('express');
const userController = require('../controllers/authControllers.js');
const router = express.Router();
const passport = require('passport')

// Route for user sign-up
router.post('/sign-up', (req,res) => {
    userController.signUp(req, res);
});

// Route for user sign-in
router.post('/sign-in', (req, res) => {
    userController.signIn(req, res);
});

// Route for user sign-out
router.get('/sign-out', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Sign out successfully' });
});

// Route for user forgot-password
router.post('/forgot-password', (req,res) => {
    userController.forgotPassword(req, res);
});

// Route for user reset-password
router.post('/reset-password/:token', (req,res) => {
    userController.resetPassword(req, res);
});

// Route for user authentication using JWT
router.get('/authenticate', (req, res, next) => {
    passport.authenticate('jwt', { message: 'Custom message' }, (err, user, info) => {
        if (err) { return res.status(500).json({ message: info.message }); }
        if (!user) { return res.status(401).json({ message: info.message }); }
        return res.status(200).json({ message: info.message});
    })(req, res, next);
});

module.exports = router;
