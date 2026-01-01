/**
 * Dashboard Page
 * Main dashboard with stats and overview
 * Uses DashboardLayout with Sidebar
 */

import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="dashboard-home">
        <h1 className="page-title">Welcome Back, {user?.firstName}! 🎉</h1>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#4CAF50' }}>
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="stat-info">
              <h3>R 12,450</h3>
              <p>Total Earnings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#2196F3' }}>
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>24</h3>
              <p>Team Members</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFD700' }}>
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-info">
              <h3>Gold</h3>
              <p>Current Tier</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FF6B35' }}>
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-info">
              <h3>Level 3</h3>
              <p>TLI Status</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn">
              <i className="fas fa-user-plus"></i>
              <span>Invite Members</span>
            </button>
            <button className="action-btn">
              <i className="fas fa-video"></i>
              <span>Create Video</span>
            </button>
            <button className="action-btn">
              <i className="fas fa-comments"></i>
              <span>Chat with Coach</span>
            </button>
            <button className="action-btn">
              <i className="fas fa-store"></i>
              <span>Marketplace</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <i className="fas fa-user-plus" style={{ color: '#4CAF50' }}></i>
              <div>
                <p className="activity-text">New team member joined</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <i className="fas fa-dollar-sign" style={{ color: '#FFD700' }}></i>
              <div>
                <p className="activity-text">Earned R500 commission</p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <i className="fas fa-trophy" style={{ color: '#FF6B35' }}></i>
              <div>
                <p className="activity-text">Achievement unlocked: Cash Catalyst!</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-home {
          max-width: 1400px;
        }

        .page-title {
          font-size: 2rem;
          color: #0A2647;
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 1.8rem;
          color: #0A2647;
        }

        .stat-info p {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
        }

        .quick-actions {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .quick-actions h2 {
          color: #0A2647;
          margin-bottom: 1.5rem;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .action-btn {
          background: linear-gradient(135deg, #FFD700, #FF6B35);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: transform 0.3s;
          font-weight: 600;
        }

        .action-btn:hover {
          transform: scale(1.05);
        }

        .action-btn i {
          font-size: 1.5rem;
        }

        .recent-activity {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .recent-activity h2 {
          color: #0A2647;
          margin-bottom: 1.5rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 10px;
          background: #FAF8F3;
        }

        .activity-item i {
          font-size: 1.5rem;
        }

        .activity-text {
          margin: 0;
          color: #0A2647;
          font-weight: 500;
        }

        .activity-time {
          color: #999;
          font-size: 0.85rem;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Dashboard;
