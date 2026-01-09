import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/payment.css';

const PaymentProcessing = ({ onNavigate, onBack }) => {
  const navigate = useNavigate();
  const [tierData, setTierData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Load selected tier from localStorage
    const saved = localStorage.getItem('selectedTier');
    if (saved) {
      setTierData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    setShowBankDetails(paymentMethod === 'bank-deposit');
  }, [paymentMethod]);

  const handleYocoPayment = async () => {
    setProcessing(true);

    try {
      // Initialize Yoco inline checkout
      const yoco = new window.YocoSDK({
        publicKey: process.env.REACT_APP_YOCO_PUBLIC_KEY || 'pk_test_ed3c54a6gOol69qa7f45',
      });

      yoco.showPopup({
        amountInCents: parseInt(tierData.price) * 100, // Convert to cents
        currency: 'ZAR',
        name: `${tierData.name} Membership`,
        description: `Z2B ${tierData.name} Tier - ${tierData.pvPoints} PV`,
        callback: function (result) {
          if (result.error) {
            const errorMessage = result.error.message;
            console.error('Yoco error:', errorMessage);
            alert(`Payment failed: ${errorMessage}`);
            setProcessing(false);
          } else {
            // Payment successful
            console.log('Yoco payment token:', result.id);

            // Send token to backend for processing
            processYocoPayment(result.id);
          }
        },
      });
    } catch (error) {
      console.error('Yoco initialization error:', error);
      alert('Payment system error. Please try again or use Bank Deposit option.');
      setProcessing(false);
    }
  };

  const processYocoPayment = async (token) => {
    try {
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}/api/payment/yoco-charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token: token,
          amountInCents: parseInt(tierData.price) * 100,
          tier: tierData.tier,
          tierName: tierData.name,
          pvPoints: tierData.pvPoints,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Payment successful - redirect to dashboard
        alert('✅ Payment successful! Welcome to Z2B Legacy Builders!');
        localStorage.removeItem('selectedTier');
        navigate('/dashboard');
      } else {
        alert(`❌ Payment failed: ${data.message || 'Unknown error'}`);
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('❌ Payment processing failed. Please contact support.');
      setProcessing(false);
    }
  };

  const handleBankDeposit = () => {
    // User chose bank deposit - give them access immediately (pending verification)
    const confirmed = window.confirm(
      'After making your bank deposit, send proof of payment (POD) to 0774901639.\n\n' +
      'Click OK to access your dashboard now. Your account will be activated once payment is verified.'
    );

    if (confirmed) {
      localStorage.removeItem('selectedTier');
      navigate('/dashboard');
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      handleYocoPayment();
    } else if (paymentMethod === 'bank-deposit') {
      handleBankDeposit();
    } else if (paymentMethod === 'instant') {
      // Instant EFT - redirect to external page
      const paymentUrl = 'https://www.z2blegacybuilders.co.za/tier-upgrade-payment.html';
      const params = new URLSearchParams({
        tier: tierData?.tier || '',
        price: tierData?.price || '',
        name: tierData?.name || ''
      });
      window.location.href = `${paymentUrl}?${params.toString()}`;
    }
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
                <span className="method-name">Card Payment (Yoco)</span>
              </div>
            </label>

            <label className={`method-option ${paymentMethod === 'bank-deposit' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="bank-deposit"
                checked={paymentMethod === 'bank-deposit'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <span className="method-icon">🏦</span>
                <span className="method-name">Direct Bank Deposit</span>
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

        {/* Bank Deposit Details */}
        {showBankDetails && (
          <div className="bank-details" style={{
            background: 'linear-gradient(135deg, #2A1810 0%, #3A2820 100%)',
            border: '2px solid #FDB931',
            borderRadius: '12px',
            padding: '25px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#FDB931', marginBottom: '20px' }}>🏦 Bank Deposit Details</h3>
            <div style={{ background: '#1A0F0A', padding: '20px', borderRadius: '8px', marginBottom: '15px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#FDB931' }}>Bank Name:</strong>
                <p style={{ color: '#E8DCC8', fontSize: '1.1rem', margin: '5px 0' }}>NEDBANK</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#FDB931' }}>Account Name:</strong>
                <p style={{ color: '#E8DCC8', fontSize: '1.1rem', margin: '5px 0' }}>ZERO2BILLIONAIERS AMAVULANDLELA PTY LTD</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#FDB931' }}>Account Number:</strong>
                <p style={{ color: '#E8DCC8', fontSize: '1.3rem', fontWeight: 'bold', margin: '5px 0', fontFamily: 'monospace' }}>1318257727</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#FDB931' }}>Reference:</strong>
                <p style={{ color: '#E8DCC8', fontSize: '1.1rem', margin: '5px 0' }}>YOUR FULL NAMES</p>
              </div>
            </div>
            <div style={{ background: 'rgba(253, 185, 49, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #FDB931' }}>
              <p style={{ color: '#FDB931', margin: 0, fontSize: '1.05rem' }}>
                <strong>📸 AFTER DEPOSIT:</strong> Send Proof of Payment (POD) to <strong style={{ fontSize: '1.2rem' }}>0774901639</strong>
              </p>
            </div>
          </div>
        )}

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
          <button
            className="btn-proceed"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? 'Processing...' : (
              paymentMethod === 'bank-deposit'
                ? 'Confirm & Access Dashboard →'
                : 'Proceed to Payment →'
            )}
          </button>
        </div>

        {/* What Happens Next */}
        <div className="next-steps">
          <h4>What happens next?</h4>
          <ul>
            {paymentMethod === 'card' && (
              <>
                <li>✓ Secure card payment via Yoco</li>
                <li>✓ Instant account activation</li>
              </>
            )}
            {paymentMethod === 'bank-deposit' && (
              <>
                <li>✓ Make deposit to the bank account above</li>
                <li>✓ Send POD to 0774901639</li>
                <li>✓ Account activated upon verification</li>
              </>
            )}
            {paymentMethod === 'instant' && (
              <>
                <li>✓ Instant EFT payment</li>
                <li>✓ Quick account activation</li>
              </>
            )}
            <li>✓ Access to all ecosystem apps</li>
            <li>✓ Start earning through 7 income streams</li>
          </ul>
        </div>
      </div>

      {/* Yoco SDK Script */}
      <script src="https://js.yoco.com/sdk/v1/yoco-sdk-web.js"></script>
    </div>
  );
};

export default PaymentProcessing;
