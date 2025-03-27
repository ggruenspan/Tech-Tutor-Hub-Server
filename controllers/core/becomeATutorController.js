// controllers/becomeATutorController.js

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Models (Mongoose schema)
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
        const { fullName, email, password, bio, pronouns } = req.body;

        // Check if a user with the given email already exists
        User.findOne({ "email.address": email })
        .then((user) => {
            if (user) {
                // User exists, update bio and pronouns, then create a new tutor for the existing user
                user.profile.bio = bio;
                user.profile.pronouns = pronouns;
                createTutorForUser(user, false);
            } else {
                // User does not exist, create a new user and then create a new tutor
                bcrypt.hash(password, 10)
                .then((hash) => {
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

                    newUser.save()
                    .then((savedUser) => {
                        createTutorForUser(savedUser, true);
                    })
                    .catch((err) => {
                        res.status(500).json({ message: 'Error occurred while creating the account. Please try again. If the issue persists, contact support.' });
                    });
                })
                .catch((hashErr) => {
                    res.status(500).json({ message: 'Error occurred while hashing the password. Please try again. If the issue persists, contact support.' });
                });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        });

        function createTutorForUser(user, sendVerificationEmail) {
            // Always delete the old image
            Image.findByIdAndDelete(user.profile.profileImage)
            .then(() => {
                // Save the new image to the Images collection with the user's ID
                const newImage = new Image({
                    user: user.id,
                    desc: `Uploaded`,
                    img: {
                        data: req.files.file[0].buffer,
                        contentType: req.files.file[0].mimetype
                    }
                });

                newImage.save()
                .then((savedImage) => {
                    user.profile.profileImage = savedImage._id;
                    saveTutor(user, sendVerificationEmail);
                })
                .catch((imageErr) => {
                    res.status(500).json({ message: 'Error occurred while saving the profile image. Please try again. If the issue persists, contact support.' });
                });
            })
            .catch((deleteErr) => {
                res.status(500).json({ message: 'Error occurred while deleting the old profile image. Please try again. If the issue persists, contact support.' });
            });
        }
        
        function saveTutor(user, sendVerificationEmail) {
            // Create Tutor entry with pending approval status
            const newTutor = new Tutor({
                user: user._id,  // Associate tutor with user
                approvalStatus: 'pending'  // Default to pending
            });
        
            newTutor.save()
            .then((newTutor) => {
                // Associate the tutor with the user's tutor field
                user.tutor = newTutor._id;
        
                if (sendVerificationEmail) {
                    // Generate a unique verification token and set expiration time
                    const expirationTime = new Date(res.locals.localTime);
                    expirationTime.setMinutes(expirationTime.getMinutes() + 60);
        
                    user.tokens.verification.verificationToken = crypto.randomBytes(20).toString('hex');
                    user.tokens.verification.verificationTokenExpiration = expirationTime;
                }
        
                user.save()
                .then(() => {
                    if (sendVerificationEmail) {
                        // Send verification email
                        emailController.sendVerificationEmail(email, user.account.firstName, user.tokens.verification.verificationToken)
                        .then(() => {
                            res.status(202).json({ message: 'Account created! Please check your email for verification instructions.' });
                        })
                        .catch((emailErr) => {
                            res.status(500).json({ message: 'Account created, but there was an error sending the verification email. Please contact support for assistance.' });
                        });
                    } else {
                        res.status(201).json({ message: 'Tutor profile created successfully.' });
                    }
                })
                .catch((err) => {
                    res.status(500).json({ message: 'Error occurred while saving the user. Please try again. If the issue persists, contact support.' });
                });
            })
            .catch((tutorErr) => {
                res.status(500).json({ message: 'Error occurred while creating the tutor. Please try again. If the issue persists, contact support.' });
            });
        }
    } catch (err) {
        console.error("Error creating tutor:", err);
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Function to get a tutors testimonial
function getTestimonials(req, res) {
    try {
        // Find all tutors that have a testimonial
        Tutor.find({ testimonial: { $exists: true, $ne: null } })
            .then((tutors) => {
                if (!tutors || tutors.length === 0) {
                    return res.status(404).json({ message: 'No testimonials available at the moment.' });
                }

                // Fetch user details for each tutor
                const userPromises = tutors.map(tutor => 
                    User.findById(tutor.user).select('profile.profileImage account.firstName account.lastName')
                );

                Promise.all(userPromises)
                    .then(users => {
                        // Fetch profile images for each user
                        const imagePromises = users.map(user => 
                            Image.findById(user.profile.profileImage).select('img.data img.contentType')
                        );

                        Promise.all(imagePromises)
                            .then(images => {
                                // Extract testimonials and user details
                                const testimonials = tutors.map((tutor, index) => ({
                                    tutorId: tutor._id,
                                    testimonial: tutor.testimonial,
                                    tutorName: `${users[index].account.firstName} ${users[index].account.lastName}`,
                                    profileImage: images[index] ? {
                                        data: images[index].img.data.toString('base64'), // Encode image data to Base64
                                        contentType: images[index].img.contentType
                                    } : null
                                }));

                                res.status(200).json({ testimonials });
                            })
                            .catch((err) => {
                                res.status(500).json({ message: 'An error occurred while fetching profile images. Please try again later.' });
                            });
                    })
                    .catch((err) => {
                        res.status(500).json({ message: 'An error occurred while fetching user details. Please try again later.' });
                    });
            })
            .catch((err) => {
                res.status(500).json({ message: 'An error occurred while fetching testimonials. Please try again later.' });
            });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}

// Export the controller functions
module.exports = { 
    checkUserByEmail,
    addSubjects,
    getSubjects,
    addLanguages,
    getLanguages,
    createNewTutor,
    getTestimonials
}