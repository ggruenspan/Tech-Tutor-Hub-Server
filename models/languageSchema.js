// models/languageSchema.js

const mongoose = require('mongoose');

// Define the Language model with a schema that includes a required name field
const language = mongoose.model(
    "Language",
    new mongoose.Schema({
        name: { type: String, required: true }, // Name of the language
    }, {
        versionKey: false // Disable the __v version key
    })
);

module.exports = language;