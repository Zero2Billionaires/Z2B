import React from 'react';
import '../styles/about.css';
import SignUpButton from './SignUpButton';
import FloatingUpsell from './FloatingUpsell';

const AboutZ2B = ({ onNavigate }) => {
  const stages = [
    { number: 1, name: 'Awareness', icon: '💡', description: 'Recognize your current reality and discover what\'s truly possible for your future' },
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
            Our mission is to TEEE — Transform, Educate, Empower, and Enrich 1 million employees
            into entrepreneurs by 2031, by helping them build sustainable businesses and generational
            wealth, transforming families, communities, and the continent's economic landscape.
          </p>
        </div>

        <h2 style={{ marginTop: '3rem' }}>Our Vision</h2>
        <div className="vision-box">
          <p>
            We envision a continent where Employees are no longer trapped by limited incomes, toxic work
            environments, or economic dependency — but are confident entrepreneurs, business owners, and
            legacy builders.
          </p>
          <p>
            A future where millions sit at the Z2B Table, owning scalable digital and traditional businesses,
            creating jobs, circulating wealth locally, and passing generational assets to their families.
          </p>
          <p>
            By 2031 and beyond, Z2B Table will be a leading catalyst for Africa's entrepreneurial awakening —
            restoring dignity through ownership, freedom through systems, and prosperity through purpose-driven
            enterprise.
          </p>
        </div>
      </section>

      {/* Employee Pain Points */}
      <section id="pain-points" className="about-section pain-points-section">
        <h2>Why Employees Are Leaving the 9-to-5 Behind</h2>
        <p className="section-intro">
          Every day, thousands of hardworking employees realize the same painful truth:
          The traditional career path is broken. Here are the 5 realities forcing them to seek a better way.
        </p>

        <div className="pain-points-grid">
          <div className="pain-card">
            <div className="pain-number">1</div>
            <h3>Income Is Capped, but Life Costs Keep Rising</h3>
            <p className="pain-description">
              Annual salary increases barely match inflation. Promotions are limited and political.
              Side hustles are discouraged. No matter how hard you work, there's a ceiling to your earnings.
            </p>
            <div className="pain-trigger">
              <span className="trigger-icon">💥</span>
              <em>"I'll never earn significantly more, no matter how hard I work."</em>
            </div>
          </div>

          <div className="pain-card">
            <div className="pain-number">2</div>
            <h3>No Time Freedom or Control Over Your Life</h3>
            <p className="pain-description">
              Trading time for money means fixed schedules you don't control. Limited leave days
              that must be "approved." Missed family moments, constant burnout, living for weekends.
            </p>
            <div className="pain-trigger">
              <span className="trigger-icon">💥</span>
              <em>"I'm living for weekends and holidays instead of actually living my life."</em>
            </div>
          </div>

          <div className="pain-card">
            <div className="pain-number">3</div>
            <h3>Job Insecurity & Fear of Being Replaced</h3>
            <p className="pain-description">
              Companies retrench without warning. AI and automation are replacing roles daily.
              Economic downturns lead to sudden layoffs. Even loyalty doesn't guarantee security.
            </p>
            <div className="pain-trigger">
              <span className="trigger-icon">💥</span>
              <em>"My income depends on decisions I have zero control over."</em>
            </div>
          </div>

          <div className="pain-card">
            <div className="pain-number">4</div>
            <h3>No Ownership, No Legacy, No Wealth</h3>
            <p className="pain-description">
              You work for years but don't own the company you help grow. Building someone else's
              asset, not your own. Retirement comes with limited savings and no scalable legacy.
            </p>
            <div className="pain-trigger">
              <span className="trigger-icon">💥</span>
              <em>"I'm working hard, but building nothing that belongs to me."</em>
            </div>
          </div>

          <div className="pain-card">
            <div className="pain-number">5</div>
            <h3>Trapped in Toxic Environments & Limited Growth</h3>
            <p className="pain-description">
              Office politics, undervalued contributions, limited opportunities for advancement.
              Your potential is capped by someone else's vision. Dreams deferred, purpose lost.
            </p>
            <div className="pain-trigger">
              <span className="trigger-icon">💥</span>
              <em>"I'm spending my best years building someone else's dream."</em>
            </div>
          </div>
        </div>
      </section>

      {/* Z2B Table as the Solution */}
      <section id="z2b-solution" className="about-section solution-section">
        <h2>Welcome to the Z2B Table: Where Employees Become Entrepreneurs</h2>
        <p className="section-intro">
          If you've felt any of these pain points, you're not broken—the system is.
          The Z2B Table is your seat at a different kind of table. One where you own, build, and control your future.
        </p>

        <div className="solution-grid">
          <div className="solution-card">
            <div className="solution-icon">💰</div>
            <h3>Uncapped Income Potential</h3>
            <p>
              No more salary ceilings. Build multiple revenue streams—digital products, services,
              affiliate income, and our TLI program. Your earning potential is limited only by your effort and systems.
            </p>
            <div className="solution-benefit">✅ Your work directly increases your wealth</div>
          </div>

          <div className="solution-card">
            <div className="solution-icon">⏰</div>
            <h3>Time Freedom & Flexibility</h3>
            <p>
              Design your schedule around your life, not the other way around. Work from anywhere.
              Choose when to hustle and when to rest. Be present for the moments that matter.
            </p>
            <div className="solution-benefit">✅ You control your time and energy</div>
          </div>

          <div className="solution-card">
            <div className="solution-icon">🛡️</div>
            <h3>Security Through Ownership</h3>
            <p>
              Stop depending on a single employer. Build assets you own—businesses, products, systems
              that generate income even when you're not working. True security comes from ownership.
            </p>
            <div className="solution-benefit">✅ You can't be fired from your own business</div>
          </div>

          <div className="solution-card">
            <div className="solution-icon">🏆</div>
            <h3>Build Your Legacy</h3>
            <p>
              Create wealth that compounds and transfers to the next generation. Own scalable assets.
              Leave behind businesses, systems, and wealth that outlive you. This is generational impact.
            </p>
            <div className="solution-benefit">✅ Your children inherit assets, not just memories</div>
          </div>

          <div className="solution-card">
            <div className="solution-icon">🎯</div>
            <h3>Purpose-Driven Work</h3>
            <p>
              Build something that aligns with your values and vision. Serve communities you care about.
              Make decisions that reflect your purpose. This is your mission, not someone else's.
            </p>
            <div className="solution-benefit">✅ Wake up excited about your work, not dreading it</div>
          </div>

          <div className="solution-card">
            <div className="solution-icon">🚀</div>
            <h3>Complete Support System</h3>
            <p>
              You're not alone. The Z2B Table provides training, AI coaching, community support,
              12 powerful tools, and a proven framework. We've already helped thousands make the transition.
            </p>
            <div className="solution-benefit">✅ A roadmap, not guesswork</div>
          </div>
        </div>

        <div className="solution-cta">
          <h3>Your Seat at the Z2B Table Is Waiting</h3>
          <p>
            The employees who thrive aren't lucky—they're strategic. They recognized the pain points,
            chose a different path, and took action. You can too.
          </p>
          <SignUpButton onNavigate={onNavigate} variant="primary" size="large" text="🪑 Claim Your Seat at the Z2B Table" />
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
        <SignUpButton onNavigate={onNavigate} variant="primary" size="large" text="🚀 Join Z2B Now" />
      </section>

      {/* Floating Upsell Button */}
      <FloatingUpsell onNavigate={onNavigate} />
    </div>
  );
};

export default AboutZ2B;
