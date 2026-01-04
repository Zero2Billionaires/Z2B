/**
 * Admin Dashboard
 * Main admin panel with navigation to all admin tools
 * Role-based access control
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admindashboard.css';

// Import admin panel components
import AdminRoleManager from './AdminRoleManager';
import CommissionEditor from './CommissionEditor';
import TLIQualificationEditor from './TLIQualificationEditor';
import CEOAwardsPanel from './CEOAwardsPanel';
import FreeMembershipManager from './FreeMembershipManager';

const AdminDashboard = () => {
  const [activePanel, setActivePanel] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      navigate('/admin-login');
      return;
    }

    // Check if user has admin role
    if (!user.adminRole || user.adminRole === 'none') {
      alert('You do not have admin access');
      navigate('/dashboard');
      return;
    }

    setAdminUser(user);
    setPermissions(user.adminPermissions || {});
  }, [navigate]);

  if (!adminUser) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return (
          <div className="admin-overview">
            <h2>Admin Dashboard</h2>
            <div className="admin-info-card">
              <h3>Welcome, {adminUser.fullName}</h3>
              <p>Role: <strong>{adminUser.adminRole.toUpperCase()}</strong></p>
              <p>Membership: {adminUser.membershipNumber}</p>
            </div>

            <div className="permissions-grid">
              <h3>Your Permissions</h3>
              <div className="permission-cards">
                {permissions.canRead && (
                  <div className="permission-card">
                    <span className="permission-icon">📖</span>
                    <span>View Data</span>
                  </div>
                )}
                {permissions.canEdit && (
                  <div className="permission-card">
                    <span className="permission-icon">✏️</span>
                    <span>Edit Records</span>
                  </div>
                )}
                {permissions.canDelete && (
                  <div className="permission-card">
                    <span className="permission-icon">🗑️</span>
                    <span>Delete Records</span>
                  </div>
                )}
                {permissions.canManageAdmins && (
                  <div className="permission-card">
                    <span className="permission-icon">👥</span>
                    <span>Manage Admins</span>
                  </div>
                )}
                {permissions.canEditCommissions && (
                  <div className="permission-card">
                    <span className="permission-icon">💰</span>
                    <span>Edit Commissions</span>
                  </div>
                )}
                {permissions.canCreateAwards && (
                  <div className="permission-card">
                    <span className="permission-icon">🏆</span>
                    <span>Create Awards</span>
                  </div>
                )}
                {permissions.canAuthorizeFree && (
                  <div className="permission-card">
                    <span className="permission-icon">🎁</span>
                    <span>Authorize Free Access</span>
                  </div>
                )}
                {permissions.canProcessPayouts && (
                  <div className="permission-card">
                    <span className="permission-icon">💳</span>
                    <span>Process Payouts</span>
                  </div>
                )}
                {permissions.canViewFinancials && (
                  <div className="permission-card">
                    <span className="permission-icon">📊</span>
                    <span>View Financials</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'roles':
        return permissions.canManageAdmins ? (
          <AdminRoleManager />
        ) : (
          <div className="access-denied">
            <h3>Access Denied</h3>
            <p>You don't have permission to manage admin roles.</p>
          </div>
        );

      case 'commissions':
        return adminUser.adminRole === 'ceo' && permissions.canEditCommissions ? (
          <CommissionEditor />
        ) : (
          <div className="access-denied">
            <h3>Access Denied</h3>
            <p>Only CEO can edit commission rates.</p>
          </div>
        );

      case 'tli':
        return adminUser.adminRole === 'ceo' ? (
          <TLIQualificationEditor />
        ) : (
          <div className="access-denied">
            <h3>Access Denied</h3>
            <p>Only CEO can edit TLI qualifications.</p>
          </div>
        );

      case 'awards':
        return permissions.canCreateAwards || adminUser.adminRole === 'senior' ? (
          <CEOAwardsPanel />
        ) : (
          <div className="access-denied">
            <h3>Access Denied</h3>
            <p>You don't have permission to manage CEO Awards.</p>
          </div>
        );

      case 'free-members':
        return permissions.canAuthorizeFree ? (
          <FreeMembershipManager />
        ) : (
          <div className="access-denied">
            <h3>Access Denied</h3>
            <p>You don't have permission to authorize free memberships.</p>
          </div>
        );

      default:
        return <div>Panel not found</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <h2>Z2B Admin</h2>
          <p className="admin-role-badge">{adminUser.adminRole}</p>
        </div>

        <nav className="admin-nav">
          <button
            className={activePanel === 'overview' ? 'active' : ''}
            onClick={() => setActivePanel('overview')}
          >
            <span className="nav-icon">📊</span>
            Overview
          </button>

          {permissions.canManageAdmins && (
            <button
              className={activePanel === 'roles' ? 'active' : ''}
              onClick={() => setActivePanel('roles')}
            >
              <span className="nav-icon">👥</span>
              Admin Roles
            </button>
          )}

          {adminUser.adminRole === 'ceo' && permissions.canEditCommissions && (
            <button
              className={activePanel === 'commissions' ? 'active' : ''}
              onClick={() => setActivePanel('commissions')}
            >
              <span className="nav-icon">💰</span>
              Commissions
            </button>
          )}

          {adminUser.adminRole === 'ceo' && (
            <button
              className={activePanel === 'tli' ? 'active' : ''}
              onClick={() => setActivePanel('tli')}
            >
              <span className="nav-icon">⭐</span>
              TLI Levels
            </button>
          )}

          {(permissions.canCreateAwards || adminUser.adminRole === 'senior') && (
            <button
              className={activePanel === 'awards' ? 'active' : ''}
              onClick={() => setActivePanel('awards')}
            >
              <span className="nav-icon">🏆</span>
              CEO Awards
            </button>
          )}

          {permissions.canAuthorizeFree && (
            <button
              className={activePanel === 'free-members' ? 'active' : ''}
              onClick={() => setActivePanel('free-members')}
            >
              <span className="nav-icon">🎁</span>
              Free Memberships
            </button>
          )}

          <hr className="nav-divider" />

          <button
            className="nav-back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <span className="nav-icon">🏠</span>
            Back to Dashboard
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {renderPanel()}
      </div>
    </div>
  );
};

export default AdminDashboard;
