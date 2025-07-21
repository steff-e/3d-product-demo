import React, { useEffect } from 'react';

const Layout = ({ children }) => {

  useEffect(() => {
    const prevBg = document.body.style.background;
    document.body.style.background = '#f3f3f3';
    return () => {
      document.body.style.background = prevBg;
    };
  }, []);

  const handleHeaderClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f3f3' }}>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          width: '100%',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: '1.2rem 2vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          onClick={handleHeaderClick}
          style={{
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            color: '#222',
            cursor: 'pointer',
            letterSpacing: '0.03em',
            userSelect: 'none',
            transition: 'color 0.2s',
          }}
          tabIndex={0}
          role="button"
          aria-label="Scroll to top"
        >
          3D Product Demo
        </span>
      </header>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '5.5rem 1vw 2rem 1vw' }}>{children}</main>
    </div>
  );
};

export default Layout;
