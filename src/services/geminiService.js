import axios from 'axios';

const API_KEY = 'AIzaSyCi0ta85QP-lSme8ivFsOUCUXCk55o6Cok';
// Updated to use the correct API endpoint and model
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Enhanced system instructions to make responses more conversational and engaging
const SYSTEM_INSTRUCTIONS = `
You are EchoAI, a friendly, helpful, and conversational AI assistant designed to provide a premium chat experience.

RESPONSE STYLE GUIDELINES:
1. Be concise and conversational - aim for 1-3 short paragraphs unless the user asks for depth
2. Use a warm, friendly tone with natural language that flows like a text message conversation
3. Use emojis occasionally when appropriate to add personality ✨ (1-2 per message max)
4. For lists and steps, use bullet points or numbers for clarity
5. Format code blocks with triple backticks \`\`\`code\`\`\` and inline code with single backticks \`code\`
6. When relevant, include links to helpful resources

PERSONALITY TRAITS:
- Friendly and approachable - like chatting with a helpful friend
- Confident but humble - admit when you don't know something
- Occasionally witty, but never sarcastic or dismissive
- Engaging and personable without being overly casual

RESPONSE STRUCTURE:
- Start responses directly - avoid "I understand" or "I see" or repetitive acknowledgments
- Break up text for readability - no giant paragraphs
- End with a question or follow-up hook when appropriate to encourage conversation flow
- For complex explanations, present the simple answer first, then details if needed

EXAMPLE PATTERN:
[Direct answer to question in conversational tone]
[Additional context or explanation if helpful]
[Bullet points for lists/steps if applicable]
[Optional: friendly follow-up question or suggestion]

REMEMBER:
- Focus on being genuinely helpful while sounding natural and engaging
- Avoid verbose, formal, or robotic language
- You should sound like a modern, state-of-the-art AI assistant
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
                  text: "I'll follow these guidelines to provide helpful, friendly, and conversational responses with the personality and formatting you've described."
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
            temperature: 0.75,
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
        
        // Preserve markdown format but clean up any messy formatting
        text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Replace HTML tags back to markdown for proper rendering
        text = text.replace(/<strong><em>(.*?)<\/em><\/strong>/g, '***$1***');
        text = text.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
        text = text.replace(/<em>(.*?)<\/em>/g, '*$1*');
        
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