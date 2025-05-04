
import React, { useState, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  uploadedImage: string | null;
  onClearImage: () => void;
  onImageUpload: (imageUrl: string) => void;
  webSearchEnabled: boolean;
  imageAnalysisEnabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  uploadedImage, 
  onClearImage,
  onImageUpload,
  webSearchEnabled,
  imageAnalysisEnabled
}) => {
  const { sendMessage, isLoading } = useChat();
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const handleSendMessage = () => {
    if (!value.trim() && !uploadedImage) return;
    
    sendMessage(value.trim(), uploadedImage || undefined);
    onChange('');
    onClearImage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          onImageUpload(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload an image file');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleVoiceRecognition = () => {
    if (isRecording) {
      // Stop recording if already active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true; // Keep recording until manually stopped
    
    setIsRecording(true);
    recognitionRef.current = recognition;
    
    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript;
      onChange(value + ' ' + transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      recognitionRef.current = null;
    };
    
    recognition.onend = () => {
      // Only set recording to false if we're not in continuous mode
      // or if there was an error
      if (!recognition.continuous) {
        setIsRecording(false);
        recognitionRef.current = null;
      } else if (isRecording) {
        // If still supposed to be recording but ended, restart
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition', e);
          setIsRecording(false);
          recognitionRef.current = null;
        }
      }
    };
    
    recognition.start();
  };

  return (
    <div className={styles.inputWrapper}>
      {uploadedImage && (
        <div className={styles.imagePreview}>
          <img 
            src={uploadedImage} 
            alt="Upload preview" 
            className={styles.previewImage} 
          />
          <button 
            className={styles.removeImage} 
            onClick={onClearImage}
            aria-label="Remove image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
      
      <div className={styles.inputContainer}>
        <textarea
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={isLoading}
        />
        
        <div className={styles.inputActions}>
          <div className={styles.leftActions}>
            {/* We don't need the checkbox here as it's controlled from outside */}
            <span className={webSearchEnabled ? styles.toggleActive : ''}>
              {webSearchEnabled && "Web search enabled"}
            </span>
            <span className={imageAnalysisEnabled ? styles.toggleActive : ''}>
              {imageAnalysisEnabled && "Image analysis enabled"}
            </span>
          </div>
          
          <div className={styles.rightActions}>
            <button 
              className={styles.actionButton}
              onClick={triggerFileInput}
              disabled={isLoading}
              aria-label="Upload image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5-5 5 5m-5-5v12" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className={styles.fileInput} 
                onChange={handleFileUpload}
              />
            </button>
            
            <button 
              className={`${styles.actionButton} ${isRecording ? styles.recording : ''}`}
              onClick={toggleVoiceRecognition}
              disabled={isLoading}
              aria-label={isRecording ? "Stop recording" : "Start voice input"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            
            <button 
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={(!value.trim() && !uploadedImage) || isLoading}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
