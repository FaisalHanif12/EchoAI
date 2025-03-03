import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import DarkModeToggle from './components/DarkModeToggle';
import geminiService from './services/geminiService';
import ChatSidebar from './components/ChatSidebar';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Load chat history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);
  
  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  // Generate a title based on the first message
  const generateChatTitle = (message) => {
    // Truncate the message if it's too long
    const maxLength = 30;
    let title = message.trim();
    if (title.length > maxLength) {
      title = title.substring(0, maxLength) + '...';
    }
    return title;
  };
  
  // Start a new chat
  const startNewChat = () => {
    // Save current chat if it has messages
    if (messages.length > 0 && currentChatId) {
      updateChatInHistory(currentChatId, messages);
    }
    
    // Create a new chat ID
    const newChatId = Date.now().toString();
    const timestamp = new Date().toLocaleString();
    
    // Add new chat to history
    setChatHistory([
      { id: newChatId, title: 'New Chat', timestamp, messages: [] },
      ...chatHistory
    ]);
    
    // Set as current chat
    setCurrentChatId(newChatId);
    setMessages([]);
  };
  
  // Update a chat in history
  const updateChatInHistory = (chatId, chatMessages) => {
    setChatHistory(prevHistory => {
      return prevHistory.map(chat => {
        if (chat.id === chatId) {
          // Generate title from first user message if available
          let title = 'New Chat';
          const firstUserMessage = chatMessages.find(msg => msg.isUser);
          if (firstUserMessage) {
            title = generateChatTitle(firstUserMessage.text);
          }
          
          return { ...chat, title, messages: chatMessages };
        }
        return chat;
      });
    });
  };
  
  // Load a chat from history
  const loadChat = (chatId) => {
    // Save current chat first
    if (messages.length > 0 && currentChatId) {
      updateChatInHistory(currentChatId, messages);
    }
    
    // Find selected chat
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setMessages(selectedChat.messages);
      setCurrentChatId(chatId);
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  // Initialize a new chat if none exists
  useEffect(() => {
    if (!currentChatId && chatHistory.length === 0) {
      startNewChat();
    } else if (!currentChatId && chatHistory.length > 0) {
      // Load the most recent chat
      setCurrentChatId(chatHistory[0].id);
      setMessages(chatHistory[0].messages);
    }
  }, [chatHistory, currentChatId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    // Create a new chat if none exists
    if (!currentChatId) {
      startNewChat();
    }
    
    // Add user message
    const newUserMessage = {
      text: inputValue,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputValue('');
    
    // Update chat in history
    updateChatInHistory(currentChatId, updatedMessages);
    
    // Simulate bot typing
    setIsTyping(true);
    
    try {
      // Get response from Gemini API
      const response = await geminiService.generateResponse(inputValue);
      
      // Add bot response
      const botResponse = {
        text: response,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      const messagesWithResponse = [...updatedMessages, botResponse];
      setMessages(messagesWithResponse);
      
      // Update chat in history again with bot response
      updateChatInHistory(currentChatId, messagesWithResponse);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      const errorResponse = {
        text: "Sorry, I couldn't process your request. Please try again later.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      const messagesWithError = [...updatedMessages, errorResponse];
      setMessages(messagesWithError);
      
      // Update chat in history with error
      updateChatInHistory(currentChatId, messagesWithError);
    } finally {
      setIsTyping(false);
    }
  };
  
  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.start();
      } else {
        alert('Speech recognition is not supported in your browser.');
        setIsListening(false);
      }
    }
  };
  
  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <ChatSidebar 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        startNewChat={startNewChat}
        loadChat={loadChat}
        darkMode={darkMode}
      />
      
      <div className={`chat-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="chat-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <h1>EchoAI Chatbot</h1>
          <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>
        
        <div className="messages-container">
          {messages.length === 0 && !isTyping && (
            <div className="welcome-message">
              <h2>What can I help you?</h2>
            </div>
          )}
          
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message.text} 
              isUser={message.isUser} 
            />
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="input-container" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="message-input"
          />
          <button 
            type="button" 
            className={`voice-button ${isListening ? 'active' : ''}`}
            onClick={toggleVoiceInput}
          >
            <i className="fas fa-microphone"></i>
          </button>
          <button type="submit" className="send-button">
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;