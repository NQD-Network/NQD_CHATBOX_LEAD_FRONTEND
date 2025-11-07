import { useState, useEffect } from 'react';
import LeftNav from './LeftNav';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout({ children }) {
  const { colors } = useTheme();
  const [navWidth, setNavWidth] = useState('260px');

  useEffect(() => {
    const updateNavWidth = () => {
      const isMobile = window.innerWidth < 768;
      setNavWidth(isMobile ? '60px' : '260px');
    };

    updateNavWidth();
    window.addEventListener('resize', updateNavWidth);
    return () => window.removeEventListener('resize', updateNavWidth);
  }, []);

  const layoutStyle = {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Gilroy', sans-serif",
    backgroundColor: colors.background,
    color: colors.text,
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const mainContentStyle = {
    marginLeft: navWidth,
    flex: 1,
    transition: 'margin-left 0.3s ease',
    overflow: 'auto',
  };

  return (
    <div style={layoutStyle}>
      <LeftNav />
      <main style={mainContentStyle}>
        {children}
      </main>
    </div>
  );
}
