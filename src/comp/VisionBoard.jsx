import React, { useState } from 'react';
import '../styles/visionboard.css';
import welcomeImage from '../assets/z2b-welcome.jpeg';
import z2bTableLogo from '../assets/z2b-table-logo.jpeg';
import ExportShare from './ExportShare';

const VisionBoard = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    why: '',
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
    how: '',
    when: '',
    where: '',
    tableFocus: '',
    visionStatement: '',
    dailyTreat: '',
    reward: '',
    punishment: ''
  });

  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('visionBoard', JSON.stringify(formData));
    localStorage.setItem('milestone1Complete', 'true');
    if (onComplete) {
      onComplete(formData);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="visionboard-container">
      <div className="visionboard-header">
        <div className="welcome-hero">
          <img src={welcomeImage} alt="Welcome to Z2B Table" className="welcome-image" />
          <div className="welcome-overlay">
            <img src={z2bTableLogo} alt="Z2B Table" className="z2b-logo" />
            <h1>MILESTONE 1: VISION BOARD</h1>
            <p className="subtitle">"Transformation • Education • Empowerment • Enrichment"</p>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
        <p className="step-indicator">Step {step} of {totalSteps}</p>
      </div>

      <form onSubmit={handleSubmit} className="visionboard-form">

        {/* Step 1: WHY - Foundation */}
        {step === 1 && (
          <div className="form-step">
            <div className="tee-badge">Foundation</div>
            <h2>WHY - What's Your Purpose?</h2>
            <p className="step-description">
              Why are you building a legacy? Family? Freedom? Impact?
              Your WHY is the foundation that will sustain you through every challenge.
            </p>

            <textarea
              name="why"
              value={formData.why}
              onChange={handleChange}
              placeholder="Example: I want to free my family from financial stress, send my kids to university debt-free, and create generational wealth that outlives me..."
              rows="8"
              required
              className="vision-textarea"
            />

            <div className="form-actions">
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: SWOT Analysis →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: SWOT Analysis - Transformation */}
        {step === 2 && (
          <div className="form-step">
            <div className="tee-badge transformation">🔄 Transformation</div>
            <h2>SWOT Analysis - Know Yourself</h2>
            <p className="step-description">
              Transformation begins with honest self-assessment. Identify your Strengths,
              Weaknesses, Opportunities, and Threats to build a strategic foundation.
            </p>

            <div className="swot-grid">
              <div className="swot-quadrant strengths">
                <h3>💪 Strengths</h3>
                <p className="swot-hint">What are you naturally good at? Skills, resources, advantages?</p>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleChange}
                  placeholder="Example: Strong network in tech, 10 years sales experience, R50k savings..."
                  rows="5"
                  required
                  className="vision-textarea"
                />
              </div>

              <div className="swot-quadrant weaknesses">
                <h3>⚠️ Weaknesses</h3>
                <p className="swot-hint">What skills or resources are you missing? Honest gaps?</p>
                <textarea
                  name="weaknesses"
                  value={formData.weaknesses}
                  onChange={handleChange}
                  placeholder="Example: No formal business training, limited capital, fear of public speaking..."
                  rows="5"
                  required
                  className="vision-textarea"
                />
              </div>

              <div className="swot-quadrant opportunities">
                <h3>🌟 Opportunities</h3>
                <p className="swot-hint">What external trends or openings can you leverage?</p>
                <textarea
                  name="opportunities"
                  value={formData.opportunities}
                  onChange={handleChange}
                  placeholder="Example: Growing demand for online education, AI tools democratizing content creation..."
                  rows="5"
                  required
                  className="vision-textarea"
                />
              </div>

              <div className="swot-quadrant threats">
                <h3>🛡️ Threats</h3>
                <p className="swot-hint">What external challenges or risks could derail you?</p>
                <textarea
                  name="threats"
                  value={formData.threats}
                  onChange={handleChange}
                  placeholder="Example: Economic downturn, high competition, family obligations limiting time..."
                  rows="5"
                  required
                  className="vision-textarea"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: Strategy →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: HOW - Strategy & Approach (Education) */}
        {step === 3 && (
          <div className="form-step">
            <div className="tee-badge education">📚 Education</div>
            <h2>HOW - Your Strategy</h2>
            <p className="step-description">
              How will you achieve your vision? What's your approach? What skills do you need to learn?
            </p>

            <textarea
              name="how"
              value={formData.how}
              onChange={handleChange}
              placeholder="Example: Build an online course in 90 days, learn content marketing, partner with established creators for mentorship, invest in paid ads once validated..."
              rows="8"
              required
              className="vision-textarea"
            />

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: Timeline →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: WHEN - Timeline & Milestones (Education) */}
        {step === 4 && (
          <div className="form-step">
            <div className="tee-badge education">📚 Education</div>
            <h2>WHEN - Your Timeline</h2>
            <p className="step-description">
              When will you hit key milestones? Set realistic deadlines that create urgency without overwhelm.
            </p>

            <textarea
              name="when"
              value={formData.when}
              onChange={handleChange}
              placeholder="Example: Month 1-3: Product development. Month 4-6: First 100 customers. Month 7-12: R10k monthly revenue. Year 2: R50k monthly, hire first assistant..."
              rows="8"
              required
              className="vision-textarea"
            />

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: Context →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: WHERE - Context & Market (Education) */}
        {step === 5 && (
          <div className="form-step">
            <div className="tee-badge education">📚 Education</div>
            <h2>WHERE - Your Market & Context</h2>
            <p className="step-description">
              Where will you operate? Who is your target market? What's your geographic or digital landscape?
            </p>

            <textarea
              name="where"
              value={formData.where}
              onChange={handleChange}
              placeholder="Example: Online globally via Instagram & YouTube, targeting African diaspora aged 25-45 interested in wealth building. Based in Johannesburg but digital-first..."
              rows="8"
              required
              className="vision-textarea"
            />

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: Choose Table →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Choose Your Table Focus (TEEE Alignment) */}
        {step === 6 && (
          <div className="form-step">
            <div className="tee-badge empowerment">⚡ Empowerment</div>
            <h2>Choose Your Table Focus</h2>
            <p className="step-description">
              Which Table aligns with your TEEE journey? (You can change this later)
            </p>

            <div className="table-options">
              {[
                { value: 'creator', icon: '🎨', title: 'Creator Table', desc: 'Digital products, content, courses, AI tools. Transform knowledge into income.' },
                { value: 'entrepreneur', icon: '💼', title: 'Entrepreneur Table', desc: 'Trading, services, SMEs. Build systems, teams, cashflow.' },
                { value: 'family', icon: '👨‍👩‍👧‍👦', title: 'Family Table', desc: 'Generational wealth, education, property, values. Legacy for your lineage.' },
                { value: 'impact', icon: '🌍', title: 'Social Impact Table', desc: 'Prosperity for a cause. Community upliftment, healing, transformation.' },
                { value: 'investor', icon: '💰', title: 'Investor Table', desc: 'Multiple income streams, real estate, farming, manufacturing.' },
                { value: 'innovation', icon: '🚀', title: 'Innovation Table', desc: 'Digital first, raise capital, scale into physical industries.' }
              ].map(option => (
                <label key={option.value} className={`table-option ${formData.tableFocus === option.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="tableFocus"
                    value={option.value}
                    checked={formData.tableFocus === option.value}
                    onChange={handleChange}
                  />
                  <div className="option-content">
                    <h3>{option.icon} {option.title}</h3>
                    <p>{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
                disabled={!formData.tableFocus}
              >
                Next: Vision Statement →
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Vision Statement - Declaration (Empowerment) */}
        {step === 7 && (
          <div className="form-step">
            <div className="tee-badge empowerment">⚡ Empowerment</div>
            <h2>Your Vision Statement</h2>
            <p className="step-description">
              Crystallize everything into ONE powerful declaration. This anchors you when challenges come.
            </p>

            <textarea
              name="visionStatement"
              value={formData.visionStatement}
              onChange={handleChange}
              placeholder="Example: By 2030, I will have built a R10M portfolio of passive income properties, sent my 3 children to university debt-free, employed 20 people in my community, and established a training center that empowers 500 families annually with digital skills..."
              rows="8"
              required
              className="vision-textarea"
            />

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: Habit Hack →
              </button>
            </div>
          </div>
        )}

        {/* Step 8: Habit Hack - Accountability System */}
        {step === 8 && (
          <div className="form-step">
            <div className="tee-badge transformation">🎯 Habit Hack</div>
            <h2>Lock In Your Accountability</h2>
            <p className="step-description">
              Connect your legacy building to something you LOVE. Make staying true to your WHY
              irresistible by rewarding yourself, and make breaking commitment painful.
            </p>

            <div className="habit-section">
              <h3>🎁 What's Your Daily Treat?</h3>
              <p className="habit-hint">
                What do you love doing daily? (Chess, Coffee, Netflix, Hot Bath, Social Media, etc.)
              </p>
              <input
                type="text"
                name="dailyTreat"
                value={formData.dailyTreat}
                onChange={handleChange}
                placeholder="Example: Playing Chess, Drinking Coffee, Watching Netflix..."
                required
                className="habit-input"
              />
            </div>

            <div className="habit-section reward-section">
              <h3>🏆 Your REWARD (When You Stay True)</h3>
              <p className="habit-hint">
                When you complete a task, section, or stay true to your daily WHY/HOW/WHEN/WHERE - what's your reward?
              </p>
              <textarea
                name="reward"
                value={formData.reward}
                onChange={handleChange}
                placeholder="Example: Play 3 Chess games, Enjoy 2 cups of premium coffee, Watch 1 episode of my favorite show, Take a 30-min hot bath..."
                rows="4"
                required
                className="vision-textarea"
              />
            </div>

            <div className="habit-section punishment-section">
              <h3>⚠️ Your PUNISHMENT (When You Break Commitment)</h3>
              <p className="habit-hint">
                When you let a day pass without being true to your WHY - what do you lose?
              </p>
              <textarea
                name="punishment"
                value={formData.punishment}
                onChange={handleChange}
                placeholder="Example: No Chess for the entire day, No coffee tomorrow, No Netflix for 2 days, Only cold shower..."
                rows="4"
                required
                className="vision-textarea"
              />
            </div>

            <div className="habit-philosophy">
              <p>
                💡 <strong>The Philosophy:</strong> By connecting what you LOVE to what you MUST DO,
                you create unstoppable momentum. Your brain will crave the reward and fear the punishment,
                keeping you aligned with your Table.
              </p>
            </div>

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="submit" className="btn-complete">
                🎉 Complete Vision Board
              </button>
            </div>
          </div>
        )}

      </form>

      {/* Export & Share */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <ExportShare
          milestoneData={formData}
          milestoneName="Vision Board"
          milestoneNumber={1}
        />
      </div>
    </div>
  );
};

export default VisionBoard;
