import React from 'react';
import '../styles/welcome.css';
import z2bTableLogo from '../assets/z2b-table-logo.jpeg';

const Welcome = ({ onStartJourney }) => {
  const milestones = [
    { number: 1, name: 'Vision Board', icon: '🎯', free: true, description: 'Define your WHY, SWOT, and legacy vision' },
    { number: 2, name: 'Skills Assessment', icon: '📚', free: false, description: 'Identify skills, gaps, and set goals' },
    { number: 3, name: 'Revenue Streams', icon: '💰', free: false, description: 'Map income sources and opportunities' },
    { number: 4, name: 'Action Plan', icon: '📋', free: false, description: 'Create your 90-day roadmap' },
    { number: 5, name: 'Market Research', icon: '🔍', free: false, description: 'Define your audience and niche' },
    { number: 6, name: 'Personal Brand', icon: '⭐', free: false, description: 'Build your unique value proposition' },
    { number: 7, name: 'Launch Ready', icon: '🚀', free: false, description: 'Go live with your Table' }
  ];

  const tliHighlights = [
    { level: '☿️ MERCURY', income: 'R2.5K - R10K' },
    { level: '🌍 EARTH', income: 'R10K - R40K' },
    { level: '🪐 JUPITER', income: 'R50K - R150K' },
    { level: '💫 MAMA I MADE IT', income: 'R100K - R300K' },
    { level: '☀️ THE SUN', income: 'R1M - R2.5M' },
    { level: '♾️ THE COSMOS', income: 'R3M - R5M' }
  ];

  return (
    <div className="welcome-container">
      {/* Hero Section */}
      <div className="welcome-hero-section">
        <div className="hero-content">
          <div className="hero-logo-container">
            <img src={z2bTableLogo} alt="Z2B Table" className="hero-logo" />
          </div>
          <h1 className="hero-title">Welcome to Your Legacy Table</h1>
          <p className="hero-tagline">Transformation • Education • Empowerment • Enrichment</p>
          <p className="hero-description">
            Build wealth, create impact, and leave a legacy that outlives you.
            Join thousands of builders turning dreams into reality through the Z2B Table system.
          </p>
        </div>
      </div>

      {/* What is Z2B Table */}
      <div className="section what-is-section">
        <h2>🪑 What is the Z2B Table?</h2>
        <p className="section-intro">
          Your Table is more than a business—it's your personal ecosystem for building generational wealth.
          Whether you're a creator, entrepreneur, investor, or impact-maker, the Z2B Table gives you
          the framework, tools, and community to turn your vision into sustainable income.
        </p>

        <div className="tee-pillars">
          <div className="pillar">
            <div className="pillar-icon">🔄</div>
            <h3>Transformation</h3>
            <p>Change your mindset, habits, and approach to wealth-building</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">📚</div>
            <h3>Education</h3>
            <p>Learn proven strategies, skills, and systems to build your Table</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">⚡</div>
            <h3>Empowerment</h3>
            <p>Take action, build your team, and create lasting impact</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">💰</div>
            <h3>Enrichment</h3>
            <p>Generate income, build wealth, and achieve financial freedom</p>
          </div>
        </div>
      </div>

      {/* Framework Hierarchy */}
      <div className="section framework-section">
        <h2>🎯 How It All Connects</h2>
        <p className="section-intro">
          Three powerful frameworks work together to transform you from zero to billionaire.
        </p>

        <div className="framework-stack">
          <div className="framework-layer foundation">
            <div className="framework-label">FOUNDATION</div>
            <div className="framework-content">
              <h3>🪑 4 Legs + 🌟 7 Stages</h3>
              <p>The proven blueprint every billionaire follows</p>
            </div>
          </div>

          <div className="framework-arrow">↓</div>

          <div className="framework-layer presentation">
            <div className="framework-label">PRESENTATION</div>
            <div className="framework-content">
              <h3>TEEE System</h3>
              <p>Transformation • Education • Empowerment • Enrichment</p>
            </div>
          </div>

          <div className="framework-arrow">↓</div>

          <div className="framework-layer journey">
            <div className="framework-label">YOUR JOURNEY</div>
            <div className="framework-content">
              <h3>🗺️ 7 Milestones</h3>
              <p>Your personalized pit stops to celebrate & measure progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* The 4 Legs of the Billionaire Table */}
      <div className="section legs-section">
        <h2>🪑 The 4 Legs of the Billionaire Table</h2>
        <p className="section-intro">
          Your Table stands on 4 unshakeable legs. Each leg represents a pillar of wealth-building
          that successful entrepreneurs master. Neglect one, and your Table wobbles.
        </p>

        <div className="legs-grid">
          <div className="leg-card">
            <div className="leg-number">1</div>
            <div className="leg-icon">🧠</div>
            <h3>Mindset</h3>
            <p>Transform your thinking patterns and beliefs to unlock unlimited potential</p>
            <div className="leg-detail">Shift from employee to entrepreneur thinking</div>
          </div>

          <div className="leg-card">
            <div className="leg-number">2</div>
            <div className="leg-icon">⚙️</div>
            <h3>Systems</h3>
            <p>Build automated processes and frameworks that generate consistent results</p>
            <div className="leg-detail">Create scalable, repeatable operations</div>
          </div>

          <div className="leg-card">
            <div className="leg-number">3</div>
            <div className="leg-icon">🤝</div>
            <h3>Relationships</h3>
            <p>Cultivate meaningful connections that amplify your impact and opportunities</p>
            <div className="leg-detail">Leverage networks for growth</div>
          </div>

          <div className="leg-card">
            <div className="leg-number">4</div>
            <div className="leg-icon">🏛️</div>
            <h3>Legacy</h3>
            <p>Create lasting impact that transcends your lifetime and transforms generations</p>
            <div className="leg-detail">Build something bigger than yourself</div>
          </div>
        </div>
      </div>

      {/* The 7-Stage Transformation Journey */}
      <div className="section stages-section">
        <h2>🌟 The 7-Stage Transformation Journey</h2>
        <p className="section-intro">
          Every billionaire follows a transformation journey. These 7 stages map directly to your
          7 milestones, guiding you from awareness to becoming a leader who activates others.
        </p>

        <div className="stages-journey">
          <div className="stage-item">
            <div className="stage-number">1</div>
            <div className="stage-content">
              <h3>Awareness</h3>
              <p>Recognize your current reality and discover what's truly possible for your future</p>
              <div className="stage-milestone">→ M1: Vision Board</div>
            </div>
          </div>

          <div className="stage-item">
            <div className="stage-number">2</div>
            <div className="stage-content">
              <h3>Alignment</h3>
              <p>Align your goals, values, and vision with your transformation path</p>
              <div className="stage-milestone">→ M1-M2: Vision → Skills</div>
            </div>
          </div>

          <div className="stage-item">
            <div className="stage-number">3</div>
            <div className="stage-content">
              <h3>Action</h3>
              <p>Take consistent daily steps that move you toward your entrepreneurial goals</p>
              <div className="stage-milestone">→ M2-M3: Skills → Revenue</div>
            </div>
          </div>

          <div className="stage-item">
            <div className="stage-number">4</div>
            <div className="stage-content">
              <h3>Adjustment</h3>
              <p>Adapt your strategies based on real feedback and lessons learned along the way</p>
              <div className="stage-milestone">→ M3-M4: Revenue → Action Plan</div>
            </div>
          </div>

          <div className="stage-item">
            <div className="stage-number">5</div>
            <div className="stage-content">
              <h3>Acceleration</h3>
              <p>Scale your efforts and multiply your results exponentially through proven systems</p>
              <div className="stage-milestone">→ M4-M5: Plan → Market Research</div>
            </div>
          </div>

          <div className="stage-item">
            <div className="stage-number">6</div>
            <div className="stage-content">
              <h3>Ascension</h3>
              <p>Reach new levels of success, influence, and financial freedom beyond your dreams</p>
              <div className="stage-milestone">→ M6: Personal Brand</div>
            </div>
          </div>

          <div className="stage-item">
            <div className="stage-number">7</div>
            <div className="stage-content">
              <h3>Activation</h3>
              <p>Become a leader who activates and inspires transformation in others</p>
              <div className="stage-milestone">→ M7: Launch Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* The Journey: 7 Milestones */}
      <div className="section milestones-section">
        <h2>🗺️ Your Journey: 7 TEEE Milestones</h2>
        <p className="section-intro">
          Complete structured milestones that guide you from vision to execution.
          Each milestone builds on the last, creating unstoppable momentum toward transformation,
          education, empowerment, and financial enrichment.
        </p>

        <div className="milestones-grid">
          {milestones.map(milestone => (
            <div key={milestone.number} className={`milestone-card ${milestone.free ? 'free' : 'paid'}`}>
              <div className="milestone-header">
                <span className="milestone-icon">{milestone.icon}</span>
                <div className="milestone-title">
                  <span className="milestone-number">M{milestone.number}</span>
                  <span className="milestone-name">{milestone.name}</span>
                </div>
              </div>
              <p className="milestone-description">{milestone.description}</p>
              <div className="milestone-badge">
                {milestone.free ? '✅ FREE' : '💎 Members Only'}
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-transparency">
          <div className="transparency-box">
            <h3>💡 Full Transparency on Pricing</h3>
            <p>
              <strong>Milestone 1 (Vision Board) is 100% FREE</strong> — no credit card, no commitment.
              Experience the power of the Z2B Table system risk-free.
            </p>
            <p>
              To unlock <strong>Milestones 2-7</strong> and access our full <strong>ZERO2BILLIONAIRES ECOSYSTEM</strong> (apps, AI tools, community, coaching, income opportunities),
              you'll choose a membership tier that fits your goals. Investment starts at <strong>R480 (Beta pricing)</strong>.
            </p>
            <p className="transparency-note">
              We believe in earning your trust through results, not misleading tactics.
              Try M1 free, see the value, then decide if this is right for you.
            </p>
          </div>
        </div>
      </div>

      {/* TLI Challenge Preview */}
      <div className="section tli-section">
        <h2>🎯 The TLI Challenge: Your Income Roadmap</h2>
        <p className="section-intro">
          Track your progress through 10 celestial levels as you build your income from
          R2,500/month to R5 million/month. Every milestone brings you closer to financial freedom.
        </p>

        <div className="tli-preview-grid">
          {tliHighlights.map((tli, index) => (
            <div key={index} className="tli-preview-card">
              <div className="tli-level">{tli.level}</div>
              <div className="tli-income">{tli.income}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Focus Areas */}
      <div className="section tables-section">
        <h2>🎨 Choose Your Table Focus</h2>
        <div className="tables-grid">
          <div className="table-card">
            <span className="table-icon">🎨</span>
            <h3>Creator Table</h3>
            <p>Digital products, content, courses, AI tools</p>
          </div>
          <div className="table-card">
            <span className="table-icon">💼</span>
            <h3>Entrepreneur Table</h3>
            <p>Trading, services, SMEs, systems</p>
          </div>
          <div className="table-card">
            <span className="table-icon">👨‍👩‍👧‍👦</span>
            <h3>Family Table</h3>
            <p>Generational wealth, education, property</p>
          </div>
          <div className="table-card">
            <span className="table-icon">🌍</span>
            <h3>Social Impact Table</h3>
            <p>Community upliftment, healing, transformation</p>
          </div>
          <div className="table-card">
            <span className="table-icon">💰</span>
            <h3>Investor Table</h3>
            <p>Real estate, farming, multiple streams</p>
          </div>
          <div className="table-card">
            <span className="table-icon">🚀</span>
            <h3>Innovation Table</h3>
            <p>Digital-first, scale, raise capital</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="section cta-section">
        <div className="cta-box">
          <h2>🎉 Ready to Build Your Legacy?</h2>
          <p className="cta-description">
            Start with Milestone 1 absolutely free. No risk, no pressure.
            Just you, your vision, and the first step toward the life you deserve.
          </p>

          <div className="cta-features">
            <div className="cta-feature">✅ 100% Free Vision Board</div>
            <div className="cta-feature">✅ No Credit Card Required</div>
            <div className="cta-feature">✅ Access TLI Tracker</div>
            <div className="cta-feature">✅ Instant Access</div>
          </div>

          <button className="cta-button" onClick={onStartJourney}>
            🚀 Start Milestone 1 FREE
          </button>

          <p className="cta-footnote">
            After completing M1, you can choose to upgrade to access the full 7-milestone TEEE journey and income opportunities.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="welcome-footer-info">
        <p>
          Questions? Visit{' '}
          <a href="https://www.z2blegacybuilders.co.za" target="_blank" rel="noopener noreferrer">
            Z2B Legacy Builders
          </a>
        </p>
      </div>
    </div>
  );
};

export default Welcome;
