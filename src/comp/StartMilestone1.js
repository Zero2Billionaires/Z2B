import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StartMilestone1() {
  const navigate = useNavigate();

  useEffect(() => {
    // Referral tracking is already handled in App.js
    // Just ensure it's captured
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || urlParams.get('referral');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
      sessionStorage.setItem('referralCode', refCode);
      // Also set cookie
      document.cookie = `referralCode=${refCode}; max-age=${30 * 24 * 60 * 60}; path=/`;
    }
  }, []);

  const handleStartMilestone = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || urlParams.get('referral');
    const queryString = refCode ? `?ref=${refCode}` : '';
    navigate(`/milestone1-welcome${queryString}`);
  };

  const styles = {
    page: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: 'linear-gradient(180deg, #1A0F0A 0%, #2A1810 50%, #1A0F0A 100%)',
      color: '#E8DCC8',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    container: {
      maxWidth: '900px',
      textAlign: 'center',
    },
    h1: {
      fontSize: '3rem',
      color: '#FDB931',
      marginBottom: '2rem',
      textShadow: '0 0 40px rgba(253, 185, 49, 0.7)',
      lineHeight: '1.3',
    },
    subtitle: {
      fontSize: '1.5rem',
      color: '#D4C5A9',
      marginBottom: '3rem',
      fontStyle: 'italic',
    },
    scripture: {
      background: 'rgba(253, 185, 49, 0.08)',
      border: '2px solid #FDB931',
      borderRadius: '15px',
      padding: '30px',
      margin: '3rem 0',
    },
    scriptureText: {
      fontSize: '1.3rem',
      color: '#FFFFFF',
      fontStyle: 'italic',
      lineHeight: '1.9',
      marginBottom: '1rem',
    },
    scriptureRef: {
      color: '#FDB931',
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    description: {
      fontSize: '1.3rem',
      color: '#D4C5A9',
      lineHeight: '1.8',
      margin: '2rem 0',
    },
    ctaButton: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #FDB931 0%, #D4A029 100%)',
      color: '#000000',
      padding: '25px 70px',
      fontSize: '1.5rem',
      fontWeight: 700,
      textDecoration: 'none',
      borderRadius: '50px',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 0 50px rgba(253, 185, 49, 0.7)',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginTop: '3rem',
      transition: 'all 0.3s ease',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>
          Before You Upgrade Your Life by resigning from the Job you hate, Clarify Your Foundation
        </h1>

        <p style={styles.subtitle}>The First Transform Journey • Royal Table Framework</p>

        <div style={styles.scripture}>
          <p style={styles.scriptureText}>
            "Where there is no vision, the people perish: but he that keepeth the law, happy is he."
          </p>
          <p style={styles.scriptureRef}>— Proverbs 29:18 (KJV)</p>
        </div>

        <p style={styles.description}>
          You're about to complete Milestone 1: <strong style={{ color: '#FDB931' }}>Awareness</strong>.<br />
          This is where transformation begins—not with empty dreams, but with brutal honesty and God-sized vision.
        </p>

        <button
          style={styles.ctaButton}
          onClick={handleStartMilestone}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 0 70px rgba(253, 185, 49, 1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 0 50px rgba(253, 185, 49, 0.7)';
          }}
        >
          Start Milestone 1
        </button>
      </div>
    </div>
  );
}

export default StartMilestone1;
