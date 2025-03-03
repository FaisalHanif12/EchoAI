import axios from 'axios';

const API_KEY = 'AIzaSyCi0ta85QP-lSme8ivFsOUCUXCk55o6Cok';
// Updated to use the correct API endpoint and model
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const geminiService = {
  generateResponse: async (message) => {
    try {
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        }
      );
      
      // Extract the text response from Gemini API
      if (response.data && 
          response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts && 
          response.data.candidates[0].content.parts[0]) {
        return response.data.candidates[0].content.parts[0].text;
      }
      
      return "Sorry, I couldn't generate a response.";
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
      
      return "Sorry, there was an error processing your request.";
    }
  }
};

export default geminiService;