import React from 'react';
import '../styles/signup-button.css';

const SignUpButton = ({
  onNavigate,
  variant = 'primary',
  size = 'large',
  text = '🚀 Join Z2B Now',
  className = ''
}) => {
  const handleSignUp = () => {
    // Navigate to membership tiers page for sign up
    if (onNavigate) {
      onNavigate('tiers');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <button
      className={`signup-btn signup-btn-${variant} signup-btn-${size} ${className}`}
      onClick={handleSignUp}
    >
      {text}
    </button>
  );
};

export default SignUpButton;
