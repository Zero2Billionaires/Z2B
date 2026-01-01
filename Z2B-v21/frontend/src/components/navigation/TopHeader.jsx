/**
 * TopHeader Component
 * Top bar for dashboard with search and user menu
 */

import { useAuth } from '../../context/AuthContext';
import './TopHeader.css';

const TopHeader = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="top-header">
      <div className="search-container">
        <i className="fas fa-search"></i>
        <input type="text" placeholder="Search..." className="search-input" />
      </div>

      <div className="header-actions">
        <button className="icon-btn">
          <i className="fas fa-bell"></i>
          <span className="badge">3</span>
        </button>

        <div className="user-menu">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=FFD700&color=0A2647`}
            alt="Profile"
            className="avatar"
          />
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-tier">Gold Member</span>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
