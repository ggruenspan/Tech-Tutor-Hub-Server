// routes/userAPI.js

const express = require('express');
const authController = require('../controllers/authControllers.js');
const router = express.Router();

// Route for user sign-up
router.post('/sign-up', (req,res) => {
    authController.signUp(req, res);
});

// Route for user sign-in
router.post('/sign-in', (req, res) => {
    authController.signIn(req, res);
});

// Route for user forgot-password
router.post('/forgot-password', (req,res) => {
    authController.forgotPassword(req, res);
});

// Route for user reset-password
router.post('/reset-password/:token', (req,res) => {
    authController.resetPassword(req, res);
});

// Route for user email verification
router.get('/verify-email/:token', (req, res) => {
    authController.verifyEmail(req, res);
});

module.exports = router;
