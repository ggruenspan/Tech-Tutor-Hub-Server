// routes/userAPI.js

const express = require('express');
const userController = require('../controllers/userControllers.js');
const router = express.Router();

// Route for user sign-up
router.post('/sign-up', (req,res) => {
    // console.log('sign-up');
    userController.signUp(req, res);
});

// Route for user sign-in
router.post('/sign-in', (req, res) => {
    // console.log('sign-in');
    userController.signIn(req, res);
});

// Route for user sign-out
router.get('/sign-out', (req, res) => {
    // console.log('signOut');
    res.clearCookie('token');
    res.status(200).json({ message: 'Sign out successfully' });
});

// Route for user forgot-password
router.post('/forgot-password', function(req,res) {
    // console.log('forgot-password');
    userController.forgotPassword(req, res);
});

// Route for user reset-password
router.post('/reset-password/:token', function(req,res) {
    // console.log('reset-password');
    userController.resetPassword(req, res);
});

module.exports = router;
