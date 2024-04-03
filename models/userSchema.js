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
            firstName: String,
            lastName: String,
            avatar: String,
            bio: String,
            phone: String,
            dof: String,
            address: {
                street1: String,
                city: String,
                state: String,
                country: String,
                areaCode: String,
            }
        },
        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tutor"
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