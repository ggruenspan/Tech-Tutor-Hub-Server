// config/passportConfig.js

const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// User model (Mongoose schema)
const User = require('../models/userSchema.js');

// Configure Passport to use JWT authentication strategy
passport.use( new JwtStrategy({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET_OR_KEY, passReqToCallback: true}, (req, jwtPayload, done) => {
User.findOne({ _id: jwtPayload.id })
    .then((user) => {
        if(user) { return done(null, user, { message: 'Authentication successful' }); }
        else { return done(null, { message: 'Authentication failed' }); }
    })
    .catch((err) => { return done(err); });
}));