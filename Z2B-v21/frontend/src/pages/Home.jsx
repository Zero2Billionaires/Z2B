/**
 * Home Page (Landing Page)
 * Public facing page for visitors
 * TODO: Convert full landing-page.html design to React
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../layouts/PublicLayout';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <PublicLayout>
      <div className="landing-hero">
        <div className="container py-5">
          <div className="text-center">
            <h1 className="display-3 fw-bold mb-4">
              Build Your Billion Dollar Legacy
            </h1>
            <p className="lead mb-5" style={{ fontSize: '1.5rem', color: '#f0f0f0' }}>
              Transform Employees into Entrepreneurs
            </p>

            {!isAuthenticated ? (
              <div className="d-flex justify-content-center gap-3">
                <Link to="/register" className="cta-btn cta-primary">
                  Get Started
                </Link>
                <Link to="/login" className="cta-btn cta-outline">
                  Login
                </Link>
              </div>
            ) : (
              <div>
                <Link to="/dashboard" className="cta-btn cta-primary">
                  Go to Dashboard
                </Link>
              </div>
            )}

            <div className="mt-5">
              <Link to="/tiers" className="tier-link">
                View Membership Tiers →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .landing-hero {
          min-height: 80vh;
          background: linear-gradient(135deg, #0A2647 0%, #051428 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .landing-hero h1 {
          background: linear-gradient(135deg, #FFD700, #FF6B35);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-btn {
          padding: 1rem 3rem;
          font-size: 1.2rem;
          font-weight: 600;
          border-radius: 50px;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s;
        }

        .cta-primary {
          background: linear-gradient(135deg, #FFD700 0%, #FF6B35 100%);
          color: #0A2647;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        }

        .cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6);
        }

        .cta-outline {
          border: 2px solid #FFD700;
          color: #FFD700;
        }

        .cta-outline:hover {
          background: #FFD700;
          color: #0A2647;
        }

        .tier-link {
          color: #FFD700;
          font-size: 1.3rem;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .tier-link:hover {
          color: #FF6B35;
        }
      `}</style>
    </PublicLayout>
  );
};

export default Home;
