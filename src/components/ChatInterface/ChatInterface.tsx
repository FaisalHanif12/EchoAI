
import React, { useState } from 'react';
import { ChatProvider } from '../../contexts/ChatContext';
import Sidebar from '../Sidebar/Sidebar';
import ChatWindow from '../ChatWindow/ChatWindow';
import Header from '../Header/Header';
import styles from './ChatInterface.module.css';

const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ChatProvider>
      <div className={styles.chatInterface}>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className={styles.content}>
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
          <ChatWindow sidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </ChatProvider>
  );
};

export default ChatInterface;
