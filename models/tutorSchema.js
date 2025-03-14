// models/tutorSchema.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tutor = mongoose.model(
    "Tutor",
    new mongoose.Schema({
        _id: { type: String, default: uuidv4 },
        user: { type: String, ref: 'Users' },
        availability: { type: Object, required: true }, // Store availability as an object (e.g., { Monday: { start: "8 AM", end: "8 PM" } })
        subjects: { type: [String], required: true }, // Array of subjects
        hourlyRate: { type: Number, required: true }, // Hourly rate as a number
        teachingMode: { type: String, required: true }, // Online, in-person, hybrid
        languages: { type: [String], required: true }, // Array of languages
        approvalStatus: { 
            type: String, 
            enum: ['pending', 'approved', 'rejected'], 
            default: 'pending' // Default status is pending until an admin approves
        }
    }, {
        versionKey: false
    })
);

module.exports = tutor;