// controllers/settingsControllers.js

// User & Image models (Mongoose schema)
const User = require('../models/userSchema.js');
const Image = require('../models/imageSchema.js');
const Project = require('../models/projectSchema.js');

const { jwtSign } = require('../config/jwtConfig.js');

// Function to get the users profile
function getUserProfile (req, res) {
    try {
        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
            } else {
                res.status(200).json({ message: 'User profile retrieved successfully', user: user });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Export the controller functions
module.exports = { 
    getUserProfile
}