/**
 * BTSS Assessment Component
 * Four Legs of a Billionaire Table Assessment
 */

import { useState } from 'react';
import './BTSSAssessment.css';

const BTSSAssessment = ({ user, currentScore, onScoreUpdate }) => {
  const [scores, setScores] = useState({
    mindsetMysteryScore: currentScore?.mindsetMysteryScore || 50,
    moneyMovesScore: currentScore?.moneyMovesScore || 50,
    legacyMissionScore: currentScore?.legacyMissionScore || 50,
    movementMomentumScore: currentScore?.movementMomentumScore || 50
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const legs = [
    {
      key: 'mindsetMysteryScore',
      name: 'Mindset Mystery',
      icon: '🧠',
      description: 'Identity in Christ, belief systems, vision clarity'
    },
    {
      key: 'moneyMovesScore',
      name: 'Money Moves',
      icon: '💰',
      description: 'Income generation, investment, asset protection'
    },
    {
      key: 'legacyMissionScore',
      name: 'Legacy Mission',
      icon: '🏛️',
      description: 'Purpose-driven systems, generational wealth'
    },
    {
      key: 'movementMomentumScore',
      name: 'Movement Momentum',
      icon: '🚀',
      description: 'Community, networking, visibility'
    }
  ];

  const handleScoreChange = (key, value) => {
    setScores(prev => ({
      ...prev,
      [key]: parseInt(value)
    }));
  };

  const calculateOverall = () => {
    const values = Object.values(scores);
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  };

  const getScoreColor = (score) => {
    if (score >= 76) return '#10b981'; // Green
    if (score >= 51) return '#3b82f6'; // Blue
    if (score >= 26) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getPhase = (score) => {
    if (score >= 76) return 'Mastery';
    if (score >= 51) return 'Strength';
    if (score >= 26) return 'Growth';
    return 'Foundation';
  };

  const submitAssessment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/btss/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          ...scores,
          assessmentType: 'self',
          notes
        })
      });

      if (!response.ok) throw new Error('Failed to submit assessment');

      const data = await response.json();
      setResult(data);
      setSubmitted(true);
      onScoreUpdate(data.btssScore);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted && result) {
    return (
      <div className="btss-result">
        <div className="result-header">
          <h2>✅ Assessment Complete!</h2>
          <p>Your BTSS (Billionaire Table Support System) has been calculated</p>
        </div>

        <div className="result-overall">
          <div className="overall-score">
            <span className="score-label">Overall BTSS</span>
            <span className="score-value" style={{ color: getScoreColor(result.btssScore.overallBTSS) }}>
              {result.btssScore.overallBTSS}/100
            </span>
          </div>
          <div className="table-stability">
            <span className="stability-label">Table Stability</span>
            <span className={`stability-badge ${result.btssScore.tableStability.toLowerCase()}`}>
              {result.btssScore.tableStability}
            </span>
          </div>
        </div>

        <div className="result-legs">
          <h3>Your Four Legs</h3>
          <div className="legs-grid">
            {legs.map((leg) => {
              const score = scores[leg.key];
              const isWeakest = result.btssScore.weakestLeg === leg.name;
              const isStrongest = result.btssScore.strongestLeg === leg.name;

              return (
                <div key={leg.key} className={`leg-card ${isWeakest ? 'weakest' : ''} ${isStrongest ? 'strongest' : ''}`}>
                  <div className="leg-icon">{leg.icon}</div>
                  <h4>{leg.name}</h4>
                  <div className="leg-score" style={{ color: getScoreColor(score) }}>
                    {score}/100
                  </div>
                  <div className="leg-phase">{getPhase(score)}</div>
                  {isWeakest && <div className="leg-badge weakest-badge">Focus Area</div>}
                  {isStrongest && <div className="leg-badge strongest-badge">Strongest</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="result-insights">
          <h3>💡 Insights & Recommendations</h3>
          <div className="insight-card">
            <p className="insight-main">
              Your focus should be on <strong>{result.btssScore.weakestLeg}</strong> to strengthen your table.
            </p>
            <p className="insight-detail">
              {result.insights.focusArea}
            </p>
          </div>
        </div>

        <button
          className="retake-button"
          onClick={() => {
            setSubmitted(false);
            setResult(null);
          }}
        >
          Take New Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="btss-assessment">
      <div className="assessment-header">
        <h2>BTSS Assessment</h2>
        <p>Rate yourself (0-100) on each of the Four Legs</p>
      </div>

      <div className="assessment-preview">
        <div className="preview-score">
          <span className="preview-label">Estimated Overall BTSS</span>
          <span className="preview-value" style={{ color: getScoreColor(calculateOverall()) }}>
            {calculateOverall()}/100
          </span>
        </div>
      </div>

      <div className="assessment-form">
        {legs.map((leg) => (
          <div key={leg.key} className="leg-assessment">
            <div className="leg-header">
              <span className="leg-icon">{leg.icon}</span>
              <div className="leg-info">
                <h3>{leg.name}</h3>
                <p>{leg.description}</p>
              </div>
            </div>

            <div className="score-slider">
              <input
                type="range"
                min="0"
                max="100"
                value={scores[leg.key]}
                onChange={(e) => handleScoreChange(leg.key, e.target.value)}
                className="slider"
                style={{
                  background: `linear-gradient(to right, ${getScoreColor(scores[leg.key])} ${scores[leg.key]}%, #e5e7eb ${scores[leg.key]}%)`
                }}
              />
              <div className="score-display">
                <span className="score-value" style={{ color: getScoreColor(scores[leg.key]) }}>
                  {scores[leg.key]}
                </span>
                <span className="score-phase">{getPhase(scores[leg.key])}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="notes-section">
          <label>Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional context about your current state..."
            rows="4"
          />
        </div>

        <button
          className="submit-button"
          onClick={submitAssessment}
          disabled={loading}
        >
          {loading ? '⏳ Submitting...' : '📊 Submit Assessment'}
        </button>
      </div>
    </div>
  );
};

export default BTSSAssessment;
