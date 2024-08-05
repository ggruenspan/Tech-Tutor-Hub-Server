// controllers/userControllers.js

// User & Image models (Mongoose schema)
const User = require('../models/userSchema.js');
const Image = require('../models/imageSchema.js');

const { jwtSign } = require('../config/jwtConfig.js');

// Function to update users profile
function updateUserProfile (req, res) {
    try {
        const { oldEmail, firstName, lastName, newEmail, phoneNumber, dateOfBirth, country, stateProvince, city, bio, pronouns } = req.body;

        // Check if a user with the given email already exists
        User.findOne({ "email.address" : newEmail })
       .then((user) => {
            if(user && user.email.address !== oldEmail) {
                    // If user with newEmail already exists and it's not the current user, send an error message
                    return res.status(400).json({ message: 'Email already in use. Please use a different email.' });
            }
            else {
                const userName = (firstName.split(" ")[0].charAt(0).toUpperCase() + firstName.split(" ")[0].slice(1)) + "." + lastName.charAt(0).toUpperCase();

                // Find the user by their old email address and update their profile
                User.findOneAndUpdate(
                    {
                        "email.address": oldEmail,
                        $or: [
                            {"userName": { $ne: userName}},
                            { "email.address": { $ne: newEmail }},
                            { "profile.firstName": { $ne: firstName }},
                            { "profile.lastName": { $ne: lastName }},
                            { "profile.phoneNumber": { $ne: phoneNumber }},
                            { "profile.dateOfBirth": { $ne: dateOfBirth }},
                            { "profile.address.country": { $ne: country }},
                            { "profile.address.stateProvince": { $ne: stateProvince }},
                            { "profile.address.city": { $ne: city }},
                            { "profile.bio": { $ne: bio }},
                            { "profile.pronouns": { $ne: pronouns }} 
                        ]
                    },
                    { 
                        $set: {
                            "userName": userName,
                            "email.address": newEmail,
                            "profile.firstName": firstName,
                            "profile.lastName": lastName,
                            "profile.phoneNumber": phoneNumber,
                            "profile.dateOfBirth": dateOfBirth,
                            "profile.address.country": country,
                            "profile.address.stateProvince": stateProvince,
                            "profile.address.city": city,
                            "profile.bio": bio,
                            "profile.pronouns": pronouns,
                            "profile.completed": true
                        }
                    },
                    { new: true, runValidators: true } // Return the updated document and run schema validators
                )
                .then((user) => {
                    if (!user) {
                        return res.status(200).json({ message: 'No changes detected.' });
                    }

                    // Create a new payload with updated user information
                    const payload = {
                        id: user.id,
                        role: user.role,
                        userName: user.userName,
                        email: user.email.address,
                        firstName: user.profile.firstName,
                        lastName: user.profile.lastName,
                        phoneNumber: user.profile.phoneNumber,
                        dateOfBirth: user.profile.dateOfBirth,
                        country: user.profile.address.country,
                        stateProvince: user.profile.address.stateProvince,
                        city: user.profile.address.city,
                        bio: user.profile.bio,
                        pronouns: user.profile.pronouns
                    };

                    // Generate a new JWT token
                    jwtSign(payload)
                    .then((token) => {
                        res.status(200).json({ message: 'User profile updated successfully', token: token });
                    })
                    .catch((err) => {
                        return res.status(500).json({ message: 'An error occurred while generating the token' });
                    });
                })
                .catch((err) => {
                    res.status(500).json({ message: 'An error occurred while updating user profile' });
                });
            }
       })
       .catch((err) => {
            res.status(500).json({ message: 'Internal server error. Please try again' });
       })

    } catch(err) {
        return res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

// Function to update users profile picture
function uploadProfilePicture(req, res, next) {
    try {
        let newImage = new Image({
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            desc: 'UserPicture',
            img: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });

        // Create a new iamge
        newImage.save()
        .then(() => {
            res.status(200).json({ message: 'Profile image uploaded successfully!'});
        })
        .catch(err => {
            res.status(500).send("Error uploading image");
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error. Please try again' });
    }  
}

// Export the controller functions
module.exports = {
    updateUserProfile,
    uploadProfilePicture
}