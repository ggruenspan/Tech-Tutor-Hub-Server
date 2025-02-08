// controllers/becomeATutorController.js

// User & Subject models (Mongoose schema)
const User = require('../../models/userSchema.js');
const Subject = require('../../models/subjectSchema.js');
const Language = require('../../models/languageSchema.js');

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

// Export the controller functions
module.exports = { 
    checkUserByEmail,
    addSubjects,
    getSubjects,
    addLanguages,
    getLanguages
}