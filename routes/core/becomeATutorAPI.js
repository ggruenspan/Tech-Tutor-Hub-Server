// routes/settingsAPI.js

const express = require('express');
// const authenticateToken = require('../../middleware/authenticateToken.js');
const becomeATutorController = require('../../controllers/core/becomeATutorController.js');
const upload = require('../../config/multerConfig.js');
const uploadController = require('../../config/googleDriveConfig.js');
const router = express.Router();

// Route for checking if user exists by email before becoming a tutor
router.post('/check-user-by-email', (req, res) => {
    becomeATutorController.checkUserByEmail(req, res);
});

// Route for adding multiple subjects to the database 
router.post('/add-subjects', (req, res) => {
    becomeATutorController.addSubjects(req, res);
});

// Route for adding subject that isnt already in the database
router.post('/add-subject', (req, res) => {
    becomeATutorController.addSubject(req, res);
});

// Route for getting the subjects
router.get('/get-subjects', (req, res) => {
    becomeATutorController.getSubjects(req, res);
});

// Route for adding languages to the database
router.post('/add-languages', (req, res) => {
    becomeATutorController.addLanguages(req, res); 
});

// Route for adding language that isnt already in the database
router.post('/add-language', (req, res) => {
    becomeATutorController.addLanguage(req, res);
});

// Route for getting the languages
router.get('/get-languages', (req, res) => {
    becomeATutorController.getLanguages(req, res);
});

// Route for uploading the users verification video
router.post('/upload-verification-video', upload.fields([{ name: 'video', maxCount: 1 },{ name: 'file', maxCount: 1 }]), (req, res) => {
    uploadController.uploadToGoogleDrive(req, res);
});

// Route for creating a new tutor
router.post('/create-new-tutor', upload.fields([{ name: 'file', maxCount: 1 },{ name: 'video', maxCount: 1 }]), (req, res) => {
    becomeATutorController.createNewTutor(req, res);
});

// Route for updating a tutor's testimonial
router.get('/get-testimonials', (req, res) => {
    becomeATutorController.getTestimonials(req, res);
});

module.exports = router;
