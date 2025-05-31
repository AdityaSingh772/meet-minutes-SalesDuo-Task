const fs = require('fs');
const { processWithAI } = require('../utils/aiProcessor');

/**
 * Process meeting notes with AI
 */
async function processMeeting(req, res, next) {
  try {
    let meetingText = '';

    // Check if file was uploaded
    if (req.file) {
      meetingText = fs.readFileSync(req.file.path, 'utf8');
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    } else if (req.body && typeof req.body === 'string') {
      // Handle raw text body (Content-Type: text/plain)
      meetingText = req.body;
    } else if (req.body && req.body.text) {
      // Handle JSON body with text field (backward compatibility)
      meetingText = req.body.text;
    } else {
      return res.status(400).json({
        error: 'No meeting text provided. Send either a .txt file or raw text in request body.',
        example: {
          file_upload: 'Send file with key "file"',
          raw_text_body: 'Send raw meeting notes as request body with Content-Type: text/plain'
        }
      });
    }

    // Validate input
    if (!meetingText.trim()) {
      return res.status(400).json({
        error: 'Meeting text cannot be empty'
      });
    }

    // Process with AI
    console.log('Processing meeting text with AI...');
    const result = await processWithAI(meetingText);

    // Return structured response (direct format as per task requirements)
    res.json(result);

  } catch (error) {
    console.error('Error processing meeting:', error);
    next(error);
  }
}

module.exports = {
  processMeeting
};