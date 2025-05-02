
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import { ChatProvider } from '../../contexts/ChatContext';
import Sidebar from '../Sidebar/Sidebar';
import ChatWindow from '../ChatWindow/ChatWindow';
import Header from '../Header/Header';
import styles from './ChatInterface.module.css';

const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  
  // Show sidebar automatically only on screens wider than 900px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ChatProvider>
      <div className={styles.chatInterface}>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className={styles.content}>
          {/* Show sidebar based on screen width or toggle state */}
          {isSidebarOpen && 
            <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
          }
          <ChatWindow sidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </ChatProvider>
  );
};

export default ChatInterface;
