import React, { useState } from 'react';
import '../styles/opportunity.css';

const Opportunity = () => {
  const [expandedStream, setExpandedStream] = useState(null);

  const incomeStreams = [
    {
      id: 'isp',
      code: 'ISP',
      name: 'Individual Sales Profit',
      icon: '💰',
      shortDesc: 'Commission on direct sales and recruitment',
      fullDesc: 'Earn commission ranging from 18-30% based on your membership tier. Paid monthly on all direct sales and personal recruitment.',
      tiers: {
        Bronze: '18%',
        Copper: '22%',
        Silver: '25%',
        Gold: '28%',
        Platinum: '30%'
      }
    },
    {
      id: 'qpb',
      code: 'QPB',
      name: 'Quick Pathfinder Bonus',
      icon: '⚡',
      shortDesc: 'Fast-start bonus for your first 90 days',
      fullDesc: 'Get 7.5% on your first 3 invites and 10% on subsequent sets. Only available during your first 90 days to help you build momentum fast!',
      highlight: 'First 90 Days Only'
    },
    {
      id: 'tsc',
      code: 'TSC',
      name: 'Team Sales Commission',
      icon: '👥',
      shortDesc: 'Passive income from your team depth',
      fullDesc: 'Earn from up to 10 generations deep with decreasing percentages: 10% at generation 2, down to 1% at generations 6-10.',
      depth: 'Up to 10 Generations'
    },
    {
      id: 'tli',
      code: 'TLI',
      name: 'Team Leadership Incentive',
      icon: '🚀',
      shortDesc: 'Quarterly distribution with 10 celestial levels',
      fullDesc: 'Achieve 10 celestial levels from ☿️ Swift as Mercury (R2.5K-R10K) to ♾️ Eternal as the Cosmos (R3M-R5M). Minimum guarantees plus pool bonuses based on team structure.',
      levels: '10 Celestial Levels'
    },
    {
      id: 'cea',
      code: 'CEA',
      name: 'CEO Awards',
      icon: '🏆',
      shortDesc: 'Exclusive recognition for exceptional leadership',
      fullDesc: 'Receive luxury trips, cash bonuses, and special recognition for exceptional leadership performance and contribution to the Z2B community.',
      exclusive: true
    },
    {
      id: 'cec',
      code: 'CEC',
      name: 'CEO Competitions',
      icon: '🎯',
      shortDesc: 'Quarterly performance contests',
      fullDesc: 'Compete in quarterly challenges for cash prizes and bonuses. Top performers among legacy builders receive additional rewards and recognition.',
      frequency: 'Quarterly'
    },
    {
      id: 'mkt',
      code: 'MKT',
      name: 'Marketplace Sales',
      icon: '🏪',
      shortDesc: 'Sell your digital products',
      fullDesc: 'Sellers retain 95% of sales on digital products! Only 5% platform fee for courses, templates, and tools sold on the Z2B marketplace.',
      retention: '95% Seller Retention'
    }
  ];

  const toggleStream = (id) => {
    setExpandedStream(expandedStream === id ? null : id);
  };

  return (
    <div className="opportunity-container">
      {/* Hero Section */}
      <div className="opportunity-hero">
        <h1 className="hero-title">
          <span className="hero-icon">💎</span>
          Earn by Sharing Transformation
        </h1>
        <p className="hero-subtitle">
          Transform First. Share Authentically. Get Rewarded.
        </p>
        <p className="hero-description">
          After experiencing your own transformation, you can share this life-changing platform
          with others and get rewarded for spreading the mission. Our multi-generational
          compensation structure goes <strong>10 levels deep</strong>, creating sustainable
          income for authentic legacy builders.
        </p>
      </div>

      {/* Income Streams Grid */}
      <div className="income-streams-section">
        <h2 className="section-title">
          7 Ways to Earn with Z2B
          <span className="title-underline"></span>
        </h2>

        <div className="income-streams-grid">
          {incomeStreams.map((stream) => (
            <div
              key={stream.id}
              className={`income-stream-card ${expandedStream === stream.id ? 'expanded' : ''}`}
              onClick={() => toggleStream(stream.id)}
            >
              <div className="stream-header">
                <div className="stream-icon">{stream.icon}</div>
                <div className="stream-info">
                  <div className="stream-code">{stream.code}</div>
                  <h3 className="stream-name">{stream.name}</h3>
                </div>
                <div className="expand-icon">{expandedStream === stream.id ? '−' : '+'}</div>
              </div>

              <p className="stream-short-desc">{stream.shortDesc}</p>

              {expandedStream === stream.id && (
                <div className="stream-details">
                  <p className="stream-full-desc">{stream.fullDesc}</p>

                  {stream.tiers && (
                    <div className="tiers-breakdown">
                      <h4>Commission by Tier:</h4>
                      <div className="tiers-grid">
                        {Object.entries(stream.tiers).map(([tier, percentage]) => (
                          <div key={tier} className="tier-item">
                            <span className="tier-name">{tier}</span>
                            <span className="tier-value">{percentage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stream.highlight && (
                    <div className="stream-badge highlight-badge">
                      ⏰ {stream.highlight}
                    </div>
                  )}

                  {stream.depth && (
                    <div className="stream-badge info-badge">
                      🌐 {stream.depth}
                    </div>
                  )}

                  {stream.levels && (
                    <>
                      <div className="stream-badge info-badge">
                        ⭐ {stream.levels}
                      </div>
                      <div className="tli-levels-preview">
                        <h5>10 Celestial Levels:</h5>
                        <ol className="levels-list">
                          <li>☿️ Swift as Mercury (R2.5K-R10K)</li>
                          <li>♀️ Bright as Venus (R5K-R20K)</li>
                          <li>🌍 Solid as Earth (R10K-R40K)</li>
                          <li>♂️ Fierce as Mars (R25K-R80K)</li>
                          <li>🪐 Big as Jupiter (R50K-R150K)</li>
                          <li>💫 Mama I Made It (R100K-R300K)</li>
                          <li>🔵 Deep as Neptune (R250K-R600K)</li>
                          <li>⭐ Bright as a Star (R500K-R1.2M)</li>
                          <li>☀️ Powerful as the Sun (R1M-R2.5M)</li>
                          <li>♾️ Eternal as the Cosmos (R3M-R5M)</li>
                        </ol>
                        <button
                          className="btn-view-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = '#tli';
                          }}
                        >
                          🚀 View Full TLI Challenge
                        </button>
                      </div>
                    </>
                  )}

                  {stream.exclusive && (
                    <div className="stream-badge exclusive-badge">
                      👑 Exclusive Recognition
                    </div>
                  )}

                  {stream.frequency && (
                    <div className="stream-badge info-badge">
                      📅 {stream.frequency}
                    </div>
                  )}

                  {stream.retention && (
                    <div className="stream-badge success-badge">
                      ✨ {stream.retention}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="opportunity-cta">
        <h2>Ready to Build Your Legacy?</h2>
        <p>Join thousands of legacy builders earning through authentic transformation sharing.</p>
        <div className="cta-buttons">
          <button className="btn-primary" onClick={() => window.location.href = '#tiers'}>
            🚀 Choose Your Tier
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = '#tli'}>
            📊 Explore TLI Challenge
          </button>
        </div>
      </div>

      {/* Ethical Notice */}
      <div className="ethical-notice">
        <p>
          <strong>Our Commitment:</strong> We believe in personal transformation first.
          All income claims represent potential earnings based on tier and performance.
          Individual results vary. Success requires authentic engagement, not exaggerated promises.
        </p>
      </div>
    </div>
  );
};

export default Opportunity;
