// routes/userAPI.js

const express = require('express');
const authenticateToken = require('../middleware/authenticateToken.js');
const upload = require('../config/multerConfig.js');
const userController = require('../controllers/userControllers.js');
const router = express.Router();

// Route for getting the user data
router.get('/get-user-profile', authenticateToken, (req, res) => {
    userController.getUserProfile(req, res);
});

// Route for user profile update
router.post('/update-user-profile', (req,res) => {
    userController.updateUserProfile(req, res);
});

// Define the route for uploading profile pictures
router.post('/upload-profile-picture', authenticateToken, upload.single('profileImage'), (req, res) => {
    userController.uploadProfilePicture(req, res);
});

module.exports = router;
