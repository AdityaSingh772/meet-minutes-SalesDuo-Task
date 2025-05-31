const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb', type: 'text/plain' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Meeting Minutes Extractor'
  });
});


// 404 handler
app.use('*', notFoundHandler);


// Start server
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
  console.log(`Process meetings: POST http://localhost:${PORT}/process-meeting`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY not found in environment variables');
  }
});

module.exports = app;