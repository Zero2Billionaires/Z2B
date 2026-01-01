import React, { useState } from 'react';
import '../styles/members-training.css';

const MembersTraining = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const trainingTopics = [
    {
      id: 'conversion',
      category: 'Sales & Conversion',
      question: 'How do I make a person not interested become interested and start participating in our program?',
      icon: '🎯',
      answer: {
        intro: 'Based on Z2B Legacy Builders\' core philosophy, here\'s the transformation-first approach:',
        mainTitle: 'The Transformation-First Approach',
        mainContent: 'The key is embedded in your platform\'s tagline: "Transform First. Share Authentically. Get Rewarded."',
        sections: [
          {
            title: 'Why People Aren\'t Interested (Usually):',
            icon: '❌',
            points: [
              'They don\'t see the value - They haven\'t experienced transformation themselves',
              'They see it as "just another MLM" - They\'re skeptical of income claims',
              'They don\'t trust the messenger - No authentic relationship or proof',
              'Timing isn\'t right - Their life circumstances make them resistant'
            ]
          },
          {
            title: 'The Z2B Solution:',
            icon: '✅',
            intro: 'Don\'t try to make them interested in the income opportunity first. Instead:',
            strategies: [
              {
                title: '1. Lead with Transformation Tools',
                points: [
                  'Invite them to try the Vision Board exercise (free, no commitment)',
                  'Share your own transformation story authentically',
                  'Let them experience value BEFORE talking business'
                ]
              },
              {
                title: '2. Use Your Platform Features',
                points: [
                  'Share your SMART goals on social media (that\'s why we built the sharing feature!)',
                  'Post your daily check-in wins',
                  'Show your journey, not just the destination'
                ]
              },
              {
                title: '3. The 7 Income Streams Are Secondary',
                points: [
                  'Notice the Opportunity page says: "After experiencing your own transformation, you can share..."',
                  'They need to EXPERIENCE before they EARN'
                ]
              },
              {
                title: '4. Leverage Social Proof',
                points: [
                  'Use the Success Stories section',
                  'Share when you hit TLI milestones',
                  'Let them see real people getting real results'
                ]
              }
            ]
          },
          {
            title: 'Practical Strategy:',
            icon: '💡',
            intro: 'Instead of asking "Are you interested in Z2B?", try:',
            examples: [
              '"I\'m working on this free vision board tool - want to do it together?"',
              '"I set this crazy goal and I\'m using this system to track it - check it out"',
              '"This daily check-in changed my mindset - try it for 7 days with me?"'
            ]
          }
        ],
        conclusion: {
          highlight: 'The uninterested become interested when they see authentic transformation in someone they trust.',
          advice: 'Focus on your own transformation journey first, share it publicly (using the social media tools we built), and let curiosity do the selling. The right people will ask: "What are you doing differently?"'
        }
      }
    }
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="training-container">
      {/* Hero Section */}
      <div className="training-hero">
        <h1 className="training-title">
          <span className="training-icon">🎓</span>
          Members Training Center
        </h1>
        <p className="training-subtitle">
          Essential strategies and coaching for successful legacy builders
        </p>
      </div>

      {/* Training Topics */}
      <div className="training-content">
        <h2 className="section-header">
          <span className="section-icon">💼</span>
          Coaching Q&A
        </h2>

        <div className="training-topics">
          {trainingTopics.map((topic) => (
            <div
              key={topic.id}
              className={`training-card ${expandedFaq === topic.id ? 'expanded' : ''}`}
            >
              <div className="training-card-header" onClick={() => toggleFaq(topic.id)}>
                <div className="topic-info">
                  <span className="topic-icon">{topic.icon}</span>
                  <div className="topic-text">
                    <span className="topic-category">{topic.category}</span>
                    <h3 className="topic-question">{topic.question}</h3>
                  </div>
                </div>
                <div className="expand-indicator">
                  {expandedFaq === topic.id ? '−' : '+'}
                </div>
              </div>

              {expandedFaq === topic.id && (
                <div className="training-card-content">
                  <div className="answer-intro">
                    <p>{topic.answer.intro}</p>
                  </div>

                  <div className="answer-main">
                    <h3 className="answer-title">{topic.answer.mainTitle}</h3>
                    <p className="answer-highlight">{topic.answer.mainContent}</p>
                  </div>

                  {topic.answer.sections.map((section, idx) => (
                    <div key={idx} className="answer-section">
                      <h4 className="section-title">
                        {section.icon && <span className="section-icon-small">{section.icon}</span>}
                        {section.title}
                      </h4>

                      {section.intro && <p className="section-intro">{section.intro}</p>}

                      {section.points && (
                        <ul className="points-list">
                          {section.points.map((point, pidx) => (
                            <li key={pidx}>{point}</li>
                          ))}
                        </ul>
                      )}

                      {section.strategies && (
                        <div className="strategies-list">
                          {section.strategies.map((strategy, sidx) => (
                            <div key={sidx} className="strategy-item">
                              <h5 className="strategy-title">{strategy.title}</h5>
                              <ul className="strategy-points">
                                {strategy.points.map((point, ppidx) => (
                                  <li key={ppidx}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.examples && (
                        <div className="examples-list">
                          {section.examples.map((example, eidx) => (
                            <div key={eidx} className="example-item">
                              💬 {example}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="answer-conclusion">
                    <div className="conclusion-highlight">
                      <strong>Key Insight:</strong> {topic.answer.conclusion.highlight}
                    </div>
                    <p className="conclusion-advice">{topic.answer.conclusion.advice}</p>
                  </div>

                  <div className="action-section">
                    <h4 className="action-title">🚀 Take Action Now:</h4>
                    <div className="action-buttons">
                      <button className="action-btn primary">
                        📝 Complete Your Vision Board
                      </button>
                      <button className="action-btn secondary">
                        🎯 Set a SMART Goal
                      </button>
                      <button className="action-btn secondary">
                        📊 Share Your Progress
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="coming-soon-section">
          <h3 className="coming-soon-title">📚 More Training Coming Soon</h3>
          <div className="coming-soon-grid">
            <div className="coming-soon-card">
              <span className="soon-icon">🎥</span>
              <h4>Video Training Library</h4>
              <p>Step-by-step video courses on building your legacy</p>
            </div>
            <div className="coming-soon-card">
              <span className="soon-icon">📖</span>
              <h4>Sales Scripts</h4>
              <p>Proven conversation starters and follow-up templates</p>
            </div>
            <div className="coming-soon-card">
              <span className="soon-icon">🎯</span>
              <h4>TLI Roadmap</h4>
              <p>Detailed strategies for each celestial level</p>
            </div>
            <div className="coming-soon-card">
              <span className="soon-icon">👥</span>
              <h4>Team Building Mastery</h4>
              <p>Advanced techniques for growing your network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersTraining;
