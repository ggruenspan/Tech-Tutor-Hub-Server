// models/subjectSchema.js

const mongoose = require('mongoose');

const subject = mongoose.model(
    "Subject",
    new mongoose.Schema({
        name: { type: String, required: true },
    }, {
        versionKey: false
    })
);

module.exports = subject;