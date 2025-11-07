import { useTheme } from "../src/contexts/ThemeContext";

export default function TermsOfService() {
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
      <h1 style={{ fontWeight: 600, marginBottom: 24, color: colors.title, transition: "color 0.3s ease" }}>Terms of Service</h1>
      <p style={{ marginBottom: 16 }}>
        By using NQD.ai, you agree to our terms and conditions. You must not use
        the service for illegal, harmful, or abusive purposes.
      </p>
      <p style={{ marginBottom: 16 }}>
        NQD.ai is not responsible for indirect or consequential damages arising
        from the use of our platform. All features are provided &ldquo;as is.&rdquo;
      </p>
      <p>We may update these terms periodically without prior notice.</p>
    </div>
  );
}
