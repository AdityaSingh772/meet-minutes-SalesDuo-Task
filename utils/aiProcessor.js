const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure the GEMINI_API_KEY environment variable is set
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


 //Process meeting text with Gemini AI to extract structured information
 
async function processWithAI(meetingText) {
  try {
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Create a prompt for structured extraction
    const prompt = `
You are an AI assistant specialized in extracting structured information from meeting notes. 

Please analyze the following meeting notes and extract:

1. **Summary**: A concise 2-3 sentence summary of the main topics discussed
2. **Decisions**: A list of key decisions that were made during the meeting
3. **Action Items**: A structured list of tasks with the following format:
   - task: Brief description of what needs to be done
   - owner: Person responsible (if mentioned, otherwise null)
   - due: Deadline or due date (if mentioned, otherwise null)

**IMPORTANT**: Respond ONLY with valid JSON in exactly this format:
{
  "summary": "2-3 sentence summary here",
  "decisions": [
    "Decision 1",
    "Decision 2"
  ],
  "actionItems": [
    {
      "task": "Task description",
      "owner": "Person name or null",
      "due": "Date or null"
    }
  ]
}

**Meeting Notes:**
${meetingText}

**Response (JSON only):**`;

    console.log('Sending request to Gemini API...');
    
    // Generate content with timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      )
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log('Raw AI Response:', text);

    // Clean and parse the JSON response
    let cleanedResponse = text.trim();
    
    // Remove any markdown code block formatting
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove any leading/trailing whitespace
    cleanedResponse = cleanedResponse.trim();
    
    // Find JSON object in the response
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const jsonStr = cleanedResponse.substring(jsonStart, jsonEnd);
    
    try {
      const parsedResult = JSON.parse(jsonStr);
      
      // Validate the structure
      const validatedResult = validateAndSanitizeResponse(parsedResult);
      
      console.log('Successfully processed meeting notes with AI');
      return validatedResult;
      
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      
    }

  } catch (error) {
    console.error('AI Processing Error:', error);
    
    if (error.message.includes('API key')) {
      throw new Error('Invalid or missing Gemini API key');
    }
    
    if (error.message.includes('quota') || error.status === 429) {
      throw new Error('API quota exceeded or rate limit hit');
    }
    
    if (error.message.includes('timeout')) {
      throw new Error('Request timeout - AI service took too long to respond');
    }

    throw new Error('An error occurred while processing the meeting notes with AI: ' + error.message);
  }
}


 //Validate and sanitize the AI response to so that it matches expected structure
 
function validateAndSanitizeResponse(response) {
  const result = {
    summary: '',
    decisions: [],
    actionItems: []
  };

  // Validate summary
  if (typeof response.summary === 'string' && response.summary.trim()) {
    result.summary = response.summary.trim();
  } else {
    result.summary = 'Meeting summary could not be extracted.';
  }

  // Validate decisions
  if (Array.isArray(response.decisions)) {
    result.decisions = response.decisions
      .filter(decision => typeof decision === 'string' && decision.trim())
      .map(decision => decision.trim());
  }

  // Validate action items
  if (Array.isArray(response.actionItems)) {
    result.actionItems = response.actionItems
      .filter(item => item && typeof item === 'object' && item.task)
      .map(item => ({
        task: String(item.task).trim(),
        owner: item.owner && typeof item.owner === 'string' ? item.owner.trim() : null,
        due: item.due && typeof item.due === 'string' ? item.due.trim() : null
      }));
  }

  return result;
}


module.exports = {
  processWithAI
};