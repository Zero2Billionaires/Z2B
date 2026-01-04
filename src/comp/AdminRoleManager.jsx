/**
 * Admin Role Manager
 * Assign and manage admin roles
 * CEO and Senior admins with canManageAdmins permission
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/adminrolemanager.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminRoleManager = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    role: 'call_center',
    notes: ''
  });

  const roles = [
    { value: 'call_center', label: 'Call Center', description: 'Read-only access to view data' },
    { value: 'support', label: 'Support', description: 'Can edit member information' },
    { value: 'sales', label: 'Sales', description: 'Can view commissions and financials' },
    { value: 'finance', label: 'Finance', description: 'Can process payouts' },
    { value: 'senior', label: 'Senior Admin', description: 'Advanced admin with most permissions' },
    { value: 'ceo', label: 'CEO', description: 'Full access to everything' }
  ];

  useEffect(() => {
    fetchAdmins();
    fetchUsers();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/list-admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAdmins(response.data.admins || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admins:', error);
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

  const handleAssignRole = async (e) => {
    e.preventDefault();

    if (!formData.userId) {
      alert('Please select a user');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/assign-role`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Admin role assigned successfully!');
      setShowAssignForm(false);
      setFormData({ userId: '', role: 'call_center', notes: '' });
      fetchAdmins();
    } catch (error) {
      console.error('Error assigning role:', error);
      alert(error.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId, userName) => {
    if (!window.confirm(`Remove admin role from ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/remove-role/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Admin role removed successfully');
      fetchAdmins();
    } catch (error) {
      console.error('Error removing role:', error);
      alert(error.response?.data?.message || 'Failed to remove role');
    }
  };

  if (loading) {
    return <div className="loading">Loading admin list...</div>;
  }

  return (
    <div className="admin-role-manager">
      <div className="panel-header">
        <h2>Admin Role Management</h2>
        <button
          className="btn-primary"
          onClick={() => setShowAssignForm(!showAssignForm)}
        >
          {showAssignForm ? 'Cancel' : '+ Assign Admin Role'}
        </button>
      </div>

      {showAssignForm && (
        <div className="assign-form-container">
          <h3>Assign New Admin Role</h3>
          <form onSubmit={handleAssignRole}>
            <div className="form-group">
              <label>Select User</label>
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
              <label>Admin Role</label>
              <div className="role-options">
                {roles.map((role) => (
                  <div
                    key={role.value}
                    className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: role.value })}
                  >
                    <div className="role-label">{role.label}</div>
                    <div className="role-description">{role.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Why is this person being assigned this role?"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Assign Role
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAssignForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admins-list">
        <h3>Current Admins ({admins.length})</h3>

        {admins.length === 0 ? (
          <p className="no-data">No admins found. Assign your first admin above.</p>
        ) : (
          <div className="admins-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Membership #</th>
                  <th>Role</th>
                  <th>Assigned Date</th>
                  <th>Assigned By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id}>
                    <td>{admin.fullName}</td>
                    <td>{admin.email}</td>
                    <td>{admin.membershipNumber}</td>
                    <td>
                      <span className={`role-badge role-${admin.adminRole}`}>
                        {admin.adminRole.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {admin.roleAssignedDate
                        ? new Date(admin.roleAssignedDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      {admin.assignedBy?.fullName || 'System'}
                    </td>
                    <td>
                      <button
                        className="btn-danger-sm"
                        onClick={() => handleRemoveRole(admin._id, admin.fullName)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="permissions-reference">
        <h3>Role Permissions Reference</h3>
        <div className="permissions-grid">
          <div className="perm-card">
            <h4>Call Center</h4>
            <ul>
              <li>View member data</li>
            </ul>
          </div>
          <div className="perm-card">
            <h4>Support</h4>
            <ul>
              <li>View member data</li>
              <li>Edit member info</li>
            </ul>
          </div>
          <div className="perm-card">
            <h4>Sales</h4>
            <ul>
              <li>View member data</li>
              <li>Edit member info</li>
              <li>View commissions</li>
            </ul>
          </div>
          <div className="perm-card">
            <h4>Finance</h4>
            <ul>
              <li>View member data</li>
              <li>Edit member info</li>
              <li>View commissions</li>
              <li>Process payouts</li>
            </ul>
          </div>
          <div className="perm-card">
            <h4>Senior Admin</h4>
            <ul>
              <li>All Support permissions</li>
              <li>Delete records</li>
              <li>Manage admins</li>
              <li>Authorize free memberships</li>
              <li>Vote on CEO Awards</li>
            </ul>
          </div>
          <div className="perm-card perm-card-ceo">
            <h4>CEO</h4>
            <ul>
              <li>Full access to everything</li>
              <li>Edit commission rates</li>
              <li>Edit TLI qualifications</li>
              <li>Create CEO Awards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleManager;
