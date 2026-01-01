import React, { useState, useEffect } from 'react';
import '../styles/dailycheckin.css';

const DailyCheckIn = () => {
  const [visionData, setVisionData] = useState(null);
  const [checkInDone, setCheckInDone] = useState(false);
  const [stayedTrue, setStayedTrue] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load vision board data
    const data = localStorage.getItem('visionBoard');
    if (data) {
      setVisionData(JSON.parse(data));
    }

    // Load streak
    const savedStreak = localStorage.getItem('habitStreak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }

    // Check if already checked in today
    const lastCheckIn = localStorage.getItem('lastCheckIn');
    const today = new Date().toDateString();
    if (lastCheckIn === today) {
      setCheckInDone(true);
      const todayResult = localStorage.getItem('todayResult');
      setStayedTrue(todayResult === 'true');
    }
  }, []);

  const handleCheckIn = (answer) => {
    const today = new Date().toDateString();
    let newStreak = streak;

    if (answer) {
      newStreak = streak + 1;
    } else {
      newStreak = 0;
    }

    setStreak(newStreak);
    setStayedTrue(answer);
    setCheckInDone(true);

    localStorage.setItem('lastCheckIn', today);
    localStorage.setItem('todayResult', answer.toString());
    localStorage.setItem('habitStreak', newStreak.toString());
  };

  const resetCheckIn = () => {
    setCheckInDone(false);
    setStayedTrue(null);
  };

  if (!visionData) {
    return (
      <div className="checkin-container">
        <p>Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="checkin-container">
      <div className="checkin-header">
        <h1>🎯 Daily Habit Check</h1>
        <p className="checkin-subtitle">Accountability is the bridge between goals and achievement</p>
        <div className="streak-badge">
          🔥 {streak} Day Streak
        </div>
      </div>

      {!checkInDone ? (
        <div className="checkin-question">
          <h2>Did you stay true to your WHY today?</h2>
          <p className="question-detail">
            Did you work on your HOW? Follow your WHEN? Show up in your WHERE?
            Did you take action toward your Table today?
          </p>

          <div className="checkin-buttons">
            <button
              className="btn-yes"
              onClick={() => handleCheckIn(true)}
            >
              ✅ YES - I stayed true!
            </button>
            <button
              className="btn-no"
              onClick={() => handleCheckIn(false)}
            >
              ❌ NO - I broke commitment
            </button>
          </div>

          <div className="reminder-box">
            <p><strong>Your Daily Treat:</strong> {visionData.dailyTreat}</p>
          </div>
        </div>
      ) : (
        <div className="checkin-result">
          {stayedTrue ? (
            <div className="reward-display">
              <div className="result-icon">🏆</div>
              <h2>REWARD UNLOCKED!</h2>
              <p className="result-message">
                You stayed true to your WHY! Your discipline is building your legacy.
              </p>
              <div className="reward-box">
                <h3>🎁 Your Reward:</h3>
                <p>{visionData.reward}</p>
              </div>
              <div className="motivational-quote">
                "Every day of commitment is a brick in your Table. Keep building!"
              </div>
            </div>
          ) : (
            <div className="punishment-display">
              <div className="result-icon">⚠️</div>
              <h2>PUNISHMENT ACTIVATED</h2>
              <p className="result-message">
                You broke commitment today. Feel the pain, learn, and come back stronger tomorrow.
              </p>
              <div className="punishment-box">
                <h3>💔 Your Punishment:</h3>
                <p>{visionData.punishment}</p>
              </div>
              <div className="motivational-quote">
                "The pain of discipline is better than the pain of regret. Reset tomorrow."
              </div>
            </div>
          )}

          <button className="btn-reset" onClick={resetCheckIn}>
            Update Today's Check-In
          </button>
        </div>
      )}

      <div className="vision-reminder">
        <h3>Your Vision Statement:</h3>
        <p className="vision-text">{visionData.visionStatement}</p>
      </div>
    </div>
  );
};

export default DailyCheckIn;
