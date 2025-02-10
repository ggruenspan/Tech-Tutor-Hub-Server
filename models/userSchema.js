// models/userSchema.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const User = mongoose.model(
    "Users",
    new mongoose.Schema({
        _id: { type: String, default: uuidv4 },
        role: { type: [String], default: ['User'] },
        userName: String,
        password: String,
        email: { 
            address: String,
            validated: {type: Boolean, default: false}
        },
        account: {
            firstName: String,
            lastName: String,
            phoneNumber: String,
            dateOfBirth: Date,
        },
        profile: {
            profileImage: { type: String, ref: 'Images' },
            bio: String,
            pronouns: String,
            portfolioLink: String,
            projectOne: { type: String, ref: 'Projects' },
            projectTwo: { type: String, ref: 'Projects' },
            socials: {
                linkOne: String,
                linkTwo: String,
            },
            location: {
                country: String,
                stateProvince: String,
                city: String,
                timeZone: String,
            },
        },
        loginHistory: [{
            _id: false,
            dateTime: Date,
            userAgent: String
        }],
        tokens: {
            verification: {
                verificationToken: String,
                verificationTokenExpiration: Date
            },
            reset: {
                resetToken: String,
                resetTokenExpiration: Date
            }
        },
        created_at: { type: Date, required: true, default: Date.now }
    }, {
        versionKey: false
    })
);

module.exports = User;