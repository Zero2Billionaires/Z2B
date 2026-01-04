import React, { useState } from 'react';
import '../styles/opportunity.css';
import SignUpButton from './SignUpButton';

const Opportunity = ({ onNavigate }) => {
  const [expandedStream, setExpandedStream] = useState(null);

  const incomeStreams = [
    {
      id: 'isp',
      code: 'ISP',
      name: 'Individual Sales Profit',
      icon: '💰',
      shortDesc: 'Commission on direct sales and inviting new builders',
      fullDesc: 'Earn commission ranging from 18-30% based on your membership tier. Paid monthly on all direct sales and inviting new builders to the Z2B platform.',
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
      fullDesc: 'Unlocked when you invite 3 or multiple sets of 3 within the Z2B month calendar (4th of current month to 3rd of following month). Get 7.5% on your first 3 invites and 10% on subsequent sets of 3. Only available during your first 90 days to help you build momentum fast!',
      highlight: 'First 90 Days Only',
      hasCalendar: true
    },
    {
      id: 'tsc',
      code: 'TSC',
      name: 'Team Sales Commission',
      icon: '👥',
      shortDesc: 'Passive income from your team depth',
      fullDesc: 'Earn from up to 10 generations deep in your team structure. Build a deep network and earn passive income from every level!',
      depth: 'Up to 10 Generations',
      hasGenerations: true
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
      name: 'The Marketplace',
      icon: '🏪',
      shortDesc: 'Sell Your Digital Products Without the Headaches',
      fullDesc: 'You focus on creating. We handle the pricing, marketing, sales, and affiliates. List your apps, templates, or AI services on the Z2B Marketplace and earn 95% of your creator payout on every sale. We price the product to cover platform operations and affiliate rewards. Example: If you want to earn R100, you get R95 per sale. Z2B handles everything else — promotion, payments, and distribution. You build. You earn. We scale.',
      retention: '95% Creator Payout',
      hasExample: true,
      example: {
        yourEarning: 'R100',
        youReceive: 'R95',
        platform: 'R5 (covers marketing, sales & affiliates)'
      }
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

                  {stream.hasGenerations && (
                    <div className="generations-preview">
                      <h5>10 Generations Deep:</h5>
                      <div className="generations-grid">
                        <div className="gen-item"><span className="gen-num">Gen 1:</span> <span className="gen-val">Direct (ISP applies)</span></div>
                        <div className="gen-item"><span className="gen-num">Gen 2:</span> <span className="gen-val">10%</span></div>
                        <div className="gen-item"><span className="gen-num">Gen 3:</span> <span className="gen-val">5%</span></div>
                        <div className="gen-item"><span className="gen-num">Gen 4:</span> <span className="gen-val">3%</span></div>
                        <div className="gen-item"><span className="gen-num">Gen 5:</span> <span className="gen-val">2%</span></div>
                        <div className="gen-item"><span className="gen-num">Gen 6:</span> <span className="gen-val">1%</span></div>
                        <div className="gen-item"><span className="gen-num">Gen 7:</span> <span className="gen-val">1%</span></div>
                        <div className="gen-item"><span className="gen-num">Gen 8:</span> <span className="gen-val">1%</span></div>
                        <div className="gen-item"><span className="gen-num">Gen 9:</span> <span className="gen-val">1%</span></div>
                        <div className="gen-item"><span className="gen-num">Gen 10:</span> <span className="gen-val">1%</span></div>
                      </div>
                      <p className="gen-note">💡 Build deep, earn passively from your entire network!</p>
                    </div>
                  )}

                  {stream.hasCalendar && (
                    <div className="calendar-preview">
                      <h5>📅 Z2B Month Calendar:</h5>
                      <div className="calendar-info">
                        <div className="calendar-dates">
                          <span className="date-start">4th of Month</span>
                          <span className="date-arrow">→</span>
                          <span className="date-end">3rd of Next Month</span>
                        </div>
                        <div className="qpb-structure">
                          <div className="qpb-tier">
                            <span className="tier-icon">🥇</span>
                            <span className="tier-text">First 3 invites: <strong>7.5%</strong></span>
                          </div>
                          <div className="qpb-tier">
                            <span className="tier-icon">🏆</span>
                            <span className="tier-text">Each subsequent set of 3: <strong>10%</strong></span>
                          </div>
                        </div>
                        <p className="calendar-note">⚡ Unlock QPB by inviting 3 or multiple sets of 3 within each Z2B month!</p>
                      </div>
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
                            if (onNavigate) onNavigate('tli');
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

                  {stream.hasExample && stream.example && (
                    <div className="marketplace-example">
                      <h5>💡 Example Breakdown:</h5>
                      <div className="example-grid">
                        <div className="example-row">
                          <span className="example-label">You want to earn:</span>
                          <span className="example-value highlight">{stream.example.yourEarning}</span>
                        </div>
                        <div className="example-row">
                          <span className="example-label">You receive per sale:</span>
                          <span className="example-value success">{stream.example.youReceive}</span>
                        </div>
                        <div className="example-row">
                          <span className="example-label">Platform fee:</span>
                          <span className="example-value muted">{stream.example.platform}</span>
                        </div>
                      </div>
                      <p className="example-note">🚀 You build. You earn. We scale.</p>
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
          <SignUpButton
            onNavigate={onNavigate}
            variant="primary"
            size="large"
            text="🚀 Join Z2B Now"
          />
          <button className="btn-secondary" onClick={() => onNavigate && onNavigate('tli')}>
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
