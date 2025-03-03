import React, { useState } from 'react';

const ThemeSwitcher = ({ setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const themes = [
    { name: 'Light', value: 'light-mode', icon: 'fa-sun' },
    { name: 'Dark', value: 'dark-mode', icon: 'fa-moon' },
    { name: 'Colorful', value: 'colorful-mode', icon: 'fa-palette' }
  ];
  
  return (
    <div className="theme-switcher">
      <button 
        className="theme-button" 
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
      >
        <i className="fas fa-paint-brush"></i>
      </button>
      
      {isOpen && (
        <div className="theme-options">
          {themes.map(theme => (
            <button 
              key={theme.value}
              className="theme-option" 
              onClick={() => {
                setTheme(theme.value);
                setIsOpen(false);
              }}
              title={theme.name}
            >
              <i className={`fas ${theme.icon}`}></i>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;