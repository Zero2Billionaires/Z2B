import React, { useState } from 'react';
import '../styles/footer.css';

const Footer = ({ onNavigate }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      // 5 clicks reached - navigate to admin login
      if (onNavigate) {
        onNavigate('login');
      }
      // Reset counter after navigation
      setTimeout(() => setClickCount(0), 1000);
    }

    // Auto-reset if user doesn't complete 5 clicks within 3 seconds
    setTimeout(() => {
      setClickCount(0);
    }, 3000);
  };

  return (
    <footer className="app-footer">
      <p>
        Built with <span className="heart">❤️</span> by{' '}
        <span
          className="secret-trigger"
          onClick={handleSecretClick}
          style={{ cursor: 'default', userSelect: 'none' }}
        >
          Z2B Legacy Builders
        </span>
        {clickCount > 0 && clickCount < 5 && (
          <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', opacity: 0.3 }}>
            ({clickCount}/5)
          </span>
        )}
      </p>
    </footer>
  );
};

export default Footer;
