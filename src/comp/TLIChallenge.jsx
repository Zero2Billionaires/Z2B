import React, { useState } from 'react';
import '../styles/tli-challenge.css';

const TLIChallenge = () => {
  const [activeGoal, setActiveGoal] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [goalForm, setGoalForm] = useState({
    specific: '',
    measurable: '',
    attainable: '',
    deadline: '',
    why: ''
  });

  const tliLevels = [
    {
      level: 1,
      name: 'Swift as Mercury',
      icon: '☿️',
      earnings: 'R2.5K-R10K',
      requirement: '1,800 PV/month',
      color: '#C0C0C0'
    },
    {
      level: 2,
      name: 'Bright as Venus',
      icon: '♀️',
      earnings: 'R5K-R20K',
      requirement: '3,000 PV/month',
      leaders: '2 Level 1 leaders',
      color: '#FFD700'
    },
    {
      level: 3,
      name: 'Solid as Earth',
      icon: '🌍',
      earnings: 'R10K-R40K',
      requirement: '6,000 PV/month',
      leaders: '2 Level 2 leaders',
      color: '#4169E1'
    },
    {
      level: 4,
      name: 'Fierce as Mars',
      icon: '♂️',
      earnings: 'R25K-R80K',
      requirement: '12,000 PV/month',
      leaders: '2 Level 3 leaders',
      tier: 'Gold+ tier required',
      color: '#DC143C'
    },
    {
      level: 5,
      name: 'Big as Jupiter',
      icon: '🪐',
      earnings: 'R50K-R150K',
      requirement: '25,000 PV/month',
      leaders: '2 Level 4 leaders',
      tier: 'Gold+ tier required',
      color: '#FF8C00'
    },
    {
      level: 6,
      name: 'Mama I Made It',
      icon: '💫',
      earnings: 'R100K-R300K',
      requirement: '50,000 PV/month',
      leaders: '2 Level 5 leaders',
      tier: 'Platinum only',
      color: '#9370DB'
    },
    {
      level: 7,
      name: 'Deep as Neptune',
      icon: '🔵',
      earnings: 'R250K-R600K',
      requirement: '75,000 PV/month',
      leaders: '7 Level 5 leaders',
      tier: 'Platinum only',
      color: '#1E90FF'
    },
    {
      level: 8,
      name: 'Bright as a Star',
      icon: '⭐',
      earnings: 'R500K-R1.2M',
      requirement: '100,000 PV/month',
      leaders: '7 Level 6 leaders',
      tier: 'Platinum only',
      color: '#FFD700'
    },
    {
      level: 9,
      name: 'Powerful as the Sun',
      icon: '☀️',
      earnings: 'R1M-R2.5M',
      requirement: '150,000 PV/month',
      leaders: '7 Level 7 leaders',
      tier: 'Platinum only',
      color: '#FFA500'
    },
    {
      level: 10,
      name: 'Eternal as the Cosmos',
      icon: '♾️',
      earnings: 'R3M-R5M',
      requirement: '200,000 PV/month',
      leaders: '7 Level 8 leaders',
      tier: 'Platinum only',
      color: '#9400D3'
    }
  ];

  const handleSetGoal = (level) => {
    setSelectedLevel(level);
    setShowGoalForm(true);
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const newGoal = {
      level: selectedLevel.level,
      levelName: selectedLevel.name,
      icon: selectedLevel.icon,
      ...goalForm,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const savedGoals = JSON.parse(localStorage.getItem('tliGoals') || '[]');
    savedGoals.push(newGoal);
    localStorage.setItem('tliGoals', JSON.stringify(savedGoals));

    setActiveGoal(newGoal);
    setShowGoalForm(false);
    setGoalForm({
      specific: '',
      measurable: '',
      attainable: '',
      deadline: '',
      why: ''
    });
  };

  const shareToSocial = (platform) => {
    const goal = activeGoal || selectedLevel;
    const text = `🎯 I'm committed to reaching ${goal.icon} ${goal.levelName} with Z2B Legacy Builders!

My SMART Goal:
🎯 Target: ${goalForm.specific || goal.name}
📊 Measurable: ${goalForm.measurable || goal.earnings}
⏰ Deadline: ${goalForm.deadline || '90 days'}

Join me on this transformation journey! #Z2BLegacyBuilders #TLIChallenge`;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=https://z2blegacybuilders.co.za&quote=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://z2blegacybuilders.co.za`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="tli-challenge-container">
      {/* Hero Section */}
      <div className="tli-hero">
        <h1 className="tli-title">
          <span className="tli-hero-icon">🚀</span>
          TLI Challenge: Set Your SMART Goals
        </h1>
        <p className="tli-subtitle">
          10 Celestial Levels • Minimum Guarantees • Pool Bonuses
        </p>
        <p className="tli-description">
          Set a <strong>S</strong>pecific, <strong>M</strong>easurable, <strong>A</strong>ttainable,
          <strong>R</strong>elevant, and <strong>T</strong>ime-bound goal. Share your commitment with the world!
        </p>
      </div>

      {/* TLI Levels Grid */}
      <div className="tli-levels-grid">
        {tliLevels.map((level) => (
          <div
            key={level.level}
            className="tli-level-card"
            style={{ borderColor: level.color }}
          >
            <div className="level-header">
              <span className="level-icon" style={{ fontSize: '3rem' }}>{level.icon}</span>
              <div className="level-info">
                <span className="level-number">Level {level.level}</span>
                <h3 className="level-name" style={{ color: level.color }}>{level.name}</h3>
              </div>
            </div>

            <div className="level-earnings">{level.earnings}</div>

            <div className="level-requirements">
              <div className="req-item">
                <span className="req-icon">💼</span>
                <span>{level.requirement}</span>
              </div>
              {level.leaders && (
                <div className="req-item">
                  <span className="req-icon">👥</span>
                  <span>{level.leaders}</span>
                </div>
              )}
              {level.tier && (
                <div className="req-badge">{level.tier}</div>
              )}
            </div>

            <button
              className="btn-set-goal"
              onClick={() => handleSetGoal(level)}
              style={{ borderColor: level.color }}
            >
              Set SMART Goal
            </button>
          </div>
        ))}
      </div>

      {/* SMART Goal Form Modal */}
      {showGoalForm && selectedLevel && (
        <div className="modal-overlay" onClick={() => setShowGoalForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedLevel.icon} Set Your SMART Goal
              </h2>
              <button className="modal-close" onClick={() => setShowGoalForm(false)}>
                ✕
              </button>
            </div>

            <div className="goal-level-info">
              <h3>{selectedLevel.name}</h3>
              <p>{selectedLevel.earnings} • Level {selectedLevel.level}</p>
            </div>

            <form onSubmit={handleGoalSubmit} className="smart-goal-form">
              <div className="form-field">
                <label>
                  <span className="smart-letter">S</span>pecific
                  <span className="field-hint">What exactly will you achieve?</span>
                </label>
                <textarea
                  value={goalForm.specific}
                  onChange={(e) => setGoalForm({...goalForm, specific: e.target.value})}
                  placeholder={`I will reach ${selectedLevel.name} by...`}
                  required
                  rows={3}
                />
              </div>

              <div className="form-field">
                <label>
                  <span className="smart-letter">M</span>easurable
                  <span className="field-hint">How will you track progress?</span>
                </label>
                <input
                  type="text"
                  value={goalForm.measurable}
                  onChange={(e) => setGoalForm({...goalForm, measurable: e.target.value})}
                  placeholder={`Track ${selectedLevel.requirement}`}
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  <span className="smart-letter">A</span>ttainable
                  <span className="field-hint">What actions will you take?</span>
                </label>
                <textarea
                  value={goalForm.attainable}
                  onChange={(e) => setGoalForm({...goalForm, attainable: e.target.value})}
                  placeholder="Daily actions: prospecting, training, follow-ups..."
                  required
                  rows={3}
                />
              </div>

              <div className="form-field">
                <label>
                  <span className="smart-letter">T</span>ime-bound
                  <span className="field-hint">When will you achieve this?</span>
                </label>
                <input
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-field">
                <label>
                  <span className="smart-letter">💎</span> Your WHY
                  <span className="field-hint">Why is this goal important to you?</span>
                </label>
                <textarea
                  value={goalForm.why}
                  onChange={(e) => setGoalForm({...goalForm, why: e.target.value})}
                  placeholder="This goal will allow me to..."
                  required
                  rows={3}
                />
              </div>

              <button type="submit" className="btn-submit-goal">
                🎯 Commit to My Goal
              </button>
            </form>

            <div className="share-section">
              <p className="share-title">Share Your Commitment:</p>
              <div className="share-buttons">
                <button className="share-btn twitter" onClick={() => shareToSocial('twitter')}>
                  🐦 Twitter
                </button>
                <button className="share-btn facebook" onClick={() => shareToSocial('facebook')}>
                  📘 Facebook
                </button>
                <button className="share-btn linkedin" onClick={() => shareToSocial('linkedin')}>
                  💼 LinkedIn
                </button>
                <button className="share-btn whatsapp" onClick={() => shareToSocial('whatsapp')}>
                  💬 WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Stories CTA */}
      <div className="tli-cta">
        <h2>Ready to Start Your Journey?</h2>
        <p>Set your SMART goal, share it with the world, and let's build your legacy together!</p>
        <button className="btn-cta-primary" onClick={() => window.location.href = '#tiers'}>
          🚀 Choose Your Tier
        </button>
      </div>
    </div>
  );
};

export default TLIChallenge;
