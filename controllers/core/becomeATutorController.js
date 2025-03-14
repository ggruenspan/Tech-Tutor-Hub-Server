// controllers/becomeATutorController.js

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// User & Subject models (Mongoose schema)
const User = require('../../models/userSchema.js');
const Tutor = require('../../models/tutorSchema.js');
const Image = require('../../models/imageSchema.js');
const Subject = require('../../models/subjectSchema.js');
const Language = require('../../models/languageSchema.js');

const emailController = require('../emailController.js');

// Function to check whether the user exists and their approval status
function checkUserByEmail(req, res) {
    try {
        const { email, sessionStatus } = req.body;

        // // Find the user with the given email
        User.findOne({ 'email.address': email })
            .then((user) => {
                if (!user) {
                    return res.status(200).json({
                        message: 'Thank you for considering becoming a tutor! Let’s start by creating your account.'
                    });
                }
                
                // User exists, check if they are already a tutor
                Tutor.findOne({ user: user._id })
                .then((tutor) => {
                    if (tutor) {
                        if (tutor.approvalStatus === 'rejected') {
                            return res.status(403).json({
                                message: 'Your tutor application was rejected. If you believe this was a mistake, you can appeal the decision using the link sent in your rejection email.'
                            });
                        }
                        if (tutor.approvalStatus === 'pending') {
                            return res.status(403).json({
                                message: 'Your tutor application is currently under review. We will notify you once it is approved.'
                            });
                        }
                        return res.status(200).json({
                            message: 'You are already registered as a tutor. Please sign in to access your account.'
                        });
                    }

                    if (sessionStatus == false) {
                        return res.status(403).json({
                            message: 'An account with this email already exists. If this is your account, please sign in to continue.'
                        });
                    }
                    return res.status(200).json({
                        message: 'Thank you for considering becoming a tutor!'
                    });
                })
                .catch(() => {
                    res.status(500).json({
                        message: 'Error occurred while checking tutor approval status. Please try again. If the issue persists, contact support.'
                    });
                });
            })
            .catch(() => {
                res.status(500).json({
                    message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.'
                });
            });
    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error. Please try again. If the issue persists, contact support.'
        });
    }
}

// Function to add subjects
function addSubjects(req, res) {
    try {
        const { subjects } = req.body; // Accept an array of subjects

        if (!Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ message: 'Invalid data format. Expected a non-empty array of subjects.' });
        }

        // Validate that all subjects are non-empty strings
        const formattedSubjects = subjects.map((name) => {
            if (typeof name !== 'string' || !name.trim()) {
                throw new Error('Each subject must be a non-empty string.');
            }
            return { name: name.trim() };
        });

        // Insert the subjects into the database
        Subject.insertMany(formattedSubjects)
            .then((insertedSubjects) => {
                res.status(201).json({
                    message: 'Subjects added successfully.',
                    data: insertedSubjects,
                });
            })
            .catch((error) => {
                console.error("Error adding subjects:", error);
                res.status(500).json({ message: 'Error adding subjects.', error: error.message });
            });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: 'Internal server error. Please try again later.', error: error.message });
    }
}

// Function to get the subjects
function getSubjects(req, res) {
    try {
        // Fetch all subjects from the database
        Subject.find({})
            .then((subjects) => {
                if (!subjects || subjects.length === 0) {
                    return res.status(404).json({ message: 'No subjects available at the moment.' });
                }

                res.status(200).json({ subjects });
            })
            .catch((err) => {
                console.error("Error fetching subjects:", err);
                res.status(500).json({ message: 'An error occurred while fetching subjects. Please try again later.', error: err.message });
            });
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: 'Internal server error. Please try again later.', error: err.message });
    }
}

// Function to add languages
function addLanguages(req, res) {
    try {
        const { languages } = req.body; // Accept an array of languages

        if (!Array.isArray(languages) || languages.length === 0) {
            return res.status(400).json({ message: 'Invalid data format. Expected a non-empty array of languages.' });
        }

        // Validate that all subjects are non-empty strings
        const formattedLanguages = languages.map((name) => {
            if (typeof name !== 'string' || !name.trim()) {
                throw new Error('Each language must be a non-empty string.');
            }
            return { name: name.trim() };
        });

        // Insert the subjects into the database
        Language.insertMany(formattedLanguages)
            .then((insertedLanguages) => {
                res.status(201).json({
                    message: 'Languages added successfully.',
                    data: insertedLanguages,
                });
            })
            .catch((error) => {
                console.error("Error adding languages:", error);
                res.status(500).json({ message: 'Error adding languages.', error: error.message });
            });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: 'Internal server error. Please try again later.', error: error.message });
    }   
}

// Function to get the languages
function getLanguages(req, res) {
    try {
        // Fetch all subjects from the database
        Language.find({})
            .then((languages) => {
                if (!languages || languages.length === 0) {
                    return res.status(404).json({ message: 'No subjects available at the moment.' });
                }

                res.status(200).json({ languages });
            })
            .catch((err) => {
                console.error("Error fetching languages:", err);
                res.status(500).json({ message: 'An error occurred while fetching languages. Please try again later.', error: err.message });
            });
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: 'Internal server error. Please try again later.', error: err.message });
    }
}

// Function to create a new tutor
function createNewTutor(req, res) {
    try {
        const { fullName, email, password, bio, pronouns, availability, subjects, hourlyRate, teachingMode, languages } = req.body;

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
                    },
                    profile: {
                        bio: bio,
                        pronouns: pronouns
                    }
                });

                // Save the new user
                newUser.save()
                .then((savedUser) => {
                    // Save the image to the Images collection with the user's ID
                    const newImage = new Image({
                        user: newUser.id,
                        desc: `Uploaded`,
                        img: {
                            data: req.files.file[0].buffer,
                            contentType: req.files.file[0].mimetype
                        }
                    });

                    newImage.save()
                    .then((savedImage) => {
                        // Parse incoming JSON data
                        const parsedAvailability = JSON.parse(availability);
                        const parsedSubjects = JSON.parse(subjects);
                        const parsedLanguages = JSON.parse(languages);

                        // Create Tutor entry with pending approval status
                        const newTutor = new Tutor({
                            user: newUser._id,  // Associate tutor with user
                            availability: parsedAvailability,
                            subjects: parsedSubjects,
                            hourlyRate,
                            teachingMode,
                            languages: parsedLanguages,
                            approvalStatus: 'pending'  // Default to pending
                        });

                        newTutor.save()
                        .then((newTutor) => {
                            // Update the user's profile with the image ID
                            savedUser.profile.profileImage = savedImage._id;

                            // Associate the tutor with the user's tutor field
                            savedUser.tutor = newTutor._id;

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
                        .catch((tutorErr) => {
                            res.status(500).json({ message: 'Error occurred while creating the tutor. Please try again. If the issue persists, contact support.' });
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
        console.error("Error creating tutor:", err);
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Export the controller functions
module.exports = { 
    checkUserByEmail,
    addSubjects,
    getSubjects,
    addLanguages,
    getLanguages,
    createNewTutor
}