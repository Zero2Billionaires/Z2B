import React, { useState, useEffect } from 'react';
import '../styles/tlitracker.css';

const TLITracker = ({ compact = false }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentPV, setCurrentPV] = useState(0);

  const tliLevels = [
    {
      level: 1,
      name: 'SWIFT AS MERCURY',
      icon: '☿️',
      incomeMin: 2500,
      incomeMax: 10000,
      pvGoal: 1800,
      teamRequirement: 'Entry level',
      color: '#c0c0c0'
    },
    {
      level: 2,
      name: 'BRIGHT AS VENUS',
      icon: '♀️',
      incomeMin: 5000,
      incomeMax: 20000,
      pvGoal: 3000,
      teamRequirement: '2 leaders at Level 1',
      color: '#ffd700'
    },
    {
      level: 3,
      name: 'SOLID AS EARTH',
      icon: '🌍',
      incomeMin: 10000,
      incomeMax: 40000,
      pvGoal: 6000,
      teamRequirement: '2 leaders at Level 2',
      color: '#4169e1'
    },
    {
      level: 4,
      name: 'FIERCE AS MARS',
      icon: '♂️',
      incomeMin: 25000,
      incomeMax: 80000,
      pvGoal: 12000,
      teamRequirement: '2 leaders at Level 3',
      color: '#ff4500'
    },
    {
      level: 5,
      name: 'BIG AS JUPITER',
      icon: '🪐',
      incomeMin: 50000,
      incomeMax: 150000,
      pvGoal: 25000,
      teamRequirement: '2 leaders at Level 4',
      color: '#ff8c00'
    },
    {
      level: 6,
      name: 'MAMA I MADE IT',
      icon: '💫',
      incomeMin: 100000,
      incomeMax: 300000,
      pvGoal: 50000,
      teamRequirement: '2 leaders at Level 5',
      color: '#9370db'
    },
    {
      level: 7,
      name: 'DEEP AS NEPTUNE',
      icon: '🔵',
      incomeMin: 250000,
      incomeMax: 600000,
      pvGoal: 75000,
      teamRequirement: '7 leaders at Level 5',
      color: '#1e90ff',
      requiresPlatinum: true
    },
    {
      level: 8,
      name: 'BRIGHT AS A STAR',
      icon: '⭐',
      incomeMin: 500000,
      incomeMax: 1200000,
      pvGoal: 100000,
      teamRequirement: '7 leaders at Level 6',
      color: '#ffd700',
      requiresPlatinum: true
    },
    {
      level: 9,
      name: 'POWERFUL AS THE SUN',
      icon: '☀️',
      incomeMin: 1000000,
      incomeMax: 2500000,
      pvGoal: 150000,
      teamRequirement: '7 leaders at Level 7',
      color: '#ff6347',
      requiresPlatinum: true
    },
    {
      level: 10,
      name: 'ETERNAL AS THE COSMOS',
      icon: '♾️',
      incomeMin: 3000000,
      incomeMax: 5000000,
      pvGoal: 200000,
      teamRequirement: '7 leaders at Level 8',
      color: '#8a2be2',
      requiresPlatinum: true
    }
  ];

  useEffect(() => {
    const savedTLI = localStorage.getItem('tliProgress');
    if (savedTLI) {
      const data = JSON.parse(savedTLI);
      setCurrentLevel(data.level || 1);
      setCurrentPV(data.pv || 0);
    }
  }, []);

  const currentLevelData = tliLevels[currentLevel - 1];
  const nextLevelData = currentLevel < 10 ? tliLevels[currentLevel] : null;
  const progressPercentage = (currentPV / currentLevelData.pvGoal) * 100;

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `R${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `R${(amount / 1000).toFixed(0)}K`;
    }
    return `R${amount}`;
  };

  if (compact) {
    return (
      <div className="tli-compact">
        <div className="tli-compact-badge">
          <span className="tli-compact-icon">{currentLevelData.icon}</span>
          <span className="tli-compact-level">Level {currentLevel}</span>
        </div>
        <div className="tli-compact-bar">
          <div
            className="tli-compact-progress"
            style={{
              width: `${Math.min(progressPercentage, 100)}%`,
              background: currentLevelData.color
            }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="tli-tracker">
      <div className="tli-header">
        <h2>🎯 TLI Challenge Progress</h2>
        <p className="tli-subtitle">Team Leadership Incentive • Track Your Journey to Financial Freedom</p>
      </div>

      <div className="tli-current-level">
        <div className="tli-level-badge" style={{ borderColor: currentLevelData.color }}>
          <div className="tli-level-icon">{currentLevelData.icon}</div>
          <div className="tli-level-info">
            <div className="tli-level-number">LEVEL {currentLevel}</div>
            <div className="tli-level-name" style={{ color: currentLevelData.color }}>
              {currentLevelData.name}
            </div>
          </div>
        </div>

        <div className="tli-stats-grid">
          <div className="tli-stat">
            <div className="tli-stat-label">Income Range</div>
            <div className="tli-stat-value">
              {formatCurrency(currentLevelData.incomeMin)} - {formatCurrency(currentLevelData.incomeMax)}
            </div>
          </div>
          <div className="tli-stat">
            <div className="tli-stat-label">Monthly PV Goal</div>
            <div className="tli-stat-value">{currentLevelData.pvGoal.toLocaleString()}</div>
          </div>
          <div className="tli-stat">
            <div className="tli-stat-label">Team Required</div>
            <div className="tli-stat-value">{currentLevelData.teamRequirement}</div>
          </div>
          {currentLevelData.requiresPlatinum && (
            <div className="tli-stat platinum-required">
              <div className="tli-stat-label">Tier Required</div>
              <div className="tli-stat-value">💎 Platinum</div>
            </div>
          )}
        </div>
      </div>

      <div className="tli-progress-section">
        <div className="tli-progress-header">
          <span>PV Progress: {currentPV.toLocaleString()} / {currentLevelData.pvGoal.toLocaleString()}</span>
          <span>{Math.min(Math.round(progressPercentage), 100)}%</span>
        </div>
        <div className="tli-progress-bar">
          <div
            className="tli-progress-fill"
            style={{
              width: `${Math.min(progressPercentage, 100)}%`,
              background: `linear-gradient(90deg, ${currentLevelData.color}, ${currentLevelData.color}dd)`
            }}
          ></div>
        </div>
      </div>

      {nextLevelData && (
        <div className="tli-next-level">
          <h3>🎯 Next Level: {nextLevelData.icon} {nextLevelData.name}</h3>
          <div className="tli-next-requirements">
            <div className="tli-requirement">
              <span className="requirement-icon">💰</span>
              <span>Income: {formatCurrency(nextLevelData.incomeMin)} - {formatCurrency(nextLevelData.incomeMax)}</span>
            </div>
            <div className="tli-requirement">
              <span className="requirement-icon">📊</span>
              <span>Monthly PV: {nextLevelData.pvGoal.toLocaleString()}</span>
            </div>
            <div className="tli-requirement">
              <span className="requirement-icon">👥</span>
              <span>{nextLevelData.teamRequirement}</span>
            </div>
          </div>
        </div>
      )}

      {currentLevel === 10 && (
        <div className="tli-max-level">
          <h3>🎊 Congratulations! You've Reached the Highest Level!</h3>
          <p>You are ETERNAL AS THE COSMOS - Continue building your legacy!</p>
        </div>
      )}
    </div>
  );
};

export default TLITracker;
