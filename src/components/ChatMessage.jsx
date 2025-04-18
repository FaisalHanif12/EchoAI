import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatMessage.css';

const ChatMessage = ({ message, isUser, onEdit, onDelete, darkMode, messageId, timestamp }) => {
  const [showActions, setShowActions] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [showReactions, setShowReactions] = useState(false);
  
  const formattedTimestamp = timestamp ? new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Reactions list
  const reactions = ["👍", "❤️", "😂", "😮", "🙏", "👀"];
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(message).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleEditChange = (e) => {
    setEditedMessage(e.target.value);
  };
  
  const handleEditSubmit = () => {
    if (editedMessage.trim() && onEdit) {
      onEdit(messageId, editedMessage);
    }
    setIsEditing(false);
  };
  
  const handleDeleteClick = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this message?')) {
      onDelete(messageId);
    }
  };
  
  const handleReaction = (emoji) => {
    setReaction(emoji);
    setShowReactions(false);
  };
  
  // Function to detect and parse code blocks
  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="edit-message-container">
          <textarea
            value={editedMessage}
            onChange={handleEditChange}
            className="edit-message-input"
            autoFocus
          />
          <div className="edit-actions">
            <button onClick={() => setIsEditing(false)} className="cancel-edit">Cancel</button>
            <button onClick={handleEditSubmit} className="save-edit">Save</button>
          </div>
        </div>
      );
    }
    
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={darkMode ? vscDarkPlus : vs}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {message}
      </ReactMarkdown>
    );
  };
  
  return (
    <div 
      className={`message ${isUser ? 'user-message' : 'bot-message'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="message-header">
        <div className="message-avatar">
          {isUser ? (
            <i className="fas fa-user"></i>
          ) : (
            <i className="fas fa-robot"></i>
          )}
        </div>
        <div className="message-sender">
          {isUser ? 'You' : 'EchoAI'}
        </div>
        <div className="message-timestamp">{formattedTimestamp}</div>
      </div>
      
      <div className="message-content">
        {renderContent()}
      </div>
      
      {reaction && (
        <div className="message-reaction">
          <span>{reaction}</span>
        </div>
      )}
      
      {showActions && (
        <div className="message-actions">
          <button 
            className="action-button" 
            title={isCopied ? "Copied!" : "Copy message"}
            onClick={handleCopyClick}
          >
            <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'}`}></i>
          </button>
          
          {isUser && (
            <button 
              className="action-button" 
              title="Edit message"
              onClick={handleEditClick}
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
          
          {isUser && (
            <button 
              className="action-button" 
              title="Delete message"
              onClick={handleDeleteClick}
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
          
          <button 
            className="action-button" 
            title="React to message"
            onClick={() => setShowReactions(!showReactions)}
          >
            <i className="fas fa-smile"></i>
          </button>
        </div>
      )}
      
      {showReactions && (
        <div className="reaction-selector">
          {reactions.map((emoji) => (
            <button 
              key={emoji} 
              className="reaction-button"
              onClick={() => handleReaction(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;