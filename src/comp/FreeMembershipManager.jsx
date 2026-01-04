/**
 * Free Membership Manager
 * CEO and Senior admins can authorize free memberships
 * Categories: partner, community, cash_deposit, special
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/freemembershipmanager.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FreeMembershipManager = () => {
  const [freeMembers, setFreeMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthorizeForm, setShowAuthorizeForm] = useState(false);

  const [formData, setFormData] = useState({
    userId: '',
    category: 'partner',
    justification: '',
    expiresAt: '',
    notes: ''
  });

  const categories = [
    {
      value: 'partner',
      label: 'Strategic Partner',
      description: 'Business partners, influencers, strategic alliances'
    },
    {
      value: 'community',
      label: 'Community Empowerment',
      description: 'Community leaders, NGO partners, social impact initiatives'
    },
    {
      value: 'cash_deposit',
      label: 'Cash Deposit',
      description: 'Direct cash payment instead of monthly fees'
    },
    {
      value: 'special',
      label: 'Special Authorization',
      description: 'VIP, family, scholarships, special circumstances'
    }
  ];

  useEffect(() => {
    fetchFreeMembers();
    fetchUsers();
  }, []);

  const fetchFreeMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/ceo/free-members`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFreeMembers(response.data.members || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching free members:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAuthorize = async (e) => {
    e.preventDefault();

    if (!formData.userId) {
      alert('Please select a user');
      return;
    }

    if (!formData.justification.trim()) {
      alert('Please provide justification for free membership');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/ceo/authorize-free-membership`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Free membership authorized successfully!');
      setShowAuthorizeForm(false);
      resetForm();
      fetchFreeMembers();
    } catch (error) {
      console.error('Error authorizing free membership:', error);
      alert(error.response?.data?.message || 'Failed to authorize free membership');
    }
  };

  const handleRevoke = async (userId, userName) => {
    if (!window.confirm(`Revoke free membership for ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/ceo/revoke-free-membership/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Free membership revoked successfully');
      fetchFreeMembers();
    } catch (error) {
      console.error('Error revoking free membership:', error);
      alert(error.response?.data?.message || 'Failed to revoke free membership');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      category: 'partner',
      justification: '',
      expiresAt: '',
      notes: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading free members...</div>;
  }

  return (
    <div className="free-membership-manager">
      <div className="panel-header">
        <h2>Free Membership Management</h2>
        <button
          className="btn-primary"
          onClick={() => setShowAuthorizeForm(!showAuthorizeForm)}
        >
          {showAuthorizeForm ? 'Cancel' : '+ Authorize Free Membership'}
        </button>
      </div>

      {showAuthorizeForm && (
        <div className="authorize-form-container">
          <h3>Authorize Free Membership</h3>
          <form onSubmit={handleAuthorize}>
            <div className="form-group">
              <label>Select User *</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
              >
                <option value="">-- Select User --</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullName} ({user.email}) - {user.membershipNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <div className="category-options">
                {categories.map((cat) => (
                  <div
                    key={cat.value}
                    className={`category-option ${
                      formData.category === cat.value ? 'selected' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                  >
                    <div className="category-label">{cat.label}</div>
                    <div className="category-description">{cat.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Justification *</label>
              <textarea
                value={formData.justification}
                onChange={(e) =>
                  setFormData({ ...formData, justification: e.target.value })
                }
                placeholder="Why is this person being granted free membership? Provide specific details."
                rows="4"
                required
              />
              <small>
                Be specific: Who approved this? What value do they bring? What agreement was
                made?
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
                <small>Leave blank for permanent free access</small>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional context..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Authorize Free Membership
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAuthorizeForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="free-members-list">
        <h3>Free Members ({freeMembers.length})</h3>

        {freeMembers.length === 0 ? (
          <p className="no-data">No free memberships authorized yet</p>
        ) : (
          <div className="members-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Membership #</th>
                  <th>Tier</th>
                  <th>Category</th>
                  <th>Justification</th>
                  <th>Authorized By</th>
                  <th>Authorized Date</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {freeMembers.map((member) => (
                  <tr key={member._id}>
                    <td>{member.fullName}</td>
                    <td>{member.email}</td>
                    <td>{member.membershipNumber}</td>
                    <td>
                      <span className="tier-badge">{member.tier}</span>
                    </td>
                    <td>
                      <span className={`category-badge category-${member.freeMembershipStatus.category}`}>
                        {member.freeMembershipStatus.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="justification-cell">
                      {member.freeMembershipStatus.justification}
                    </td>
                    <td>
                      {member.freeMembershipStatus.authorizedBy?.fullName || 'System'}
                    </td>
                    <td>
                      {member.freeMembershipStatus.authorizedDate
                        ? new Date(
                            member.freeMembershipStatus.authorizedDate
                          ).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      {member.freeMembershipStatus.expiresAt
                        ? new Date(
                            member.freeMembershipStatus.expiresAt
                          ).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      <button
                        className="btn-danger-sm"
                        onClick={() => handleRevoke(member._id, member.fullName)}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="category-stats">
        <h3>Breakdown by Category</h3>
        <div className="stats-grid">
          {categories.map((cat) => {
            const count = freeMembers.filter(
              (m) => m.freeMembershipStatus.category === cat.value
            ).length;
            return (
              <div key={cat.value} className="stat-card">
                <h4>{cat.label}</h4>
                <p className="stat-count">{count}</p>
                <p className="stat-description">{cat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FreeMembershipManager;
