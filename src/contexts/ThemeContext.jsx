import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Update localStorage and document class when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Background colors
      background: isDarkMode ? '#0f172a' : '#fefefe',
      backgroundSecondary: isDarkMode ? '#1e293b' : '#f9fafb',
      backgroundTertiary: isDarkMode ? '#334155' : '#ffffff',

      // Text colors
      text: isDarkMode ? '#f1f5f9' : '#111111',
      textSecondary: isDarkMode ? '#cbd5e1' : '#4b5563',
      textMuted: isDarkMode ? '#94a3b8' : '#6b7280',
      textDisabled: isDarkMode ? '#64748b' : '#9ca3af',

      // Brand colors
      brand: '#0e8695',
      brandHover: '#0d7582',
      brandLight: isDarkMode ? '#0e8695' : '#e5f3f5',

      // Border colors
      border: isDarkMode ? '#334155' : '#e5e7eb',
      borderLight: isDarkMode ? '#475569' : '#d1d5db',

      // Status colors
      success: isDarkMode ? '#22c55e' : '#10b981',
      error: isDarkMode ? '#ef4444' : '#c33333',
      errorBg: isDarkMode ? '#7f1d1d' : '#fee',
      errorBorder: isDarkMode ? '#991b1b' : '#fcc',

      // Chat specific colors
      chatBotBg: isDarkMode ? '#1e293b' : '#eef3f5',
      chatUserBg: isDarkMode ? '#065f46' : '#d1f7f0',

      // Button colors
      buttonDisabled: isDarkMode ? '#475569' : '#cccccc',

      // Input colors
      inputBg: isDarkMode ? '#1e293b' : '#f9fafb',
      inputBorder: isDarkMode ? '#475569' : '#d9e3e6',

      // Card colors
      cardBg: isDarkMode ? '#1e293b' : '#ffffff',
      cardShadow: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',

      // Header colors
      headerBg: isDarkMode ? '#0f172aeb' : '#ffffffeb',

      // Logo/title color
      title: isDarkMode ? '#f1f5f9' : '#11333d',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
