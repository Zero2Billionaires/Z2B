import React, { useState, useEffect } from 'react';
import '../styles/payment.css';

const PaymentProcessing = ({ onNavigate, onBack }) => {
  const [tierData, setTierData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    // Load selected tier from localStorage
    const saved = localStorage.getItem('selectedTier');
    if (saved) {
      setTierData(JSON.parse(saved));
    }
  }, []);

  const handlePayment = (e) => {
    e.preventDefault();

    // TODO: Integrate with actual payment gateway (PayFast, Stripe, etc.)
    // For now, redirect to external payment page
    const paymentUrl = 'https://www.z2blegacybuilders.co.za/tier-upgrade-payment.html';

    // Pass tier data as URL parameters
    const params = new URLSearchParams({
      tier: tierData?.tier || '',
      price: tierData?.price || '',
      name: tierData?.name || ''
    });

    window.location.href = `${paymentUrl}?${params.toString()}`;
  };

  if (!tierData) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h2>⚠️ No Tier Selected</h2>
          <p>Please select a membership tier first.</p>
          <button className="btn-back" onClick={() => onNavigate && onNavigate('tiers')}>
            ← Back to Membership Tiers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        {/* Header */}
        <div className="payment-header">
          <h1>🔐 Secure Payment</h1>
          <p>Complete your {tierData.name} membership</p>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span className="summary-label">Membership Tier:</span>
            <span className="summary-value">{tierData.name}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">PV Points:</span>
            <span className="summary-value">{tierData.pvPoints} PV</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Pricing Type:</span>
            <span className="summary-value">
              {tierData.pricingType === 'beta' ? '🎉 Beta Pricing' : 'Regular Pricing'}
            </span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-total">
            <span className="total-label">Total Due:</span>
            <span className="total-value">R {tierData.price}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          <div className="methods-grid">
            <label className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <span className="method-icon">💳</span>
                <span className="method-name">Credit/Debit Card</span>
              </div>
            </label>

            <label className={`method-option ${paymentMethod === 'eft' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="eft"
                checked={paymentMethod === 'eft'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <span className="method-icon">🏦</span>
                <span className="method-name">EFT/Bank Transfer</span>
              </div>
            </label>

            <label className={`method-option ${paymentMethod === 'instant' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="instant"
                checked={paymentMethod === 'instant'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <span className="method-icon">⚡</span>
                <span className="method-name">Instant EFT</span>
              </div>
            </label>
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <span className="security-icon">🔒</span>
          <p>Your payment information is secure and encrypted</p>
        </div>

        {/* Action Buttons */}
        <div className="payment-actions">
          <button className="btn-back" onClick={() => onNavigate && onNavigate('tiers')}>
            ← Back to Tiers
          </button>
          <button className="btn-proceed" onClick={handlePayment}>
            Proceed to Payment →
          </button>
        </div>

        {/* What Happens Next */}
        <div className="next-steps">
          <h4>What happens next?</h4>
          <ul>
            <li>✓ Secure payment processing via PayFast</li>
            <li>✓ Instant account activation upon payment</li>
            <li>✓ Access to all ecosystem apps</li>
            <li>✓ Start earning through 7 income streams</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessing;
