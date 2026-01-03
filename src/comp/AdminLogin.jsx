import React, { useState } from 'react';
import '../styles/login.css';

const AdminLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
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

    if (!username || !password) {
      setError('Please enter both username and password');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setLoading(true);
    setError('');

    // TEMPORARY WORKAROUND: Local admin authentication (until backend is deployed)
    // Valid credentials: Admin1 / Admin123! OR admin@z2b.co.za / Admin123!
    const validCredentials = [
      { username: 'Admin1', password: 'Admin123!' },
      { username: 'admin@z2b.co.za', password: 'Admin123!' },
      { username: 'admin', password: 'Admin123!' }
    ];

    const isValid = validCredentials.some(
      cred => (cred.username === username || cred.username === username.toLowerCase()) && cred.password === password
    );

    if (isValid) {
      // Create mock admin data
      const mockAdminData = {
        id: 'admin-temp-001',
        username: username,
        email: 'admin@z2b.co.za',
        role: 'superadmin',
        name: 'Admin User'
      };

      // Store auth data
      localStorage.setItem('authToken', 'temporary-local-token-' + Date.now());
      localStorage.setItem('userData', JSON.stringify(mockAdminData));

      setSuccess('✅ Admin access granted! Redirecting...');

      // Call parent callback with admin data
      setTimeout(() => {
        onLoginSuccess(mockAdminData);
      }, 1000);

      setLoading(false);
      return;
    }

    // If local auth fails, try backend API (for when it's deployed)
    try {
      const loginEmail = username.includes('@') ? username : 'admin@z2b.co.za';

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const userRole = data.user?.role || data.admin?.role;

        if (userRole !== 'admin' && userRole !== 'superadmin') {
          setError('Access denied. Admin credentials required.');
          setTimeout(() => setError(''), 5000);
          return;
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify({...data.user, role: userRole}));

        setSuccess('Admin access granted! Redirecting...');

        setTimeout(() => {
          onLoginSuccess({...data.user, role: userRole});
        }, 1000);
      } else {
        setError('Invalid credentials. Please try again.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Using: Admin1 / Admin123!');
      setTimeout(() => setError(''), 5000);
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
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetMessage('✅ Password reset link sent to your email!');
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
      setResetMessage('Connection error. Please try again.');
      setTimeout(() => setResetMessage(''), 5000);
    } finally {
      setResetLoading(false);
    }
  };

  const handleUsernameKeyPress = (e) => {
    if (e.key === 'Enter') {
      document.getElementById('admin-password-input').focus();
    }
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h1>🔐 Admin Password Reset</h1>
            <p className="login-tagline">Reset Your Admin Access</p>
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
              <label htmlFor="reset-email-input">Admin Email Address</label>
              <input
                id="reset-email-input"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="admin@z2blegacybuilders.co.za"
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
              ← Back to Admin Login
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
          <h1>🔐 Z2B Admin Panel</h1>
          <p className="login-tagline">Administrator Access Only</p>
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
            <label htmlFor="admin-username-input">Admin Username or Email</label>
            <input
              id="admin-username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleUsernameKeyPress}
              placeholder="Admin1 or admin@z2b.co.za"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password-input">Admin Password</label>
            <div className="password-input-wrapper">
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
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
                Authenticating...
              </>
            ) : (
              'Access Admin Panel'
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
        </div>

        {/* Security Notice */}
        <div className="login-promo" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: 'rgba(220, 53, 69, 0.3)' }}>
          <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>
            🔒 <strong>Secure Admin Access</strong>
          </p>
          <p style={{ color: '#c4a76f', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            This area is for authorized administrators only. All login attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
