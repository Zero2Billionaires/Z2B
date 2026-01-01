import React, { useState } from 'react';
import '../styles/mainnavigation.css';
import z2bTableLogo from '../assets/z2b-table-logo.jpeg';

const MainNavigation = ({ currentPage, onNavigate, isLoggedIn = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Main top navigation items
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    {
      id: 'about',
      label: 'About',
      icon: '👤',
      dropdown: [
        { id: 'about-z2b', label: 'About Z2B' },
        { id: 'about-coach', label: 'Meet Coach Manlaw' },
        { id: 'testimonials', label: 'Success Stories' }
      ]
    },
    { id: 'opportunity', label: 'Opportunity', icon: '💰', highlight: true },
    { id: 'ecosystem', label: 'Ecosystem', icon: '🌐' },
    { id: 'tiers', label: 'Membership Tiers', icon: '💎' },
    { id: 'tli', label: 'TLI Challenge', icon: '🚀' },
    { id: isLoggedIn ? 'dashboard' : 'login', label: isLoggedIn ? 'Dashboard' : 'Members Login', icon: isLoggedIn ? '📊' : '🔐' },
  ];

  // Side menu items (quick access links)
  const sideMenuItems = [
    { id: 'milestones', label: 'Milestones & Goals', icon: '🗺️' },
    { id: 'income', label: 'Income Tracker', icon: '💰', external: true, url: 'https://www.z2blegacybuilders.co.za/income.html' },
    { id: 'marketplace', label: 'Marketplace', icon: '🏪', external: true, url: 'https://www.z2blegacybuilders.co.za/marketplace.html' },
    { id: 'upgrade', label: 'Upgrade Tier', icon: '⬆️', external: true, url: 'https://www.z2blegacybuilders.co.za/tier-upgrade-payment.html' },
  ];

  const handleNavigate = (pageId, url = null) => {
    if (url) {
      // External link - open in new window
      window.open(url, '_blank');
      setMenuOpen(false);
      setActiveDropdown(null);
    } else {
      onNavigate(pageId);
      setMenuOpen(false);
      setActiveDropdown(null);
    }
  };

  const toggleDropdown = (menuId) => {
    setActiveDropdown(activeDropdown === menuId ? null : menuId);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => handleNavigate('home')}>
          <img src={z2bTableLogo} alt="Z2B Table" className="logo-icon-img" />
          <div className="logo-text">
            <span className="logo-main">Z2B Legacy Builders</span>
            <span className="logo-tagline">TEEE - Transformation • Education • Empowerment • Enrichment</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {menuItems.map(item => (
            <div key={item.id} className="nav-item-wrapper">
              {item.dropdown ? (
                <>
                  <button
                    className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => toggleDropdown(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {activeDropdown === item.id && (
                    <div className="nav-dropdown">
                      {item.dropdown.map(subItem => (
                        <button
                          key={subItem.id}
                          className="dropdown-item"
                          onClick={() => handleNavigate(subItem.id)}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className={`nav-item ${currentPage === item.id ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
                  onClick={() => handleNavigate(item.id, item.url)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.external && <span style={{ marginLeft: '0.3rem', fontSize: '0.8rem' }}>↗</span>}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="header-cta">
          {isLoggedIn ? (
            <>
              <button className="btn-dashboard" onClick={() => handleNavigate('dashboard')}>
                📊 Dashboard
              </button>
              <button className="btn-logout" onClick={() => handleNavigate('logout')}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={() => handleNavigate('login')}>
                Members Login
              </button>
              <button className="btn-start" onClick={() => handleNavigate('get-started')}>
                🚀 Start Free
              </button>
            </>
          )}

          {/* Side Menu Toggle */}
          <button className="btn-side-menu" onClick={() => setSideMenuOpen(!sideMenuOpen)} title="Quick Access">
            ⚡
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="menu-icon">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <>
          <div className="mobile-menu">
            {menuItems.map(item => (
              <div key={item.id} className="mobile-menu-item">
                {item.dropdown ? (
                  <>
                    <button
                      className="mobile-item-button"
                      onClick={() => toggleDropdown(item.id)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {item.label}
                      <span className="dropdown-arrow">{activeDropdown === item.id ? '▲' : '▼'}</span>
                    </button>
                    {activeDropdown === item.id && (
                      <div className="mobile-dropdown">
                        {item.dropdown.map(subItem => (
                          <button
                            key={subItem.id}
                            className="mobile-dropdown-item"
                            onClick={() => handleNavigate(subItem.id)}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    className={`mobile-item-button ${item.highlight ? 'highlight' : ''}`}
                    onClick={() => handleNavigate(item.id, item.url)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                    {item.external && <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>↗</span>}
                  </button>
                )}
              </div>
            ))}

            <div className="mobile-cta-section">
              {!isLoggedIn && (
                <>
                  <button className="btn-login mobile" onClick={() => handleNavigate('login')}>
                    Members Login
                  </button>
                  <button className="btn-start mobile" onClick={() => handleNavigate('get-started')}>
                    🚀 Start Free
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="mobile-overlay" onClick={() => setMenuOpen(false)}></div>
        </>
      )}

      {/* Side Menu Panel */}
      {sideMenuOpen && (
        <>
          <div className="side-menu-panel">
            <div className="side-menu-header">
              <h3>⚡ Quick Access</h3>
              <button className="side-menu-close" onClick={() => setSideMenuOpen(false)}>
                ✕
              </button>
            </div>
            <div className="side-menu-items">
              {sideMenuItems.map(item => (
                <button
                  key={item.id}
                  className="side-menu-item"
                  onClick={() => {
                    handleNavigate(item.id, item.url);
                    setSideMenuOpen(false);
                  }}
                >
                  <span className="side-menu-icon">{item.icon}</span>
                  <div className="side-menu-content">
                    <span className="side-menu-label">{item.label}</span>
                    {item.external && <span className="external-indicator">Opens in new window ↗</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="side-menu-overlay" onClick={() => setSideMenuOpen(false)}></div>
        </>
      )}
    </header>
  );
};

export default MainNavigation;
