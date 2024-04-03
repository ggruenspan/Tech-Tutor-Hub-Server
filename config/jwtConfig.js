// config/jwtConfig.js

const jwt = require('jsonwebtoken');

// Function to sign a JWT token with a given payload
exports.jwtSign = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, 'tech-tutor-hub', { expiresIn: '2h' }, (err, token) => {
            if(err) { reject(err); } 
            else { resolve(token); }
        });
    })
}