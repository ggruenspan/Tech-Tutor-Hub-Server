// models/projectSchema.js

const mongoose = require('mongoose');

const project = mongoose.model(
    "Projects",
    new mongoose.Schema({
        user: { type: String, ref: 'Users' },
        name: String,
        desc: String,
        img: {
            data: Buffer,
            contentType: String
        },
        url: String
    }, {
        versionKey: false
    })
);

module.exports = project;