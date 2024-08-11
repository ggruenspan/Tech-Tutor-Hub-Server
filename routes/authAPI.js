// routes/userAPI.js

const express = require('express');
const userController = require('../controllers/authControllers.js');
const router = express.Router();

// Route for user sign-up
router.post('/sign-up', (req,res) => {
    userController.signUp(req, res);
});

// Route for user sign-in
router.post('/sign-in', (req, res) => {
    userController.signIn(req, res);
});

// Route for user forgot-password
router.post('/forgot-password', (req,res) => {
    userController.forgotPassword(req, res);
});

// Route for user reset-password
router.post('/reset-password/:token', (req,res) => {
    userController.resetPassword(req, res);
});

module.exports = router;
