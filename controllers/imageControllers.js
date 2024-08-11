// controllers/imageControllers.js

// User & Image models (Mongoose schema)
const User = require('../models/userSchema.js');
const Image = require('../models/imageSchema.js');

// Function for getting the user profile image
function getProfileImage(req, res) {
    try {
        const { email } = req.user;

        // Find the user with the given email
        User.findOne({ "email.address" : email, })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'Unable to find user with email: ' + email });
            }

            Image.findById(user.profile.profileImage)
            .then((image) => {
                // Ensure the requesting user is authorized to access the image
                if (image.user !== user.id) {
                    return res.status(403).json({ message: 'Forbidden' });
                } else {
                    res.status(200).json({
                        image: {
                            data: image.img.data.toString('base64'), // Encode image data to Base64
                            contentType: image.img.contentType
                        }
                    });

                }
            })
            .catch(err => {
                res.status(500).json({ message: 'Internal server error' });
            });

        })
        .catch((err) => {
            return res.status(500).json({ message: 'An error occurred while signing in. Please try again' });
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

// Function for removing a users profile image
function removeProfileImage(req, res) {
    try {
        const { email } = req.user;

        // Find the user with the given email
        User.findOne({ "email.address": email })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                const currentProfileImageId = user.profile.profileImage;
                if (currentProfileImageId) {
                    // Fetch the image details to check the description
                    return Image.findById(currentProfileImageId).exec()
                        .then((image) => {
                            if (!image) {
                                return res.status(404).json({ message: 'Image not found' });
                            }

                            // Check if the description is 'genPicture'
                            if (image.description === 'genPicture') {
                                return res.status(200).json({ message: 'No profile image to remove' });
                            }

                            // Delete the profile image
                            return Image.findByIdAndDelete(currentProfileImageId).exec()
                                .then(() => {
                                    return User.updateOne({ "email.address": email }, { $unset: { "profile.profileImage": "" } });
                                })
                                .then(() => {
                                    res.status(200).json({ message: 'Profile image successfully removed' });
                                });
                        });
                }

                // If there's no profile image, send a success message
                return res.status(200).json({ message: 'No profile image to remove' });
            })
            .catch((err) => {
                res.status(500).json({ message: 'An error occurred while processing the request. Please try again' });
            });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

// Export the controller functions
module.exports = {
    getProfileImage,
    removeProfileImage
}