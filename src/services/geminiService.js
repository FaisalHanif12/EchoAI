import axios from 'axios';

const API_KEY = 'AIzaSyCi0ta85QP-lSme8ivFsOUCUXCk55o6Cok';
// Updated to use the correct API endpoint and model
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// System instructions to make responses more conversational and engaging
const SYSTEM_INSTRUCTIONS = `
You are EchoAI, a friendly, helpful, and conversational AI assistant.
Follow these guidelines for all your responses:
1. Keep responses concise and to the point (1-3 paragraphs max unless the user asks for more detail)
2. Be friendly, warm, and engaging - use a conversational tone
3. Use emojis occasionally where appropriate to add personality (but don't overuse them)
4. Break up long responses with line breaks for readability
5. Avoid overly formal language, technical jargon, or verbose explanations unless specifically asked
6. When listing options or steps, use bullet points for clarity
7. If you're not sure about something, be honest but helpful
8. Don't use phrases like "I understand" or "I see" repeatedly
9. Always focus on being helpful and providing value to the user

Your personality traits:
- Friendly and approachable
- Efficient and clear
- Helpful without being condescending
- Just the right amount of casual to feel natural
`;

const geminiService = {
  generateResponse: async (message) => {
    try {
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: SYSTEM_INSTRUCTIONS
                }
              ]
            },
            {
              role: "model",
              parts: [
                {
                  text: "I'll follow these guidelines to provide helpful, friendly, and conversational responses."
                }
              ]
            },
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          }
        }
      );
      
      // Extract the text response from Gemini API
      if (response.data && 
          response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts && 
          response.data.candidates[0].content.parts[0]) {
        
        let text = response.data.candidates[0].content.parts[0].text;
        
        // Additional formatting/processing if needed
        text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown bold if present
        
        return text;
      }
      
      return "I couldn't generate a response right now. How can I help with something else?";
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      console.log('Error details:', error.response ? error.response.data : 'No response data');
      
      // Check if we have a specific error message from the API
      if (error.response && 
          error.response.data && 
          error.response.data.error && 
          error.response.data.error.message) {
        console.log('API Error Message:', error.response.data.error.message);
      }
      
      return "Sorry, I ran into a technical issue. Let's try again with a different question!";
    }
  }
};

export default geminiService;