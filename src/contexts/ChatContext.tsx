
import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  imageUrl?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  timestamp: number;
  lastMessage?: string;
}

interface ChatContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  createNewSession: () => void;
  switchSession: (sessionId: string) => void;
  sendMessage: (content: string, imageUrl?: string) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  clearError: () => void;
  currentSession: ChatSession | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    return savedSessions ? JSON.parse(savedSessions) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem('currentSessionId');
    return saved || (sessions.length > 0 ? sessions[0].id : null);
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save current session ID to localStorage
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('currentSessionId', currentSessionId);
    }
  }, [currentSessionId]);

  const currentSession = currentSessionId 
    ? sessions.find(session => session.id === currentSessionId) || null
    : null;

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat ${sessions.length + 1}`,
      messages: [],
      timestamp: Date.now()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const sendMessage = async (content: string, imageUrl?: string) => {
    if (!content && !imageUrl) return;
    if (!currentSessionId) {
      createNewSession();
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
      imageUrl
    };
    
    // Add user message to current session
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, userMessage],
          lastMessage: content,
          timestamp: Date.now()
        };
      }
      return session;
    }));
    
    // Call GPT API
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we'd make an API call here to OpenAI
      // For this demo, we'll simulate a delay and response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const botMessage: Message = {
        id: Date.now().toString(),
        content: `This is a simulated response to: "${content}".\n\nIn a real implementation, this would connect to the OpenAI GPT-4o API endpoint.`,
        role: 'assistant',
        timestamp: Date.now()
      };
      
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, botMessage],
            timestamp: Date.now()
          };
        }
        return session;
      }));
    } catch (err) {
      setError('Failed to get response from AI. Please try again.');
      console.error('Error fetching AI response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  };

  const updateSessionName = (sessionId: string, name: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return { ...session, name };
      }
      return session;
    }));
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSessionId,
        isLoading,
        error,
        createNewSession,
        switchSession,
        sendMessage,
        deleteSession,
        updateSessionName,
        clearError,
        currentSession
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
