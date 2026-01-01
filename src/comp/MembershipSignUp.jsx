import React, { useState, useEffect } from 'react';
import '../styles/membership-signup.css';

const MembershipSignUp = ({ onNavigate, onComplete }) => {
  const [tierData, setTierData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('selectedTier');
    if (saved) {
      setTierData(JSON.parse(saved));
    } else {
      if (onNavigate) {
        onNavigate('tiers');
      }
    }
  }, [onNavigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const membershipData = { ...formData, tier: tierData, createdAt: new Date().toISOString() };
      const { password, confirmPassword, ...safeData } = membershipData;
      localStorage.setItem('pendingMembership', JSON.stringify(safeData));
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (onComplete) {
        onComplete(membershipData);
      } else if (onNavigate) {
        onNavigate('payment');
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!tierData) {
    return <div className="membership-signup-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="membership-signup-container">
      <div className="signup-content">
        <div className="signup-header">
          <h1>Complete Your Membership</h1>
          <p className="signup-tagline">Join Z2B Legacy Builders - {tierData.name}</p>
        </div>
        <div className="tier-summary">
          <div className="tier-summary-badge">{tierData.emoji}</div>
          <div className="tier-summary-info">
            <h3>{tierData.name}</h3>
            <p className="tier-summary-price">R{tierData.price} <span>once-off</span></p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} className={errors.firstName ? 'error' : ''} disabled={loading} />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} className={errors.lastName ? 'error' : ''} disabled={loading} />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={errors.email ? 'error' : ''} disabled={loading} placeholder="your@email.com" />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className={errors.phone ? 'error' : ''} disabled={loading} placeholder="+27 123 456 789" />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Account Security</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Create Password *</label>
                <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className={errors.password ? 'error' : ''} disabled={loading} placeholder="Min. 8 characters" />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? 'error' : ''} disabled={loading} placeholder="Re-enter password" />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Referral Code (Optional)</h3>
            <div className="form-group">
              <label htmlFor="referralCode">Referred by a member?</label>
              <input id="referralCode" name="referralCode" type="text" value={formData.referralCode} onChange={handleChange} disabled={loading} placeholder="Enter referral code" />
              <small>Leave blank if not referred</small>
            </div>
          </div>
          <div className="form-section">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} disabled={loading} />
                <span>I agree to the Terms and Conditions and Privacy Policy</span>
              </label>
              {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
            </div>
          </div>
          {errors.submit && <div className="alert alert-error"><span className="alert-icon">⚠️</span>{errors.submit}</div>}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => onNavigate && onNavigate('tiers')} disabled={loading}>← Change Tier</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Processing...' : 'Continue to Payment →'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembershipSignUp;
