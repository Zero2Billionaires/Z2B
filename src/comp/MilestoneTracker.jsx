import React, { useState, useEffect } from 'react';
import '../styles/milestone-tracker.css';

const MilestoneTracker = ({ onNavigate }) => {
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [currentMilestone, setCurrentMilestone] = useState(1);

  useEffect(() => {
    // Load progress from localStorage
    const milestone1 = localStorage.getItem('milestone1Complete');
    const milestone2 = localStorage.getItem('milestone2Complete');
    const tierData = localStorage.getItem('selectedTier');

    let completed = [];
    if (milestone1 === 'true') completed.push(1);
    if (tierData) completed.push(2); // Tier selection counts as milestone
    if (milestone2 === 'true') completed.push(3);

    setCompletedMilestones(completed);
    setCurrentMilestone(completed.length + 1);
  }, []);

  const milestones = [
    {
      number: 1,
      name: 'Vision Board',
      icon: '🎯',
      stage: 'Awareness',
      description: 'Define your WHY, complete SWOT analysis, and create your legacy vision',
      actions: ['Complete Vision Board exercise', 'Define your WHY', 'Set your legacy goals'],
      free: true
    },
    {
      number: 2,
      name: 'Membership Selection',
      icon: '💎',
      stage: 'Alignment',
      description: 'Choose your legacy path and membership tier',
      actions: ['Review membership tiers', 'Select your tier', 'Complete payment'],
      free: false
    },
    {
      number: 3,
      name: 'Skills Assessment',
      icon: '📚',
      stage: 'Alignment',
      description: 'Identify your skills, gaps, and set development goals',
      actions: ['Take skills inventory', 'Identify gaps', 'Create learning plan'],
      free: false
    },
    {
      number: 4,
      name: 'Revenue Streams',
      icon: '💰',
      stage: 'Action',
      description: 'Map your 7 income streams and opportunities',
      actions: ['Understand all 7 streams', 'Choose primary stream', 'Set income goals'],
      free: false
    },
    {
      number: 5,
      name: 'Action Plan',
      icon: '📋',
      stage: 'Action',
      description: 'Create your 90-day transformation roadmap',
      actions: ['Set 90-day goals', 'Create weekly plan', 'Identify milestones'],
      free: false
    },
    {
      number: 6,
      name: 'Market Research',
      icon: '🔍',
      stage: 'Acceleration',
      description: 'Define your target audience and niche',
      actions: ['Identify target market', 'Research competitors', 'Find your niche'],
      free: false
    },
    {
      number: 7,
      name: 'Personal Brand',
      icon: '⭐',
      stage: 'Ascension',
      description: 'Build your unique value proposition',
      actions: ['Define your brand', 'Create content strategy', 'Build online presence'],
      free: false
    }
  ];

  const getStageColor = (stage) => {
    const colors = {
      'Awareness': '#4169e1',
      'Alignment': '#9370db',
      'Action': '#32cd32',
      'Acceleration': '#ffa500',
      'Ascension': '#ffd700'
    };
    return colors[stage] || '#daa520';
  };

  const isMilestoneCompleted = (number) => {
    return completedMilestones.includes(number);
  };

  const isMilestoneCurrent = (number) => {
    return number === currentMilestone;
  };

  const isMilestoneLocked = (number) => {
    return number > currentMilestone;
  };

  const handleMilestoneClick = (milestone) => {
    if (milestone.number === 1) {
      onNavigate && onNavigate('vision-board');
    } else if (milestone.number === 2) {
      onNavigate && onNavigate('tiers');
    } else if (milestone.number === 3 && !isMilestoneLocked(3)) {
      onNavigate && onNavigate('skills-assessment');
    } else if (isMilestoneLocked(milestone.number)) {
      alert(`Complete Milestone ${milestone.number - 1} first!`);
    }
  };

  const getProgressPercentage = () => {
    return Math.round((completedMilestones.length / milestones.length) * 100);
  };

  return (
    <div className="milestone-tracker-container">
      {/* Hero Section */}
      <div className="milestone-hero">
        <h1 className="milestone-title">
          <span className="milestone-hero-icon">🗺️</span>
          Your 7 TEEE Milestones
        </h1>
        <p className="milestone-subtitle">
          Track Your Transformation Journey
        </p>
        <p className="milestone-description">
          Complete each milestone to unlock the next stage of your legacy building journey.
          Each step brings you closer to financial freedom and lasting impact.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <h3>Your Progress</h3>
          <span className="progress-percentage">{getProgressPercentage()}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <p className="progress-text">
          {completedMilestones.length} of {milestones.length} milestones completed
        </p>
      </div>

      {/* Milestones Grid */}
      <div className="milestones-grid">
        {milestones.map((milestone) => {
          const isCompleted = isMilestoneCompleted(milestone.number);
          const isCurrent = isMilestoneCurrent(milestone.number);
          const isLocked = isMilestoneLocked(milestone.number);
          const stageColor = getStageColor(milestone.stage);

          return (
            <div
              key={milestone.number}
              className={`milestone-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => handleMilestoneClick(milestone)}
              style={{ borderLeftColor: stageColor }}
            >
              {/* Status Badge */}
              <div className="milestone-status">
                {isCompleted && <span className="status-badge completed-badge">✓ Completed</span>}
                {isCurrent && !isCompleted && <span className="status-badge current-badge">→ Current</span>}
                {isLocked && <span className="status-badge locked-badge">🔒 Locked</span>}
              </div>

              {/* Header */}
              <div className="milestone-card-header">
                <div className="milestone-icon-wrapper">
                  <span className="milestone-icon">{milestone.icon}</span>
                  {isCompleted && <span className="check-overlay">✓</span>}
                  {isLocked && <span className="lock-overlay">🔒</span>}
                </div>
                <div className="milestone-info">
                  <span className="milestone-number">Milestone {milestone.number}</span>
                  <h3 className="milestone-name">{milestone.name}</h3>
                  <span className="milestone-stage" style={{ color: stageColor }}>
                    {milestone.stage}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="milestone-card-description">{milestone.description}</p>

              {/* Actions */}
              <div className="milestone-actions-list">
                <h4>Actions:</h4>
                <ul>
                  {milestone.actions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>

              {/* Free/Paid Badge */}
              <div className="milestone-pricing">
                {milestone.free ? (
                  <span className="free-badge">✨ FREE</span>
                ) : (
                  <span className="members-badge">💎 Members Only</span>
                )}
              </div>

              {/* Action Button */}
              {!isLocked && (
                <button
                  className={`btn-milestone-action ${isCompleted ? 'completed' : isCurrent ? 'current' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMilestoneClick(milestone);
                  }}
                >
                  {isCompleted ? 'Review' : isCurrent ? 'Start Now' : 'Begin'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Steps CTA */}
      {currentMilestone <= milestones.length && (
        <div className="next-steps-cta">
          <h2>Ready for Your Next Milestone?</h2>
          <p>Complete Milestone {currentMilestone}: {milestones[currentMilestone - 1]?.name}</p>
          <button
            className="btn-next-milestone"
            onClick={() => handleMilestoneClick(milestones[currentMilestone - 1])}
          >
            Continue Your Journey →
          </button>
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker;
