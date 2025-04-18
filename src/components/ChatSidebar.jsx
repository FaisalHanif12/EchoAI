import React, { useState } from 'react';

const ChatSidebar = ({ 
  isOpen, 
  toggleSidebar, 
  chatHistory, 
  currentChatId, 
  startNewChat, 
  loadChat,
  deleteChat,
  darkMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
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
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter chat history based on search query
  const filteredHistory = searchQuery.trim() === '' 
    ? chatHistory 
    : chatHistory.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Handle delete click
  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    setConfirmDelete(chatId);
  };
  
  // Confirm deletion
  const confirmDeleteChat = (e, chatId) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    deleteChat(chatId);
    setConfirmDelete(null);
  };
  
  // Cancel deletion
  const cancelDelete = (e) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    setConfirmDelete(null);
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
      
      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>
      
      <div className="chat-history-list">
        {filteredHistory.length === 0 ? (
          <div className="no-history">
            {searchQuery ? 'No matching conversations found' : 'No chat history yet'}
          </div>
        ) : (
          filteredHistory.map((chat) => (
            <div 
              key={chat.id} 
              className={`chat-history-item ${currentChatId === chat.id ? 'active' : ''}`}
              onClick={() => loadChat(chat.id)}
            >
              <div className="chat-info">
                <div className="chat-title" title={chat.title}>
                  <i className="fas fa-comment-alt"></i>
                  {chat.title}
                </div>
                <div className="chat-timestamp">{formatTimestamp(chat.timestamp)}</div>
                <div className="chat-message-count">
                  {chat.messages.length} {chat.messages.length === 1 ? 'message' : 'messages'}
                </div>
              </div>
              
              {confirmDelete === chat.id ? (
                <div className="delete-confirmation">
                  <span>Delete?</span>
                  <button 
                    className="confirm-delete" 
                    onClick={(e) => confirmDeleteChat(e, chat.id)}
                    title="Confirm delete"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                  <button 
                    className="cancel-delete" 
                    onClick={cancelDelete}
                    title="Cancel"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <button 
                  className="delete-chat-button" 
                  onClick={(e) => handleDeleteClick(e, chat.id)}
                  title="Delete conversation"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="sidebar-footer">
        <div className="app-info">
          <span className="app-version">EchoAI v2.0</span>
          <span className="app-mode">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;