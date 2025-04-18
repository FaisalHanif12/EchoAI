import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import DarkModeToggle from './components/DarkModeToggle';
import geminiService from './services/geminiService';
import ChatSidebar from './components/ChatSidebar';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash'); // Default model
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // AI model options
  const aiModels = [
    { id: 'gemini-2.0-flash', name: 'Gemini Flash', description: 'Fast responses' },
    { id: 'gemini-2.0-pro', name: 'Gemini Pro', description: 'More capable' },
  ];
  
  // Command prefixes
  const COMMANDS = {
    SUMMARIZE: '/summarize',
    CLEAR: '/clear',
    EXPORT: '/export',
    HELP: '/help',
  };
  
  // Load chat history and preferences from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      // Check user's system preference
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
    
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);
  
  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);
  
  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  // Save selected model
  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Generate suggested prompts based on conversation context
  const generateSuggestedPrompts = useCallback(async () => {
    // Only generate suggestions if we have at least one exchange
    if (messages.length < 2) return;
    
    try {
      // Get the last few messages for context
      const recentMessages = messages.slice(-4);
      const conversationContext = recentMessages
        .map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.text}`)
        .join('\n');
      
      const prompt = `Based on this conversation context:\n${conversationContext}\n\nGenerate 3 short, specific follow-up questions or prompts the user might want to ask next. Each should be no more than 10 words and relevant to the conversation flow. Return ONLY the 3 questions in a list format.`;
      
      const response = await geminiService.generateResponse(prompt, selectedModel);
      
      // Parse the response to extract the suggested prompts
      const promptList = response
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*|^-\s*/, '').trim())
        .filter(line => line.length > 0 && line.length < 60)
        .slice(0, 3);
      
      setSuggestedPrompts(promptList);
    } catch (error) {
      console.error('Error generating suggested prompts:', error);
      setSuggestedPrompts([]);
    }
  }, [messages, selectedModel]);
  
  // Update a chat in history
  const updateChatInHistory = useCallback((chatId, chatMessages) => {
    setChatHistory(prevHistory => {
      return prevHistory.map(chat => {
        if (chat.id === chatId) {
          // Preserve existing title if it's not "New Chat"
          let title = chat.title;
          if (title === 'New Chat' && chatMessages.length > 0) {
            // Find first user message
            const firstUserMessage = chatMessages.find(msg => msg.isUser);
            if (firstUserMessage) {
              // For now, use simple truncation - we'll replace with generated title async
              title = firstUserMessage.text.substring(0, 30);
              
              // Generate better title asynchronously
              generateChatTitle(firstUserMessage.text)
                .then(generatedTitle => {
                  setChatHistory(prevHistory => {
                    return prevHistory.map(c => {
                      if (c.id === chatId) {
                        return { ...c, title: generatedTitle };
                      }
                      return c;
                    });
                  });
                });
            }
          }
          
          return { ...chat, title, messages: chatMessages };
        }
        return chat;
      });
    });
  }, [generateChatTitle]);
  
  // Start a new chat
  const startNewChat = useCallback(() => {
    // Save current chat if it has messages
    if (messages.length > 0 && currentChatId) {
      updateChatInHistory(currentChatId, messages);
    }
    
    // Create a new chat ID
    const newChatId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Add new chat to history
    setChatHistory([
      { id: newChatId, title: 'New Chat', timestamp, messages: [] },
      ...chatHistory
    ]);
    
    // Set as current chat
    setCurrentChatId(newChatId);
    setMessages([]);
    setSuggestedPrompts([]);
  }, [messages, currentChatId, chatHistory, updateChatInHistory]);
  
  // Trigger suggested prompts generation when messages change
  useEffect(() => {
    if (messages.length > 0) {
      generateSuggestedPrompts();
    }
  }, [messages, generateSuggestedPrompts]);
  
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
      setTimeout(() => generateSuggestedPrompts(), 300);
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  // Delete a chat from history
  const deleteChat = (chatId) => {
    // If we're deleting the current chat, start a new one
    if (chatId === currentChatId) {
      setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
      startNewChat();
    } else {
      setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
    }
  };
  
  // Edit a message
  const editMessage = (messageId, newText) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, text: newText, isEdited: true } : msg
      );
      
      // Update chat in history
      if (currentChatId) {
        updateChatInHistory(currentChatId, updatedMessages);
      }
      
      return updatedMessages;
    });
  };
  
  // Delete a message
  const deleteMessage = (messageId) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.filter(msg => msg.id !== messageId);
      
      // Update chat in history
      if (currentChatId) {
        updateChatInHistory(currentChatId, updatedMessages);
      }
      
      return updatedMessages;
    });
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
  }, [chatHistory, currentChatId, startNewChat]);
  
  // Process commands
  const processCommand = async (command) => {
    const args = command.split(' ');
    const commandType = args[0].toLowerCase();
    
    switch (commandType) {
      case COMMANDS.CLEAR:
        setMessages([]);
        updateChatInHistory(currentChatId, []);
        return true;
        
      case COMMANDS.EXPORT:
        exportChat();
        return true;
        
      case COMMANDS.SUMMARIZE:
        await summarizeConversation();
        return true;
        
      case COMMANDS.HELP:
        showHelpMessage();
        return true;
        
      default:
        return false;
    }
  };
  
  // Show help message
  const showHelpMessage = () => {
    const helpMessage = {
      id: uuidv4(),
      text: `**Available Commands:**
* \`${COMMANDS.CLEAR}\`: Clear the current conversation
* \`${COMMANDS.EXPORT}\`: Export conversation as JSON file
* \`${COMMANDS.SUMMARIZE}\`: Generate a summary of this conversation
* \`${COMMANDS.HELP}\`: Show this help message

**Tips:**
* Use the microphone button for voice input
* Click on messages to see action options
* Change AI model in the settings panel
`,
      isUser: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, helpMessage]);
    updateChatInHistory(currentChatId, [...messages, helpMessage]);
  };
  
  // Export chat as JSON
  const exportChat = () => {
    // Find current chat
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    if (!currentChat) return;
    
    const exportData = {
      title: currentChat.title,
      timestamp: currentChat.timestamp,
      messages: currentChat.messages
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const fileName = `${currentChat.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    saveAs(blob, fileName);
  };
  
  // Summarize conversation
  const summarizeConversation = async () => {
    if (messages.length < 2) {
      const errorMessage = {
        id: uuidv4(),
        text: "There's not enough conversation to summarize yet.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, errorMessage]);
      return;
    }
    
    setIsTyping(true);
    
    try {
      const conversationText = messages
        .map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.text}`)
        .join('\n\n');
      
      const prompt = `Summarize the key points of this conversation in 3-5 bullet points:\n\n${conversationText}`;
      
      const summary = await geminiService.generateResponse(prompt, selectedModel);
      
      const summaryMessage = {
        id: uuidv4(),
        text: `**Conversation Summary:**\n\n${summary}`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages([...messages, summaryMessage]);
      updateChatInHistory(currentChatId, [...messages, summaryMessage]);
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      
      const errorMessage = {
        id: uuidv4(),
        text: "Sorry, I couldn't summarize the conversation. Please try again later.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages([...messages, errorMessage]);
      updateChatInHistory(currentChatId, [...messages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (inputValue.trim() === '') return;
    
    // Check if it's a command
    if (isProcessingCommand) {
      const commandProcessed = await processCommand(inputValue);
      if (commandProcessed) {
        setInputValue('');
        return;
      }
    }
    
    // Create a new chat if none exists
    if (!currentChatId) {
      startNewChat();
    }
    
    // Add user message with unique ID
    const newUserMessage = {
      id: uuidv4(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputValue('');
    
    // Update chat in history
    updateChatInHistory(currentChatId, updatedMessages);
    
    // Simulate bot typing
    setIsTyping(true);
    
    try {
      // Get response from Gemini API with the specified model
      const response = await geminiService.generateResponse(inputValue, selectedModel);
      
      // Add bot response with unique ID
      const botResponse = {
        id: uuidv4(),
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
        id: uuidv4(),
        text: "Sorry, I couldn't process your request. Please try again later.",
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      const messagesWithError = [...updatedMessages, errorResponse];
      setMessages(messagesWithError);
      
      // Update chat in history with error
      updateChatInHistory(currentChatId, messagesWithError);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleSuggestedPrompt = (prompt) => {
    setInputValue(prompt);
  };
  
  const toggleVoiceInput = () => {
    if (isListening) {
      // Stop listening
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
        recognitionRef.current = recognition;
        
        // Configuration
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        // Handle results - continuously update as the user speaks
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          // Combine results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update input with final + interim results
          setInputValue(finalTranscript || interimTranscript);
          setTranscript(finalTranscript || interimTranscript);
        };
        
        // Handle errors
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          recognition.stop();
          recognitionRef.current = null;
        };
        
        // Handle end of speech recognition
        recognition.onend = () => {
          // Only set listening to false if this was triggered by the API
          // and not by our manual stop
          if (recognitionRef.current) {
            setIsListening(false);
            recognitionRef.current = null;
          }
        };
        
        recognition.start();
        setIsListening(true);
      } else {
        alert('Speech recognition is not supported in your browser.');
      }
    }
  };
  
  // Clean up recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
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
    const value = e.target.value;
    setInputValue(value);
    
    // Check if input starts with a command
    const isCommand = Object.values(COMMANDS).some(cmd => value.startsWith(cmd));
    setIsProcessingCommand(isCommand);
  };
  
  // Generate a title based on the first message
  const generateChatTitle = async (message) => {
    try {
      // First try to generate a title using AI
      const prompt = `Generate a very short, concise title (max 5 words) for a conversation that starts with: "${message}"`;
      const title = await geminiService.generateResponse(prompt, selectedModel);
      
      // Clean up the title (remove quotes if present)
      return title.replace(/^["'](.+)["']$/, '$1').substring(0, 30);
    } catch (error) {
      console.error('Error generating title:', error);
      
      // Fallback to simple truncation
      const maxLength = 30;
      let simpleTitle = message.trim();
      if (simpleTitle.length > maxLength) {
        simpleTitle = simpleTitle.substring(0, maxLength) + '...';
      }
      return simpleTitle;
    }
  };
  
  // Handle AI model change
  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
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
        deleteChat={deleteChat}
        darkMode={darkMode}
      />
      
      <div className={`chat-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="chat-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <h1>EchoAI Chatbot</h1>
          <div className="header-actions">
            <div className="model-selector">
              <select 
                value={selectedModel} 
                onChange={(e) => handleModelChange(e.target.value)}
                className="model-select"
              >
                {aiModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </div>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 && !isTyping && (
            <div className="welcome-message">
              <h2>Welcome to EchoAI!</h2>
              <p>How can I assist you today?</p>
              <div className="welcome-tips">
                <div className="tip">
                  <i className="fas fa-microphone"></i>
                  <span>Use voice input</span>
                </div>
                <div className="tip">
                  <i className="fas fa-file-export"></i>
                  <span>Type /export to save chat</span>
                </div>
                <div className="tip">
                  <i className="fas fa-lightbulb"></i>
                  <span>Type /help for more commands</span>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id || index} 
              message={message.text} 
              isUser={message.isUser}
              messageId={message.id}
              timestamp={message.timestamp}
              onEdit={editMessage}
              onDelete={deleteMessage}
              darkMode={darkMode}
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
        
        {suggestedPrompts.length > 0 && messages.length > 0 && (
          <div className="suggested-prompts">
            {suggestedPrompts.map((prompt, index) => (
              <button 
                key={index} 
                className="suggested-prompt-btn"
                onClick={() => handleSuggestedPrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        
        <form className="input-container" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={isListening ? "Listening..." : "Type a message or try /help"}
            className={`message-input ${isListening ? 'listening' : ''} ${isProcessingCommand ? 'command-mode' : ''}`}
          />
          <button 
            type="button" 
            className={`voice-button ${isListening ? 'active' : ''}`}
            onClick={toggleVoiceInput}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
          </button>
          <button type="submit" className="send-button">
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
        
        {isListening && (
          <div className="voice-feedback">
            <div className="voice-waves">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="transcript-preview">{transcript || "Speak now..."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;