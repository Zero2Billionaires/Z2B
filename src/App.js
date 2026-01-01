import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainNavigation from './comp/MainNavigation';
import Welcome from './comp/Welcome';
import Ecosystem from './comp/Ecosystem';
import VisionBoard from './comp/VisionBoard';
import MembershipPricing from './comp/MembershipPricing';
import SkillsAssessment from './comp/SkillsAssessment';
import DailyCheckIn from './comp/DailyCheckIn';
import AboutZ2B from './comp/AboutZ2B';
import MeetCoachManlaw from './comp/MeetCoachManlaw';
import SuccessStories from './comp/SuccessStories';
import Login from './comp/Login';
import MembersDashboard from './comp/MembersDashboard';
import AdminPanel from './comp/AdminPanel';
import Footer from './comp/Footer';
import './App.css';

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [milestone1Complete, setMilestone1Complete] = useState(false);
  const [membershipSelected, setMembershipSelected] = useState(false);
  const [milestone2Complete, setMilestone2Complete] = useState(false);
  const [currentView, setCurrentView] = useState('welcome');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const started = localStorage.getItem('hasStarted');
    const m1Complete = localStorage.getItem('milestone1Complete');
    const tierData = localStorage.getItem('selectedTier');
    const m2Complete = localStorage.getItem('milestone2Complete');
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (started === 'true') {
      setHasStarted(true);
    }

    if (m1Complete === 'true') {
      setMilestone1Complete(true);
    }

    if (tierData) {
      setMembershipSelected(true);
    }

    if (m2Complete === 'true') {
      setMilestone2Complete(true);
    }

    // Check authentication
    if (authToken && userData) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userData));
    }

    // Determine initial view based on progress
    if (started !== 'true') {
      setCurrentView('welcome');
    } else if (m2Complete === 'true') {
      setCurrentView('daily-checkin');
    } else if (tierData) {
      setCurrentView('skills-assessment');
    } else if (m1Complete === 'true') {
      setCurrentView('membership');
    } else {
      setCurrentView('vision-board');
    }
  }, []);

  const handleStartJourney = () => {
    localStorage.setItem('hasStarted', 'true');
    setHasStarted(true);
    setCurrentView('vision-board');
  };

  const handleVisionBoardComplete = (data) => {
    setMilestone1Complete(true);
    setCurrentView('membership');
    console.log('Vision Board Completed:', data);
  };

  const handleMembershipSelected = (tier) => {
    setMembershipSelected(true);
    setCurrentView('skills-assessment');
    console.log('Membership Tier Selected:', tier);
  };

  const handleSkillsAssessmentComplete = (data) => {
    setMilestone2Complete(true);
    setCurrentView('daily-checkin');
    console.log('Skills Assessment Completed:', data);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);

    // Redirect based on user role
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('welcome');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
      case 'welcome':
        return <Welcome onStartJourney={handleStartJourney} />;
      case 'ecosystem':
        return <Ecosystem />;
      case 'tiers':
      case 'membership':
        return <MembershipPricing onTierSelected={handleMembershipSelected} />;
      case 'get-started':
      case 'vision-board':
        return <VisionBoard onComplete={handleVisionBoardComplete} />;
      case 'skills-assessment':
        return <SkillsAssessment onComplete={handleSkillsAssessmentComplete} />;
      case 'daily-checkin':
        return <DailyCheckIn />;
      case 'about-z2b':
        return <AboutZ2B />;
      case 'about-coach':
        return <MeetCoachManlaw />;
      case 'testimonials':
        return <SuccessStories />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return isAuthenticated ? (
          <MembersDashboard user={currentUser} onLogout={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        );
      case 'admin':
        return isAuthenticated && currentUser?.role === 'admin' ? (
          <AdminPanel user={currentUser} onLogout={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        );
      // Placeholder pages (will implement later)
      case 'four-legs':
      case 'seven-stages':
      case 'teee-system':
      case 'milestones':
      case 'tli':
      case 'login':
        return (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
            <h1 style={{ color: '#daa520', marginBottom: '1rem' }}>Coming Soon</h1>
            <p style={{ color: '#c4a76f', fontSize: '1.2rem' }}>
              This page is under construction. Check back soon!
            </p>
            <button
              onClick={() => setCurrentView('home')}
              style={{
                marginTop: '2rem',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #daa520, #b8860b)',
                color: '#1a0f0a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ← Back to Home
            </button>
          </div>
        );
      default:
        return <Welcome onStartJourney={handleStartJourney} />;
    }
  };

  const milestoneStatus = {
    milestone1Complete,
    membershipSelected,
    milestone2Complete
  };

  // Don't show navigation/footer on dashboard or admin pages
  const showMainLayout = !['dashboard', 'admin'].includes(currentView);

  return (
    <Router>
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {showMainLayout && (
          <MainNavigation
            currentPage={currentView}
            onNavigate={handleNavigate}
            isLoggedIn={isAuthenticated}
          />
        )}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={renderContent()} />
          </Routes>
        </div>
        {showMainLayout && <Footer />}
      </div>
    </Router>
  );
}

export default App;