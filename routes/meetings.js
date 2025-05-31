const express = require('express');
const meetingController = require('../controllers/meetingController');
const upload = require('../middleware/upload');

const router = express.Router();

// Main endpoint for processing meeting notes
router.post('/process-meeting', upload.single('file'), meetingController.processMeeting);

module.exports = router;