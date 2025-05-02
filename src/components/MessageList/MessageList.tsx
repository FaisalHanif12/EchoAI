
import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import styles from './MessageList.module.css';

const MessageList: React.FC = () => {
  const { currentSession } = useChat();
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  
  // Function to format the timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Speech synthesis for bot messages
  const speak = (text: string, messageId: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      if (speakingMessageId === messageId) {
        setSpeakingMessageId(null);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingMessageId(null);
      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // If there's no current session or no messages, return null
  if (!currentSession || !currentSession.messages || currentSession.messages.length === 0) {
    return null;
  }

  return (
    <div className={styles.messageList} style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
      {currentSession.messages.map((message) => (
        <div
          key={message.id}
          className={`${styles.messageContainer} ${
            message.role === 'user' ? styles.userMessage : styles.botMessage
          }`}
        >
          <div 
            className={`${styles.messageAvatar} ${
              message.role === 'user' ? styles.userAvatar : styles.botAvatar
            }`}
          >
            {message.role === 'user' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2c-4.42 0-8 3.58-8 8 0 4.95 8 12 8 12s8-7.05 8-12c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
              </svg>
            )}
          </div>
          
          <div className={`${styles.messageContent} glass-card`}>
            <div className={styles.messageHeader}>
              <span className={styles.messageSender}>
                {message.role === 'user' ? 'You' : 'EchoAI'}
              </span>
              <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
            </div>
            
            {message.image && (
              <div className={styles.imageContainer}>
                <img 
                  src={message.image} 
                  alt="Uploaded by user"
                  className={styles.uploadedImage}
                />
              </div>
            )}
            
            <div className={styles.messageText}>{message.content}</div>
            
            {message.role !== 'user' && (
              <button
                className={`${styles.speakButton} ${speakingMessageId === message.id ? styles.speaking : ''}`}
                onClick={() => speak(message.content, message.id)}
                title={speakingMessageId === message.id ? "Stop speaking" : "Read aloud"}
              >
                {speakingMessageId === message.id ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
