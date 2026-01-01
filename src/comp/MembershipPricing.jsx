import React, { useState } from 'react';
import '../styles/membership.css';

const MembershipPricing = ({ onTierSelected }) => {
  const [selectedTier, setSelectedTier] = useState('');
  const [showBetaPricing, setShowBetaPricing] = useState(true);

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze Legacy Builder',
      icon: '🥉',
      regularPrice: 960,
      betaPrice: 480,
      commission: '18%',
      apps: '2 apps',
      aiFuel: '25 daily',
      features: [
        '18% ISP commission',
        'Coach Manlaw + 1 app choice',
        '25 AI Fuel daily',
        'Team bonuses from generation 2'
      ],
      badge: ''
    },
    {
      id: 'copper',
      name: 'Copper Legacy Builder',
      icon: '🟠',
      regularPrice: 1960,
      betaPrice: 980,
      commission: '22%',
      apps: '3 apps',
      aiFuel: '60 daily',
      features: [
        '22% ISP commission',
        'Coach Manlaw + 2 app choices',
        '60 AI Fuel daily',
        'Up to 5 generation team structure'
      ],
      badge: ''
    },
    {
      id: 'silver',
      name: 'Silver Legacy Builder',
      icon: '🥈',
      regularPrice: 2960,
      betaPrice: 1480,
      commission: '25%',
      apps: '4 apps',
      aiFuel: '120 daily',
      features: [
        '25% ISP commission',
        'Coach Manlaw + 3 app choices',
        '120 AI Fuel daily',
        'Leadership incentive levels 1-3'
      ],
      badge: ''
    },
    {
      id: 'gold',
      name: 'Gold Legacy Builder',
      icon: '🥇',
      regularPrice: 5960,
      betaPrice: 2980,
      commission: '28%',
      apps: '5 apps',
      aiFuel: '250 daily',
      features: [
        '28% ISP commission',
        'Coach Manlaw + 4 app choices',
        '250 AI Fuel daily',
        'Quarterly profit sharing',
        'VIP support'
      ],
      badge: '⭐ Most Popular'
    },
    {
      id: 'platinum',
      name: 'Platinum Legacy Builder',
      icon: '💎',
      regularPrice: 9960,
      betaPrice: 4980,
      commission: '30%',
      apps: 'All 12 apps',
      aiFuel: '500 daily',
      features: [
        '30% ISP commission',
        'Coach Manlaw + All 11 Z2B apps',
        '500 AI Fuel daily',
        'All 10 leadership levels',
        'Done-for-you campaigns',
        'Personal coach'
      ],
      badge: '👑 Premium'
    }
  ];

  // Calculate PV points dynamically based on price (PV = price / 20)
  const calculatePV = (tier) => {
    const price = showBetaPricing ? tier.betaPrice : tier.regularPrice;
    return Math.floor(price / 20);
  };

  const handleTierSelect = (tierId) => {
    setSelectedTier(tierId);
  };

  const handleContinue = () => {
    if (selectedTier) {
      const tier = tiers.find(t => t.id === selectedTier);
      const price = showBetaPricing ? tier.betaPrice : tier.regularPrice;
      const pvPoints = calculatePV(tier);

      localStorage.setItem('selectedTier', JSON.stringify({
        tier: selectedTier,
        name: tier.name,
        price: price,
        pvPoints: pvPoints,
        pricingType: showBetaPricing ? 'beta' : 'regular'
      }));

      if (onTierSelected) {
        onTierSelected(selectedTier);
      }
    }
  };

  return (
    <div className="membership-container">
      <div className="membership-header">
        <div className="tee-badge transformation">🔄 Transformation</div>
        <h1>Choose Your Legacy Path</h1>
        <p className="membership-subtitle">
          Milestone 1 is FREE - You've completed your Vision Board! 🎉
        </p>
        <p className="membership-description">
          To unlock Milestones 2-7 and build your legacy, select your membership tier below.
        </p>

        <div className="pricing-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showBetaPricing}
              onChange={(e) => setShowBetaPricing(e.target.checked)}
            />
            <span className="toggle-text">
              {showBetaPricing ? '🎯 Beta Pricing (50% OFF)' : '💼 Regular Pricing'}
            </span>
          </label>
        </div>

        {showBetaPricing && (
          <div className="scarcity-banner">
            <div className="scarcity-icon">⚡</div>
            <div className="scarcity-content">
              <h3>Limited Beta Offer - First 100 Builders Only!</h3>
              <p>
                Lock in 50% OFF forever as a founding member. After 100 builders,
                pricing increases to 30% discount (until 1,000 builders), then 20% discount,
                and eventually full price. <strong>Don't miss this opportunity!</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="tiers-grid">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`tier-card ${selectedTier === tier.id ? 'selected' : ''} ${tier.id === 'gold' ? 'popular' : ''}`}
            onClick={() => handleTierSelect(tier.id)}
          >
            {tier.badge && <div className="tier-badge">{tier.badge}</div>}

            <div className="tier-icon">{tier.icon}</div>
            <h2 className="tier-name">{tier.name}</h2>

            <div className="tier-price">
              <span className="currency">R</span>
              <span className="amount">{showBetaPricing ? tier.betaPrice : tier.regularPrice}</span>
              {showBetaPricing && (
                <span className="original-price">R{tier.regularPrice}</span>
              )}
            </div>

            <div className="tier-highlights">
              <div className="highlight">
                <span className="highlight-icon">💎</span>
                <span className="highlight-text">{tier.commission} Commission</span>
              </div>
              <div className="highlight">
                <span className="highlight-icon">📱</span>
                <span className="highlight-text">{tier.apps}</span>
              </div>
              <div className="highlight">
                <span className="highlight-icon">📊</span>
                <span className="highlight-text">{calculatePV(tier)} PV Points</span>
              </div>
              <div className="highlight">
                <span className="highlight-icon">⚡</span>
                <span className="highlight-text">{tier.aiFuel} AI Fuel</span>
              </div>
            </div>

            <div className="tier-features">
              <h3>Features:</h3>
              <ul>
                {tier.features.map((feature, index) => (
                  <li key={index}>✅ {feature}</li>
                ))}
              </ul>
            </div>

            <div className="tier-select-indicator">
              {selectedTier === tier.id ? '✅ Selected' : 'Select This Tier'}
            </div>
          </div>
        ))}
      </div>

      <div className="membership-info">
        <div className="info-box">
          <h3>⚡ Pay-As-You-Go Model</h3>
          <p>
            No monthly subscriptions! Your AI Fuel credits last 3 months with rollover capability.
            Only pay when you need to refuel.
          </p>
        </div>
      </div>

      <div className="membership-actions">
        <button
          className="btn-continue"
          onClick={handleContinue}
          disabled={!selectedTier}
        >
          {selectedTier ? '🚀 Continue to Milestones 2-7' : '👆 Select a Tier Above'}
        </button>
      </div>

      <div className="membership-footer">
        <p className="footer-note">
          💡 Your selected tier unlocks access to Milestones 2-7 and all associated benefits.
          You can upgrade your tier at any time.
        </p>
      </div>
    </div>
  );
};

export default MembershipPricing;
