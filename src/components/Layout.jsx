import React, { useEffect } from 'react';

const Layout = ({ children }) => {
  // Dynamically set main's padding-bottom to match the footer's height
  useEffect(() => {
    function adjustMainPadding() {
      const main = document.querySelector('main');
      const footer = document.querySelector('.footer');
      if (main && footer) {
        main.style.paddingBottom = footer.offsetHeight + 24 + 'px';
      }
    }
    adjustMainPadding();
    window.addEventListener('resize', adjustMainPadding);
    return () => window.removeEventListener('resize', adjustMainPadding);
  }, []);


  const handleHeaderClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div style={{ minHeight: '100vh' }}>
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            width: '100%',
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
      <footer className="footer">
        <p className="copyright">Stefanie Adrianzen</p>
        <a href="https://www.linkedin.com/in/stefanie-adrianzen/" style={{ display: 'flex', alignItems: 'center' }}>
          <svg
            className="footer-logo"
            width="37"
            height="37"
            viewBox="0 0 20 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="LinkedIn logo"
          >
            <rect x="0" fill="none" width="20" height="20" />
            <path d="M2.5 18h3V6.9h-3V18zM4 2c-1 0-1.8.8-1.8 1.8S3 5.6 4 5.6s1.8-.8 1.8-1.8S5 2 4 2zm6.6 6.6V6.9h-3V18h3v-5.7c0-3.2 4.1-3.4 4.1 0V18h3v-6.8c0-5.4-5.7-5.2-7.1-2.6z" />
          </svg>
        </a>
      </footer>
    </>
  );
};

export default Layout;