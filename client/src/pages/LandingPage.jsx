import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="logo-section">
            <h1 className="app-title">Z2B LEGACY BUILDERS APP</h1>
            <div className="tagline">Premium Gold & Black Edition</div>
          </div>

          {/* Vision & Mission */}
          <div className="vision-mission-container">
            <div className="vision-mission-card">
              <div className="card-icon">🎯</div>
              <h2 className="card-title">Our Vision & Mission</h2>
              <p className="mission-statement">
                Transforming <span className="highlight">Employees to Entrepreneurs</span> and
                ordinary people to <span className="highlight">Extraordinary Legacy Builders</span>
              </p>
              <div className="programme-badge">
                <span className="badge-icon">⚡</span>
                <span className="badge-text">90 Days Programme</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="cta-section">
            <button className="cta-btn primary" onClick={() => navigate('/dashboard')}>
              <span className="btn-icon">🚀</span>
              Enter Dashboard
            </button>
            <button className="cta-btn secondary">
              <span className="btn-icon">📚</span>
              Learn More
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="gold-accent top-left"></div>
        <div className="gold-accent bottom-right"></div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Z2B Legacy Builders?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Transform Your Career</h3>
            <p>From employee mindset to entrepreneurial freedom in just 90 days</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Build Your Legacy</h3>
            <p>Create generational wealth through proven network marketing strategies</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Multi-Tier Growth</h3>
            <p>Progress from FAM to Diamond Legacy with unlimited earning potential</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Comprehensive Training</h3>
            <p>90-day structured programme with mentorship and support</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">90</div>
            <div className="stat-label">Days to Transform</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">6</div>
            <div className="stat-label">Tier Levels</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">∞</div>
            <div className="stat-label">Earning Potential</div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="journey-section">
        <h2 className="section-title">Your 90-Day Journey</h2>
        <div className="journey-timeline">
          <div className="timeline-item">
            <div className="timeline-marker">1</div>
            <div className="timeline-content">
              <h3>Days 1-30: Foundation</h3>
              <p>Learn the fundamentals, understand the system, and start building your network</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">2</div>
            <div className="timeline-content">
              <h3>Days 31-60: Growth</h3>
              <p>Scale your team, master commission structures, and achieve your first tier upgrade</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">3</div>
            <div className="timeline-content">
              <h3>Days 61-90: Legacy</h3>
              <p>Establish passive income, mentor your team, and build generational wealth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="final-cta-content">
          <h2>Ready to Build Your Legacy?</h2>
          <p>Join thousands of entrepreneurs who transformed their lives in 90 days</p>
          <button className="cta-btn primary large" onClick={() => navigate('/dashboard')}>
            <span className="btn-icon">🎯</span>
            Start Your Journey Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2025 Z2B Legacy Builders App. All rights reserved.</p>
        <p className="footer-tagline">Transforming Lives, Building Legacies</p>
      </footer>
    </div>
  )
}

export default LandingPage
