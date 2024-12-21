// routes/settingsAPI.js

const express = require('express');
const authenticateToken = require('../../middleware/authenticateToken.js');
const upload = require('../../config/multerConfig.js');
const publicProfileController = require('../../controllers/settings/publicProfileController.js');
const router = express.Router();

// ----------------------------------------- Public Profile Page Start -------------------------------------------------------

// Route for getting the user data
router.get('/get-public-profile', authenticateToken, (req, res) => {
    publicProfileController.getPublicProfile(req, res);
});

// Route for user profile update
router.post('/update-public-profile', authenticateToken, upload.fields([{ name: 'projectOneImage', maxCount: 1 },{ name: 'projectTwoImage', maxCount: 1 }]), (req, res) => {
    publicProfileController.updatePublicProfile(req, res);
});

// Route for removing a user projects
router.delete('/remove-profile-project/:projectId', authenticateToken, (req, res) => {
    publicProfileController.removePublicProfileProject(req, res);
});

// Route for getting the user profile image
router.get('/get-profile-image', authenticateToken, (req, res) => {
    publicProfileController.getProfileImage(req, res);
});

// Define the route for uploading profile pictures
router.post('/upload-profile-picture', authenticateToken, upload.single('profileImage'), (req, res) => {
    publicProfileController.uploadProfilePicture(req, res);
});

// Route for removing a users profile image
router.delete('/remove-profile-image', authenticateToken, (req, res) => {
    publicProfileController.removeProfileImage(req, res);
});

// ----------------------------------------- Public Profile Page End -------------------------------------------------------

module.exports = router;
