import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className={`icon-container ${theme}`}>
        {theme === 'light' ? (
          <Sun size={20} className="icon sun-icon" />
        ) : (
          <Moon size={20} className="icon moon-icon" />
        )}
      </div>
      <span className="toggle-text">
        {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};
