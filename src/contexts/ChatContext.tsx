import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentSession: ChatSession | undefined;
  createNewSession: () => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  addMessageToSession: (sessionId: string, message: Message) => void;
  sendMessage: (content: string, image?: string) => void;
  updateSessionName: (sessionId: string, newName: string) => void;
  isLoading: boolean;
  error: string | null;
  webSearchEnabled: boolean;
  imageAnalysisEnabled: boolean;
  toggleWebSearch: () => void;
  toggleImageAnalysis: () => void;
}

// Define the structure of a message
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  image?: string;
}

// Define the structure of a chat session
export interface ChatSession {
  id: string;
  name: string;
  timestamp: number;
  messages: Message[];
  lastMessage?: string;
}

// Create the ChatContext
const ChatContext = createContext<ChatContextProps | undefined>(undefined);

// Create a ChatProvider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [imageAnalysisEnabled, setImageAnalysisEnabled] = useState(false);

  // Load sessions from localStorage on component mount
  useEffect(() => {
    const storedSessions = localStorage.getItem('chatSessions');
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  }, [sessions]);

  // Get the current session
  const currentSession = sessions.find(session => session.id === currentSessionId);

  // Function to create a new chat session
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      name: 'New Chat',
      timestamp: Date.now(),
      messages: [],
    };
    setSessions([...sessions, newSession]);
    setCurrentSessionId(newSession.id);
  };

  // Function to switch to a different chat session
  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  // Function to delete a chat session
  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  // Function to add a message to a chat session
  const addMessageToSession = (sessionId: string, message: Message) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        // Update session name based on first user message if it's still the default name
        let updatedName = session.name;
        if (session.name === 'New Chat' && message.role === 'user' && message.content.trim()) {
          // Use first 30 characters of user message as session name
          updatedName = message.content.length > 30 
            ? `${message.content.substring(0, 30)}...` 
            : message.content;
        }
        
        return {
          ...session,
          name: updatedName,
          messages: [...session.messages, message],
          lastMessage: message.role === 'user' ? `You: ${message.content}` : message.content,
        };
      }
      return session;
    }));
  };

  // Function to send a message
  const sendMessage = async (content: string, image?: string) => {
    if (!currentSessionId) {
      console.error('No current session.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message to the session
    const userMessage: Message = {
      id: uuidv4(),
      content: content,
      role: 'user',
      timestamp: Date.now(),
      image: image,
    };
    addMessageToSession(currentSessionId, userMessage);

    try {
      // Simulate an API call to get a response from the AI
      const response = await simulateAICall(content, webSearchEnabled, imageAnalysisEnabled, image);

      // Add AI message to the session
      const aiMessage: Message = {
        id: uuidv4(),
        content: response,
        role: 'assistant',
        timestamp: Date.now(),
      };
      addMessageToSession(currentSessionId, aiMessage);
    } catch (e: any) {
      setError(e.message || 'Failed to send message.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to simulate an API call to the AI
  const simulateAICall = async (content: string, webSearchEnabled: boolean, imageAnalysisEnabled: boolean, image?: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Removed the "AI response to:" prefix
        let aiResponse = `Here's my response to your message about "${content}"`;
        if (webSearchEnabled) {
          aiResponse += ' with web search enabled';
        }
        if (imageAnalysisEnabled && image) {
          aiResponse += ' with image analysis enabled';
        }
        resolve(aiResponse);
      }, 1500);
    });
  };

  // Function to update a session name
  const updateSessionName = (sessionId: string, newName: string) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          name: newName,
        };
      }
      return session;
    }));
  };

  const toggleWebSearch = () => {
    setWebSearchEnabled(prev => !prev);
  };

  const toggleImageAnalysis = () => {
    setImageAnalysisEnabled(prev => !prev);
  };

  const value: ChatContextProps = {
    sessions,
    currentSessionId,
    currentSession,
    createNewSession,
    switchSession,
    deleteSession,
    addMessageToSession,
    sendMessage,
    updateSessionName,
    isLoading,
    error,
    webSearchEnabled,
    imageAnalysisEnabled,
    toggleWebSearch,
    toggleImageAnalysis,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Create a custom hook to use the ChatContext
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
