/**
 * Sidebar Navigation Component
 * Main navigation for the dashboard
 * Converted from dashboard.html sidebar
 */

import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    {
      icon: 'fa-home',
      label: 'Dashboard',
      path: '/dashboard',
      tooltip: 'View your dashboard overview, stats, and recent activity'
    },
    {
      icon: 'fa-users',
      label: 'My Team',
      path: '/dashboard/team',
      tooltip: 'View your downline structure and team members'
    },
    {
      icon: 'fa-money-bill-wave',
      label: 'Income',
      path: '/dashboard/income',
      tooltip: 'Track your earnings and commission history'
    },
    {
      icon: 'fa-chart-line',
      label: 'Compensation',
      path: '/dashboard/compensation',
      tooltip: 'Learn about the compensation plan and opportunities'
    },
    {
      icon: 'fa-store',
      label: 'Marketplace',
      path: '/dashboard/marketplace',
      tooltip: 'Buy and sell products in the Z2B marketplace'
    },
    {
      icon: 'fa-trophy',
      label: 'Competitions',
      path: '/dashboard/competitions',
      tooltip: 'Participate in competitions and challenges'
    },
    {
      icon: 'fa-award',
      label: 'Achievements',
      path: '/dashboard/achievements',
      tooltip: 'Track your TLI levels and achievements'
    },
    {
      icon: 'fa-comments',
      label: 'Coach Manlaw',
      path: '/dashboard/coach',
      tooltip: 'Chat with AI Coach Manlaw for business guidance'
    },
  ];

  const appItems = [
    {
      icon: 'fa-briefcase',
      label: 'Benown',
      path: '/dashboard/apps/benown',
      tooltip: 'Business Management - Plan and manage your business'
    },
    {
      icon: 'fa-robot',
      label: 'Zyra',
      path: '/dashboard/apps/zyra',
      tooltip: 'Lead Generation AI - Capture and manage leads'
    },
    {
      icon: 'fa-video',
      label: 'Vidzie',
      path: '/dashboard/apps/vidzie',
      tooltip: 'Video Creator - Create marketing videos easily'
    },
    {
      icon: 'fa-share-alt',
      label: 'Glowie',
      path: '/dashboard/apps/glowie',
      tooltip: 'Social Media Manager - Manage your social presence'
    },
    {
      icon: 'fa-network-wired',
      label: 'Zynect',
      path: '/dashboard/apps/zynect',
      tooltip: 'Team Connection - Connect with your team members'
    },
    {
      icon: 'fa-gamepad',
      label: 'Zyro',
      path: '/dashboard/apps/zyro',
      tooltip: 'Gamification - Games, challenges, and rewards'
    },
  ];

  const bottomItems = [
    {
      icon: 'fa-user',
      label: 'Profile',
      path: '/dashboard/profile',
      tooltip: 'Manage your profile and personal information'
    },
    {
      icon: 'fa-cog',
      label: 'Settings',
      path: '/dashboard/settings',
      tooltip: 'Account settings and preferences'
    },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h3>Z2B Legacy</h3>
        <p>Build Your Legacy</p>
      </div>

      <nav className="sidebar-nav">
        {/* Main Navigation */}
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/dashboard'}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
            <div className="tooltip-text">{item.tooltip}</div>
          </NavLink>
        ))}

        {/* Apps Section */}
        <div className="nav-section-title">
          <i className="fas fa-mobile-alt"></i>
          <span>Z2B Apps</span>
        </div>
        {appItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
            <div className="tooltip-text">{item.tooltip}</div>
          </NavLink>
        ))}

        {/* Bottom Items */}
        <div className="sidebar-bottom">
          {bottomItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
              <div className="tooltip-text">{item.tooltip}</div>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
