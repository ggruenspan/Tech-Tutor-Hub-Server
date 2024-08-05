// routes/userAPI.js

const express = require('express');
const upload = require('../config/multerConfig.js');
const userController = require('../controllers/userControllers.js');
const router = express.Router();

// Route for user profile update
router.post('/update-user-profile', (req,res) => {
    userController.updateUserProfile(req, res);
});

// Define the route for uploading profile pictures
router.post('/upload-profile-picture', upload.single('profileImage'), (req, res, next) => {
    userController.uploadProfilePicture(req, res, next);
});

module.exports = router;
