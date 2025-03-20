// models/imageSchema.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Define the Image model with a schema
const Image = mongoose.model(
    "Images",
    new mongoose.Schema({
        _id: { type: String, default: uuidv4 }, // Unique identifier for the image
        user: { type: String, ref: 'Users' }, // Reference to the user who uploaded the image
        desc: String, // Description of the image
        img: {
            data: Buffer, // Image data stored as a buffer
            contentType: String // Type of the image (e.g., 'image/jpeg')
        }
    }, {
        versionKey: false // Disable the __v field (version key)
    })
);

module.exports = Image;