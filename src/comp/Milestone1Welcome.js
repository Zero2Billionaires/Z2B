import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Milestone1Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    // Load the milestone1-welcome.html content
    // Since it's too large to inline, we'll redirect to the static HTML file
    // that should be placed in the public folder
    window.location.href = '/milestone1-welcome-static.html' + window.location.search;
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#2A1810',
      color: '#FDB931',
      fontSize: '1.5rem',
      fontFamily: 'Georgia, serif'
    }}>
      Loading Milestone 1...
    </div>
  );
}

export default Milestone1Welcome;
