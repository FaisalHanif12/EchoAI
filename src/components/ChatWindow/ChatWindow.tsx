
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import MessageList from '../MessageList/MessageList';
import ChatInput from '../ChatInput/ChatInput';
import PromptSuggestions from '../PromptSuggestions/PromptSuggestions';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  sidebarOpen: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ sidebarOpen }) => {
  const { 
    currentSession, 
    createNewSession,
    isLoading,
    error
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change or when loading completes
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
  };

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateContent}>
        <h2 className={styles.emptyStateTitle}>Welcome to AI Chat</h2>
        <p className={styles.emptyStateDescription}>
          Start a new conversation or select an existing one from the sidebar.
        </p>
        <button 
          className={styles.startButton}
          onClick={createNewSession}
        >
          Start new chat
        </button>
      </div>
    </div>
  );

  return (
    <main className={`${styles.chatWindow} ${sidebarOpen ? styles.withSidebar : styles.fullWidth}`}>
      {!currentSession ? renderEmptyState() : (
        <>
          <div className={styles.messageContainer}>
            <MessageList />
            {isLoading && (
              <div className={styles.typingIndicator}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <span>AI is thinking...</span>
              </div>
            )}
            {error && (
              <div className={styles.errorMessage}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
          
          <div className={styles.inputArea}>
            {currentSession && (
              <>
                <PromptSuggestions onSelectPrompt={handlePromptSelect} />
                <ChatInput 
                  value={inputValue}
                  onChange={setInputValue}
                  uploadedImage={uploadedImage}
                  onClearImage={() => setUploadedImage(null)}
                  onImageUpload={setUploadedImage}
                />
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
};

export default ChatWindow;
