/**
 * Public Navbar Component
 * Navigation for public pages (landing, login, register)
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="public-navbar">
      <div className="nav-container">
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

export default Navbar;
