import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function LeftNav() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { colors } = useTheme();

  // Detect mobile and auto-collapse on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile by default
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to handle navigation clicks on mobile
  const handleNavClick = () => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  };

  // Static projects for demo (will be replaced with backend data later)
  const projects = [
    { id: 1, name: 'Project Alpha', date: '2 days ago' },
    { id: 2, name: 'Customer Support Bot', date: '5 days ago' },
    { id: 3, name: 'Sales Assistant', date: '1 week ago' },
    { id: 4, name: 'Technical Support', date: '2 weeks ago' },
  ];

  const isActive = (path) => router.pathname === path;

  const containerStyle = {
    width: isCollapsed ? '60px' : '260px',
    height: '100vh',
    backgroundColor: colors.backgroundSecondary,
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease, background-color 0.3s ease, border-color 0.3s ease',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
    fontFamily: "'Gilroy', sans-serif",
  };

  const headerStyle = {
    padding: isCollapsed ? '16px 8px' : '16px 20px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.3s ease',
  };

  const logoStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.title,
    display: isCollapsed ? 'none' : 'block',
    transition: 'color 0.3s ease',
  };

  const toggleButtonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  };

  const newChatButtonStyle = {
    margin: isCollapsed ? '12px 8px' : '12px 16px',
    padding: isCollapsed ? '12px' : '12px 16px',
    backgroundColor: '#0e8695',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  };

  const sectionStyle = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: isCollapsed ? '8px' : '8px 16px',
  };

  const sectionTitleStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '12px 4px 8px',
    display: isCollapsed ? 'none' : 'block',
    transition: 'color 0.3s ease',
  };

  const projectItemStyle = (isActiveItem) => ({
    padding: isCollapsed ? '12px 8px' : '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    backgroundColor: isActiveItem ? colors.brandLight : 'transparent',
    color: isActiveItem ? colors.brand : colors.textSecondary,
    justifyContent: isCollapsed ? 'center' : 'flex-start',
  });

  const projectIconStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    backgroundColor: colors.borderLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    flexShrink: 0,
    transition: 'background-color 0.3s ease',
  };

  const projectTextStyle = {
    flex: 1,
    display: isCollapsed ? 'none' : 'block',
    overflow: 'hidden',
  };

  const projectNameStyle = {
    fontSize: '15px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const projectDateStyle = {
    fontSize: '13px',
    color: colors.textMuted,
    marginTop: '2px',
    transition: 'color 0.3s ease',
  };

  const footerStyle = {
    borderTop: `1px solid ${colors.border}`,
    padding: isCollapsed ? '8px' : '8px 16px',
    transition: 'border-color 0.3s ease',
  };

  const footerItemStyle = (isActiveItem) => ({
    padding: isCollapsed ? '12px 8px' : '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    backgroundColor: isActiveItem ? colors.brand : 'transparent',
    color: isActiveItem ? '#ffffff' : colors.textSecondary,
    fontSize: '15px',
    fontWeight: '500',
    textDecoration: 'none',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
  });

  return (
    <nav style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={logoStyle}>NQD Chatbox</div>
        <button
          style={toggleButtonStyle}
          onClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.border}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10h14M3 5h14M3 15h14" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <button
        style={newChatButtonStyle}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d7582'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0e8695'}
        onClick={() => {
          router.push('/');
          handleNavClick();
        }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {!isCollapsed && <span>New Chat</span>}
      </button>

      {/* Projects Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Projects</div>
        {projects.map((project) => (
          <div
            key={project.id}
            style={projectItemStyle(false)}
            onClick={handleNavClick}
            onMouseEnter={(e) => {
              if (!isCollapsed) e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={projectIconStyle}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="#6b7280">
                <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm0 2v9h14V6H3z" />
              </svg>
            </div>
            <div style={projectTextStyle}>
              <div style={projectNameStyle}>{project.name}</div>
              <div style={projectDateStyle}>{project.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Links */}
      <div style={footerStyle}>
        <ThemeToggle isCollapsed={isCollapsed} />

        <Link
          href="/"
          style={footerItemStyle(isActive('/'))}
          onClick={handleNavClick}
          onMouseEnter={(e) => {
            if (!isActive('/')) e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
          }}
          onMouseLeave={(e) => {
            if (!isActive('/')) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          {!isCollapsed && <span>Home</span>}
        </Link>

        <Link
          href="/settings"
          style={footerItemStyle(isActive('/settings'))}
          onClick={handleNavClick}
          onMouseEnter={(e) => {
            if (!isActive('/settings')) e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
          }}
          onMouseLeave={(e) => {
            if (!isActive('/settings')) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          {!isCollapsed && <span>Settings</span>}
        </Link>

        <Link
          href="/privacy-policy"
          style={footerItemStyle(isActive('/privacy-policy'))}
          onClick={handleNavClick}
          onMouseEnter={(e) => {
            if (!isActive('/privacy-policy')) e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
          }}
          onMouseLeave={(e) => {
            if (!isActive('/privacy-policy')) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {!isCollapsed && <span>Privacy Policy</span>}
        </Link>

        <Link
          href="/terms-of-service"
          style={footerItemStyle(isActive('/terms-of-service'))}
          onClick={handleNavClick}
          onMouseEnter={(e) => {
            if (!isActive('/terms-of-service')) e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
          }}
          onMouseLeave={(e) => {
            if (!isActive('/terms-of-service')) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          {!isCollapsed && <span>Terms of Service</span>}
        </Link>


        <Link
          href="/profile"
          style={footerItemStyle(isActive('/profile'))}
          onMouseEnter={(e) => {
            if (!isActive('/profile')) e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            if (!isActive('/profile')) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a4 4 0 110 8 4 4 0 010-8zm-7 14a7 7 0 0114 0 1 1 0 01-1 1H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          {!isCollapsed && <span>Profile</span>}
        </Link>
      </div>
    </nav>
  );
}
