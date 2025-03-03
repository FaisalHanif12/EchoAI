import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`message-wrapper ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-bubble">
        {message}
      </div>
    </div>
  );
};

export default ChatMessage;