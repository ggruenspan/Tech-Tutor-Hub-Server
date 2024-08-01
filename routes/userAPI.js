// routes/userAPI.js

const express = require('express');
const userController = require('../controllers/userControllers.js');
const router = express.Router();

// Route for user profile update
router.post('/updateUserProfile', function(req,res) {
    userController.updateUserProfile(req, res);
});

module.exports = router;
