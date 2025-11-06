import Head from "next/head";

export default function Settings() {
  const containerStyle = {
    padding: "40px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "'Gilroy', sans-serif",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#11333d",
    marginBottom: "8px",
  };

  const subtitleStyle = {
    fontSize: "16px",
    color: "#6b7280",
    marginBottom: "32px",
  };

  const sectionStyle = {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
  };

  const sectionTitleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#11333d",
    marginBottom: "16px",
  };

  const settingItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  };

  const settingLabelStyle = {
    fontSize: "14px",
    color: "#4b5563",
  };

  const settingDescStyle = {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "4px",
  };

  const toggleStyle = {
    width: "48px",
    height: "24px",
    backgroundColor: "#d1d5db",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    width: "200px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#0e8695",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "20px",
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
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d7582'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0e8695'}
        >
          Save Changes
        </button>
      </div>
    </>
  );
}
