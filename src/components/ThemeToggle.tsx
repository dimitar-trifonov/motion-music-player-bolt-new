import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  // Initialize theme from localStorage or default to auto
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to auto (system preference)
      setTheme('auto');
      applyTheme('auto');
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    
    if (newTheme === 'auto') {
      // Remove data-theme attribute to use system preference
      root.removeAttribute('data-theme');
    } else {
      // Set explicit theme
      root.setAttribute('data-theme', newTheme);
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun size={20} />;
    } else if (theme === 'dark') {
      return <Moon size={20} />;
    } else {
      // Auto theme - show current system preference
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDarkMode ? <Moon size={20} /> : <Sun size={20} />;
    }
  };

  const getTooltip = () => {
    if (theme === 'light') return 'Switch to Dark Theme';
    if (theme === 'dark') return 'Switch to Auto Theme';
    return 'Switch to Light Theme';
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;