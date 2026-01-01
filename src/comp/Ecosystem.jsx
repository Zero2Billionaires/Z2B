import React from 'react';
import '../styles/ecosystem.css';

const Ecosystem = ({ onNavigate }) => {
  const apps = [
    {
      id: 'coach-manlaw',
      name: 'Coach ManLaw',
      icon: '👨‍🏫',
      tagline: 'Your AI Billionaire Coach Available 24/7',
      description: 'Your AI Billionaire Coach available 24/7. Get personalized guidance, master the 4 Legs of a Billionaire Table.',
      price: 'Included',
      features: [
        '90-Day Billionaire Curriculum',
        'Real-Time AI Coaching Chat',
        'BTSS Assessment System',
        'Scripture-Based Guidance',
        'Personalized milestone tracking',
        'Direct integration with all apps'
      ],
      tier: 'Included in ALL Tiers',
      badge: '🔴 LIVE',
      status: 'LIVE'
    },
    {
      id: 'mydigital-twin',
      name: 'MyDigital Twin',
      icon: '🤖',
      tagline: 'Clone Yourself. Go Viral.',
      description: 'Clone Yourself. Go Viral. Create AI-powered videos with your face and voice in minutes.',
      price: 700,
      features: [
        'Voice & Face Cloning',
        'Multiple package tiers with varying video limits',
        'ISP Commission opportunities',
        'Create AI-powered videos',
        'Your face and voice',
        'Professional video output'
      ],
      tier: 'Choose as your app',
      badge: '🤖 AI CLONING',
      status: 'AI CLONING'
    },
    {
      id: 'mavula',
      name: 'MAVULA',
      icon: '🎙️',
      tagline: 'AI Prospecting Automation',
      description: 'AI Prospecting Automation. Automate your network marketing prospecting with AI-powered conversations.',
      price: 700,
      features: [
        'AI-Powered Conversations',
        'Automated Follow-ups',
        'Lead Scoring & Tracking',
        'WhatsApp Integration',
        'Social Media Import',
        'Content AI Training'
      ],
      tier: 'Choose as your app',
      badge: '🔴 AVAILABLE NOW',
      status: 'AVAILABLE NOW'
    },
    {
      id: 'glowie',
      name: 'GLOWIE',
      icon: '✨',
      tagline: 'No-Code AI App Builder',
      description: 'No-Code AI App Builder. Create professional mobile and web applications in minutes without coding.',
      price: 700,
      features: [
        'Claude-Powered AI Generation',
        'Instant App Deployment',
        'No Coding Required',
        'Marketplace Integration',
        'Professional mobile and web apps',
        'Build in minutes'
      ],
      tier: 'Choose as your app',
      badge: '🔴 LIVE',
      status: 'LIVE'
    },
    {
      id: 'benown',
      name: 'BENOWN',
      icon: '📊',
      tagline: 'AI Content Creator',
      description: 'AI Content Creator. Generate engaging social media posts, blog articles, emails, and marketing content effortlessly.',
      price: 700,
      features: [
        'Social Media Posts',
        'Blog Articles & SEO',
        'Email Campaigns',
        'Marketing Copy',
        'AI-powered content generation',
        'Multiple content types'
      ],
      tier: 'Choose as your app',
      badge: '🔵 COMING SOON',
      status: 'COMING SOON',
      pricing: 'Pay as You Go'
    },
    {
      id: 'zyra',
      name: 'ZYRA',
      icon: '📱',
      tagline: 'AI Sales Agent That Never Sleeps',
      description: 'AI Sales Agent that never sleeps. Automate customer conversations, answer questions, and convert prospects.',
      price: 700,
      features: [
        'Automated Sales Conversations',
        '24/7 Customer Support',
        'Lead Qualification',
        'CRM Integration',
        'Never-ending sales automation',
        'Prospect conversion'
      ],
      tier: 'Choose as your app',
      badge: '🔵 COMING SOON',
      status: 'COMING SOON'
    },
    {
      id: 'vidzie',
      name: 'VIDZIE',
      icon: '🎬',
      tagline: 'HeyGen-Style AI Avatar Video Generator',
      description: 'HeyGen-Style AI Avatar Video Generator. Upload a photo, type your script, and generate professional AI avatar videos.',
      price: 700,
      features: [
        'AI Avatar from Single Photo',
        'Script-to-Video Generation',
        'Multiple AI Voice Options',
        'HD & 4K Quality',
        'Custom Backgrounds & Settings',
        'Video Library Management'
      ],
      tier: 'Choose as your app',
      badge: '🔴 LIVE',
      status: 'LIVE'
    },
    {
      id: 'zynth',
      name: 'ZYNTH',
      icon: '🎵',
      tagline: 'AI Voice Cloning Platform',
      description: 'AI Voice Cloning Platform. Clone your voice with a 30-minute recording and generate unlimited speech.',
      price: 700,
      features: [
        'Voice Recording & Upload',
        'AI Voice Cloning',
        'Text-to-Speech Generation',
        'Export Audio Files',
        '30-minute recording requirement',
        'Unlimited speech generation'
      ],
      tier: 'Choose as your app',
      badge: '🆕 NEW',
      status: 'NEW'
    },
    {
      id: 'captionpro',
      name: 'CaptionPro',
      icon: '📝',
      tagline: 'AI Video Captions & Auto-Cut Platform',
      description: 'AI Video Captions & Auto-Cut Platform. Transform your videos with AI-powered captions in 50+ languages.',
      price: 700,
      features: [
        '50+ Languages including African languages',
        'Auto-Cut to Reels/Shorts',
        'Translation 130+ Languages',
        'Video Editing Suite',
        'AI-powered caption generation',
        'Professional video transformation'
      ],
      tier: 'Choose as your app',
      badge: '🆕 NEW',
      status: 'NEW',
      pricing: 'Pay as You Go'
    },
    {
      id: 'zynect',
      name: 'ZYNECT',
      icon: '🤝',
      tagline: 'Complete CRM Platform',
      description: 'Complete CRM Platform. Manage contacts, send SMS/WhatsApp campaigns, track leads, and automate customer journey.',
      price: 700,
      features: [
        'Contact Management',
        'SMS & WhatsApp Campaigns',
        'Email Marketing',
        'Analytics Dashboard',
        'Lead tracking & automation',
        'Customer journey management'
      ],
      tier: 'Choose as your app',
      badge: '🔵 COMING SOON',
      status: 'COMING SOON'
    },
    {
      id: 'zyro',
      name: 'ZYRO',
      icon: '🌐',
      tagline: 'Gamification Hub',
      description: 'Gamification Hub. Engage and compete with team members through challenges, roulette, and bingo games.',
      price: 700,
      features: [
        'Challenge Games',
        'Roulette Rewards',
        'Bingo Events',
        'Team Leaderboards',
        'Team engagement tools',
        'Competition & rewards'
      ],
      tier: 'Choose as your app',
      badge: '🔴 LIVE',
      status: 'LIVE'
    },
    {
      id: 'sheppard-staff',
      name: 'Shepherd Staff',
      icon: '⛪',
      tagline: 'Complete AI-Powered Church Management System',
      description: 'Complete AI-powered church management system. Track visitors, disciples, prayer requests, giving, and events. Members can buy this as a gift for any pastor or church!',
      price: 700,
      features: [
        'AI Attendance & Member Tracking',
        'Discipleship Pipeline & Growth',
        'Prayer Request Management',
        'Online Giving & Analytics',
        'Evangelism & Visitor Follow-up',
        'Mass Communication System',
        '🎁 Can be purchased as a gift for churches'
      ],
      tier: 'Choose as your app',
      badge: '🎁 LAUNCH SPECIAL',
      status: 'LAUNCH SPECIAL'
    }
  ];

  return (
    <div className="ecosystem-container">
      {/* Header */}
      <div className="ecosystem-header">
        <h1>🌐 ZERO2BILLIONAIRES ECOSYSTEM</h1>
        <p className="ecosystem-subtitle">
          Official Z2B Apps + Builders Marketplace
        </p>
        <p className="ecosystem-description">
          Access powerful tools designed specifically for legacy builders. Below are the official <strong>Z2B Apps</strong> included with your membership tier.
          Visit the <strong>Marketplace</strong> to discover apps built by fellow Builders!
        </p>
      </div>

      {/* Featured Info */}
      <div className="ecosystem-info">
        <div className="info-card">
          <div className="info-icon">👑</div>
          <h3>Z2B Official Apps</h3>
          <p>12 professional apps built by Z2B. Coach Manlaw included in ALL tiers!</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🏪</div>
          <h3>Builders Marketplace</h3>
          <p>Members can list and sell their own apps. Build once, earn forever!</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🔗</div>
          <h3>Fully Integrated</h3>
          <p>All apps connect to your Table dashboard for seamless workflow.</p>
        </div>
      </div>

      {/* Z2B Apps Section Header */}
      <div style={{ textAlign: 'center', margin: '3rem 0 2rem' }}>
        <h2 style={{ color: '#daa520', fontSize: '2.5rem', marginBottom: '1rem' }}>
          🏆 OFFICIAL Z2B APPS
        </h2>
        <p style={{ color: '#c4a76f', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
          Choose your apps based on your membership tier. <strong>Coach Manlaw is included in ALL tiers.</strong>
          <br />
          Bronze = 2 apps • Copper = 3 apps • Silver = 4 apps • Gold = 5 apps • Platinum = All 12 apps
          <br />
          <span style={{ fontSize: '1rem', color: '#daa520' }}>All apps from R700 for basic features (advanced features sold separately)</span>
        </p>
      </div>

      {/* Apps Grid */}
      <div className="apps-grid">
        {apps.map(app => (
          <div key={app.id} className="app-card">
            {app.badge && <div className="app-badge">{app.badge}</div>}

            <div className="app-icon">{app.icon}</div>
            <h2 className="app-name">{app.name}</h2>
            <p className="app-tagline">{app.tagline}</p>

            <div className="app-price">
              {typeof app.price === 'number' ? (
                <>
                  <span className="price-currency">From R</span>
                  <span className="price-amount">{app.price}</span>
                  <span className="price-period">for basic features</span>
                </>
              ) : (
                <span className="price-special">{app.price}</span>
              )}
            </div>
            {typeof app.price === 'number' && (
              <p className="price-note" style={{ fontSize: '0.85rem', color: '#c4a76f', fontStyle: 'italic', marginTop: '0.5rem' }}>
                Excludes advanced features
              </p>
            )}

            <p className="app-description">{app.description}</p>

            <div className="app-features">
              <h4>Features:</h4>
              <ul>
                {app.features.map((feature, index) => (
                  <li key={index}>✅ {feature}</li>
                ))}
              </ul>
            </div>

            <div className="app-tier">{app.tier}</div>

            <button
              className="btn-app-action"
              onClick={() => {
                if (app.price === 'Coming Soon') {
                  alert('App coming soon! We will notify you when it launches.');
                } else if (app.price === 'Included') {
                  // Included apps - encourage tier purchase
                  if (onNavigate) {
                    onNavigate('tiers');
                  }
                } else {
                  // Paid apps - go to tier selection
                  if (onNavigate) {
                    onNavigate('tiers');
                  }
                }
              }}
            >
              {app.price === 'Coming Soon' ? 'Join Waitlist' :
               app.price === 'Included' ? 'Included in Membership' : '🛒 Buy Now'}
            </button>
          </div>
        ))}
      </div>

      {/* Marketplace CTA */}
      <div className="ecosystem-cta" style={{ marginTop: '4rem', background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(147, 112, 219, 0.2))' }}>
        <h2>🏪 Visit the Builders Marketplace</h2>
        <p>
          Discover apps built by fellow Builders, or list your own app and earn passive income!
          The marketplace is managed by admin and organized by product categories for easy browsing.
        </p>
        <button
          className="btn-upgrade"
          style={{ background: 'linear-gradient(135deg, #9370db, #8a2be2)' }}
          onClick={() => window.open('https://www.z2blegacybuilders.co.za/marketplace.html', '_blank')}
        >
          🏪 Browse Marketplace
        </button>
      </div>

      {/* Upgrade CTA */}
      <div className="ecosystem-cta">
        <h2>Ready to Access More Z2B Apps?</h2>
        <p>
          Upgrade your membership tier to unlock more official Z2B apps and accelerate your journey.
        </p>
        <button className="btn-upgrade" onClick={() => window.open('https://www.z2blegacybuilders.co.za/tier-upgrade-payment.html', '_blank')}>
          💎 Upgrade Your Tier
        </button>
      </div>
    </div>
  );
};

export default Ecosystem;
