import React from 'react';
import '../styles/about.css';

const SuccessStories = () => {
  return (
    <div className="about-container">
      {/* Header */}
      <div className="about-header">
        <h1>Success Stories</h1>
        <p className="about-tagline">Real People • Real Results • Real Legacies</p>
      </div>

      {/* Hero Challenge Section */}
      <section className="success-hero">
        <div className="hero-challenge-box">
          <div className="challenge-icon">🌟</div>
          <h2>Be the First to Tell the World!</h2>
          <p className="challenge-text">
            The Z2B Table is transforming lives across South Africa and beyond.
            <strong> Your success story could be the one that inspires thousands.</strong>
          </p>
          <p className="challenge-text">
            Will you be among the first Legacy Builders to share your transformation with the world?
            Your journey from ZERO to success starts TODAY!
          </p>
          <button className="challenge-button">
            🚀 Start My Journey & Be a Success Story
          </button>
        </div>
      </section>

      {/* The Power of Your Story */}
      <section className="about-section">
        <h2>Why Your Story Matters</h2>
        <div className="story-importance">
          <div className="importance-card">
            <div className="importance-icon">💡</div>
            <h3>Inspire Others</h3>
            <p>Your breakthrough becomes someone else's breakthrough. When you share your story, you light the path for others walking in darkness.</p>
          </div>
          <div className="importance-card">
            <div className="importance-icon">🎯</div>
            <h3>Solidify Your Success</h3>
            <p>Teaching what you've learned reinforces your transformation. Sharing your story cements your victory.</p>
          </div>
          <div className="importance-card">
            <div className="importance-icon">👥</div>
            <h3>Build Your Network</h3>
            <p>Success stories attract opportunity. Your testimony becomes your testimony—opening doors you never knew existed.</p>
          </div>
          <div className="importance-card">
            <div className="importance-icon">💰</div>
            <h3>Accelerate Your Income</h3>
            <p>As a featured success story, you become a leader in the Z2B community, increasing your TLI earning potential.</p>
          </div>
        </div>
      </section>

      {/* Success Criteria */}
      <section className="about-section criteria-section">
        <h2>What Makes a Powerful Success Story?</h2>
        <p className="section-intro">
          Your story doesn't have to be perfect—it just has to be real. Here's what we're looking for:
        </p>
        <div className="criteria-list">
          <div className="criteria-item">
            <div className="criteria-icon">✅</div>
            <div className="criteria-content">
              <h3>Clear Transformation</h3>
              <p>Show us your BEFORE (where you were) and AFTER (where you are now). The contrast is powerful.</p>
            </div>
          </div>
          <div className="criteria-item">
            <div className="criteria-icon">✅</div>
            <div className="criteria-content">
              <h3>Specific Results</h3>
              <p>Numbers tell stories. Income increase? Skills learned? Milestones completed? Share the details.</p>
            </div>
          </div>
          <div className="criteria-item">
            <div className="criteria-icon">✅</div>
            <div className="criteria-content">
              <h3>Honest Journey</h3>
              <p>Don't hide the struggles. Your obstacles overcome inspire more than your victories achieved.</p>
            </div>
          </div>
          <div className="criteria-item">
            <div className="criteria-icon">✅</div>
            <div className="criteria-content">
              <h3>Actionable Insights</h3>
              <p>What did you learn? What would you tell someone starting today? Your wisdom helps others win.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="about-section">
        <h2>Featured Success Stories</h2>
        <div className="coming-soon-box">
          <div className="coming-soon-icon">🎬</div>
          <h3>The Stage is Set... For YOU!</h3>
          <p>
            This space is reserved for the pioneering Legacy Builders who are transforming their lives
            right now through the Z2B Table system.
          </p>
          <p>
            <strong>Imagine your photo here.</strong><br />
            Imagine your story inspiring thousands.<br />
            Imagine being recognized as one of the FIRST to prove the Z2B system works.
          </p>
          <p className="cta-text">
            That's not just imagination—that's your future. But only if you START TODAY.
          </p>
        </div>
      </section>

      {/* The Challenge */}
      <section className="about-section challenge-section">
        <h2>The Z2B Success Story Challenge</h2>
        <div className="challenge-box">
          <h3>Here's Your Challenge:</h3>
          <div className="challenge-steps">
            <div className="challenge-step">
              <div className="step-number">1</div>
              <p><strong>Start Free:</strong> Complete Milestone 1 (Vision Board) at NO COST</p>
            </div>
            <div className="challenge-step">
              <div className="step-number">2</div>
              <p><strong>Choose Your Tier:</strong> Select the membership level that fits your ambition</p>
            </div>
            <div className="challenge-step">
              <div className="step-number">3</div>
              <p><strong>Work the System:</strong> Complete all 7 milestones using the TEEE framework</p>
            </div>
            <div className="challenge-step">
              <div className="step-number">4</div>
              <p><strong>Document Everything:</strong> Track your wins, lessons, and breakthroughs</p>
            </div>
            <div className="challenge-step">
              <div className="step-number">5</div>
              <p><strong>Share Your Story:</strong> Submit your transformation and inspire the world</p>
            </div>
          </div>
          <p className="challenge-reward">
            <strong>Your Reward:</strong> Featured placement on our Success Stories page, increased credibility
            in the Z2B community, and the satisfaction of knowing YOU helped someone else believe.
          </p>
        </div>
      </section>

      {/* Testimonial Template */}
      <section className="about-section template-section">
        <h2>Your Success Story Template</h2>
        <div className="template-box">
          <p><strong>Copy this template to start crafting your story:</strong></p>
          <div className="template-content">
            <p>📍 <strong>BEFORE Z2B:</strong> [Describe your situation - job, income, mindset, struggles]</p>
            <p>🎯 <strong>WHY I JOINED:</strong> [What made you say "enough is enough" and take action?]</p>
            <p>🚀 <strong>MY JOURNEY:</strong> [Key milestones, challenges overcome, pivotal moments]</p>
            <p>💰 <strong>RESULTS:</strong> [Specific outcomes - income, skills, mindset shifts, achievements]</p>
            <p>🌟 <strong>BIGGEST LESSON:</strong> [What surprised you? What would you tell your past self?]</p>
            <p>👥 <strong>MY ADVICE:</strong> [Wisdom for someone considering starting their Z2B journey]</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="about-cta">
        <h2>Don't Wait for "Someday"</h2>
        <p>
          The builders who become success stories aren't smarter, luckier, or more talented than you.
          They just started. They committed. They showed up.
        </p>
        <p>
          <strong>Your success story is waiting to be written.</strong>
        </p>
        <p>
          Will you write it? Or will you watch someone else write theirs while you stay where you are?
        </p>
        <button className="cta-button">
          ✍️ Yes! I'm Ready to Write My Success Story
        </button>
        <p className="cta-footnote">
          Milestone 1 is 100% FREE. No credit card. No risk. Just you, your vision, and your future.
        </p>
      </section>
    </div>
  );
};

export default SuccessStories;
