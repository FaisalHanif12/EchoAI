import React from 'react';

const ChatMessage = ({ message, isUser }) => {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className={isUser ? 'user-message' : 'bot-message'}>
      {message}
      <div className="message-timestamp">{timestamp}</div>
      <div className="message-actions">
        <button className="action-button" title="Copy">
          <i className="fas fa-copy"></i>
        </button>
        {isUser && (
          <button className="action-button" title="Edit">
            <i className="fas fa-edit"></i>
          </button>
        )}
        <button className="action-button" title="React">
          <i className="fas fa-smile"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatMessage;