import Head from "next/head";
import { useEffect, useState } from "react";
import { useTheme } from "../src/contexts/ThemeContext";

const LOGIN_FRONTEND_URL = process.env.NEXT_PUBLIC_LOGIN_FRONTEND_URL || "https://auth.nqd.ai";

// Token refresh function
async function refreshAccessTokenOnServer(refreshToken) {
  if (!refreshToken) throw new Error("No refresh token available");

  const resp = await fetch("/api/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error || "Failed to refresh token");
  }

  if (data.access_token) localStorage.setItem("access_token", data.access_token);
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
  if (data.id_token) localStorage.setItem("id_token", data.id_token);

  return data.access_token;
}

// Tenant detection
function detectTenant() {
  if (typeof window === 'undefined') {
    return 'nqd-chatbox';
  }

  const hostname = window.location.hostname;
  const port = window.location.port;

  if (port === '3000' || hostname.includes('snm.jewelry')) {
    return 'my-frontend';
  } else if (port === '3001' || hostname.includes('nqd.ai')) {
    return 'nqd-chatbox';
  }

  return 'nqd-chatbox';
}

export default function Settings() {
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mounted, setMounted] = useState(false);

  // Detect tenant on mount
  useEffect(() => {
    setMounted(true);
    const detectedTenant = detectTenant();
    if (typeof window !== 'undefined') {
      localStorage.setItem('tenant_id', detectedTenant);
    }
  }, []);

  // Fetch user info
  useEffect(() => {
    if (!mounted) return;

    const fetchUserInfo = async () => {
      let accessToken = localStorage.getItem("access_token");
      let refreshToken = localStorage.getItem("refresh_token");

      // If no tokens, redirect to login
      if (!accessToken && !refreshToken) {
        const tenantId = detectTenant();
        const loginUrl = `${LOGIN_FRONTEND_URL}/login?tenant_id=${tenantId}&return_to=${encodeURIComponent(window.location.href)}`;
        window.location.href = loginUrl;
        return;
      }

      // Try to refresh if only refresh token exists
      if (!accessToken && refreshToken) {
        try {
          accessToken = await refreshAccessTokenOnServer(refreshToken);
        } catch (err) {
          localStorage.clear();
          const tenantId = detectTenant();
          const loginUrl = `${LOGIN_FRONTEND_URL}/login?tenant_id=${tenantId}&return_to=${encodeURIComponent(window.location.href)}`;
          window.location.href = loginUrl;
          return;
        }
      }

      // Fetch user info with retry logic
      let hasRefreshed = false;
      const attemptFetch = async () => {
        try {
          const resp = await fetch("/api/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (resp.status === 401) {
            if (!hasRefreshed && refreshToken) {
              hasRefreshed = true;
              try {
                accessToken = await refreshAccessTokenOnServer(refreshToken);
                return attemptFetch();
              } catch (err) {
                localStorage.clear();
                const tenantId = detectTenant();
                const loginUrl = `${LOGIN_FRONTEND_URL}/login?tenant_id=${tenantId}&return_to=${encodeURIComponent(window.location.href)}`;
                window.location.href = loginUrl;
                return;
              }
            } else {
              localStorage.clear();
              const tenantId = detectTenant();
              const loginUrl = `${LOGIN_FRONTEND_URL}/login?tenant_id=${tenantId}&return_to=${encodeURIComponent(window.location.href)}`;
              window.location.href = loginUrl;
              return;
            }
          }

          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
          }

          const data = await resp.json();
          setUser(data);
          setEmail(data.email || "");
          setDisplayName(`${data.name?.first || ""} ${data.name?.last || ""}`.trim() || "");
        } catch (err) {
          console.error("Failed to fetch user info:", err);
        } finally {
          setLoading(false);
        }
      };

      await attemptFetch();
    };

    fetchUserInfo();
  }, [mounted]);

  const containerStyle = {
    padding: "40px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "'Gilroy', sans-serif",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: colors.title,
    marginBottom: "8px",
    transition: "color 0.3s ease",
  };

  const subtitleStyle = {
    fontSize: "16px",
    color: colors.textMuted,
    marginBottom: "32px",
    transition: "color 0.3s ease",
  };

  const sectionStyle = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    border: `1px solid ${colors.border}`,
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  };

  const sectionTitleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: colors.title,
    marginBottom: "16px",
    transition: "color 0.3s ease",
  };

  const settingItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: `1px solid ${colors.border}`,
    transition: "border-color 0.3s ease",
  };

  const settingLabelStyle = {
    fontSize: "14px",
    color: colors.textSecondary,
    transition: "color 0.3s ease",
  };

  const settingDescStyle = {
    fontSize: "12px",
    color: colors.textMuted,
    marginTop: "4px",
    transition: "color 0.3s ease",
  };

  const toggleStyle = {
    width: "48px",
    height: "24px",
    backgroundColor: colors.borderLight,
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  };

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: "6px",
    border: `1px solid ${colors.borderLight}`,
    fontSize: "14px",
    width: "200px",
    backgroundColor: colors.backgroundTertiary,
    color: colors.text,
    transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: colors.brand,
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "20px",
    transition: "background-color 0.3s ease",
  };

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '16px',
    color: colors.textMuted,
  };

  if (loading) {
    return <div style={loadingStyle}>Loading user settings...</div>;
  }

  return (
    <>
      <Head>
        <title>Settings - NQD Chatbox</title>
        <meta name="description" content="Configure your NQD Chatbox settings" />
      </Head>

      <div style={containerStyle}>
        <h1 style={titleStyle}>Settings</h1>
        <p style={subtitleStyle}>Manage your account and application preferences</p>

        {/* Account Settings */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Account Settings</h2>

          <div style={settingItemStyle}>
            <div>
              <div style={settingLabelStyle}>Email Address</div>
              <div style={settingDescStyle}>Your primary contact email</div>
            </div>
            <div style={{
              ...inputStyle,
              backgroundColor: colors.border,
              cursor: 'not-allowed',
              opacity: 0.7,
              display: 'flex',
              alignItems: 'center',
            }}>
              {email || "user@example.com"}
            </div>
          </div>

          <div style={settingItemStyle}>
            <div>
              <div style={settingLabelStyle}>Display Name</div>
              <div style={settingDescStyle}>Your name shown in conversations</div>
            </div>
            <div style={{
              ...inputStyle,
              backgroundColor: colors.border,
              cursor: 'not-allowed',
              opacity: 0.7,
              display: 'flex',
              alignItems: 'center',
            }}>
              {displayName || "Your Name"}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Notifications</h2>

          <div style={settingItemStyle}>
            <div>
              <div style={settingLabelStyle}>Email Notifications</div>
              <div style={settingDescStyle}>Receive email updates about your projects</div>
            </div>
            <div style={toggleStyle}></div>
          </div>

          <div style={settingItemStyle}>
            <div>
              <div style={settingLabelStyle}>Desktop Notifications</div>
              <div style={settingDescStyle}>Show desktop alerts for new messages</div>
            </div>
            <div style={toggleStyle}></div>
          </div>
        </div>

        {/* Chat Settings */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Chat Settings</h2>

          <div style={settingItemStyle}>
            <div>
              <div style={settingLabelStyle}>Auto-save Conversations</div>
              <div style={settingDescStyle}>Automatically save chat history</div>
            </div>
            <div style={toggleStyle}></div>
          </div>

          <div style={settingItemStyle}>
            <div>
              <div style={settingLabelStyle}>Default Service</div>
              <div style={settingDescStyle}>Pre-selected service for new chats</div>
            </div>
            <input
              type="text"
              placeholder="None"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          style={buttonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.brandHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.brand}
          onClick={() => alert('Settings saved successfully!')}
        >
          Save Changes
        </button>
      </div>
    </>
  );
}