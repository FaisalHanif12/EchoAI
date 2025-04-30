
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useIsMobile } from '../../hooks/use-mobile';
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
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [imageAnalysisEnabled, setImageAnalysisEnabled] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Scroll to bottom when messages change or when loading completes
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  // Scroll to bottom when component mounts
  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
  };

  const toggleWebSearch = () => {
    setWebSearchEnabled(prev => !prev);
  };

  const toggleImageAnalysis = () => {
    setImageAnalysisEnabled(prev => !prev);
  };

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={`${styles.emptyStateContent} glass-card`}>
        <div className={styles.logoContainer}>
          <svg className={styles.logo} width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className={styles.emptyStateTitle}>Welcome to EchoAI</h2>
        <p className={styles.emptyStateDescription}>
          Start a new conversation or select an existing one from the sidebar.
        </p>
        <button 
          className={`${styles.startButton} pill-button hover-transition`}
          onClick={createNewSession}
        >
          Start new chat
        </button>
      </div>
    </div>
  );

  return (
    <main className={`${styles.chatWindow} ${sidebarOpen && !isMobile ? styles.withSidebar : styles.fullWidth}`}>
      {!currentSession ? renderEmptyState() : (
        <>
          <div className={styles.messageContainer}>
            <MessageList />
            {isLoading && (
              <div className={`${styles.typingIndicator} glass-card`}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <span>AI is thinking...</span>
              </div>
            )}
            {error && (
              <div className={`${styles.errorMessage} glass-card`}>
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
                <div className={styles.promptSuggestionsContainer}>
                  <PromptSuggestions onSelectPrompt={handlePromptSelect} />
                </div>
                <div className={styles.togglesContainer}>
                  <div className={styles.toggleWrapper}>
                    <span>Web Search</span>
                    <button 
                      className={`${styles.toggleButton} ${webSearchEnabled ? styles.toggleActive : ''}`}
                      onClick={toggleWebSearch}
                      aria-label={webSearchEnabled ? "Disable web search" : "Enable web search"}
                      aria-pressed={webSearchEnabled}
                    >
                      <span className={styles.toggleSlider}></span>
                    </button>
                  </div>
                  <div className={styles.toggleWrapper}>
                    <span>Image Analysis</span>
                    <button 
                      className={`${styles.toggleButton} ${imageAnalysisEnabled ? styles.toggleActive : ''}`}
                      onClick={toggleImageAnalysis}
                      aria-label={imageAnalysisEnabled ? "Disable image analysis" : "Enable image analysis"}
                      aria-pressed={imageAnalysisEnabled}
                    >
                      <span className={styles.toggleSlider}></span>
                    </button>
                  </div>
                </div>
                <ChatInput 
                  value={inputValue}
                  onChange={setInputValue}
                  uploadedImage={uploadedImage}
                  onClearImage={() => setUploadedImage(null)}
                  onImageUpload={setUploadedImage}
                  webSearchEnabled={webSearchEnabled}
                  imageAnalysisEnabled={imageAnalysisEnabled}
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
