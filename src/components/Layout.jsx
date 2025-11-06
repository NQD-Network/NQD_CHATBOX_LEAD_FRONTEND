import LeftNav from './LeftNav';

export default function Layout({ children }) {
  const layoutStyle = {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Gilroy', sans-serif",
  };

  const mainContentStyle = {
    marginLeft: '260px', // Width of the expanded nav
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
