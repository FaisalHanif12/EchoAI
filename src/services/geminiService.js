import axios from 'axios';

const API_KEY = 'AIzaSyCi0ta85QP-lSme8ivFsOUCUXCk55o6Cok';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Default safety settings - less restrictive
const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_ONLY_HIGH"
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_ONLY_HIGH"
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_ONLY_HIGH"
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_ONLY_HIGH"
  }
];

// Conversation history for context
let conversationHistory = [];

const geminiService = {
  generateResponse: async (message, modelId = 'gemini-2.0-flash') => {
    try {
      // Add user message to history (keeping last 10 messages max for context)
      conversationHistory.push({
        role: "user",
        parts: [{ text: message }]
      });
      
      // Trim history to last 10 messages to avoid context overflows
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }
      
      // Build the request body based on model
      const requestBody = {
        contents: conversationHistory,
        safetySettings,
        generationConfig: {
          temperature: modelId === 'gemini-2.0-pro' ? 0.7 : 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: modelId === 'gemini-2.0-pro' ? 8192 : 2048,
        }
      };
      
      // Make the API request
      const response = await axios.post(
        `${BASE_URL}/${modelId}:generateContent?key=${API_KEY}`,
        requestBody
      );
      
      // Extract the text response from Gemini API
      if (response.data && 
          response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts && 
          response.data.candidates[0].content.parts[0]) {
        
        const aiResponse = response.data.candidates[0].content.parts[0].text;
        
        // Add AI response to conversation history
        conversationHistory.push({
          role: "model",
          parts: [{ text: aiResponse }]
        });
        
        return aiResponse;
      }
      
      // If no response found in expected structure
      console.error('Unexpected response structure:', response.data);
      throw new Error('Unable to extract response from API');
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Detailed error logging
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error details:', error.response.data);
        
        // Check if we have a specific error message from the API
        if (error.response.data && 
            error.response.data.error && 
            error.response.data.error.message) {
          console.log('API Error Message:', error.response.data.error.message);
          
          // Return user-friendly error message based on the error type
          if (error.response.data.error.message.includes('blocked due to safety settings')) {
            return "I'm sorry, but I can't provide a response to that query due to safety concerns. Could you try rephrasing your question?";
          }
          
          if (error.response.status === 429) {
            return "I've reached my usage limit. Please try again in a moment.";
          }
        }
      }
      
      // Check if it's a network error
      if (error.message === 'Network Error') {
        return "Sorry, I can't connect to my brain right now. Please check your internet connection and try again.";
      }
      
      // Add specific error types as needed
      return "Sorry, there was an error processing your request. Please try again later.";
    }
  },
  
  // Clear conversation history
  clearHistory: () => {
    conversationHistory = [];
  },
  
  // Get current conversation history
  getHistory: () => {
    return [...conversationHistory];
  }
};

export default geminiService;