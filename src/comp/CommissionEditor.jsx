/**
 * Commission Editor
 * CEO-only panel to edit ISP, QPB, and TSC commission rates
 * Includes version history tracking
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/commissioneditor.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CommissionEditor = () => {
  const [activeTab, setActiveTab] = useState('ISP');
  const [commissions, setCommissions] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');

  // ISP Rates
  const [ispRates, setIspRates] = useState({
    FAM: 0,
    Bronze: 0.18,
    Copper: 0.22,
    Silver: 0.25,
    Gold: 0.28,
    Platinum: 0.30,
    Diamond: 0
  });

  // QPB Rates
  const [qpbRates, setQpbRates] = useState({
    firstSet: 0.075,
    additionalSets: 0.10
  });

  // TSC Rates
  const [tscRates, setTscRates] = useState({
    gen2: 0.10,
    gen3: 0.05,
    gen4: 0.03,
    gen5: 0.02,
    gen6: 0.01,
    gen7: 0.01,
    gen8: 0.01,
    gen9: 0.01,
    gen10: 0.01
  });

  useEffect(() => {
    fetchCommissions();
    fetchHistory();
  }, []);

  const fetchCommissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/config/commissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCommissions(response.data.commissions);

      if (response.data.commissions.ISP) {
        setIspRates(response.data.commissions.ISP.ispRates);
      }
      if (response.data.commissions.QPB) {
        setQpbRates(response.data.commissions.QPB.qpbRates);
      }
      if (response.data.commissions.TSC) {
        setTscRates(response.data.commissions.TSC.tscRates);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching commissions:', error);
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/config/commissions/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSave = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for this change');
      return;
    }

    if (!window.confirm(`Are you sure you want to update ${activeTab} commission rates? This will affect all future calculations.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let rates;

      if (activeTab === 'ISP') {
        rates = ispRates;
      } else if (activeTab === 'QPB') {
        rates = qpbRates;
      } else if (activeTab === 'TSC') {
        rates = tscRates;
      }

      await axios.put(
        `${API_URL}/admin/config/commissions`,
        {
          configType: activeTab,
          rates,
          reason
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert(`${activeTab} rates updated successfully!`);
      setEditing(false);
      setReason('');
      fetchCommissions();
      fetchHistory();
    } catch (error) {
      console.error('Error updating commissions:', error);
      alert(error.response?.data?.message || 'Failed to update commissions');
    }
  };

  if (loading) {
    return <div className="loading">Loading commission data...</div>;
  }

  return (
    <div className="commission-editor">
      <div className="panel-header">
        <h2>Commission Configuration</h2>
        <p className="warning-text">
          ⚠️ Changes here affect all future commission calculations
        </p>
      </div>

      <div className="commission-tabs">
        <button
          className={activeTab === 'ISP' ? 'active' : ''}
          onClick={() => setActiveTab('ISP')}
        >
          ISP (Individual Sales Profit)
        </button>
        <button
          className={activeTab === 'QPB' ? 'active' : ''}
          onClick={() => setActiveTab('QPB')}
        >
          QPB (Quick Pathfinder Bonus)
        </button>
        <button
          className={activeTab === 'TSC' ? 'active' : ''}
          onClick={() => setActiveTab('TSC')}
        >
          TSC (Team Sales Commission)
        </button>
      </div>

      <div className="commission-content">
        {activeTab === 'ISP' && (
          <div className="isp-editor">
            <h3>Individual Sales Profit Rates</h3>
            <p className="description">
              Percentage earned on each personal sale based on tier
            </p>

            <div className="rates-grid">
              {Object.keys(ispRates).map((tier) => (
                <div key={tier} className="rate-item">
                  <label>{tier}</label>
                  <div className="rate-input-group">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={ispRates[tier]}
                      onChange={(e) =>
                        setIspRates({ ...ispRates, [tier]: parseFloat(e.target.value) })
                      }
                      disabled={!editing}
                    />
                    <span className="rate-display">
                      {(ispRates[tier] * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'QPB' && (
          <div className="qpb-editor">
            <h3>Quick Pathfinder Bonus Rates</h3>
            <p className="description">
              Bonus for inviting new builders within first 90 days (4th-3rd of month cycle)
            </p>

            <div className="rates-grid">
              <div className="rate-item">
                <label>First Set (3 invites)</label>
                <div className="rate-input-group">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.001"
                    value={qpbRates.firstSet}
                    onChange={(e) =>
                      setQpbRates({ ...qpbRates, firstSet: parseFloat(e.target.value) })
                    }
                    disabled={!editing}
                  />
                  <span className="rate-display">
                    {(qpbRates.firstSet * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="rate-item">
                <label>Additional Sets (per 3 invites)</label>
                <div className="rate-input-group">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={qpbRates.additionalSets}
                    onChange={(e) =>
                      setQpbRates({ ...qpbRates, additionalSets: parseFloat(e.target.value) })
                    }
                    disabled={!editing}
                  />
                  <span className="rate-display">
                    {(qpbRates.additionalSets * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TSC' && (
          <div className="tsc-editor">
            <h3>Team Sales Commission Rates</h3>
            <p className="description">
              Percentage earned from team sales across 10 generations
            </p>

            <div className="rates-grid">
              {Object.keys(tscRates).map((gen) => (
                <div key={gen} className="rate-item">
                  <label>Generation {gen.replace('gen', '')}</label>
                  <div className="rate-input-group">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={tscRates[gen]}
                      onChange={(e) =>
                        setTscRates({ ...tscRates, [gen]: parseFloat(e.target.value) })
                      }
                      disabled={!editing}
                    />
                    <span className="rate-display">
                      {(tscRates[gen] * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {editing && (
          <div className="edit-form">
            <div className="form-group">
              <label>Reason for Change *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you changing these rates? (e.g., Market adjustment, Board decision, etc.)"
                rows="3"
                required
              />
            </div>

            <div className="form-actions">
              <button className="btn-primary" onClick={handleSave}>
                Save Changes
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setEditing(false);
                  fetchCommissions();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!editing && (
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => setEditing(true)}>
              Edit {activeTab} Rates
            </button>
          </div>
        )}
      </div>

      <div className="history-section">
        <h3>Change History</h3>
        {history.length === 0 ? (
          <p className="no-data">No changes recorded yet</p>
        ) : (
          <div className="history-list">
            {history.slice(0, 10).map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-header">
                  <span className="history-type">{item.configType}</span>
                  <span className="history-version">v{item.version}</span>
                  <span className="history-date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="history-details">
                  <strong>Modified by:</strong> {item.modifiedBy?.fullName || 'System'}
                </div>
                {item.reason && (
                  <div className="history-reason">
                    <strong>Reason:</strong> {item.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionEditor;
