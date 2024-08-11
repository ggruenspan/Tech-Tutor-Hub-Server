// models/imageSchema.js

const mongoose = require('mongoose');

const Image = mongoose.model(
    "Images",
    new mongoose.Schema({
        user: { type: String, ref: 'Users' },
        desc:  { type: String, default: 'GenPicture' },
        img: {
            data: Buffer,
            contentType: String
        }
    }, {
        versionKey: false
    })
);

module.exports = Image;