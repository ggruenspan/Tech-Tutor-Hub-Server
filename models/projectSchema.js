// models/projectSchema.js

const mongoose = require('mongoose');

// Define the Project model with a schema
const project = mongoose.model(
    "Projects",
    new mongoose.Schema({
        user: { type: String, ref: 'Users' }, // Reference to the Users collection
        name: String, // Project name
        desc: String, // Project description
        img: {
            data: Buffer, // Image data
            contentType: String // Image content type
        },
        url: String // Project URL
    }, {
        versionKey: false // Disable the __v version key
    })
);

module.exports = project;