// controllers/authControllers.js

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// User & Image models (Mongoose schema)
const User = require('../models/userSchema.js');
const Image = require('../models/imageSchema.js');

const emailController = require('./emailController.js');
const publicProfileController = require('./publicProfileController.js');

const { jwtSign } = require('../config/jwtConfig.js');

// Controller function for user sign-up
function signUp(req, res) {
    try {
        const { fullName, email, password } = req.body;

        // Check if a user with the given email already exists
        User.findOne({ "email.address": email })
        .then((user) => {
            if (user) {
                return res.status(400).json({ message: `An account with the email ${email} already exists.` });
            }

            // Hash the password
            bcrypt.hash(password, 10)
            .then((hash) => {
                // Create a new user without the profile image
                const newUser = new User({
                    _id: uuidv4(),
                    userName: `${fullName.split(" ")[0].charAt(0).toUpperCase()}${fullName.split(" ")[0].slice(1)}.${fullName.split(" ")[1].charAt(0).toUpperCase()}`,
                    password: hash,
                    email: { address: email },
                    account: {
                        firstName: fullName.split(" ")[0],
                        lastName: fullName.split(" ")[1],
                    }
                });

                // Save the new user
                newUser.save()
                .then((savedUser) => {
                    // Generate a profile image with the user's first initial
                    const initial = fullName.charAt(0).toUpperCase();
                    const imageBuffer = publicProfileController.generateProfileImage(initial);

                    // Save the image to the Images collection with the user's ID
                    const newImage = new Image({
                        user: savedUser._id, // Reference to the user's ID
                        desc: `Generated profile image for ${savedUser.account.firstName} ${savedUser.account.lastName}`,
                        img: {
                            data: imageBuffer,
                            contentType: 'image/png'
                        }
                    });

                    newImage.save()
                    .then((savedImage) => {
                        // Update the user's profile with the image ID
                        savedUser.profile.profileImage = savedImage._id;

                        // Generate a unique verification token and set expiration time
                        const expirationTime = new Date(res.locals.localTime);
                        expirationTime.setMinutes(expirationTime.getMinutes() + 60);

                        savedUser.tokens.verification.verificationToken = crypto.randomBytes(20).toString('hex');
                        savedUser.tokens.verification.verificationTokenExpiration = expirationTime;

                        savedUser.save()
                        .then(() => {
                            // Send verification email
                            emailController.sendVerificationEmail(email, savedUser.account.firstName, savedUser.tokens.verification.verificationToken)
                            .then(() => {
                                res.status(201).json({ message: 'Account created! Please check your email for verification instructions.' });
                            })
                            .catch((emailErr) => {
                                res.status(500).json({ message: 'Account created, but there was an error sending the verification email. Please contact support for assistance.' });
                            });
                        })
                        .catch((err) => {
                            res.status(500).json({ message: 'Error occurred while saving the user. Please try again. If the issue persists, contact support.' });
                        });
                    })
                    .catch((imageErr) => {
                        res.status(500).json({ message: 'Error occurred while saving the profile image. Please try again. If the issue persists, contact support.' });
                    });
                })
                .catch((err) => {
                    res.status(500).json({ message: 'Error occurred while creating the account. Please try again. If the issue persists, contact support.' });
                });
            })
            .catch((hashErr) => {
                res.status(500).json({ message: 'Error occurred while hashing the password. Please try again. If the issue persists, contact support.' });
            });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Controller function for user sign-in
function signIn(req, res) {
    try {
        const { email, password } = req.body;

        // Find the user with the given email
        User.findOne({ "email.address": email })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: `No account found with email: ${email}` });
            }

            if (!user.email.validated) {
                return res.status(400).json({ message: 'Email address has not been validated. Please check your email for verification instructions.' });
            } else {
                // Check if the password is correct
                bcrypt.compare(password, user.password)
                .then((isMatch) => {
                    if (isMatch) {
                        const payload = {
                            id: user.id,
                            role: user.role,
                            userName: user.userName,
                            email: user.email.address,
                        };

                        // Update user's login history and generate JWT token
                        user.loginHistory.push({
                            dateTime: new Date(res.locals.localTime),
                            userAgent: req.get('User-Agent')
                        });

                        user.updateOne({ $set: { loginHistory: user.loginHistory } })
                        .then(() => {
                            jwtSign(payload)
                            .then((token) => {
                                res.status(200).json({ message: 'Sign-in successful', token });
                            })
                            .catch(() => {
                                res.status(500).json({ message: 'Error generating token. Please try again. If the issue persists, contact support.' });
                            });
                        })
                        .catch(() => {
                            res.status(500).json({ message: 'Error updating login history. Please try again. If the issue persists, contact support.' });
                        });
                    } else {
                        res.status(400).json({ message: 'Invalid email or password.' });
                    }
                })
                .catch(() => {
                    res.status(500).json({ message: 'Error comparing passwords. Please try again. If the issue persists, contact support.' });
                });
            }
        })
        .catch(() => {
            res.status(500).json({ message: 'Error finding user. Please try again. If the issue persists, contact support.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Controller function for forgot password
function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        // Check if the email exists in the database
        User.findOne({ "email.address": email })
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: `No account found with email: ${email}` });
            }

            // Generate a unique reset token and set expiration time
            const expirationTime = new Date(res.locals.localTime);
            expirationTime.setMinutes(expirationTime.getMinutes() + 60);

            user.tokens.reset.resetToken = crypto.randomBytes(20).toString('hex');
            user.tokens.reset.resetTokenExpiration = expirationTime;

            user.save()
            .then(() => {
                // Send password reset email
                emailController.sendResetPasswordEmail(email, user.account.firstName, user.tokens.reset.resetToken)
                .then(() => {
                    res.status(200).json({ message: 'Password reset email sent. Please check your email for reset instructions.' });
                })
                .catch(() => {
                    res.status(500).json({ message: 'Reset token generated, but there was an error sending the email. Please contact support for assistance.' });
                });
                
            })
            .catch(() => {
                res.status(500).json({ message: 'Error occurred while saving the reset token. Please try again. If the issue persists, contact support.' });
            });
        })
        .catch(() => {
            res.status(500).json({ message: 'Error occurred while finding the user. Please try again. If the issue persists, contact support.' });
        });

    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Controller function for reset password
function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Find the user by the reset token and check if it's still valid
        User.findOne({ "tokens.reset.resetToken": token })
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: 'Invalid token. Please request a new password reset. If the issue persists, contact support.' });
            }

            // Check if the reset token has expired
            if (user.tokens.reset.resetTokenExpiration < new Date(res.locals.localTime)) {
                return res.status(400).json({ message: 'Expired token. Please request a new password reset.' });
            }

            // Check if the new password is the same as the current password
            bcrypt.compare(password, user.password)
            .then((isMatch) => {
                if (!isMatch) {
                    // Hash the new password
                    bcrypt.hash(password, 10)
                    .then((hash) => {
                        // Update the user's password and clear the reset token fields
                        user.password = hash;
                        user.tokens.reset = undefined;

                        // Save the updated user in the database
                        user.save()
                        .then(() => {
                            res.status(200).json({ message: 'Password reset successfully.' });
                        })
                        .catch(() => {
                            res.status(500).json({ message: 'Error occurred while saving your new password. Please try again. If the issue persists, contact support.' });
                        });
                    })
                    .catch(() => {
                        res.status(500).json({ message: 'Error occurred while hashing the password. Please try again. If the issue persists, contact support.' });
                    });
                } else {
                    res.status(400).json({ message: 'You cannot use your current password as the new password.' });
                }
            })
            .catch(() => {
                res.status(500).json({ message: 'Error occurred while comparing passwords. Please try again. If the issue persists, contact support.' });
            });
        })
        .catch(() => {
            res.status(500).json({ message: 'Invalid token. Please request a new password reset. If the issue persists, contact support.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Controller function for verifying the user's email address
function verifyEmail(req, res) {
    try {
        const { token } = req.params;

        // Find the user by the verification token and check if it's still valid
        User.findOne({ "tokens.verification.verificationToken": token })
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: 'Invalid token. Please contact support.' });
            }

            // Check if the verification token has expired
            if (user.tokens.verification.verificationTokenExpiration < new Date(res.locals.localTime)) {
                return res.status(400).json({ message: 'Expired token. Please register again.' });
            }

            // Update the user's email validation status and clear the verification token fields
            user.email.validated = true;
            user.tokens.verification = undefined;

            // Save the updated user in the database
            user.save()
            .then(() => {
                res.status(200).json({ message: 'Email verified successfully.' });
            })
            .catch(() => {
                res.status(500).json({ message: 'Error occurred while verifying the email. Please try again. If the issue persists, contact support.' });
            });
        })
        .catch(() => {
            res.status(500).json({ message: 'Error occurred while processing the token. Please try again. If the issue persists, contact support.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
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