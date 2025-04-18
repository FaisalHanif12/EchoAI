import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message, isUser, timestamp }) => {
  // Function to detect and format URLs in text
  const formatLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="message-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };
  
  // Function to format markdown-style bold and italic text
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    // Handle bold with ** or __
    let formatted = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
    
    // Handle italic with * or _
    formatted = formatted.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');
    
    // Convert formatted text to JSX
    // Split by HTML tags and rebuild with React elements
    const parts = formatted.split(/(<\/?[^>]+>)/);
    
    return parts.map((part, i) => {
      if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
        const content = part.substring(8, part.length - 9);
        return <strong key={i}>{formatLinks(content)}</strong>;
      } else if (part.startsWith('<em>') && part.endsWith('</em>')) {
        const content = part.substring(4, part.length - 5);
        return <em key={i}>{formatLinks(content)}</em>;
      } else {
        return formatLinks(part);
      }
    });
  };

  // Function to format the message with enhanced markdown-like formatting
  const formatMessage = (text) => {
    if (!text) return '';
    
    // Split text into paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, paragraphIndex) => {
      // Check if paragraph is a code block (```code```)
      if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
        // Check for language specification
        const firstLineBreak = paragraph.indexOf('\n');
        let language = '';
        let code = '';
        
        if (firstLineBreak > 3) {
          language = paragraph.substring(3, firstLineBreak).trim();
          code = paragraph.substring(firstLineBreak + 1, paragraph.length - 3);
        } else {
          code = paragraph.substring(3, paragraph.length - 3);
        }
        
        return (
          <div key={paragraphIndex} className={`code-block ${language ? `language-${language}` : ''}`}>
            {language && <div className="code-language">{language}</div>}
            <pre><code>{code}</code></pre>
          </div>
        );
      }
      
      // Check if paragraph is inline code (`code`)
      if (paragraph.startsWith('`') && paragraph.endsWith('`') && !paragraph.includes('\n')) {
        const code = paragraph.substring(1, paragraph.length - 1);
        return <code key={paragraphIndex} className="inline-code">{code}</code>;
      }
      
      // Check if paragraph is a list
      if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ')) {
        const listItems = paragraph
          .split('\n')
          .filter(item => item.trim().startsWith('- ') || item.trim().startsWith('• '))
          .map((item, itemIndex) => (
            <li key={itemIndex}>{formatMarkdown(item.replace(/^-\s|•\s/, ''))}</li>
          ));
        
        return <ul key={paragraphIndex} className="message-list">{listItems}</ul>;
      }
      
      // Check if paragraph is numbered list
      if (/^\d+\.\s/.test(paragraph.trim())) {
        const listItems = paragraph
          .split('\n')
          .filter(item => /^\d+\.\s/.test(item.trim()))
          .map((item, itemIndex) => (
            <li key={itemIndex}>{formatMarkdown(item.replace(/^\d+\.\s/, ''))}</li>
          ));
        
        return <ol key={paragraphIndex} className="message-list">{listItems}</ol>;
      }
      
      // Regular paragraph
      return <p key={paragraphIndex}>{formatMarkdown(paragraph)}</p>;
    });
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };
  
  // Enhanced bot avatar with subtle animation
  const botAvatar = (
    <div className="bot-avatar">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#7c4dff" className="avatar-circle" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="10" r="1.5" fill="white" />
        <circle cx="15" cy="10" r="1.5" fill="white" />
      </svg>
    </div>
  );
  
  // Enhanced user avatar
  const userAvatar = (
    <div className="user-avatar">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#3a86ff" className="avatar-circle" />
        <circle cx="12" cy="10" r="3" fill="white" />
        <path d="M6 20.1C6 17.8 8.7 16 12 16s6 1.8 6 4.1" fill="white" />
      </svg>
    </div>
  );
  
  // Message display time
  const displayTime = formatTimestamp(timestamp);
  
  return (
    <div className={`message-wrapper ${isUser ? 'user-message' : 'bot-message'}`}>
      {/* Always render both avatars but position them based on isUser */}
      <div className={isUser ? 'hidden' : ''}>
        {botAvatar}
      </div>
      <div className="message-container">
        <div className="message-bubble">
          <div className="message-content">
            {formatMessage(message)}
          </div>
        </div>
        {displayTime && <div className="message-timestamp">{displayTime}</div>}
      </div>
      <div className={!isUser ? 'hidden' : ''}>
        {userAvatar}
      </div>
    </div>
  );
};

export default ChatMessage;