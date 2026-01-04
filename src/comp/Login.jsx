import React, { useState } from 'react';
import '../styles/login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://z2b-production-3cd3.up.railway.app';

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend not available. Server returned HTML instead of JSON.');
      }

      const data = await response.json();

      if (response.ok && data.token) {
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));

        setSuccess('✅ Login successful! Redirecting...');

        // Call parent callback with user data
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1000);
      } else {
        setError(data.message || 'Invalid credentials. Please check your email and password.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error('Login error:', err);

      // Provide clear, actionable error messages
      if (err.message.includes('Backend not available')) {
        setError('⚠️ Backend server is not deployed yet. Please register a new account or contact support.');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('⚠️ Cannot connect to server. Please check your internet connection or try again later.');
      } else {
        setError('⚠️ Login failed. Please register a new account or contact support.');
      }
      setTimeout(() => setError(''), 10000);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setResetMessage('Please enter your email address');
      setTimeout(() => setResetMessage(''), 5000);
      return;
    }

    setResetLoading(true);
    setResetMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend not available');
      }

      const data = await response.json();

      if (response.ok) {
        setResetMessage('✅ Password reset instructions sent! Check your email.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail('');
          setResetMessage('');
        }, 3000);
      } else {
        setResetMessage(data.message || 'Failed to send reset link');
        setTimeout(() => setResetMessage(''), 5000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setResetMessage('⚠️ Backend server not available. Please contact support.');
      setTimeout(() => setResetMessage(''), 5000);
    } finally {
      setResetLoading(false);
    }
  };

  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      document.getElementById('password-input').focus();
    }
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h1>Password Reset</h1>
            <p className="login-tagline">Reset Your Member Access</p>
          </div>

          {/* Reset Message */}
          {resetMessage && (
            <div className={`alert ${resetMessage.includes('✅') ? 'alert-success' : 'alert-error'}`}>
              <span className="alert-icon">{resetMessage.includes('✅') ? '✅' : '⚠️'}</span>
              {resetMessage}
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="form-group">
              <label htmlFor="reset-email-input">Email Address</label>
              <input
                id="reset-email-input"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={resetLoading}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={resetLoading}
            >
              {resetLoading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="login-footer">
            <button
              type="button"
              className="link-secondary"
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail('');
                setResetMessage('');
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>Z2B Legacy Builders</h1>
          <p className="login-tagline">Welcome Back, Legacy Builder</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleEmailKeyPress}
              placeholder="your@email.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🔓' : '🔒'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>

        {/* Additional Links */}
        <div className="login-footer">
          <button
            type="button"
            className="link-secondary"
            onClick={() => setShowForgotPassword(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Forgot Password?
          </button>
          <span className="separator">•</span>
          <a href="#register" className="link-secondary">
            Create Account
          </a>
        </div>

        {/* Free Access Promo */}
        <div className="login-promo">
          <p>
            Don't have an account?{' '}
            <strong>Start FREE with Milestone 1!</strong>
          </p>
          <button
            type="button"
            className="btn-register"
            onClick={() => window.location.href = '/get-started'}
          >
            🚀 Start Free Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
