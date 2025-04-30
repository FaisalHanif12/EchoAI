
import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const { 
    sessions, 
    currentSessionId, 
    createNewSession, 
    switchSession, 
    deleteSession,
    updateSessionName
  } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (sessionId: string, currentName: string) => {
    setEditingSessionId(sessionId);
    setEditName(currentName);
  };

  const saveSessionName = (sessionId: string) => {
    if (editName.trim()) {
      updateSessionName(sessionId, editName.trim());
    }
    setEditingSessionId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      saveSessionName(sessionId);
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.lastMessage && session.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <button 
          className={styles.newChatButton}
          onClick={createNewSession}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Chat
        </button>
        
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className={styles.clearSearch}
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.sessionList}>
        {filteredSessions.length > 0 ? (
          filteredSessions.map(session => (
            <div 
              key={session.id} 
              className={`${styles.sessionItem} ${currentSessionId === session.id ? styles.active : ''}`}
              onClick={() => {
                switchSession(session.id);
                if (window.innerWidth <= 768) {
                  closeSidebar();
                }
              }}
            >
              <div className={styles.sessionInfo}>
                {editingSessionId === session.id ? (
                  <input
                    type="text"
                    className={styles.editNameInput}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => saveSessionName(session.id)}
                    onKeyDown={(e) => handleKeyDown(e, session.id)}
                    autoFocus
                  />
                ) : (
                  <h3 
                    className={styles.sessionName}
                    onDoubleClick={() => startEditing(session.id, session.name)}
                  >
                    {session.name}
                  </h3>
                )}
                <p className={styles.sessionPreview}>
                  {session.lastMessage ? 
                    (session.lastMessage.length > 30 ? 
                      `${session.lastMessage.substring(0, 30)}...` : 
                      session.lastMessage) : 
                    'New conversation'}
                </p>
              </div>
              
              <div className={styles.sessionActions}>
                <span className={styles.sessionDate}>
                  {formatDate(session.timestamp)}
                </span>
                <button 
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  aria-label="Delete session"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            {searchTerm ? 'No matching chats found' : 'No chats yet'}
          </div>
        )}
      </div>
      
      <div className={styles.sidebarFooter}>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          GitHub
        </a>
        <span>•</span>
        <a 
          href="https://twitter.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          Twitter
        </a>
      </div>
      
      <button className={styles.closeSidebar} onClick={closeSidebar} aria-label="Close sidebar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </aside>
  );
};

export default Sidebar;
