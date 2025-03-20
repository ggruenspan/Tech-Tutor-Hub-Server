// models/userSchema.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Define the User model with a schema
const User = mongoose.model(
    "Users",
    new mongoose.Schema({
        _id: { type: String, default: uuidv4 }, // Unique identifier for the user
        role: { type: [String], default: ['User'] }, // Roles assigned to the user
        userName: String, // Username of the user
        password: String, // Password of the user
        email: { 
            address: String, // Email address of the user
            validated: {type: Boolean, default: false} // Email validation status
        },
        account: {
            firstName: String, // First name of the user
            lastName: String, // Last name of the user
            phoneNumber: String, // Phone number of the user
            dateOfBirth: Date, // Date of birth of the user
        },
        profile: {
            profileImage: { type: String, ref: 'Images' }, // Reference to the user's profile image
            bio: String, // Bio of the user
            pronouns: String, // Pronouns of the user
            portfolioLink: String, // Portfolio link of the user
            projectOne: { type: String, ref: 'Projects' }, // Reference to the user's first project
            projectTwo: { type: String, ref: 'Projects' }, // Reference to the user's second project
            socials: {
                linkOne: String, // First social link of the user
                linkTwo: String, // Second social link of the user
            },
            location: {
                country: String, // Country of the user
                stateProvince: String, // State or province of the user
                city: String, // City of the user
                timeZone: String, // Time zone of the user
            },
        },
        tutor: { type: String, ref: "Tutor" }, // Reference to the tutor associated with the user
        loginHistory: [{
            _id: false,
            dateTime: Date, // Date and time of the login
            userAgent: String // User agent of the login
        }],
        tokens: {
            verification: {
                verificationToken: String, // Verification token for the user
                verificationTokenExpiration: Date // Expiration date of the verification token
            },
            reset: {
                resetToken: String, // Reset token for the user
                resetTokenExpiration: Date // Expiration date of the reset token
            }
        },
        created_at: { type: Date, required: true, default: Date.now } // Creation date of the user
    }, {
        versionKey: false // Disable the __v field (version key)
    })
);

module.exports = User;