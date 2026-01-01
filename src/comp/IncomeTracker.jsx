import React, { useState, useEffect } from 'react';
import '../styles/income-tracker.css';

const IncomeTracker = ({ onNavigate }) => {
  const [monthlyData, setMonthlyData] = useState({
    isp: 0,
    qpb: 0,
    tsc: 0,
    tli: 0,
    cea: 0,
    cec: 0,
    mkt: 0
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem(`income_${selectedMonth}`);
    if (savedData) {
      setMonthlyData(JSON.parse(savedData));
    }
  }, [selectedMonth]);

  const incomeStreams = [
    {
      id: 'isp',
      code: 'ISP',
      name: 'Individual Sales Profit',
      icon: '💰',
      color: '#32cd32'
    },
    {
      id: 'qpb',
      code: 'QPB',
      name: 'Quick Pathfinder Bonus',
      icon: '⚡',
      color: '#ff6b6b'
    },
    {
      id: 'tsc',
      code: 'TSC',
      name: 'Team Sales Commission',
      icon: '👥',
      color: '#4169e1'
    },
    {
      id: 'tli',
      code: 'TLI',
      name: 'Team Leadership Incentive',
      icon: '🚀',
      color: '#9370db'
    },
    {
      id: 'cea',
      code: 'CEA',
      name: 'CEO Awards',
      icon: '🏆',
      color: '#ffd700'
    },
    {
      id: 'cec',
      code: 'CEC',
      name: 'CEO Competitions',
      icon: '🎯',
      color: '#ff8c00'
    },
    {
      id: 'mkt',
      code: 'MKT',
      name: 'Marketplace Sales',
      icon: '🏪',
      color: '#20b2aa'
    }
  ];

  const handleInputChange = (streamId, value) => {
    const newData = {
      ...monthlyData,
      [streamId]: parseFloat(value) || 0
    };
    setMonthlyData(newData);
    localStorage.setItem(`income_${selectedMonth}`, JSON.stringify(newData));
  };

  const getTotalIncome = () => {
    return Object.values(monthlyData).reduce((sum, val) => sum + val, 0);
  };

  const getStreamPercentage = (amount) => {
    const total = getTotalIncome();
    return total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="income-tracker-container">
      {/* Hero Section */}
      <div className="income-hero">
        <h1 className="income-title">
          <span className="income-icon">💰</span>
          Income Tracker
        </h1>
        <p className="income-subtitle">
          Track your earnings across all 7 income streams
        </p>
      </div>

      {/* Month Selector */}
      <div className="month-selector-section">
        <label htmlFor="month-select">Select Month:</label>
        <input
          id="month-select"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-input"
        />
      </div>

      {/* Total Earnings Card */}
      <div className="total-earnings-card">
        <h2>Total Monthly Income</h2>
        <div className="total-amount">R {getTotalIncome().toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <p className="total-subtitle">Across all 7 income streams</p>
      </div>

      {/* Income Streams Grid */}
      <div className="income-streams-grid">
        {incomeStreams.map((stream) => {
          const amount = monthlyData[stream.id];
          const percentage = getStreamPercentage(amount);

          return (
            <div key={stream.id} className="income-stream-card" style={{ borderLeftColor: stream.color }}>
              <div className="stream-header">
                <div className="stream-icon" style={{ color: stream.color }}>{stream.icon}</div>
                <div className="stream-info">
                  <span className="stream-code">{stream.code}</span>
                  <h3 className="stream-name">{stream.name}</h3>
                </div>
              </div>

              <div className="stream-input-section">
                <label htmlFor={`input-${stream.id}`}>Amount Earned (R):</label>
                <input
                  id={`input-${stream.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount || ''}
                  onChange={(e) => handleInputChange(stream.id, e.target.value)}
                  placeholder="0.00"
                  className="amount-input"
                />
              </div>

              <div className="stream-stats">
                <div className="stat-item">
                  <span className="stat-label">This Month:</span>
                  <span className="stat-value" style={{ color: stream.color }}>
                    R {(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">% of Total:</span>
                  <span className="stat-value">{percentage}%</span>
                </div>
              </div>

              <div className="progress-bar-wrapper">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: stream.color
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Learn More About Income Streams</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => onNavigate && onNavigate('opportunity')}>
            📊 View All Income Streams
          </button>
          <button className="action-btn" onClick={() => onNavigate && onNavigate('tli')}>
            🚀 TLI Challenge
          </button>
          <button className="action-btn" onClick={() => onNavigate && onNavigate('dashboard')}>
            📈 My Dashboard
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h4>💡 Tips for Tracking Income:</h4>
        <ul>
          <li>Update your earnings weekly for accurate tracking</li>
          <li>ISP and TSC are typically your most consistent streams</li>
          <li>QPB only applies during your first 90 days</li>
          <li>TLI is paid quarterly - track monthly to plan ahead</li>
          <li>CEA and CEC are bonus streams for exceptional performance</li>
          <li>MKT earnings depend on your marketplace product sales</li>
        </ul>
      </div>
    </div>
  );
};

export default IncomeTracker;
