// models/tutorSchema.js

const mongoose = require('mongoose');

const tutor = mongoose.model(
    "Tutor",
    new mongoose.Schema({
        user: { type: String, ref: 'Users' },
        _id: { type: String, default: uuidv4 },
    }, {
        versionKey: false
    })
);

module.exports = tutor;