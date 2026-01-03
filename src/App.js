import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import Opportunity from './comp/Opportunity';
import TLIChallenge from './comp/TLIChallenge';
import MilestoneTracker from './comp/MilestoneTracker';
import IncomeTracker from './comp/IncomeTracker';
import Login from './comp/Login';
import AdminLogin from './comp/AdminLogin';
import MembersDashboard from './comp/MembersDashboard';
import AdminPanel from './comp/AdminPanel';
import MembershipSignUp from './comp/MembershipSignUp';
import PaymentProcessing from './comp/PaymentProcessing';
import Footer from './comp/Footer';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (authToken && userData) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userData));
    }

    // Capture referral code from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || urlParams.get('referral');
    if (refCode) {
      // Store referral code in localStorage for later use
      localStorage.setItem('referralCode', refCode);
      console.log('Referral code captured:', refCode);
    }
  }, []);

  const handleNavigate = (path) => {
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    navigate(cleanPath);
  };

  const handleStartJourney = () => {
    localStorage.setItem('hasStarted', 'true');
    navigate('/vision-board');
  };

  const handleVisionBoardComplete = (data) => {
    localStorage.setItem('milestone1Complete', 'true');
    navigate('/tiers');
  };

  const handleMembershipSelected = (tier) => {
    navigate('/signup');
  };

  const handleSignUpComplete = (membershipData) => {
    navigate('/payment');
  };

  const handleSkillsAssessmentComplete = (data) => {
    localStorage.setItem('milestone2Complete', 'true');
    navigate('/daily-checkin');
  };

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  };

  // Don't show navigation/footer on dashboard, admin pages, or admin-login
  const currentPath = location.pathname;
  const showMainLayout = !['/dashboard', '/admin', '/admin-login'].includes(currentPath);

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showMainLayout && (
        <MainNavigation
          currentPage={currentPath}
          onNavigate={handleNavigate}
          isLoggedIn={isAuthenticated}
        />
      )}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Welcome onStartJourney={handleStartJourney} onNavigate={handleNavigate} />} />
          <Route path="/home" element={<Welcome onStartJourney={handleStartJourney} onNavigate={handleNavigate} />} />
          <Route path="/ecosystem" element={<Ecosystem onNavigate={handleNavigate} />} />
          <Route path="/tiers" element={<MembershipPricing onTierSelected={handleMembershipSelected} />} />
          <Route path="/membership" element={<MembershipPricing onTierSelected={handleMembershipSelected} />} />
          <Route path="/signup" element={<MembershipSignUp onNavigate={handleNavigate} onComplete={handleSignUpComplete} />} />
          <Route path="/payment" element={<PaymentProcessing onNavigate={handleNavigate} />} />
          <Route path="/get-started" element={<VisionBoard onComplete={handleVisionBoardComplete} />} />
          <Route path="/vision-board" element={<VisionBoard onComplete={handleVisionBoardComplete} />} />
          <Route path="/skills-assessment" element={<SkillsAssessment onComplete={handleSkillsAssessmentComplete} />} />
          <Route path="/daily-checkin" element={<DailyCheckIn />} />
          <Route path="/about-z2b" element={<AboutZ2B onNavigate={handleNavigate} />} />
          <Route path="/about-coach" element={<MeetCoachManlaw onNavigate={handleNavigate} />} />
          <Route path="/testimonials" element={<SuccessStories onNavigate={handleNavigate} />} />
          <Route path="/opportunity" element={<Opportunity onNavigate={handleNavigate} />} />
          <Route path="/tli" element={<TLIChallenge onNavigate={handleNavigate} />} />
          <Route path="/milestones" element={<MilestoneTracker onNavigate={handleNavigate} />} />
          <Route path="/income" element={<IncomeTracker onNavigate={handleNavigate} />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/admin-login" element={<AdminLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <MembersDashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/admin"
            element={
              isAuthenticated && currentUser?.role === 'admin' ? (
                <AdminPanel user={currentUser} onLogout={handleLogout} />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
        </Routes>
      </div>
      {showMainLayout && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
