import React from 'react';

const ChatSidebar = ({ 
  isOpen, 
  toggleSidebar, 
  chatHistory, 
  currentChatId, 
  startNewChat, 
  loadChat,
  darkMode
}) => {
  // Format the timestamp to a more readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`chat-sidebar ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      <div className="sidebar-header">
        <h2>Chat History</h2>
        <button className="close-sidebar" onClick={toggleSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <button className="new-chat-button" onClick={startNewChat}>
        <i className="fas fa-plus"></i> New Chat
      </button>
      
      <div className="chat-history-list">
        {chatHistory.length === 0 ? (
          <div className="no-history">No chat history yet</div>
        ) : (
          chatHistory.map((chat) => (
            <div 
              key={chat.id} 
              className={`chat-history-item ${currentChatId === chat.id ? 'active' : ''}`}
              onClick={() => loadChat(chat.id)}
            >
              <div className="chat-title">{chat.title}</div>
              <div className="chat-timestamp">{formatTimestamp(chat.timestamp)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;