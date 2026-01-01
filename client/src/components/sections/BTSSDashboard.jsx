import React, { useState, useEffect } from 'react';
import './BTSSDashboard.css';

const BTSSDashboard = () => {
  const [btssScore, setBtssScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentScores, setAssessmentScores] = useState({
    mindsetMysteryScore: 50,
    moneyMovesScore: 50,
    legacyMissionScore: 50,
    movementMomentumScore: 50
  });

  useEffect(() => {
    loadBTSSScore();
  }, []);

  const loadBTSSScore = async () => {
    try {
      // TODO: Get actual user ID from auth context
      const userId = 'temp-user-id';
      const response = await fetch(`http://localhost:5000/api/btss/${userId}`);

      if (response.ok) {
        const data = await response.json();
        setBtssScore(data);
      }
    } catch (error) {
      console.error('Error loading BTSS score:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAssessment = async () => {
    try {
      setIsLoading(true);
      // TODO: Get actual user ID from auth context
      const userId = 'temp-user-id';

      const response = await fetch('http://localhost:5000/api/btss/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...assessmentScores,
          assessmentType: 'self'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBtssScore(data.btssScore);
        setShowAssessment(false);
        alert(`Assessment Complete!\n\nOverall BTSS: ${data.insights.overallBTSS}/100\nWeakest Leg: ${data.insights.weakestLeg}\nTable Stability: ${data.insights.tableStability}\n\n${data.insights.focusArea}`);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getLegColor = (score) => {
    if (score >= 76) return '#00ff88';
    if (score >= 51) return '#d4af37';
    if (score >= 26) return '#ff9500';
    return '#ff3333';
  };

  const getPhase = (score) => {
    if (score >= 76) return 'Mastery';
    if (score >= 51) return 'Strength';
    if (score >= 26) return 'Growth';
    return 'Foundation';
  };

  const fourLegs = [
    {
      name: 'Mindset Mystery',
      score: btssScore?.mindsetMysteryScore || 0,
      key: 'mindsetMysteryScore',
      icon: '🧠',
      description: 'Identity in Christ, belief, vision, spiritual alignment'
    },
    {
      name: 'Money Moves',
      score: btssScore?.moneyMovesScore || 0,
      key: 'moneyMovesScore',
      icon: '💰',
      description: 'Earn, multiply, protect; build scalable systems'
    },
    {
      name: 'Legacy Mission',
      score: btssScore?.legacyMissionScore || 0,
      key: 'legacyMissionScore',
      icon: '🏛️',
      description: 'Create purpose-driven systems that outlive you'
    },
    {
      name: 'Movement Momentum',
      score: btssScore?.movementMomentumScore || 0,
      key: 'movementMomentumScore',
      icon: '🚀',
      description: 'Community, EQ, networking, visibility'
    }
  ];

  if (isLoading && !btssScore) {
    return (
      <div className="btss-dashboard loading">
        <div className="loader"></div>
        <p>Loading your Billionaire Table...</p>
      </div>
    );
  }

  if (!btssScore && !showAssessment) {
    return (
      <div className="btss-dashboard no-score">
        <div className="no-score-content">
          <h2>🎯 Assess Your Billionaire Table</h2>
          <p>Take your first BTSS assessment to understand the stability of your Four Legs and discover which areas need focus.</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowAssessment(true)}
          >
            Take BTSS Assessment
          </button>
        </div>
      </div>
    );
  }

  if (showAssessment) {
    return (
      <div className="btss-dashboard assessment-mode">
        <h2>BTSS Self-Assessment</h2>
        <p className="assessment-intro">
          Rate each leg of your billionaire table from 0-100 based on your current state.
        </p>

        <div className="assessment-form">
          {fourLegs.map((leg) => (
            <div key={leg.key} className="assessment-item">
              <div className="assessment-header">
                <span className="leg-icon">{leg.icon}</span>
                <div>
                  <h3>{leg.name}</h3>
                  <p>{leg.description}</p>
                </div>
              </div>

              <div className="score-input">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessmentScores[leg.key]}
                  onChange={(e) =>
                    setAssessmentScores(prev => ({
                      ...prev,
                      [leg.key]: parseInt(e.target.value)
                    }))
                  }
                  style={{
                    background: `linear-gradient(to right, ${getLegColor(assessmentScores[leg.key])} 0%, ${getLegColor(assessmentScores[leg.key])} ${assessmentScores[leg.key]}%, rgba(255,255,255,0.1) ${assessmentScores[leg.key]}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
                <span className="score-value">{assessmentScores[leg.key]}/100</span>
              </div>
            </div>
          ))}
        </div>

        <div className="assessment-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowAssessment(false)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={submitAssessment}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="btss-dashboard">
      <div className="btss-header">
        <div>
          <h2>Your Billionaire Table</h2>
          <p className="btss-subtitle">The Four Legs Framework</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setShowAssessment(true)}
        >
          New Assessment
        </button>
      </div>

      <div className="btss-overview">
        <div className="btss-score-card">
          <div className="score-label">Overall BTSS</div>
          <div className="score-value">{btssScore.overallBTSS}<span>/100</span></div>
          <div className="score-phase">{btssScore.tableStability}</div>
        </div>

        <div className="btss-insight-card">
          <div className="insight-item">
            <span className="insight-label">Weakest Leg:</span>
            <span className="insight-value weak">{btssScore.weakestLeg}</span>
          </div>
          <div className="insight-item">
            <span className="insight-label">Strongest Leg:</span>
            <span className="insight-value strong">{btssScore.strongestLeg}</span>
          </div>
        </div>
      </div>

      <div className="four-legs-grid">
        {fourLegs.map((leg, index) => (
          <div
            key={index}
            className={`leg-card ${btssScore.weakestLeg === leg.name ? 'weakest' : ''} ${btssScore.strongestLeg === leg.name ? 'strongest' : ''}`}
          >
            <div className="leg-header">
              <span className="leg-icon">{leg.icon}</span>
              <h3>{leg.name}</h3>
            </div>

            <div className="leg-score-container">
              <div className="leg-score-circle">
                <svg viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={getLegColor(leg.score)}
                    strokeWidth="8"
                    strokeDasharray={`${leg.score * 2.51} 251`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="leg-score-text">
                  <span className="score">{leg.score}</span>
                  <span className="max">/100</span>
                </div>
              </div>
            </div>

            <div className="leg-phase" style={{ color: getLegColor(leg.score) }}>
              {getPhase(leg.score)}
            </div>

            <p className="leg-description">{leg.description}</p>

            {btssScore.weakestLeg === leg.name && (
              <div className="leg-badge weak-badge">🎯 Focus Area</div>
            )}
            {btssScore.strongestLeg === leg.name && (
              <div className="leg-badge strong-badge">⭐ Strongest</div>
            )}
          </div>
        ))}
      </div>

      <div className="btss-footer">
        <p>💡 <strong>Legacy Builder Truth:</strong> Your table is only as strong as its weakest leg. Focus on strengthening your <strong>{btssScore.weakestLeg}</strong> to create breakthrough growth.</p>
      </div>
    </div>
  );
};

export default BTSSDashboard;
