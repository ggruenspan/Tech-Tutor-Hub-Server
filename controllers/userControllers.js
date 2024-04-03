// controllers/userControllers.js

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// User model (Mongoose schema)
const User = require('../models/userSchema.js');

const { jwtSign } = require('../config/jwtConfig.js');

// Controller function for user sign-up
function signUp(req, res) {
    // console.log('signUp', req.body);
    try {
        const { fullName, email, password } = req.body;

        // Check if a user with the given email already exists
        User.findOne({ "email.address" : email })
        .then((user) => {
            if (user) {
                return res.status(400).json({ message: 'There is already a user with that email: ' + email });
            }

            // Hashes the password
            bcrypt.hash(password, 10)
            .then((hash) => {
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

                // Create a new user
                newUser.save()
                .then(() => { 
                    res.status(201).json({ message: 'User signed up successfully' });
                })
                .catch((err) => {
                    console.error(err);
                    return res.status(500).json({ message: 'An error occurred while signing up. Please try again' });
                });
            })
            .catch((hashErr) => {
                console.error(hashErr);
                return res.status(500).json({ message: 'An error occurred while signing up. Please try again' });
            })
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while signing up. Please try again' });
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
};

// Controller function for user sign-in
function signIn(req, res) {
    // console.log('signIn', req.body);
    try {
        const { email, password } = req.body;

        // Find the user with the given email
        User.findOne({ "email.address" : email, })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'Unable to find user with email: ' + email });
            }

            // Check if password is correct
            bcrypt.compare(password, user.password)
            .then((result) => {
                if (result === true) {
                    const payload = {
                        id: user.id,
                        role: user.role,
                        userName: user.userName,
                        password: user.password,
                        email: user.email.address,
                        firstName: user.profile.firstName,
                        lastName: user.profile.lastName,
                        phone: user.profile.phone,
                        dof: user.profile.dof,
                    }

                    // Update user's login history and generate JWT token
                    user.loginHistory.push({dateTime: new Date(), userAgent: req.get('User-Agent')});
                    user.updateOne({ $set: { loginHistory: user.loginHistory}})

                    // console.log(user);
                    .then(() => {
                        jwtSign(payload)
                        .then((token) => {
                            // res.setHeader('Authorization', `bearer ${token}`);
                            res.status(200).json({ message: 'User signed in successfully', token: token});
                        })
                        .catch((err) => {
                            // console.error(err);
                            return res.status(500).json('An error occurred while signing in. Please try again');
                        })
                    })
                    .catch((err) => {
                        // console.error(err);
                        return res.status(500).json({ message: 'An error occurred while signing in. Please try again' });
                    })
                } else {
                    // console.error(err);
                    return res.status(400).json({ message: 'Invalid username or password' });
                }
            })
            .catch((err) => {
                // console.error(err);
                return res.status(500).json({ message: 'An error occurred while signing in. Please try again' });
            })
        })
        .catch((err) => {
            // console.error(err);
            return res.status(500).json({ message: 'An error occurred while signing in. Please try again' });
        })
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
};

// Controller function for forgot password
function forgotPassword(req, res) {
    // console.log('forgot password', req.body);

    try {
        const { email } = req.body;

        // Check if the email is in the database
        User.findOne({  "email.address" : email })
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: 'Unable to find user with email: ' + email });
            }

            // Generate a unique reset token
            const resetToken = crypto.randomBytes(20).toString('hex');
            const expirationTime = new Date();
            // console.log(expirationTime.toLocaleTimeString());
            expirationTime.setMinutes(expirationTime.getMinutes() + 30);
            // console.log(expirationTime.toLocaleTimeString());

            // Store the reset token and expiration in the user's document
            user.resetToken = resetToken;
            user.resetTokenExpiration = expirationTime;

            user.save()
            .then(() => {
                subject = 'Password Reset';
                message = `
                    <p>You are receiving this because you (or someone else) has requested the reset of the password for your account.</p>
                    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                    <p><a href="https://localhost:4200/reset-password/${resetToken}">Reset Password Link</a></p>
                    <p>This link is valid for 30 minutes. If you do not reset your password within this time, you will need to request another reset link.</p>
                    <p>If you did not request this, please ignore this email, and your password will remain unchanged.</p>
                `
                sendEmail(res, email, subject, message, 'Password reset email sent');
            })
            .catch(err => {
                // console.error(err);
                return res.status(500).json({ message: 'An error occurred while saving the reset token' });  
            });
        })
        .catch((err) => {
            // console.error(err);
            return res.status(500).json({ message: 'An error occurred while finding the user' });
        });

    } catch (err) {
        // console.error(error);
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
};

// Controller function for reset password
function resetPassword(req, res) {
    // console.log('forgot password', req.body);

    try {
        const { token } = req.params;
        const { password } = req.body;

        // Find the user by the reset token and check if it's still valid
        User.findOne({ resetToken: token })
        .then((user) => {
            if(user.resetTokenExpiration.toLocaleTimeString() < new Date().toLocaleTimeString()) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            // Check if the new password is the same as the current password
            bcrypt.compare(password, user.password)
            .then((result) => {
                if(result === false) {
                    bcrypt.hash(password, 10)
                    .then((hash) => {
                        // Update the user's password and clear the reset token fields
                        user.password = hash;
                        user.resetToken = undefined;
                        user.resetTokenExpiration = undefined;
    
                        // Save the updated user in the database
                        user.save()
                        .then(() => {
                            res.status(200).json({ message: 'Password reset successfully' });
                        })
                        .catch((error) => {
                            // console.error(err);
                            return res.status(500).json({ message: 'An error occurred while resetting you password in' });
                        }); 
                    })
                } else {
                    return res.status(400).json({ message: 'You cannot use your current password as the new password' });
                }
            })
            .catch((err) => {
                // console.error(err);
                return res.status(500).json({ message: 'An error occurred while resetting you password in' });
            });
        })
        .catch((err) => {
            // console.error(err);
            return res.status(500).json({ message: 'An error occurred while finding the user' });
        });
    } catch (err) {
        // console.error(error);
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

// Function to send a verification email
function sendEmail(res, email, subject, message, resMessage) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: 'Tech Tutor Hub <solodevinnovations@gmail.com>',
        to: email,
        subject: subject,
        html: message,
    };

    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // console.error(error);
            return res.status(500).json({ message: 'An error occurred while sending the email' });
        }
        return res.status(200).json({ message: resMessage });
    });
}

// Export the controller functions
module.exports = {
    signUp,
    signIn,
    forgotPassword,
    resetPassword
}