/**
 * CEO Awards Panel
 * Create and manage CEO Awards (cars, trips, cash, products)
 * Board approval workflow
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ceoawardspanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CEOAwardsPanel = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userRole, setUserRole] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'car',
    value: 0,
    description: '',
    details: {},
    eligibilityCriteria: {
      minTier: 'Bronze',
      minPV: 0,
      minDirectReferrals: 0,
      minTeamSize: 0,
      minTLILevel: 0,
      customCriteria: ''
    },
    qualificationPeriod: {
      start: '',
      end: ''
    },
    numberOfWinners: 1,
    quarterCashOnHand: 0,
    quarter: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserRole(user?.adminRole || '');
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/ceo/awards`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAwards(response.data.awards || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching awards:', error);
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/ceo/awards/create`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Award created successfully!');
      setShowCreateForm(false);
      resetForm();
      fetchAwards();
    } catch (error) {
      console.error('Error creating award:', error);
      alert(error.response?.data?.message || 'Failed to create award');
    }
  };

  const handleSubmitForApproval = async (awardId) => {
    if (!window.confirm('Submit this award for board approval?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/ceo/awards/${awardId}/submit-approval`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Award submitted for board approval');
      fetchAwards();
    } catch (error) {
      console.error('Error submitting award:', error);
      alert(error.response?.data?.message || 'Failed to submit award');
    }
  };

  const handleVote = async (awardId, vote) => {
    const comment = window.prompt(`Comment for your ${vote} vote (optional):`);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/ceo/awards/${awardId}/vote`,
        { vote, comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Vote recorded successfully');
      fetchAwards();
    } catch (error) {
      console.error('Error voting:', error);
      alert(error.response?.data?.message || 'Failed to record vote');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'car',
      value: 0,
      description: '',
      details: {},
      eligibilityCriteria: {
        minTier: 'Bronze',
        minPV: 0,
        minDirectReferrals: 0,
        minTeamSize: 0,
        minTLILevel: 0,
        customCriteria: ''
      },
      qualificationPeriod: {
        start: '',
        end: ''
      },
      numberOfWinners: 1,
      quarterCashOnHand: 0,
      quarter: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading awards...</div>;
  }

  return (
    <div className="ceo-awards-panel">
      <div className="panel-header">
        <h2>CEO Awards Management</h2>
        {userRole === 'ceo' && (
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ Create New Award'}
          </button>
        )}
      </div>

      {showCreateForm && userRole === 'ceo' && (
        <div className="create-award-form">
          <h3>Create New CEO Award</h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Award Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Award Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <option value="car">Car</option>
                  <option value="trip">Trip</option>
                  <option value="cash">Cash</option>
                  <option value="product">Product</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Value (R) *</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
              />
            </div>

            <div className="form-section">
              <h4>Eligibility Criteria</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Tier</label>
                  <select
                    value={formData.eligibilityCriteria.minTier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eligibilityCriteria: {
                          ...formData.eligibilityCriteria,
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

                <div className="form-group">
                  <label>Min Direct Referrals</label>
                  <input
                    type="number"
                    value={formData.eligibilityCriteria.minDirectReferrals}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eligibilityCriteria: {
                          ...formData.eligibilityCriteria,
                          minDirectReferrals: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Min TLI Level</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={formData.eligibilityCriteria.minTLILevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eligibilityCriteria: {
                          ...formData.eligibilityCriteria,
                          minTLILevel: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Qualification Period</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.qualificationPeriod.start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualificationPeriod: {
                          ...formData.qualificationPeriod,
                          start: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.qualificationPeriod.end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualificationPeriod: {
                          ...formData.qualificationPeriod,
                          end: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Number of Winners</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfWinners}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfWinners: parseInt(e.target.value)
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Financial Info (for Board Approval)</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Quarter (e.g., Q4 2025)</label>
                  <input
                    type="text"
                    value={formData.quarter}
                    onChange={(e) =>
                      setFormData({ ...formData, quarter: e.target.value })
                    }
                    placeholder="Q4 2025"
                  />
                </div>

                <div className="form-group">
                  <label>Cash on Hand (R)</label>
                  <input
                    type="number"
                    value={formData.quarterCashOnHand}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quarterCashOnHand: parseInt(e.target.value)
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Create Award (Draft)
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="awards-list">
        <h3>All Awards ({awards.length})</h3>

        {awards.length === 0 ? (
          <p className="no-data">No awards created yet</p>
        ) : (
          <div className="awards-grid">
            {awards.map((award) => (
              <div key={award._id} className="award-card">
                <div className="award-header">
                  <h4>{award.name}</h4>
                  <span className={`status-badge status-${award.status}`}>
                    {award.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="award-details">
                  <p>
                    <strong>Type:</strong> {award.type}
                  </p>
                  <p>
                    <strong>Value:</strong> R{award.value.toLocaleString()}
                  </p>
                  <p>
                    <strong>Winners:</strong> {award.numberOfWinners}
                  </p>
                  <p>
                    <strong>Min Tier:</strong>{' '}
                    {award.eligibilityCriteria?.minTier || 'N/A'}
                  </p>
                  {award.quarter && (
                    <p>
                      <strong>Quarter:</strong> {award.quarter}
                    </p>
                  )}
                </div>

                <div className="award-votes">
                  <strong>Board Votes:</strong>
                  <p>
                    Approve: {award.approvalVotes?.filter((v) => v.vote === 'approve').length || 0}
                    {' | '}
                    Reject: {award.approvalVotes?.filter((v) => v.vote === 'reject').length || 0}
                  </p>
                </div>

                <div className="award-actions">
                  {award.status === 'draft' && userRole === 'ceo' && (
                    <button
                      className="btn-primary-sm"
                      onClick={() => handleSubmitForApproval(award._id)}
                    >
                      Submit for Approval
                    </button>
                  )}

                  {award.status === 'pending_approval' &&
                    (userRole === 'ceo' || userRole === 'senior') && (
                      <>
                        <button
                          className="btn-success-sm"
                          onClick={() => handleVote(award._id, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-danger-sm"
                          onClick={() => handleVote(award._id, 'reject')}
                        >
                          Reject
                        </button>
                      </>
                    )}

                  {award.status === 'approved' && (
                    <span className="status-text">Ready to activate</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CEOAwardsPanel;
