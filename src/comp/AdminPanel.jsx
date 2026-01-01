import React, { useState, useEffect } from 'react';
import '../styles/admin.css';

const AdminPanel = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [incomeStreams, setIncomeStreams] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://z2b-production-3cd3.up.railway.app';

  useEffect(() => {
    loadCompensationPlanData();
  }, []);

  const loadCompensationPlanData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/admin/compensation-plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIncomeStreams(data.incomeStreams || []);
        setQualifications(data.qualifications || []);
      }
    } catch (error) {
      console.error('Error loading compensation plan:', error);
    }
  };

  const saveCompensationPlan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/admin/compensation-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incomeStreams,
          qualifications,
        }),
      });

      if (response.ok) {
        alert('✅ Compensation plan saved successfully!');
      } else {
        alert('❌ Failed to save compensation plan');
      }
    } catch (error) {
      console.error('Error saving compensation plan:', error);
      alert('❌ Error saving compensation plan');
    } finally {
      setLoading(false);
    }
  };

  const addIncomeStream = () => {
    const newStream = {
      id: `stream_${Date.now()}`,
      name: 'New Income Stream',
      code: 'NEW',
      description: 'Description here',
      type: 'percentage', // percentage, fixed, hybrid
      enabled: true,
      tiers: {
        Bronze: { value: 0, enabled: false },
        Copper: { value: 0, enabled: false },
        Silver: { value: 0, enabled: false },
        Gold: { value: 0, enabled: false },
        Platinum: { value: 0, enabled: false },
      },
    };
    setIncomeStreams([...incomeStreams, newStream]);
  };

  const updateIncomeStream = (id, field, value) => {
    setIncomeStreams(incomeStreams.map(stream =>
      stream.id === id ? { ...stream, [field]: value } : stream
    ));
  };

  const updateStreamTier = (streamId, tier, field, value) => {
    setIncomeStreams(incomeStreams.map(stream =>
      stream.id === streamId
        ? {
            ...stream,
            tiers: {
              ...stream.tiers,
              [tier]: { ...stream.tiers[tier], [field]: value }
            }
          }
        : stream
    ));
  };

  const deleteIncomeStream = (id) => {
    if (window.confirm('Are you sure you want to delete this income stream?')) {
      setIncomeStreams(incomeStreams.filter(stream => stream.id !== id));
    }
  };

  const addQualification = () => {
    const newQual = {
      id: `qual_${Date.now()}`,
      name: 'New Qualification',
      type: 'sales', // sales, team_size, rank, custom
      operator: 'greater_than', // greater_than, less_than, equals, between
      value: 0,
      timeframe: 'monthly', // daily, weekly, monthly, all_time
      tier: 'Bronze',
      reward: '',
    };
    setQualifications([...qualifications, newQual]);
  };

  const updateQualification = (id, field, value) => {
    setQualifications(qualifications.map(qual =>
      qual.id === id ? { ...qual, [field]: value } : qual
    ));
  };

  const deleteQualification = (id) => {
    if (window.confirm('Are you sure you want to delete this qualification?')) {
      setQualifications(qualifications.filter(qual => qual.id !== id));
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-header">
          <h2>Z2B Admin</h2>
          <p className="admin-role">Administrator</p>
        </div>

        <nav className="admin-nav">
          <button
            className={activeSection === 'dashboard' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveSection('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button
            className={activeSection === 'compensation' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveSection('compensation')}
          >
            <span className="nav-icon">💰</span>
            Compensation Plan
          </button>
          <button
            className={activeSection === 'users' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveSection('users')}
          >
            <span className="nav-icon">👥</span>
            Manage Users
          </button>
          <button
            className={activeSection === 'products' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveSection('products')}
          >
            <span className="nav-icon">🌐</span>
            Product Access
          </button>
          <button
            className={activeSection === 'payments' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveSection('payments')}
          >
            <span className="nav-icon">💳</span>
            Payments
          </button>
          <button
            className={activeSection === 'communications' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveSection('communications')}
          >
            <span className="nav-icon">📧</span>
            Communications
          </button>
          <button
            className={activeSection === 'reports' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveSection('reports')}
          >
            <span className="nav-icon">📈</span>
            Reports
          </button>
          <button
            className={activeSection === 'settings' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveSection('settings')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
        </nav>

        <button className="btn-admin-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Compensation Plan Editor */}
        {activeSection === 'compensation' && (
          <div className="admin-content">
            <div className="admin-header-bar">
              <h1>💰 Compensation Plan Configuration</h1>
              <button className="btn-save" onClick={saveCompensationPlan} disabled={loading}>
                {loading ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>

            {/* Income Streams Section */}
            <div className="config-section">
              <div className="section-header">
                <h2>🌊 Income Streams</h2>
                <button className="btn-add" onClick={addIncomeStream}>
                  ➕ Add Income Stream
                </button>
              </div>

              <div className="income-streams-list">
                {incomeStreams.map((stream, index) => (
                  <div key={stream.id} className="stream-config-card">
                    <div className="stream-config-header">
                      <input
                        type="text"
                        className="stream-name-input"
                        value={stream.name}
                        onChange={(e) => updateIncomeStream(stream.id, 'name', e.target.value)}
                        placeholder="Income Stream Name"
                      />
                      <button
                        className="btn-delete-small"
                        onClick={() => deleteIncomeStream(stream.id)}
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="stream-config-row">
                      <div className="config-field">
                        <label>Stream Code</label>
                        <input
                          type="text"
                          value={stream.code}
                          onChange={(e) => updateIncomeStream(stream.id, 'code', e.target.value.toUpperCase())}
                          placeholder="ISP"
                          maxLength={5}
                        />
                      </div>

                      <div className="config-field">
                        <label>Type</label>
                        <select
                          value={stream.type}
                          onChange={(e) => updateIncomeStream(stream.id, 'type', e.target.value)}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>

                      <div className="config-field">
                        <label>Status</label>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={stream.enabled}
                            onChange={(e) => updateIncomeStream(stream.id, 'enabled', e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="config-field full-width">
                      <label>Description</label>
                      <textarea
                        value={stream.description}
                        onChange={(e) => updateIncomeStream(stream.id, 'description', e.target.value)}
                        placeholder="Describe this income stream..."
                        rows={2}
                      />
                    </div>

                    {/* Tier Configuration */}
                    <div className="tier-config-grid">
                      <h4>Tier Settings</h4>
                      {Object.keys(stream.tiers).map(tier => (
                        <div key={tier} className="tier-config-row">
                          <span className="tier-label">{tier}</span>
                          <input
                            type="number"
                            value={stream.tiers[tier].value}
                            onChange={(e) => updateStreamTier(stream.id, tier, 'value', parseFloat(e.target.value))}
                            placeholder="0"
                            step={stream.type === 'percentage' ? '0.1' : '1'}
                          />
                          <span className="tier-unit">
                            {stream.type === 'percentage' ? '%' : 'R'}
                          </span>
                          <label className="toggle-switch-small">
                            <input
                              type="checkbox"
                              checked={stream.tiers[tier].enabled}
                              onChange={(e) => updateStreamTier(stream.id, tier, 'enabled', e.target.checked)}
                            />
                            <span className="toggle-slider-small"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {incomeStreams.length === 0 && (
                  <div className="empty-state">
                    <p>No income streams configured yet.</p>
                    <button className="btn-add-large" onClick={addIncomeStream}>
                      ➕ Add Your First Income Stream
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Qualifications Section */}
            <div className="config-section">
              <div className="section-header">
                <h2>🎯 Qualification Rules</h2>
                <button className="btn-add" onClick={addQualification}>
                  ➕ Add Qualification
                </button>
              </div>

              <div className="qualifications-list">
                {qualifications.map((qual, index) => (
                  <div key={qual.id} className="qualification-card">
                    <div className="qual-header">
                      <input
                        type="text"
                        className="qual-name-input"
                        value={qual.name}
                        onChange={(e) => updateQualification(qual.id, 'name', e.target.value)}
                        placeholder="Qualification Name"
                      />
                      <button
                        className="btn-delete-small"
                        onClick={() => deleteQualification(qual.id)}
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="qual-config-grid">
                      <div className="config-field">
                        <label>Type</label>
                        <select
                          value={qual.type}
                          onChange={(e) => updateQualification(qual.id, 'type', e.target.value)}
                        >
                          <option value="sales">Sales Volume</option>
                          <option value="team_size">Team Size</option>
                          <option value="rank">Rank Achievement</option>
                          <option value="custom">Custom Metric</option>
                        </select>
                      </div>

                      <div className="config-field">
                        <label>Operator</label>
                        <select
                          value={qual.operator}
                          onChange={(e) => updateQualification(qual.id, 'operator', e.target.value)}
                        >
                          <option value="greater_than">Greater Than</option>
                          <option value="less_than">Less Than</option>
                          <option value="equals">Equals</option>
                          <option value="between">Between</option>
                        </select>
                      </div>

                      <div className="config-field">
                        <label>Value</label>
                        <input
                          type="number"
                          value={qual.value}
                          onChange={(e) => updateQualification(qual.id, 'value', parseFloat(e.target.value))}
                          placeholder="0"
                        />
                      </div>

                      <div className="config-field">
                        <label>Timeframe</label>
                        <select
                          value={qual.timeframe}
                          onChange={(e) => updateQualification(qual.id, 'timeframe', e.target.value)}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="all_time">All Time</option>
                        </select>
                      </div>

                      <div className="config-field">
                        <label>Required Tier</label>
                        <select
                          value={qual.tier}
                          onChange={(e) => updateQualification(qual.id, 'tier', e.target.value)}
                        >
                          <option value="Bronze">Bronze</option>
                          <option value="Copper">Copper</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                        </select>
                      </div>

                      <div className="config-field">
                        <label>Reward</label>
                        <input
                          type="text"
                          value={qual.reward}
                          onChange={(e) => updateQualification(qual.id, 'reward', e.target.value)}
                          placeholder="Bonus, Badge, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {qualifications.length === 0 && (
                  <div className="empty-state">
                    <p>No qualifications configured yet.</p>
                    <button className="btn-add-large" onClick={addQualification}>
                      ➕ Add Your First Qualification Rule
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Sections - Placeholders */}
        {activeSection !== 'compensation' && (
          <div className="admin-content">
            <h1>🚧 {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section</h1>
            <p>This admin section is being built. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
