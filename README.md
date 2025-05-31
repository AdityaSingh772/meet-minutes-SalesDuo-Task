# AI-Powered Meeting Minutes Extractor

**Internship Assignment Submission**

A Node.js backend service that accepts meeting notes and uses Google Gemini AI to extract structured information including summaries, key decisions, and action items.

## Features

- Accepts meeting notes via `.txt` file upload or raw text in request body
- Uses Google Gemini AI to extract structured information
- Returns clean JSON with summary, decisions, and action items
- Handles API timeouts, token issues, and missing input errors
- Includes comprehensive error handling and validation

## Setup Instructions

### Prerequisites
- Node.js 18.0.0 or higher
- Google Gemini API key

### Installation
```bash
cd meeting-minutes-extractor
npm install
cp .env.example .env
```

### Get Gemini API Key
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it to your `.env` file:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```

### Start the Server
```bash
npm start
```
Server runs on http://localhost:3000

## API Endpoints

### Health Check
```
GET /health
```

### Process Meeting Notes
```
POST /process-meeting
```
Accepts either:
- File upload with key "file" (.txt files only)
- Raw text in request body with Content-Type: text/plain
- JSON format: `{"text": "meeting notes here"}`

## Testing Instructions

### Using Curl Commands

**Test with raw text:**
```bash
curl -X POST http://localhost:3000/process-meeting \
  -H "Content-Type: text/plain" \
  -d "Team Sync – May 26

- We'll launch the new product on June 10.
- Ravi to prepare onboarding docs by June 5.
- Priya will follow up with logistics team on packaging delay."
```

**Test with file upload:**
```bash
curl -X POST http://localhost:3000/process-meeting \
  -F "file=@samples/meeting1.txt"
```

**Test health endpoint:**
```bash
curl http://localhost:3000/health
```


### Using Postman
1. **Create a new collection** in Postman called "Meeting Minutes API"
2. **Set up environment variable**: set up the base url to be `http://localhost:3000`
3. **Test health endpoint**:
   - Method: GET
   - URL: `http://localhost:3000/health`
4. **Test raw text processing**:
   - Method: POST  
   - URL: `http://localhost:3000/process-meeting`
   - Headers: `Content-Type: text/plain`
   - Body: Select "raw" and paste meeting text
5. **Test file upload**:
   - Method: POST
   - URL: `http://localhost:3000/process-meeting`  
   - Body: Select "form-data", key="file", type="File", select .txt file
6. **Test error handling**:
   - Same as above but with empty body or invalid file



## Test Results Location

All test results and verification files are stored in the `test/` folder:

**Screenshots:**
- `test/meeting1Postman.png` - Postman test with sample meeting 1
- `test/meeting2Postman.png` - Postman test with sample meeting 2
- `test/meeting1Curl.png` - Curl command demonstration
- `test/errorHandling.png` - Error handling validation

**API Response Files:**
- `test/meeting1Result.json` - Actual JSON output for meeting 1
- `test/meeting2Result.json` - Actual JSON output for meeting 2

**Test Documentation:**
- `test/README.md` - Complete test results documentation

## Sample Output

```json
{
  "summary": "The team confirmed the product launch on June 10, assigned onboarding preparation and logistics follow-up, and discussed user feedback on mobile design.",
  "decisions": [
    "Launch set for June 10",
    "Need mobile-first dashboard for beta users"
  ],
  "actionItems": [
    {
      "task": "Prepare onboarding docs",
      "owner": "Ravi",
      "due": "June 5"
    },
    {
      "task": "Follow up with logistics team",
      "owner": "Priya",
      "due": null
    }
  ]
}
```


## Error Handling

The API handles various error scenarios:
- Empty or missing input (400)
- Invalid file types (400) 
- File size limits (400)
- API key issues (401)
- Rate limiting (429)
- Request timeouts (504)
- Server errors (500)

## Sample Files

Two sample meeting files are included in the `samples/` directory:
- `meeting1.txt` - Product launch team meeting
- `meeting2.txt` - Engineering standup meeting

These demonstrate different meeting formats and complexity levels for testing the AI extraction capabilities.

- Aditya