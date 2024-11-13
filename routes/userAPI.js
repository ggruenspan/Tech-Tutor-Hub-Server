// routes/settingsAPI.js

const express = require('express');
const authenticateToken = require('../middleware/authenticateToken.js');
// const upload = require('../config/multerConfig.js');
const userControllers = require('../controllers/userControllers.js');
const router = express.Router();


router.get('/:userName', authenticateToken, (req, res) => {
    userControllers.getUserProfile(req, res);
});

module.exports = router;
