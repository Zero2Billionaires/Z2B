/**
 * Main App Component
 * Sets up routing and global providers
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Income from './pages/Income';
import Marketplace from './pages/Marketplace';
import CoachManlaw from './pages/CoachManlaw';
import Tiers from './pages/Tiers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// App Pages
import Benown from './pages/apps/Benown';
import Zyra from './pages/apps/Zyra';
import Vidzie from './pages/apps/Vidzie';
import Glowie from './pages/apps/Glowie';
import Zynect from './pages/apps/Zynect';
import Zyro from './pages/apps/Zyro';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tiers" element={<Tiers />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            }
          />
          <Route
            path="/income"
            element={
              <ProtectedRoute>
                <Income />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute>
                <CoachManlaw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* App Routes */}
          <Route
            path="/apps/benown"
            element={
              <ProtectedRoute>
                <Benown />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apps/zyra"
            element={
              <ProtectedRoute>
                <Zyra />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apps/vidzie"
            element={
              <ProtectedRoute>
                <Vidzie />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apps/glowie"
            element={
              <ProtectedRoute>
                <Glowie />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apps/zynect"
            element={
              <ProtectedRoute>
                <Zynect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apps/zyro"
            element={
              <ProtectedRoute>
                <Zyro />
              </ProtectedRoute>
            }
          />

          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
