/**
 * Generates all essential React components for proper user flow
 * Run with: node scripts/generate-react-components.js
 */

const fs = require('fs');
const path = require('path');

const components = {
  // Sidebar CSS
  'frontend/src/components/navigation/Sidebar.css': `/* Sidebar Styles - Converted from dashboard.html */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: linear-gradient(180deg, #0A2647 0%, #051428 100%);
  padding: 2rem 0;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
}

.sidebar-brand {
  padding: 0 1.5rem 2rem;
  border-bottom: 3px solid #D4AF37;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(184, 150, 13, 0.05));
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
}

.sidebar-brand h3 {
  color: #FFE5A0;
  font-weight: 900;
  font-size: 1.6rem;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.8), 0 0 30px rgba(255, 229, 160, 0.5);
  letter-spacing: 1.5px;
  margin: 0;
}

.sidebar-brand p {
  color: #F4E4C1;
  font-size: 0.85rem;
  margin: 0.5rem 0 0 0;
  font-weight: 600;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-left-color: #FFD700;
}

.nav-item.active {
  background: rgba(255, 215, 0, 0.2);
  border-left-color: #FF6B35;
}

.nav-item i {
  color: #FFD700;
  margin-right: 15px;
  font-size: 1.2rem;
  width: 25px;
}

.nav-item span {
  color: white;
  font-size: 1rem;
}

.nav-section-title {
  padding: 1rem 1.5rem 0.5rem;
  color: #D4AF37;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-bottom {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  position: fixed;
  left: 295px;
  background: linear-gradient(135deg, #0A2647, #051428);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
  min-width: 280px;
  max-width: 320px;
  z-index: 10000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  border: 2px solid #FFD700;
  pointer-events: none;
}

.nav-item:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  .sidebar-brand p,
  .nav-item span,
  .nav-section-title span {
    display: none;
  }
}`,

  // TopHeader Component
  'frontend/src/components/navigation/TopHeader.jsx': `import { useAuth } from '../../context/AuthContext';
import './TopHeader.css';

const TopHeader = () => {
  const { user, logout } = useAuth();

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
            src="https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=FFD700&color=0A2647"
            alt="Profile"
            className="avatar"
          />
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-tier">Gold Member</span>
          </div>
          <button onClick={logout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;`,

  // TopHeader CSS
  'frontend/src/components/navigation/TopHeader.css': `.top-header {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 0.6rem 1rem;
  border-radius: 25px;
  width: 300px;
}

.search-container i {
  color: #999;
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-btn {
  position: relative;
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.icon-btn:hover {
  color: #FFD700;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #FF6B35;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #FFD700;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #0A2647;
}

.user-tier {
  font-size: 0.85rem;
  color: #FFD700;
}

.logout-btn {
  background: none;
  border: none;
  color: #FF6B35;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.logout-btn:hover {
  transform: scale(1.1);
}`,

  // DashboardLayout
  'frontend/src/layouts/DashboardLayout.jsx': `import Sidebar from '../components/navigation/Sidebar';
import TopHeader from '../components/navigation/TopHeader';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopHeader />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;`,

  // DashboardLayout CSS
  'frontend/src/layouts/DashboardLayout.css': `.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #FAF8F3;
}

.main-wrapper {
  margin-left: 280px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dashboard-content {
  flex: 1;
  padding: 0 2rem 2rem 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 70px;
  }
}`,

  // PublicLayout
  'frontend/src/layouts/PublicLayout.jsx': `import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;`,

  // OnboardingLayout
  'frontend/src/layouts/OnboardingLayout.jsx': `import './OnboardingLayout.css';

const OnboardingLayout = ({ children, currentStep }) => {
  const steps = ['Register', 'Select Tier', 'Payment'];

  return (
    <div className="onboarding-layout">
      <div className="onboarding-header">
        <h2>Z2B Legacy Builders</h2>
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div
              key={index}
              className={\`step \${index < currentStep ? 'completed' : ''} \${
                index === currentStep ? 'active' : ''
              }\`}
            >
              <div className="step-number">{index + 1}</div>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
      <main className="onboarding-content">{children}</main>
    </div>
  );
};

export default OnboardingLayout;`,

  // OnboardingLayout CSS
  'frontend/src/layouts/OnboardingLayout.css': `.onboarding-layout {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0A2647, #051428);
}

.onboarding-header {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.onboarding-header h2 {
  color: #FFD700;
  margin-bottom: 1rem;
}

.progress-steps {
  display: flex;
  justify-content: center;
  gap: 2rem;
  align-items: center;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  background: #e0e0e0;
  color: #999;
}

.step.active {
  background: #FFD700;
  color: #0A2647;
  font-weight: 600;
}

.step.completed {
  background: #4CAF50;
  color: white;
}

.step-number {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
}

.onboarding-content {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}`,

  // Navbar component
  'frontend/src/components/navigation/Navbar.jsx': `import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="public-navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Z2B Legacy Builders
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/tiers">Tiers</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/register" className="btn-gold">Get Started</Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn-gold">Dashboard</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;`,

  // Navbar CSS
  'frontend/src/components/navigation/Navbar.css': `.public-navbar {
  background: linear-gradient(135deg, #0A2647 0%, #051428 100%);
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.public-navbar .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.8rem;
  font-weight: bold;
  color: #FFD700 !important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.nav-links a:hover {
  color: #FFD700;
}

.btn-outline {
  padding: 0.5rem 1.5rem;
  border: 2px solid #FFD700;
  border-radius: 25px;
}

.btn-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FF6B35 100%);
  color: #0A2647;
  padding: 0.6rem 2rem;
  border-radius: 50px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.btn-gold:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6);
  color: white !important;
}`,

  // Footer
  'frontend/src/components/navigation/Footer.jsx': `import './Footer.css';

const Footer = () => {
  return (
    <footer className="public-footer">
      <div className="container">
        <p>&copy; 2025 Z2B Legacy Builders. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`,

  // Footer CSS
  'frontend/src/components/navigation/Footer.css': `.public-footer {
  background: #0A2647;
  color: white;
  padding: 2rem 0;
  margin-top: auto;
}

.public-footer .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: #FFD700;
  text-decoration: none;
  transition: opacity 0.3s;
}

.footer-links a:hover {
  opacity: 0.8;
}`,
};

console.log('🚀 Generating React components...\n');

let created = 0;
let failed = 0;

Object.entries(components).forEach(([filePath, content]) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const dir = path.dirname(fullPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created: ${filePath}`);
    created++;
  } catch (error) {
    console.log(`❌ Failed: ${filePath} - ${error.message}`);
    failed++;
  }
});

console.log('\n🎉 Complete! Created ' + created + ' files, ' + failed + ' failed.');
console.log('\n📝 Next: Update your pages to use these layouts!');
