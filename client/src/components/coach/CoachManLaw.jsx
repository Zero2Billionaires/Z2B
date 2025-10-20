/**
 * Coach ManLaw - Main Component
 * AI Coaching Interface for Legacy Builders
 */

import { useState, useEffect } from 'react';
import './CoachManLaw.css';
import ChatInterface from './ChatInterface';
import BTSSAssessment from './BTSSAssessment';
import ActionItems from './ActionItems';
import WinsTracker from './WinsTracker';
import LessonLibrary from './LessonLibrary';

const CoachManLaw = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState(null);
  const [btssScore, setBtssScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Get current user
      const userRes = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userRes.ok) throw new Error('Failed to load user');

      const userData = await userRes.json();
      setUser(userData.user);

      // Get latest BTSS score
      try {
        const btssRes = await fetch(`/api/btss/latest/${userData.user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (btssRes.ok) {
          const btssData = await btssRes.json();
          setBtssScore(btssData);
        }
      } catch (error) {
        console.log('No BTSS score yet');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="coach-manlaw-loading">
        <div className="spinner"></div>
        <p>Loading Coach ManLaw...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="coach-manlaw-error">
        <h2>Authentication Required</h2>
        <p>Please log in to access Coach ManLaw</p>
        <button onClick={() => window.location.href = '/login'}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="coach-manlaw">
      <header className="coach-header">
        <div className="coach-brand">
          <h1>Coach ManLaw</h1>
          <p className="tagline">AI-Powered Coaching for Legacy Builders</p>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user.fullName.charAt(0)}
          </div>
          <div className="user-details">
            <span className="user-name">{user.fullName}</span>
            <span className="user-stage">{user.currentStage} Builder</span>
          </div>
        </div>
      </header>

      {btssScore && (
        <div className="btss-banner">
          <div className="btss-overview">
            <div className="btss-score">
              <span className="score-label">Overall BTSS</span>
              <span className="score-value">{btssScore.overallBTSS}/100</span>
            </div>
            <div className="btss-stability">
              <span className="stability-label">Table Stability</span>
              <span className={`stability-value ${btssScore.tableStability.toLowerCase()}`}>
                {btssScore.tableStability}
              </span>
            </div>
            <div className="btss-focus">
              <span className="focus-label">Focus Leg</span>
              <span className="focus-value">{user.currentFocusLeg}</span>
            </div>
          </div>
        </div>
      )}

      <nav className="coach-tabs">
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 AI Chat
        </button>
        <button
          className={`tab ${activeTab === 'btss' ? 'active' : ''}`}
          onClick={() => setActiveTab('btss')}
        >
          📊 BTSS Assessment
        </button>
        <button
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          ✅ Action Items
        </button>
        <button
          className={`tab ${activeTab === 'wins' ? 'active' : ''}`}
          onClick={() => setActiveTab('wins')}
        >
          🏆 Wins
        </button>
        <button
          className={`tab ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          📚 Lessons
        </button>
      </nav>

      <main className="coach-content">
        {activeTab === 'chat' && <ChatInterface user={user} />}
        {activeTab === 'btss' && (
          <BTSSAssessment
            user={user}
            currentScore={btssScore}
            onScoreUpdate={(newScore) => setBtssScore(newScore)}
          />
        )}
        {activeTab === 'actions' && <ActionItems user={user} />}
        {activeTab === 'wins' && <WinsTracker user={user} />}
        {activeTab === 'lessons' && <LessonLibrary user={user} />}
      </main>

      <footer className="coach-footer">
        <p className="philosophy">
          "I am a Legacy Builder, You are a Legacy Builder, and Together we are Builders of Legacies."
        </p>
      </footer>
    </div>
  );
};

export default CoachManLaw;
