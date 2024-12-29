// routes/settingsAPI.js

const express = require('express');
const authenticateToken = require('../../middleware/authenticateToken.js');
const becomeATutorController = require('../../controllers/core/becomeATutorController.js');
const router = express.Router();


router.post('/check-user-by-email', (req, res) => {
    becomeATutorController.checkUserByEmail(req, res);
});

module.exports = router;
