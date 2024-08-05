// config/multerConfig.js

var multer = require('multer');

var storage = multer.memoryStorage();

// Set multer storage engine to the newly created object
module.exports = multer({ storage });