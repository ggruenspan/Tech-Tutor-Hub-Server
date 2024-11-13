// routes/settingsAPI.js

const express = require('express');
const authenticateToken = require('../middleware/authenticateToken.js');
const upload = require('../config/multerConfig.js');
const settingsControllers = require('../controllers/settingsControllers.js');
const router = express.Router();

// Route for getting the user data
router.get('/get-public-profile', authenticateToken, (req, res) => {
    settingsControllers.getPublicProfile(req, res);
});

// Route for user profile update
router.post('/update-public-profile', authenticateToken, upload.fields([{ name: 'project1Image', maxCount: 1 },{ name: 'project2Image', maxCount: 1 }]), (req, res) => {
    settingsControllers.updatePublicProfile(req, res);
});

// Define the route for uploading profile pictures
router.post('/upload-profile-picture', authenticateToken, upload.single('profileImage'), (req, res) => {
    settingsControllers.uploadProfilePicture(req, res);
});

// Route for user verification
router.get('/verify-user', authenticateToken, (req, res) => {
    settingsControllers.verifyUser(req, res);
});

module.exports = router;
