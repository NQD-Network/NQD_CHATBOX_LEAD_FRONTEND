import { useTheme } from "../src/contexts/ThemeContext";

export default function PrivacyPolicy() {
  const { colors } = useTheme();

  return (
    <div style={{
      padding: "60px 20px",
      maxWidth: 900,
      margin: "0 auto",
      fontFamily: "'Gilroy', sans-serif",
      lineHeight: 1.6,
      color: colors.text,
      transition: "color 0.3s ease"
    }}>
      <h1 style={{ fontWeight: 600, marginBottom: 24, color: colors.title, transition: "color 0.3s ease" }}>Privacy Policy</h1>
      <p style={{ marginBottom: 16 }}>
        At NQD.ai, we respect your privacy. We collect minimal personal data
        necessary to provide our services, such as name, email, and project
        details you share voluntarily.
      </p>
      <p style={{ marginBottom: 16 }}>
        We never sell or misuse your data. Information is stored securely and
        used solely for communication and service improvement.
      </p>
      <p>For any concerns, please contact: support@nqd.ai</p>
    </div>
  );
}
