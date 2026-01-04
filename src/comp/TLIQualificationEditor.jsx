/**
 * TLI Qualification Editor
 * CEO-only panel to edit TLI level requirements
 * 8 celestial levels with editable qualifications
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/tliqualificationeditor.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TLIQualificationEditor = () => {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/config/tli`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLevels(response.data.levels || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching TLI levels:', error);
      setLoading(false);
    }
  };

  const handleEditLevel = (level) => {
    setSelectedLevel(level);
    setFormData({
      name: level.name,
      icon: level.icon,
      incomeRange: { ...level.incomeRange },
      requirements: {
        minTier: level.requirements.minTier,
        personalSales: level.requirements.personalSales,
        personalSalesTimeframe: level.requirements.personalSalesTimeframe,
        consecutiveMonths: level.requirements.consecutiveMonths || 0,
        gen1Requirements: {
          count: level.requirements.gen1Requirements.count,
          mustBeLevel: level.requirements.gen1Requirements.mustBeLevel,
          minimumMonthsAtLevel: level.requirements.gen1Requirements.minimumMonthsAtLevel
        }
      },
      monthlyMaintenance: {
        required: level.monthlyMaintenance?.required || false,
        personalSales: level.monthlyMaintenance?.personalSales || 0
      }
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for this change');
      return;
    }

    if (!window.confirm(`Update TLI Level ${selectedLevel.level}: ${selectedLevel.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/config/tli/${selectedLevel.level}`,
        {
          updates: formData,
          reason
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('TLI level updated successfully!');
      setEditing(false);
      setSelectedLevel(null);
      setReason('');
      fetchLevels();
    } catch (error) {
      console.error('Error updating TLI level:', error);
      alert(error.response?.data?.message || 'Failed to update TLI level');
    }
  };

  if (loading) {
    return <div className="loading">Loading TLI levels...</div>;
  }

  return (
    <div className="tli-qualification-editor">
      <div className="panel-header">
        <h2>TLI Qualification Editor</h2>
        <p className="warning-text">
          ⚠️ Changes affect member qualification requirements
        </p>
      </div>

      {!editing ? (
        <div className="levels-grid">
          {levels.map((level) => (
            <div key={level._id} className="level-card">
              <div className="level-header">
                <span className="level-icon">{level.icon}</span>
                <h3>{level.name}</h3>
                <span className="level-number">Level {level.level}</span>
              </div>

              <div className="level-income">
                <strong>Income Range:</strong>
                <p>
                  R{level.incomeRange.min.toLocaleString()} - R
                  {level.incomeRange.max.toLocaleString()}
                </p>
              </div>

              <div className="level-requirements">
                <h4>Requirements:</h4>
                <ul>
                  <li>
                    <strong>Min Tier:</strong> {level.requirements.minTier}
                  </li>
                  <li>
                    <strong>Personal Sales:</strong> {level.requirements.personalSales}{' '}
                    ({level.requirements.personalSalesTimeframe})
                  </li>
                  {level.requirements.consecutiveMonths > 0 && (
                    <li>
                      <strong>Consecutive Months:</strong>{' '}
                      {level.requirements.consecutiveMonths}
                    </li>
                  )}
                  <li>
                    <strong>Gen 1 Team:</strong>{' '}
                    {level.requirements.gen1Requirements.count} members
                    {level.requirements.gen1Requirements.mustBeLevel > 0 &&
                      ` at Level ${level.requirements.gen1Requirements.mustBeLevel}`}
                    {level.requirements.gen1Requirements.minimumMonthsAtLevel > 0 &&
                      ` for ${level.requirements.gen1Requirements.minimumMonthsAtLevel}+ months`}
                  </li>
                </ul>

                {level.monthlyMaintenance?.required && (
                  <div className="maintenance-req">
                    <strong>Monthly Maintenance:</strong>
                    <p>{level.monthlyMaintenance.personalSales} sales/cycle</p>
                  </div>
                )}
              </div>

              <button
                className="btn-edit"
                onClick={() => handleEditLevel(level)}
              >
                Edit Level
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="level-edit-form">
          <h3>
            Editing Level {selectedLevel.level}: {selectedLevel.name}
          </h3>

          <div className="form-sections">
            <div className="form-section">
              <h4>Basic Info</h4>

              <div className="form-group">
                <label>Level Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Icon (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Income (R)</label>
                  <input
                    type="number"
                    value={formData.incomeRange.min}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        incomeRange: {
                          ...formData.incomeRange,
                          min: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Max Income (R)</label>
                  <input
                    type="number"
                    value={formData.incomeRange.max}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        incomeRange: {
                          ...formData.incomeRange,
                          max: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Qualification Requirements</h4>

              <div className="form-group">
                <label>Minimum Tier</label>
                <select
                  value={formData.requirements.minTier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: {
                        ...formData.requirements,
                        minTier: e.target.value
                      }
                    })
                  }
                >
                  <option value="FAM">FAM</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Copper">Copper</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Personal Sales</label>
                  <input
                    type="number"
                    value={formData.requirements.personalSales}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: {
                          ...formData.requirements,
                          personalSales: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Timeframe</label>
                  <select
                    value={formData.requirements.personalSalesTimeframe}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: {
                          ...formData.requirements,
                          personalSalesTimeframe: e.target.value
                        }
                      })
                    }
                  >
                    <option value="lifetime">Lifetime</option>
                    <option value="cycle">Per Cycle</option>
                    <option value="3_consecutive_months">3 Consecutive Months</option>
                  </select>
                </div>
              </div>

              {formData.requirements.personalSalesTimeframe === '3_consecutive_months' && (
                <div className="form-group">
                  <label>Consecutive Months</label>
                  <input
                    type="number"
                    value={formData.requirements.consecutiveMonths}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: {
                          ...formData.requirements,
                          consecutiveMonths: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>Generation 1 Team Requirements</h4>

              <div className="form-group">
                <label>Number of Gen 1 Members</label>
                <input
                  type="number"
                  value={formData.requirements.gen1Requirements.count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: {
                        ...formData.requirements,
                        gen1Requirements: {
                          ...formData.requirements.gen1Requirements,
                          count: parseInt(e.target.value)
                        }
                      }
                    })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Must Be at Level</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={formData.requirements.gen1Requirements.mustBeLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: {
                          ...formData.requirements,
                          gen1Requirements: {
                            ...formData.requirements.gen1Requirements,
                            mustBeLevel: parseInt(e.target.value)
                          }
                        }
                      })
                    }
                  />
                  <small>0 = No level requirement</small>
                </div>
                <div className="form-group">
                  <label>Minimum Months at Level</label>
                  <input
                    type="number"
                    value={formData.requirements.gen1Requirements.minimumMonthsAtLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: {
                          ...formData.requirements,
                          gen1Requirements: {
                            ...formData.requirements.gen1Requirements,
                            minimumMonthsAtLevel: parseInt(e.target.value)
                          }
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Monthly Maintenance</h4>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.monthlyMaintenance.required}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyMaintenance: {
                          ...formData.monthlyMaintenance,
                          required: e.target.checked
                        }
                      })
                    }
                  />
                  Require monthly maintenance
                </label>
              </div>

              {formData.monthlyMaintenance.required && (
                <div className="form-group">
                  <label>Personal Sales per Cycle</label>
                  <input
                    type="number"
                    value={formData.monthlyMaintenance.personalSales}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyMaintenance: {
                          ...formData.monthlyMaintenance,
                          personalSales: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>Reason for Change</h4>
              <div className="form-group">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you changing this level's requirements?"
                  rows="3"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave}>
              Save Changes
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setEditing(false);
                setSelectedLevel(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TLIQualificationEditor;
