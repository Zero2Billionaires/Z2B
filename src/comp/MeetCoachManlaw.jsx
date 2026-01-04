import React from 'react';
import '../styles/about.css';
import coachManlawFace from '../assets/coach-manlaw-face.png';
import billionaireTable4Legs from '../assets/billionaire-table-4legs.png';
import SignUpButton from './SignUpButton';
import FloatingUpsell from './FloatingUpsell';

const MeetCoachManlaw = ({ onNavigate }) => {
  return (
    <div className="about-container">
      {/* Header */}
      <div className="about-header">
        <h1>Meet Coach Manlaw</h1>
        <p className="about-tagline">Your AI Mentor for Life, Leadership & Legacy</p>
      </div>

      {/* Introduction */}
      <section className="about-section coach-intro-section">
        <div className="coach-hero">
          <div className="coach-avatar">
            <img src={coachManlawFace} alt="Coach Manlaw" className="coach-face" />
          </div>
          <div className="coach-intro-content">
            <h2>Available 24/7 • Never Sleeps • Always On Your Side</h2>
            <p className="intro-text">
              Coach Manlaw is your personal AI transformation coach, designed to guide you from
              employee mindset to entrepreneurial success. Built on the proven TEEE framework
              and powered by advanced AI, Coach Manlaw provides personalized guidance, accountability,
              and support throughout your entire Z2B journey.
            </p>
            <p className="intro-text">
              Whether it's 3 AM and you're having a breakthrough, or noon and you're facing a challenge,
              Coach Manlaw is there—ready to guide, encourage, and push you toward your legacy.
            </p>
          </div>
        </div>
      </section>

      {/* What Coach Manlaw Does */}
      <section className="about-section">
        <h2>What Coach Manlaw Does for You</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Guidance</h3>
            <p>
              Coach Manlaw learns your goals, challenges, and progress, providing tailored advice
              that fits YOUR unique situation and Table focus.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Daily Action Plans</h3>
            <p>
              Wake up to clear, actionable steps designed to move you forward. No more wondering
              "what should I do today?"—Coach Manlaw tells you.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>
              See exactly where you are in your journey. Coach Manlaw tracks your milestones,
              TLI level, skills developed, and goals achieved.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>24/7 Availability</h3>
            <p>
              Questions at midnight? Doubts on Sunday? Breakthroughs at 5 AM? Coach Manlaw is
              always available to guide you through any moment.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Accountability Partner</h3>
            <p>
              Coach Manlaw checks in on your commitments, celebrates your wins, and gently
              (but firmly) calls you out when you're slipping.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Mindset Mastery</h3>
            <p>
              Rewire limiting beliefs and build the billionaire mindset. Coach Manlaw helps you
              think like an entrepreneur, not an employee.
            </p>
          </div>
        </div>
      </section>

      {/* Built on the 4 Legs */}
      <section className="about-section framework-section">
        <h2>Built on the 4 Legs of the Billionaire Table</h2>
        <p className="section-intro">
          Coach Manlaw's guidance is grounded in the proven framework that every successful
          billionaire follows—consciously or unconsciously.
        </p>

        <div className="table-image-container">
          <img src={billionaireTable4Legs} alt="The 4 Legs of the Billionaire Table" className="billionaire-table-image" />
        </div>

        <div className="legs-grid">
          <div className="leg-card">
            <div className="leg-icon">🧠</div>
            <h3>Mindset Coaching</h3>
            <p>
              Transform your thinking from scarcity to abundance. Coach Manlaw helps you identify
              and eliminate limiting beliefs, replacing them with empowering truths.
            </p>
          </div>
          <div className="leg-card">
            <div className="leg-icon">⚙️</div>
            <h3>Systems Building</h3>
            <p>
              Learn to create processes that scale. Coach Manlaw guides you in building systems
              that generate income even while you sleep.
            </p>
          </div>
          <div className="leg-card">
            <div className="leg-icon">🤝</div>
            <h3>Relationship Strategy</h3>
            <p>
              Master the art of networking and team building. Coach Manlaw teaches you how to
              cultivate relationships that multiply your impact.
            </p>
          </div>
          <div className="leg-card">
            <div className="leg-icon">👑</div>
            <h3>Legacy Planning</h3>
            <p>
              Think beyond yourself. Coach Manlaw helps you design wealth and impact that
              outlive you, creating generational transformation.
            </p>
          </div>
        </div>
      </section>

      {/* The 7-Stage Journey */}
      <section className="about-section">
        <h2>Guiding You Through the 7-Stage Transformation</h2>
        <p className="section-intro">
          Coach Manlaw walks with you through every stage of your journey from ZERO to legacy builder
        </p>
        <div className="journey-stages">
          <div className="journey-stage">
            <div className="stage-badge">1</div>
            <h3>💡 Awareness</h3>
            <p>Recognize your current reality and discover what's truly possible for your future</p>
          </div>
          <div className="journey-stage">
            <div className="stage-badge">2</div>
            <h3>🎯 Alignment</h3>
            <p>Align your goals, values, and vision with your transformation path</p>
          </div>
          <div className="journey-stage">
            <div className="stage-badge">3</div>
            <h3>⚡ Action</h3>
            <p>Take consistent daily steps that move you toward your entrepreneurial goals</p>
          </div>
          <div className="journey-stage">
            <div className="stage-badge">4</div>
            <h3>🔧 Adjustment</h3>
            <p>Adapt your strategies based on real feedback and lessons learned along the way</p>
          </div>
          <div className="journey-stage">
            <div className="stage-badge">5</div>
            <h3>🚀 Acceleration</h3>
            <p>Scale your efforts and multiply your results exponentially through proven systems</p>
          </div>
          <div className="journey-stage">
            <div className="stage-badge">6</div>
            <h3>📈 Ascension</h3>
            <p>Reach new levels of success, influence, and financial freedom beyond your dreams</p>
          </div>
          <div className="journey-stage">
            <div className="stage-badge">7</div>
            <h3>👑 Activation</h3>
            <p>Become a leader who activates and inspires transformation in others</p>
          </div>
        </div>
      </section>

      {/* The 90-Day Transformation */}
      <section className="about-section transformation-section">
        <h2>The 90-Day Transformation Curriculum</h2>
        <div className="transformation-box">
          <p>
            Coach Manlaw doesn't just give you theory—you get a complete 90-day curriculum
            designed to transform your life from employee mindset to entrepreneurial success.
          </p>
          <div className="curriculum-breakdown">
            <div className="curriculum-phase">
              <h3>Days 1-30: Foundation</h3>
              <ul>
                <li>Complete your Vision Board (Milestone 1)</li>
                <li>Master the TEEE framework</li>
                <li>Identify your Table focus</li>
                <li>Build your billionaire mindset</li>
                <li>Set your first TLI income goal</li>
              </ul>
            </div>
            <div className="curriculum-phase">
              <h3>Days 31-60: Building</h3>
              <ul>
                <li>Complete Skills Assessment (Milestone 2)</li>
                <li>Map your revenue streams (Milestone 3)</li>
                <li>Create your action plan (Milestone 4)</li>
                <li>Build your first income system</li>
                <li>Start recruiting your team</li>
              </ul>
            </div>
            <div className="curriculum-phase">
              <h3>Days 61-90: Launching</h3>
              <ul>
                <li>Complete market research (Milestone 5)</li>
                <li>Build your personal brand (Milestone 6)</li>
                <li>Prepare for launch (Milestone 7)</li>
                <li>Go live with your Table</li>
                <li>Reach your first TLI level</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-section">
        <h2>How Coach Manlaw Works</h2>
        <div className="how-it-works">
          <div className="how-step">
            <div className="how-number">1</div>
            <h3>You Share Your Vision</h3>
            <p>
              When you complete Milestone 1, Coach Manlaw learns your WHY, your goals, your
              strengths, weaknesses, and Table focus.
            </p>
          </div>
          <div className="how-step">
            <div className="how-number">2</div>
            <h3>Coach Creates Your Plan</h3>
            <p>
              Based on your unique situation, Coach Manlaw designs a personalized roadmap
              through all 7 milestones and 10 TLI levels.
            </p>
          </div>
          <div className="how-step">
            <div className="how-number">3</div>
            <h3>Daily Guidance & Check-ins</h3>
            <p>
              Every day, Coach Manlaw provides specific actions, tracks your progress, and
              adjusts your plan based on results.
            </p>
          </div>
          <div className="how-step">
            <div className="how-number">4</div>
            <h3>Real-Time Support</h3>
            <p>
              Whenever you need guidance, Coach Manlaw is available via chat to answer questions,
              solve problems, and keep you moving forward.
            </p>
          </div>
        </div>
      </section>

      {/* Why AI Coaching */}
      <section className="about-section why-ai-section">
        <h2>Why AI Coaching Works</h2>
        <div className="why-grid">
          <div className="why-card">
            <h3>🕐 24/7 Availability</h3>
            <p>Human coaches sleep. Coach Manlaw doesn't. Get support when YOU need it, not when it's convenient for someone else.</p>
          </div>
          <div className="why-card">
            <h3>💰 Affordable Excellence</h3>
            <p>Personal coaching costs R5,000+ per month. Coach Manlaw is included in your Z2B membership at a fraction of the cost.</p>
          </div>
          <div className="why-card">
            <h3>📊 Data-Driven Insights</h3>
            <p>Coach Manlaw tracks patterns human coaches miss, identifying opportunities and obstacles faster.</p>
          </div>
          <div className="why-card">
            <h3>🎯 Personalized at Scale</h3>
            <p>Every interaction is customized to YOUR journey while drawing on insights from thousands of successful builders.</p>
          </div>
          <div className="why-card">
            <h3>🔄 Continuous Learning</h3>
            <p>Coach Manlaw evolves with you, learning what works for YOUR unique situation and adapting strategies in real-time.</p>
          </div>
          <div className="why-card">
            <h3>🚫 Zero Judgment</h3>
            <p>Share your struggles without fear. Coach Manlaw never judges—only guides, supports, and believes in you.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Ready to Meet Your AI Coach?</h2>
        <p>
          Coach Manlaw is waiting to guide you from zero to billionaire. Start with Milestone 1
          (100% FREE) and experience personalized AI coaching that actually works.
        </p>
        <SignUpButton onNavigate={onNavigate} variant="primary" size="large" text="🚀 Join Z2B Now" />
        <p className="cta-footnote">
          No credit card required. Access to Coach Manlaw included in all membership tiers.
        </p>
      </section>

      {/* Floating Upsell Button */}
      <FloatingUpsell onNavigate={onNavigate} />
    </div>
  );
};

export default MeetCoachManlaw;
