import React, { useState } from 'react';
import '../styles/floatingupsell.css';

const FloatingUpsell = ({ onNavigate }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleUpgrade = () => {
    if (onNavigate) {
      onNavigate('signup');
    }
  };

  if (isMinimized) {
    return (
      <div className="floating-upsell-minimized" onClick={() => setIsMinimized(false)}>
        <span className="pulse-icon">💎</span>
      </div>
    );
  }

  return (
    <>
      <div className="floating-upsell-container">
        <button
          className="floating-upsell-close"
          onClick={() => setIsMinimized(true)}
          aria-label="Minimize"
        >
          ─
        </button>

        <div className="floating-upsell-content">
          <div className="floating-upsell-icon">💎</div>
          <div className="floating-upsell-text">
            <div className="floating-upsell-title">Unlock Your Legacy</div>
            <div className="floating-upsell-subtitle">Start Building Today</div>
          </div>
          <button
            className="floating-upsell-btn"
            onClick={() => setShowModal(true)}
          >
            Join Now
          </button>
        </div>
      </div>

      {/* Upsell Modal */}
      {showModal && (
        <div className="floating-upsell-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="floating-upsell-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <div className="modal-header">
              <h2>🎯 Ready to Build Your Legacy?</h2>
              <p className="modal-tagline">Join Zero to Billionaires Today</p>
            </div>

            <div className="modal-benefits">
              <h3>What You'll Get:</h3>
              <ul>
                <li>
                  <span className="benefit-icon">✅</span>
                  <div>
                    <strong>Complete Vision Board Access</strong>
                    <p>Visualize and manifest your legacy</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">✅</span>
                  <div>
                    <strong>All 7 Milestone Journeys</strong>
                    <p>From R0 to Billionaire Mindset</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">✅</span>
                  <div>
                    <strong>AI Coach ManLaw</strong>
                    <p>24/7 faith-based business coaching</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">✅</span>
                  <div>
                    <strong>Exclusive Community Access</strong>
                    <p>Connect with legacy builders worldwide</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">✅</span>
                  <div>
                    <strong>Referral Earnings</strong>
                    <p>Build your income while you grow</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="modal-pricing">
              <div className="price-highlight">
                <span className="price-label">Bronze Legacy Builder</span>
                <span className="price-amount">R480/month</span>
              </div>
              <p className="price-note">Start your legacy journey today!</p>
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#c4a76f', opacity: 0.8 }}>
                Other tiers available: Silver R980 • Gold R1980 • Platinum R4980
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-upgrade-now"
                onClick={handleUpgrade}
              >
                🚀 Start My Journey Now
              </button>
              <button
                className="btn-maybe-later"
                onClick={() => setShowModal(false)}
              >
                Maybe Later
              </button>
            </div>

            <div className="modal-guarantee">
              <p>🔒 <strong>30-Day Money-Back Guarantee</strong></p>
              <p>Your success is our commitment</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingUpsell;
