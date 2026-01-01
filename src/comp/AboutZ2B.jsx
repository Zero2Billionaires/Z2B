import React from 'react';
import '../styles/about.css';

const AboutZ2B = () => {
  const stages = [
    { number: 1, name: 'Awareness', icon: '👁️', description: 'Recognize your current reality and discover what\'s truly possible for your future' },
    { number: 2, name: 'Alignment', icon: '🎯', description: 'Align your goals, values, and vision with your transformation path' },
    { number: 3, name: 'Action', icon: '⚡', description: 'Take consistent daily steps that move you toward your entrepreneurial goals' },
    { number: 4, name: 'Adjustment', icon: '🔧', description: 'Adapt your strategies based on real feedback and lessons learned along the way' },
    { number: 5, name: 'Acceleration', icon: '🚀', description: 'Scale your efforts and multiply your results exponentially through proven systems' },
    { number: 6, name: 'Ascension', icon: '📈', description: 'Reach new levels of success, influence, and financial freedom beyond your dreams' },
    { number: 7, name: 'Activation', icon: '👑', description: 'Become a leader who activates and inspires transformation in others' }
  ];

  const legs = [
    { name: 'Mindset', icon: '🧠', description: 'Transform your thinking from scarcity to abundance, from employee to entrepreneur' },
    { name: 'Systems', icon: '⚙️', description: 'Build scalable processes and structures that work without you' },
    { name: 'Relationships', icon: '🤝', description: 'Cultivate meaningful connections that amplify your impact and opportunities' },
    { name: 'Legacy', icon: '👑', description: 'Create lasting wealth and impact that outlives you' }
  ];

  return (
    <div className="about-container">
      {/* Header */}
      <div className="about-header">
        <h1>About Z2B Legacy Builders</h1>
        <p className="about-tagline">From Zero to Billionaire - Your Transformation Journey</p>
      </div>

      {/* Introduction */}
      <section className="about-section">
        <h2>What is Z2B Legacy Builders?</h2>
        <div className="about-content">
          <p>
            <strong>Z2B Legacy Builders</strong> is a comprehensive Personal and Business Development Program
            owned by <strong>ZERO2BILLIONAIRES AMAVULANDLELA (Pty) Ltd</strong>, founded by
            <strong> Rev Mokoro Manana</strong>, the visionary author of the transformative book
            <em> ZERO2BILLIONAIRES</em>.
          </p>
          <p>
            What started as Rev Mokoro Manana's personal blueprint for transformation, education, empowerment,
            and enrichment (TEEE) has evolved into a powerful movement helping thousands of individuals
            across South Africa and beyond build their own legacy tables.
          </p>
          <p>
            Rev Manana realized that the frameworks and systems he developed for his own journey from
            zero to success weren't just for him—they could help countless others break free from
            financial limitations, unlock their potential, and create generational wealth.
          </p>
        </div>
      </section>

      {/* The TEEE Framework */}
      <section className="about-section teee-framework-section">
        <h2>The TEEE Framework</h2>
        <p className="section-intro">
          Our proven methodology for transforming lives and building legacies
        </p>
        <div className="framework-grid">
          <div className="framework-card transformation">
            <div className="framework-icon">🔄</div>
            <h3>Transformation</h3>
            <p>
              Change your mindset, habits, and approach to wealth-building. Break free from
              limiting beliefs and embrace the entrepreneur within you.
            </p>
          </div>
          <div className="framework-card education">
            <div className="framework-icon">📚</div>
            <h3>Education</h3>
            <p>
              Learn proven strategies, skills, and systems to build sustainable income.
              Access world-class training and resources tailored to your journey.
            </p>
          </div>
          <div className="framework-card empowerment">
            <div className="framework-icon">⚡</div>
            <h3>Empowerment</h3>
            <p>
              Take action, build your team, and create lasting impact. Gain the tools,
              confidence, and support to turn vision into reality.
            </p>
          </div>
          <div className="framework-card enrichment">
            <div className="framework-icon">💰</div>
            <h3>Enrichment</h3>
            <p>
              Generate income, build wealth, and achieve financial freedom. Create multiple
              revenue streams that compound over time.
            </p>
          </div>
        </div>
      </section>

      {/* The 4 Legs */}
      <section className="about-section">
        <h2>The 4 Legs of the Billionaire Table</h2>
        <p className="section-intro">
          Every successful billionaire's table stands on these four foundational pillars
        </p>
        <div className="legs-grid">
          {legs.map((leg, index) => (
            <div key={index} className="leg-card">
              <div className="leg-icon">{leg.icon}</div>
              <h3>{leg.name}</h3>
              <p>{leg.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The 7 Stages */}
      <section className="about-section stages-section">
        <h2>The 7-Stage Transformation Journey</h2>
        <p className="section-intro">
          Your roadmap from where you are to where you want to be
        </p>
        <div className="stages-timeline">
          {stages.map((stage, index) => (
            <div key={index} className="stage-item">
              <div className="stage-number">{stage.number}</div>
              <div className="stage-icon">{stage.icon}</div>
              <div className="stage-content">
                <h3>{stage.name}</h3>
                <p>{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-section mission-section">
        <h2>Our Mission</h2>
        <div className="mission-box">
          <p>
            To empower 1 million African entrepreneurs to build sustainable businesses and
            generational wealth by 2030, transforming families, communities, and the continent's
            economic landscape.
          </p>
        </div>

        <h2 style={{ marginTop: '3rem' }}>Our Vision</h2>
        <div className="vision-box">
          <p>
            A world where every individual has access to the knowledge, tools, and support
            needed to transform their life from zero to legacy builder—where financial freedom
            is not a privilege but a birthright.
          </p>
        </div>
      </section>

      {/* Why Z2B Works */}
      <section className="about-section why-section">
        <h2>Why Z2B Legacy Builders Works</h2>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">✅</div>
            <h3>Proven Framework</h3>
            <p>Battle-tested by Rev Mokoro Manana himself and refined through thousands of success stories</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🤖</div>
            <h3>AI-Powered Coaching</h3>
            <p>24/7 access to Coach Manlaw, your personal AI mentor who never sleeps</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🎯</div>
            <h3>Action-Oriented</h3>
            <p>Not just theory—every lesson comes with actionable steps and accountability</p>
          </div>
          <div className="why-card">
            <div className="why-icon">👥</div>
            <h3>Community Support</h3>
            <p>Join a network of ambitious builders supporting each other's growth</p>
          </div>
          <div className="why-card">
            <div className="why-icon">💎</div>
            <h3>Complete Ecosystem</h3>
            <p>12 powerful apps and tools designed to accelerate your success</p>
          </div>
          <div className="why-card">
            <div className="why-icon">📈</div>
            <h3>Income Opportunity</h3>
            <p>Earn while you learn through our TLI (Team Leadership Incentive) program</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <h2>Ready to Build Your Legacy?</h2>
        <p>
          Join thousands of builders who have transformed their lives through the Z2B Table system.
          Your journey from zero to billionaire starts with a single decision.
        </p>
        <button className="cta-button">
          🚀 Start Your Free Milestone 1
        </button>
      </section>
    </div>
  );
};

export default AboutZ2B;
