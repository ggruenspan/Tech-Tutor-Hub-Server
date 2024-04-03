// models/tutorSchema.js

const mongoose = require("mongoose");

const Tutor = mongoose.model(
    "Tutors",
    new mongoose.Schema({
        profession: String,
    })
);

module.exports = Tutor;