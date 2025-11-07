import Head from "next/head";
import { useTheme } from "../src/contexts/ThemeContext";

export default function Settings() {
  const { colors } = useTheme();
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
            <input
              type="email"
              placeholder="user@example.com"
              style={inputStyle}
            />
          </div>

          <div style={settingItemStyle}>
            <div>
              <div style={settingLabelStyle}>Display Name</div>
              <div style={settingDescStyle}>Your name shown in conversations</div>
            </div>
            <input
              type="text"
              placeholder="Your Name"
              style={inputStyle}
            />
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
        >
          Save Changes
        </button>
      </div>
    </>
  );
}
