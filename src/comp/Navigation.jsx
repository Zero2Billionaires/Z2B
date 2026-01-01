import React, { useState } from 'react';
import TLITracker from './TLITracker';
import '../styles/navigation.css';

const Navigation = ({ currentView, onNavigate, milestoneStatus }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const milestones = [
    {
      id: 'vision-board',
      number: 1,
      name: 'Vision Board',
      icon: '🎯',
      unlocked: true
    },
    {
      id: 'membership',
      number: 0,
      name: 'Membership',
      icon: '💎',
      unlocked: milestoneStatus.milestone1Complete
    },
    {
      id: 'skills-assessment',
      number: 2,
      name: 'Skills Assessment',
      icon: '📚',
      unlocked: milestoneStatus.membershipSelected
    },
    {
      id: 'daily-checkin',
      number: 3,
      name: 'Daily Check-In',
      icon: '✅',
      unlocked: milestoneStatus.milestone2Complete
    }
  ];

  const getCurrentMilestone = () => {
    return milestones.find(m => m.id === currentView) || milestones[0];
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigate = (milestoneId) => {
    onNavigate(milestoneId);
    setMenuOpen(false);
  };

  const currentMilestone = getCurrentMilestone();

  return (
    <nav className="app-navigation">
      <div className="nav-container">
        <div className="nav-left">
          <button className="menu-toggle" onClick={toggleMenu}>
            <span className="menu-icon">{menuOpen ? '✕' : '☰'}</span>
          </button>

          <div className="current-milestone">
            <span className="milestone-icon">{currentMilestone.icon}</span>
            <div className="milestone-info">
              {currentMilestone.number > 0 && (
                <span className="milestone-number">M{currentMilestone.number}</span>
              )}
              <span className="milestone-name">{currentMilestone.name}</span>
            </div>
          </div>
        </div>

        <div className="nav-right">
          <TLITracker compact={true} />
        </div>
      </div>

      {menuOpen && (
        <div className="nav-menu">
          <div className="menu-header">
            <h3>Navigate Milestones</h3>
          </div>
          <div className="menu-items">
            {milestones.map(milestone => (
              <button
                key={milestone.id}
                className={`menu-item ${currentView === milestone.id ? 'active' : ''} ${!milestone.unlocked ? 'locked' : ''}`}
                onClick={() => milestone.unlocked && handleNavigate(milestone.id)}
                disabled={!milestone.unlocked}
              >
                <span className="item-icon">{milestone.icon}</span>
                <div className="item-info">
                  <span className="item-name">
                    {milestone.number > 0 ? `M${milestone.number}: ` : ''}{milestone.name}
                  </span>
                  {!milestone.unlocked && <span className="locked-badge">🔒 Locked</span>}
                  {currentView === milestone.id && <span className="active-badge">📍 Current</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="menu-footer">
            <p className="progress-text">
              {milestoneStatus.milestone2Complete
                ? '🎉 2 Milestones Complete!'
                : milestoneStatus.milestone1Complete
                ? '🎯 1 Milestone Complete'
                : '🚀 Start Your Journey'}
            </p>
          </div>
        </div>
      )}

      {menuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </nav>
  );
};

export default Navigation;
