// controllers/imageControllers.js

const { createCanvas } = require('canvas'); // For generating the image

// User & Image models (Mongoose schema)
const User = require('../models/userSchema.js');
const Image = require('../models/imageSchema.js');

// Function for getting the user profile image
function getProfileImage(req, res) {
    try {
        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
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
                res.status(500).json({ message: 'Error occurred while checking for an existing profile image. Please try again. If the issue persists, contact support.' });
            });

        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Function for removing a users profile image
function removeProfileImage(req, res) {
    try {
        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
            }

            const currentProfileImageId = user.profile.profileImage;
            if (currentProfileImageId) {
                // Fetch the image details to check the description
                return Image.findById(currentProfileImageId).exec()
                    .then((image) => {
                        if (!image) {
                            return res.status(404).json({ message: 'Image not found' });
                        }

                        // Check the description of the image
                        if (image.desc === `Generated profile image for ${user.account.firstName} ${user.account.lastName}`) {
                            return res.status(403).json({ message: 'Cannot delete the default profile image' });
                        }

                        if (image.desc === `Uploaded profile image for ${user.account.firstName} ${user.account.lastName}`) {
                            // Delete the uploaded profile image
                            return Image.findByIdAndDelete(currentProfileImageId).exec()
                                .then(() => {
                                    // Generate a new profile image
                                    const initial = user.account.firstName.charAt(0).toUpperCase();
                                    const imageBuffer = generateProfileImage(initial);

                                    // Save the generated image to the Images collection
                                    const newImage = new Image({
                                        user: user.id,
                                        desc: `Generate profile image for ${user.account.firstName} ${user.account.lastName}`,
                                        img: {
                                            data: imageBuffer,
                                            contentType: 'image/png'
                                        }
                                    });

                                    return newImage.save();
                                })
                                .then((savedImage) => {
                                    // Update the user's profile with the new generated image ID
                                    user.profile.profileImage = savedImage._id;

                                    return user.save();
                                })
                                .then(() => {
                                    res.status(200).json({ message: 'Profile image deleted' });
                                });
                        }
                        return res.status(200).json({ message: 'No profile image to remove' });
                    });
            }
            // If there's no profile image, send a success message
            return res.status(200).json({ message: 'No profile image to remove' });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Function to generate profile image with user's first initial
function generateProfileImage(initial) {
    const canvas = createCanvas(200, 200); // Create a 200x200 canvas
    const ctx = canvas.getContext('2d');

    // Background color
    ctx.fillStyle = '#28A745';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text settings
    ctx.fillStyle = '#F5F5F5';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the initial in the center of the canvas
    ctx.fillText(initial, canvas.width / 2, canvas.height / 2);

    // Convert canvas to Buffer (to save as base64 string later)
    return canvas.toBuffer('image/png');
}

// Export the controller functions
module.exports = {
    getProfileImage,
    removeProfileImage,
    generateProfileImage
}