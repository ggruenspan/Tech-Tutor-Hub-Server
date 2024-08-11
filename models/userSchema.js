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
        profile: {
            completed: {type: Boolean, default: false},
            profileImage: { type: String, ref: 'Images' },
            firstName: String,
            lastName: String,
            phoneNumber: String,
            dateOfBirth: Date,
            address: {
                country: String,
                stateProvince: String,
                city: String,
            }, 
            bio: String,
            pronouns: String,
        },
        loginHistory: [{
            _id: false,
            dateTime: Date,
            userAgent: String
        }],
        resetToken: String,
        resetTokenExpiration: Date,
        
    }, {
        versionKey: false
    })
);

module.exports = User;