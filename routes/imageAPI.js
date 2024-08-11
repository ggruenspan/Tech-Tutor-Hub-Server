// routes/imageAPI.js

const express = require('express');
const authenticateToken = require('../middleware/authenticateToken.js');
const imageController = require('../controllers/imageControllers.js');
const router = express.Router();

// Route for getting the user profile image
router.get('/get-profile-image', authenticateToken, (req, res) => {
    imageController.getProfileImage(req, res);
});

// Route for removing a users profile image
router.delete('/remove-profile-image', authenticateToken, (req, res) => {
    imageController.removeProfileImage(req, res);
});

module.exports = router;