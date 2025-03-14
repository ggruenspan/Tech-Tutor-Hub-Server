// models/imageSchema.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Image = mongoose.model(
    "Images",
    new mongoose.Schema({
        _id: { type: String, default: uuidv4 },
        user: { type: String, ref: 'Users' },
        desc: String,
        img: {
            data: Buffer,
            contentType: String
        }
    }, {
        versionKey: false
    })
);

module.exports = Image;