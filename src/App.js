import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import DarkModeToggle from './components/DarkModeToggle';
import geminiService from './services/geminiService';
import ChatSidebar from './components/ChatSidebar';
import PromptSuggestions from './components/PromptSuggestions';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
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
  
  // Hide suggestions when we have messages
  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
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
  
  const handlePromptSelect = (prompt) => {
    setInputValue(prompt);
    // Focus the input field after selecting a prompt
    document.querySelector('.message-input').focus();
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
    if (isListening) {
      // Stop listening if already active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
    } else {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        // Save reference to the recognition object
        recognitionRef.current = recognition;
        
        recognition.onresult = (event) => {
          // Get the final transcript from the latest results
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          
          // Only update input value if we have a final transcript
          if (finalTranscript !== '') {
            setInputValue((prev) => prev + ' ' + finalTranscript);
          }
        };
        
        recognition.onend = () => {
          // Only set listening to false if the ref is null (meaning we intentionally stopped)
          if (!recognitionRef.current) {
            setIsListening(false);
          } else {
            // If recognition ended unexpectedly, restart it
            try {
              recognition.start();
            } catch (error) {
              console.error('Speech recognition error:', error);
              setIsListening(false);
              recognitionRef.current = null;
            }
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          recognitionRef.current = null;
        };
        
        // Start listening
        try {
          recognition.start();
          setIsListening(true);
        } catch (error) {
          console.error('Speech recognition failed to start:', error);
          alert('Failed to start speech recognition. Please try again.');
          setIsListening(false);
          recognitionRef.current = null;
        }
      } else {
        alert('Speech recognition is not supported in your browser.');
      }
    }
  };
  
  // Cleanup recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);
  
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
              <h2>How can I help you today?</h2>
            </div>
          )}
          
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message.text} 
              isUser={message.isUser} 
              timestamp={message.timestamp}
            />
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <div className="bot-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#7c4dff" className="avatar-circle" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="9" cy="10" r="1.5" fill="white" />
                  <circle cx="15" cy="10" r="1.5" fill="white" />
                </svg>
              </div>
              <div className="typing-bubble">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-section">
          {showSuggestions && (
            <PromptSuggestions onSelectPrompt={handlePromptSelect} />
          )}
          
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
    </div>
  );
}

export default App;