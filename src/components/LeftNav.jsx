import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LeftNav() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { colors } = useTheme();
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, bottom: 'auto' });
  const menuButtonRef = useRef(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renamingValue, setRenamingValue] = useState("");
  const renameInputRef = useRef(null);

  // Add rename handler function
  const handleRenameProject = async (id, currentName) => {
    setRenamingId(id);
    setRenamingValue(currentName);
    setOpenMenu(null);

    // Focus input after state update
    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 0);
  };

  // Add save rename function
  const handleSaveRename = async (id) => {
    if (!renamingValue.trim()) {
      alert("Name cannot be empty");
      return;
    }

    if (renamingValue === projects.find(p => p.id === id)?.name) {
      // No change, just cancel
      setRenamingId(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/session/${id}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newName: renamingValue.trim() })
      });

      const data = await res.json();

      if (data.success) {
        // Update UI
        setProjects((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, name: renamingValue.trim() } : p
          )
        );
        setRenamingId(null);

        // Trigger update event for other components
        window.dispatchEvent(new Event('session-updated'));
      } else {
        alert(data.error || "Failed to rename chat");
      }
    } catch (err) {
      console.error("Rename failed:", err);
      alert("Failed to rename chat. Please try again.");
    }
  };

  // Add cancel rename function
  const handleCancelRename = () => {
    setRenamingId(null);
    setRenamingValue("");
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/session/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.success) {
        // Remove from UI
        setProjects((prev) => prev.filter((p) => p.id !== id));

        // Remove from localStorage (for anonymous users)
        let userSessions = JSON.parse(localStorage.getItem('user_sessions') || '[]');
        userSessions = userSessions.filter(s => s !== id);
        localStorage.setItem('user_sessions', JSON.stringify(userSessions));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };


  // Detect mobile and auto-collapse on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Fetch sessions based on login status
  useEffect(() => {
    const fetchAllSessions = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');

        if (accessToken) {
          // ✅ LOGGED IN: Fetch by userId from backend

          const userInfoRes = await fetch('/api/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (userInfoRes.ok) {
            const userData = await userInfoRes.json();
            const userId = userData.id || userData.sub;
            setCurrentUserId(userId);

            if (userId) {
              const sessionsRes = await fetch(`${API_BASE}/api/session/user/${userId}`);
              const sessionsData = await sessionsRes.json();

              if (sessionsData.success && sessionsData.sessions) {

                const userProjects = sessionsData.sessions.map(session => ({
                  id: session._id,
                  name: session.firstMessage || session.message || 'Untitled Chat',
                  date: formatDate(session.updatedAt || session.createdAt),
                  service: session.service
                }));

                setProjects(userProjects);
              }
            }
          }
        } else {
          // ✅ NOT LOGGED IN: Fetch from localStorage

          const userSessions = JSON.parse(localStorage.getItem('user_sessions') || '[]');

          if (userSessions.length > 0) {
            const sessionPromises = userSessions.map(async (sessionId) => {
              try {
                const res = await fetch(`${API_BASE}/api/session/${sessionId}`);
                const data = await res.json();
                if (data.success && data.session) {
                  return {
                    id: data.session._id,
                    name: data.session.firstMessage || data.session.message || 'Untitled Chat',
                    date: formatDate(data.session.updatedAt || data.session.createdAt),
                    service: data.session.service
                  };
                }
                return null;
              } catch (err) {
                return null;
              }
            });

            const sessions = await Promise.all(sessionPromises);
            const validSessions = sessions.filter(s => s !== null);
            setProjects(validSessions);
          }
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSessions();

    // ✅ Listen for session updates from ChatBox
    const handleSessionUpdate = () => {
      fetchAllSessions();
    };

    window.addEventListener('session-updated', handleSessionUpdate);

    return () => {
      window.removeEventListener('session-updated', handleSessionUpdate);
    };
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleNavClick = () => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  };

  // ✅ Handle project click WITHOUT page refresh
  const handleProjectClick = (projectId) => {
    // Direct page reload with new sessionId
    window.location.href = `/?sessionId=${projectId}`;
    handleNavClick();
  };

  // ✅ Handle new chat creation
  const handleNewChat = () => {
    // Navigate to home without sessionId
    window.location.href = '/';
  };

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
    color: colors.textMuted,
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
        onClick={handleNewChat}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {!isCollapsed && <span>New Chat</span>}
      </button>

      {/* Projects Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          {loading ? 'Loading...' : projects.length > 0 ? 'Your Chats' : 'No Chats Yet'}
        </div>

        {projects.map((project, index) => {
          const currentSessionId = router.query.sessionId;
          const isCurrentSession = currentSessionId === project.id;
          const isRenaming = renamingId === project.id;

          return (
            <div
              key={project.id}
              style={{
                ...projectItemStyle(isCurrentSession),
                position: "relative"
              }}
              onMouseLeave={() => !isRenaming && setOpenMenu(null)}
            >
              {/* Project Icon */}
              <div style={projectIconStyle}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="#6b7280">
                  <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm0 2v9h14V6H3z" />
                </svg>
              </div>

              {/* Project Text OR Rename Input */}
              {isRenaming ? (
                <div style={{ flex: 1, display: "flex", gap: "4px" }}>
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renamingValue}
                    onChange={(e) => setRenamingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveRename(project.id);
                      } else if (e.key === "Escape") {
                        handleCancelRename();
                      }
                    }}
                    onBlur={() => handleSaveRename(project.id)}
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      fontSize: "14px",
                      border: `1px solid ${colors.brand}`,
                      borderRadius: "4px",
                      outline: "none",
                      background: colors.backgroundTertiary,
                      color: colors.text,
                      fontFamily: "'Gilroy', sans-serif"
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{ ...projectTextStyle }}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div style={projectNameStyle}>{project.name}</div>
                  <div style={projectDateStyle}>{project.date}</div>
                </div>
              )}

              {/* 3 Dots Menu Button (hide during rename) */}
              {!isRenaming && (
                <div
                  ref={openMenu === project.id ? menuButtonRef : null}
                  style={{
                    marginLeft: "auto",
                    padding: "5px",
                    cursor: "pointer",
                    display: isCollapsed ? "none" : "block",
                    color: colors.textMuted,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();

                    const buttonRect = e.currentTarget.getBoundingClientRect();
                    const spaceBelow = window.innerHeight - buttonRect.bottom;
                    const menuHeight = 100;

                    if (spaceBelow < menuHeight && buttonRect.top > menuHeight) {
                      setMenuPosition({
                        bottom: window.innerHeight - buttonRect.top,
                        top: 'auto'
                      });
                    } else {
                      setMenuPosition({
                        top: buttonRect.top,
                        bottom: 'auto'
                      });
                    }

                    setOpenMenu(openMenu === project.id ? null : project.id);
                  }}
                >
                  ⋮
                </div>
              )}

              {/* Smart Positioned Dropdown Menu */}
              {openMenu === project.id && !isRenaming && (
                <div
                  style={{
                    position: "fixed",
                    backgroundColor: colors.backgroundSecondary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    padding: "4px 0",
                    minWidth: "160px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    zIndex: 9999,
                    left: isCollapsed ? "70px" : "220px",
                    top: menuPosition.top !== 'auto' ? `${menuPosition.top}px` : 'auto',
                    bottom: menuPosition.bottom !== 'auto' ? `${menuPosition.bottom}px` : 'auto',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Rename Option */}
                  <div
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                      color: colors.text,
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.15s",
                    }}
                    onClick={() => handleRenameProject(project.id, project.name)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.border;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span>✏️</span>
                    <span>Rename</span>
                  </div>

                  {/* Divider */}
                  <div style={{
                    height: "1px",
                    background: colors.border,
                    margin: "4px 0"
                  }} />

                  {/* Delete Option */}
                  <div
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                      color: "#ef4444",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.15s",
                    }}
                    onClick={() => {
                      handleDeleteProject(project.id);
                      setOpenMenu(null);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.border;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span>🗑️</span>
                    <span>Delete Chat</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ✅ Add this CSS animation in your global styles or in a <style> tag */}
        <style jsx>{`
                @keyframes fadeIn {
                from {
                      opacity: 0;
                      transform: translateY(-5px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                  }
              }
      `}</style>
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
          onClick={handleNavClick}
          onMouseEnter={(e) => {
            if (!isActive('/profile')) e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
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