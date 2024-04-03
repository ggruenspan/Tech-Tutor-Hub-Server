// routes/userAPI.js

const express = require('express');
const passport = require('passport')
const router = express.Router();

// Route for user authentication using JWT
router.get('/authenticate', (req, res, next) => {
    passport.authenticate('jwt', { message: 'Custom message' }, (err, user, info) => {
        if (err) { return res.status(500).json({ message: info.message }); }
        if (!user) { return res.status(401).json({ message: info.message }); }
        return res.status(200).json({ message: info.message});
    })(req, res, next);
});

module.exports = router;
