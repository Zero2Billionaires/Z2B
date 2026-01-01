import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import MembersTraining from './MembersTraining';

const MembersDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    teamSize: 0,
    aiFuel: 0,
    depthLevel: 0,
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://z2b-production-3cd3.up.railway.app';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      FAM: '#808080',
      Bronze: '#cd7f32',
      Copper: '#b87333',
      Silver: '#c0c0c0',
      Gold: '#ffd700',
      Platinum: '#e5e4e2',
      Lifetime: '#9370db',
    };
    return colors[tier] || '#daa520';
  };

  const getTierIcon = (tier) => {
    const icons = {
      FAM: '🆓',
      Bronze: '🥉',
      Copper: '🔶',
      Silver: '🥈',
      Gold: '🥇',
      Platinum: '💎',
      Lifetime: '👑',
    };
    return icons[tier] || '⭐';
  };

  const incomeStreams = [
    {
      id: 'isp',
      name: 'ISP',
      fullName: 'Individual Sales Profit',
      description: 'Direct sales commissions from product sales',
      percentage: user?.tier === 'FAM' ? 0 : (user?.tier === 'Bronze' ? 12 : (user?.tier === 'Copper' ? 15 : 20)),
      icon: '💰',
      color: '#32cd32',
    },
    {
      id: 'qpb',
      name: 'QPB',
      fullName: 'Quick Pathfinder Bonus',
      description: 'Bonus for first 90 days of activity',
      available: true,
      icon: '⚡',
      color: '#ff6b6b',
    },
    {
      id: 'tsc',
      name: 'TSC',
      fullName: 'Team Sales Commission',
      description: 'Commissions from team members sales',
      depth: user?.tier === 'Bronze' ? 5 : (user?.tier === 'Copper' ? 7 : 10),
      icon: '👥',
      color: '#4169e1',
    },
    {
      id: 'tli',
      name: 'TLI',
      fullName: 'Team Leadership Incentive',
      description: 'Hybrid bonus based on team performance',
      icon: '🚀',
      color: '#9370db',
    },
    {
      id: 'cea',
      name: 'CEA',
      fullName: 'CEO Awards',
      description: 'Recognition and rewards program',
      icon: '🏆',
      color: '#ffd700',
    },
    {
      id: 'cec',
      name: 'CEC',
      fullName: 'CEO Competitions',
      description: 'Performance-based competitions',
      icon: '🎯',
      color: '#ff8c00',
    },
    {
      id: 'mkt',
      name: 'MKT',
      fullName: 'Marketplace Sales',
      description: 'Earnings from marketplace products',
      icon: '🏪',
      color: '#20b2aa',
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Z2B Dashboard</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeTab === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            Overview
          </button>
          <button
            className={activeTab === 'earnings' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('earnings')}
          >
            <span className="nav-icon">💰</span>
            Earnings
          </button>
          <button
            className={activeTab === 'team' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('team')}
          >
            <span className="nav-icon">👥</span>
            My Team
          </button>
          <button
            className={activeTab === 'apps' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('apps')}
          >
            <span className="nav-icon">🌐</span>
            My Apps
          </button>
          <button
            className={activeTab === 'framework' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('framework')}
          >
            <span className="nav-icon">🎯</span>
            Framework Tools
          </button>
          <button
            className={activeTab === 'milestones' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('milestones')}
          >
            <span className="nav-icon">🗺️</span>
            Milestones
          </button>
          <button
            className={activeTab === 'training' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('training')}
          >
            <span className="nav-icon">🎓</span>
            Training
          </button>
          <button
            className={activeTab === 'coach' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('coach')}
          >
            <span className="nav-icon">👨‍🏫</span>
            Coach Manlaw
          </button>
          <button
            className={activeTab === 'profile' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
        </nav>

        <button className="btn-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name || 'Legacy Builder'}!</h1>
            <p>Your command center for legacy building</p>
          </div>
          <div className="user-badge">
            <span className="tier-icon">{getTierIcon(user?.tier)}</span>
            <span className="tier-name" style={{ color: getTierColor(user?.tier) }}>
              {user?.tier || 'Member'}
            </span>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <p className="stat-label">Total Earnings</p>
                  <p className="stat-value">R {stats.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <p className="stat-label">Team Size</p>
                  <p className="stat-value">{stats.teamSize}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <p className="stat-label">AI Fuel Balance</p>
                  <p className="stat-value">{stats.aiFuel} credits</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <p className="stat-label">Depth Level</p>
                  <p className="stat-value">Level {stats.depthLevel}</p>
                </div>
              </div>
            </div>

            {/* Income Streams Overview */}
            <div className="section-card">
              <h2 className="section-title">🌊 Your Income Streams</h2>
              <div className="income-streams-grid">
                {incomeStreams.map(stream => (
                  <div key={stream.id} className="income-stream-card" style={{ borderLeftColor: stream.color }}>
                    <div className="stream-header">
                      <span className="stream-icon">{stream.icon}</span>
                      <div>
                        <h3>{stream.name}</h3>
                        <p className="stream-fullname">{stream.fullName}</p>
                      </div>
                    </div>
                    <p className="stream-description">{stream.description}</p>
                    {stream.percentage && (
                      <div className="stream-detail">
                        <span className="detail-label">Commission:</span>
                        <span className="detail-value">{stream.percentage}%</span>
                      </div>
                    )}
                    {stream.depth && (
                      <div className="stream-detail">
                        <span className="detail-label">Depth:</span>
                        <span className="detail-value">{stream.depth} levels</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card">
              <h2 className="section-title">⚡ Quick Actions</h2>
              <div className="quick-actions-grid">
                <button className="action-btn">
                  <span className="action-icon">👨‍🏫</span>
                  Chat with Coach Manlaw
                </button>
                <button className="action-btn">
                  <span className="action-icon">🤝</span>
                  Invite New Builders
                </button>
                <button className="action-btn">
                  <span className="action-icon">🏪</span>
                  Browse Marketplace
                </button>
                <button className="action-btn">
                  <span className="action-icon">📹</span>
                  Training Videos
                </button>
                <button className="action-btn">
                  <span className="action-icon">🎧</span>
                  Audio Lessons
                </button>
                <button className="action-btn">
                  <span className="action-icon">💎</span>
                  Upgrade Tier
                </button>
              </div>
            </div>

            {/* Referral System */}
            <div className="section-card">
              <h2 className="section-title">🔗 Share Your Referral Link</h2>
              <div className="referral-box">
                <div className="referral-info">
                  <p className="referral-label">Your Z2B ID:</p>
                  <p className="referral-code">{user?.z2bId || 'Loading...'}</p>
                </div>
                <div className="referral-link-box">
                  <input
                    type="text"
                    value={`https://www.z2blegacybuilders.co.za/?ref=${user?.z2bId || ''}`}
                    readOnly
                    className="referral-input"
                  />
                  <button className="btn-copy">📋 Copy</button>
                </div>
                <div className="referral-share-buttons">
                  <button className="btn-share btn-whatsapp">
                    📱 Share on WhatsApp
                  </button>
                  <button className="btn-share btn-email">
                    📧 Share via Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="tab-content">
            <MembersTraining />
          </div>
        )}

        {/* Other Tabs - Placeholders for now */}
        {activeTab !== 'overview' && activeTab !== 'training' && (
          <div className="tab-content">
            <div className="placeholder-message">
              <h2>🚧 {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section</h2>
              <p>This section is being built. Check back soon!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MembersDashboard;
