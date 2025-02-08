// models/languageSchema.js

const mongoose = require('mongoose');

const language = mongoose.model(
    "Language",
    new mongoose.Schema({
        name: { type: String, required: true },
    }, {
        versionKey: false
    })
);

module.exports = language;