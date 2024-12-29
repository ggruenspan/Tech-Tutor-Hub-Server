// controllers/becomeATutorController.js

// User models (Mongoose schema)
const User = require('../../models/userSchema.js');

// Function to check whether the user exists
function checkUserByEmail (req, res) {
    try {
        const { email } = req.body;

        // Find the user with the given userName
        User.findOne({ 'email.address': email })
        .then((user) => {
            if (!user) {
                return res.status(200).json({ message: 'Thank you for considering becoming a tutor! Let’s start by creating your account.' });
            } else {
                res.status(404).json({ message: `An account with the email ${email} already exists. If this is your account, please sign in to continue.` });
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
    checkUserByEmail
}