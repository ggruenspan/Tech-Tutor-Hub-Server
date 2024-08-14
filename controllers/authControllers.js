// controllers/authControllers.js

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// User & Image models (Mongoose schema)
const User = require('../models/userSchema.js');
const Image = require('../models/imageSchema.js');

const emailController = require('./emailController.js');
const imageController = require('./imageControllers.js');

const { jwtSign } = require('../config/jwtConfig.js');

// Controller function for user sign-up
function signUp(req, res) {
    try {
        const { fullName, email, password } = req.body;

        // Check if a user with the given email already exists
        User.findOne({ "email.address": email })
        .then((user) => {
            if (user) {
                return res.status(400).json({ message: 'There is already a user with that email: ' + email });
            }

            // Hash the password
            bcrypt.hash(password, 10)
            .then((hash) => {
                // Create a new user without the profile image
                let newUser = new User({
                    _id: uuidv4(),
                    userName: (fullName.split(" ")[0].charAt(0).toUpperCase() + fullName.split(" ")[0].slice(1)) + "." + fullName.split(" ")[1].charAt(0).toUpperCase(),
                    password: hash,
                    email: {
                        address: email
                    },
                    profile: {
                        firstName: fullName.split(" ")[0],
                        lastName: fullName.split(" ")[1],
                    }
                });

                // Save the new user
                newUser.save()
                .then((savedUser) => {
                    // Generate a profile image with the user's first initial
                    const initial = fullName.charAt(0).toUpperCase();
                    const imageBuffer = imageController.generateProfileImage(initial);

                    // Save the image to the Images collection with the user's ID
                    const newImage = new Image({
                        user: savedUser._id, // Reference to the user's ID
                        desc: `Generate profile image for ${fullName}`,
                        img: {
                            data: imageBuffer,
                            contentType: 'image/png'
                        }
                    });

                    newImage.save()
                    .then((savedImage) => {
                        // Update the user's profile with the image ID
                        savedUser.profile.profileImage = savedImage._id;

                        // Generate a unique reset token and store the reset token and expiration
                        const expirationTime = new Date();
                        expirationTime.setMinutes(expirationTime.getMinutes() + 30);

                        savedUser.tokens.verification.verificationToken = crypto.randomBytes(20).toString('hex');
                        savedUser.tokens.verification.verificationTokenExpiration = expirationTime;

                        savedUser.save()
                        .then(() => {
                            emailController.sendVerificationEmail(email, savedUser.tokens.verification.verificationToken)
                            .then(() => {
                                res.status(201).json({ message: 'User signed up successfully. Please check your email for verification instructions.' });
                            })
                            .catch((emailErr) => {
                                res.status(500).json({ message: 'User signed up successfully, but there was an error sending the verification email. Please contact support.' });
                            });
                        })
                        .catch((err) => {
                            return res.status(500).json({ message: 'An error occurred while updating the user profile. Please try again' });
                        });
                    })
                    .catch((imageErr) => {
                        return res.status(500).json({ message: 'An error occurred while saving the profile image. Please try again' });
                    });
                })
                .catch((err) => {
                    return res.status(500).json({ message: 'An error occurred while signing up. Please try again' });
                });
            })
            .catch((hashErr) => {
                return res.status(500).json({ message: 'An error occurred while signing up. Please try again' });
            });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'An error occurred while signing up. Please try again' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

// Controller function for user sign-in
function signIn(req, res) {
    try {
        const { email, password } = req.body;

        // Find the user with the given email
        User.findOne({ "email.address" : email, })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'Unable to find user with email: ' + email });
            }

            // Check if the email is validated
            if (!user.email.validated) {
                return res.status(400).json({ message: 'Email address has not been validated. Please check your email for verification instructions.' });
            }

            // Check if password is correct
            bcrypt.compare(password, user.password)
            .then((result) => {
                if (result === true) {
                    const payload = {
                        id: user.id,
                        role: user.role,
                        access: user.access,
                        userName: user.userName,
                        email: user.email.address,
                        avatar: user.profile.avatar,
                    }

                    // Update user's login history and generate JWT token
                    user.loginHistory.push({dateTime: new Date(), userAgent: req.get('User-Agent')});
                    user.updateOne({ $set: { loginHistory: user.loginHistory}})

                    .then(() => {
                        jwtSign(payload)
                        .then((token) => {
                            res.status(200).json({ message: 'User signed in successfully', token: token});
                        })
                        .catch((err) => {
                            return res.status(500).json('An error occurred while signing in. Please try again');
                        })
                    })
                    .catch((err) => {
                        return res.status(500).json({ message: 'An error occurred while signing in. Please try again' });
                    })
                } else {
                    return res.status(400).json({ message: 'Invalid username or password' });
                }
            })
            .catch((err) => {
                return res.status(500).json({ message: 'An error occurred while signing in. Please try again' });
            })
        })
        .catch((err) => {
            return res.status(500).json({ message: 'An error occurred while signing in. Please try again' });
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
};

// Controller function for forgot password
function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        // Check if the email is in the database
        User.findOne({ "email.address" : email })
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: 'Unable to find user with email: ' + email });
            }

            // Generate a unique reset token and tore the reset token and expiration
            const expirationTime = new Date();
            expirationTime.setMinutes(expirationTime.getMinutes() + 30);

            user.tokens.reset.resetToken = crypto.randomBytes(20).toString('hex');
            user.tokens.reset.resetTokenExpiration = expirationTime;

            user.save()
            .then(() => {
                // Send verification email
                emailController.sendResetPasswordEmail(email, user.tokens.reset.resetToken)
                .then(() => {
                    res.status(201).json({ message: 'Password reset email sent. Please check your email for reset instructions.' });
                })
                .catch((emailErr) => {
                    res.status(500).json({ message: 'Password reset email sent, but there was an error sending the email. Please contact support.' });
                });
            })
            .catch(err => {
                return res.status(500).json({ message: 'An error occurred while saving the reset token' });  
            });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'An error occurred while finding the user' });
        });

    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
};

// Controller function for reset password
function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Find the user by the reset token and check if it's still valid
        User.findOne({ "tokens.reset.resetToken": token })
        .then((user) => {
            if(user.tokens.reset.resetTokenExpiration.toLocaleTimeString() < new Date().toLocaleTimeString()) {
                return res.status(400).json({ message: 'Expired token. Please request a new password reset.' });
            }
            // Check if the new password is the same as the current password
            bcrypt.compare(password, user.password)
            .then((result) => {
                if(result === false) {
                    bcrypt.hash(password, 10)
                    .then((hash) => {
                        // Update the user's password and clear the reset token fields
                        user.password = hash;
                        user.tokens.reset = undefined;
    
                        // Save the updated user in the database
                        user.save()
                        .then(() => {
                            res.status(200).json({ message: 'Password reset successfully' });
                        })
                        .catch((err) => {
                            return res.status(500).json({ message: 'An error occurred while resetting you password in' });
                        }); 
                    })
                } else {
                    return res.status(400).json({ message: 'You cannot use your current password as the new password' });
                }
            })
            .catch((err) => {
                return res.status(500).json({ message: 'An error occurred while resetting you password in' });
            });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Invalid token. Please request a new password reset' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

// Controller function for verifying the user's email address
function verifyEmail(req, res) {
    try {
        const { token } = req.params;

        // Find the user by the reset token and check if it's still valid
        User.findOne({ "tokens.verification.verificationToken": token })
        .then((user) => {
            if(user.tokens.verification.verificationTokenExpiration.toLocaleTimeString() < new Date().toLocaleTimeString()) {
                return res.status(400).json({ message: 'Expired token. Please contact support.' });
            }

            // Update the user and clear the verification token fields
            user.email.validated = true;
            user.tokens.verification = undefined;

            // Save the updated user in the database
            user.save()
            .then(() => {
                res.status(200).json({ message: 'Verified email successfully' });
            })
            .catch((err) => {
                return res.status(500).json({ message: 'An error occurred while resetting you password in' });
            }); 
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Invalid token. Please contact support.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}


// Export the controller functions
module.exports = {
    signUp,
    verifyEmail,
    signIn,
    forgotPassword,
    resetPassword
}