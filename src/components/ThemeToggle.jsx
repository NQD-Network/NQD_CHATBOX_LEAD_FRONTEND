import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ isCollapsed = false }) {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const containerStyle = {
    position: 'relative',
    width: isCollapsed ? '36px' : '52px',
    height: isCollapsed ? '20px' : '26px',
    backgroundColor: isDarkMode ? '#0e8695' : '#cbd5e1',
    borderRadius: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
  };

  const toggleStyle = {
    width: isCollapsed ? '16px' : '22px',
    height: isCollapsed ? '16px' : '22px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transform: isDarkMode ? `translateX(${isCollapsed ? '16px' : '26px'})` : 'translateX(0)',
    transition: 'transform 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isCollapsed ? '8px' : '10px',
  };

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: isCollapsed ? '8px' : '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  const labelStyle = {
    fontSize: '15px',
    fontWeight: '500',
    color: colors.textSecondary,
    display: isCollapsed ? 'none' : 'block',
  };

  return (
    <div
      style={wrapperStyle}
      onClick={toggleTheme}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      role="button"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
    >
      <div style={containerStyle}>
        <div style={toggleStyle}>
          {isDarkMode ? '🌙' : '☀️'}
        </div>
      </div>
      <span style={labelStyle}>
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </div>
  );
}
