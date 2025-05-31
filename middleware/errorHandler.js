const multer = require('multer');

// Global error handler for the application
function globalErrorHandler(error, req, res, next) {
  console.error('Error:', error);

  // Handle Multer errors (file upload)
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  // Handle custom file validation errors
  if (error.message === 'Only .txt files are allowed') {
    return res.status(400).json({
      error: 'Invalid file type. Only .txt files are allowed.'
    });
  }
  
  // Handle AI/API related errors
  if (error.message.includes('API key')) {
    return res.status(401).json({
      error: 'Invalid or missing API key. Please check your Gemini API configuration.'
    });
  }
  
  if (error.message.includes('quota') || error.message.includes('rate limit')) {
    return res.status(429).json({
      error: 'API rate limit exceeded. Please try again later.'
    });
  }
  
  if (error.message.includes('timeout')) {
    return res.status(504).json({
      error: 'Request timeout. The AI service took too long to respond.'
    });
  }
  
  // Default server error
  res.status(500).json({
    error: 'Internal server error occurred while processing the meeting.',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}


 //404 handler for unknown routes
 
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: {
      'GET /health': 'Health check',
      'POST /process-meeting': 'Process meeting notes (file upload or raw text)'
    }
  });
}

module.exports = {
  globalErrorHandler,
  notFoundHandler
};