
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from './contexts/ThemeContext';
import ChatInterface from './components/ChatInterface/ChatInterface';
import styles from './App.module.css';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <div className={styles.app}>
            <Toaster />
            <ChatInterface />
          </div>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
