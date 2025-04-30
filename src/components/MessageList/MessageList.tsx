
import React, { useState } from 'react';
import { useChat, Message } from '../../contexts/ChatContext';
import styles from './MessageList.module.css';

const MessageList: React.FC = () => {
  const { currentSession } = useChat();
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  
  if (!currentSession) {
    return null;
  }

  // Format timestamp to display hour and minute
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Text-to-speech function for bot messages
  const speakMessage = (message: Message) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      if (speakingMessageId === message.id) {
        setSpeakingMessageId(null);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      
      setSpeakingMessageId(message.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={styles.messageList}>
      {currentSession.messages.map((message) => (
        <div 
          key={message.id} 
          className={`${styles.messageContainer} ${
            message.role === 'user' ? styles.userMessage : styles.botMessage
          }`}
        >
          <div className={styles.messageAvatar}>
            {message.role === 'user' ? (
              <div className={styles.userAvatar}>U</div>
            ) : (
              <div className={styles.botAvatar}>AI</div>
            )}
          </div>
          
          <div className={styles.messageContent}>
            <div className={styles.messageHeader}>
              <span className={styles.messageSender}>
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </span>
              <span className={styles.messageTime}>
                {formatTime(message.timestamp)}
              </span>
            </div>
            
            {message.imageUrl && (
              <div className={styles.imageContainer}>
                <img 
                  src={message.imageUrl} 
                  alt="Uploaded by user" 
                  className={styles.uploadedImage}
                />
              </div>
            )}
            
            <div className={styles.messageText}>
              {message.content}
            </div>
            
            {message.role === 'assistant' && (
              <button 
                className={`${styles.speakButton} ${speakingMessageId === message.id ? styles.speaking : ''}`}
                onClick={() => speakMessage(message)}
                aria-label={speakingMessageId === message.id ? "Stop speaking" : "Speak this message"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  {speakingMessageId === message.id ? (
                    <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
