// models/subjectSchema.js

const mongoose = require('mongoose');

// Define the Subject model with a schema that includes a required name field
const subject = mongoose.model(
    "Subject",
    new mongoose.Schema({
        name: { type: String, required: true }, // Name of the language
    }, {
        versionKey: false // Disable the __v version key
    })
);

module.exports = subject;