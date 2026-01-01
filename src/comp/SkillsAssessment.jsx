import React, { useState, useEffect } from 'react';
import TLITracker from './TLITracker';
import ExportShare from './ExportShare';
import '../styles/skillsassessment.css';

const SkillsAssessment = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState({
    technical: [],
    business: [],
    creative: [],
    leadership: [],
    personal: []
  });
  const [skillGaps, setSkillGaps] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ title: '', deadline: '', priority: 'medium' });

  const totalSteps = 4;

  const skillCategories = {
    technical: [
      'Web Development', 'Mobile Apps', 'AI/Machine Learning', 'Data Analysis',
      'Digital Marketing', 'SEO/SEM', 'Email Marketing', 'Social Media Management',
      'Graphic Design', 'Video Editing', 'Copywriting', 'Content Creation'
    ],
    business: [
      'Financial Management', 'Business Planning', 'Sales', 'Negotiation',
      'Project Management', 'Customer Service', 'Market Research', 'Budgeting',
      'Fundraising', 'Legal Compliance', 'Operations', 'Strategic Planning'
    ],
    creative: [
      'Storytelling', 'Branding', 'Photography', 'Videography',
      'Public Speaking', 'Presentation Skills', 'Creative Writing', 'Design Thinking',
      'Innovation', 'Problem Solving', 'Visual Arts', 'Music Production'
    ],
    leadership: [
      'Team Building', 'Mentoring', 'Coaching', 'Delegation',
      'Conflict Resolution', 'Decision Making', 'Vision Setting', 'Motivation',
      'Accountability', 'Communication', 'Networking', 'Influence'
    ],
    personal: [
      'Time Management', 'Self-Discipline', 'Resilience', 'Adaptability',
      'Critical Thinking', 'Emotional Intelligence', 'Learning Agility', 'Focus',
      'Stress Management', 'Goal Setting', 'Productivity', 'Work-Life Balance'
    ]
  };

  useEffect(() => {
    const savedAssessment = localStorage.getItem('skillsAssessment');
    if (savedAssessment) {
      const data = JSON.parse(savedAssessment);
      if (data.skills) setSkills(data.skills);
      if (data.skillGaps) setSkillGaps(data.skillGaps);
      if (data.goals) setGoals(data.goals);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSkill = (category, skill) => {
    setSkills(prev => {
      const categorySkills = prev[category];
      const isSelected = categorySkills.includes(skill);

      return {
        ...prev,
        [category]: isSelected
          ? categorySkills.filter(s => s !== skill)
          : [...categorySkills, skill]
      };
    });
  };

  const addSkillGap = (gap) => {
    if (gap.trim() && !skillGaps.includes(gap.trim())) {
      setSkillGaps([...skillGaps, gap.trim()]);
    }
  };

  const removeSkillGap = (gap) => {
    setSkillGaps(skillGaps.filter(g => g !== gap));
  };

  const addGoal = () => {
    if (newGoal.title.trim()) {
      const goal = {
        id: Date.now(),
        title: newGoal.title.trim(),
        deadline: newGoal.deadline,
        priority: newGoal.priority,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: '', deadline: '', priority: 'medium' });
    }
  };

  const removeGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const toggleGoalComplete = (id) => {
    setGoals(goals.map(g =>
      g.id === id ? { ...g, completed: !g.completed } : g
    ));
  };

  const handleSubmit = () => {
    const assessmentData = {
      skills,
      skillGaps,
      goals,
      completedAt: new Date().toISOString()
    };

    localStorage.setItem('skillsAssessment', JSON.stringify(assessmentData));
    localStorage.setItem('milestone2Complete', 'true');

    if (onComplete) {
      onComplete(assessmentData);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getTotalSkillsSelected = () => {
    return Object.values(skills).reduce((total, category) => total + category.length, 0);
  };

  return (
    <div className="skills-assessment-container">
      <div className="skills-header">
        <h1>MILESTONE 2: SKILLS ASSESSMENT</h1>
        <p className="subtitle">"Know Thyself • Build Your Arsenal • Define Your Path"</p>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
        <p className="step-indicator">Step {step} of {totalSteps}</p>
      </div>

      {/* TLI Tracker */}
      <TLITracker />

      <div className="skills-form">

        {/* Step 1: Current Skills Inventory */}
        {step === 1 && (
          <div className="form-step">
            <div className="tee-badge education">📚 Education</div>
            <h2>Your Current Skills Inventory</h2>
            <p className="step-description">
              Select ALL skills you currently possess. Be honest - this is your starting point.
              You've selected <strong>{getTotalSkillsSelected()} skills</strong>.
            </p>

            {Object.entries(skillCategories).map(([category, skillsList]) => (
              <div key={category} className="skill-category">
                <h3>
                  {category === 'technical' && '💻 Technical Skills'}
                  {category === 'business' && '💼 Business Skills'}
                  {category === 'creative' && '🎨 Creative Skills'}
                  {category === 'leadership' && '👥 Leadership Skills'}
                  {category === 'personal' && '🎯 Personal Development'}
                </h3>
                <div className="skills-grid">
                  {skillsList.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className={`skill-chip ${skills[category].includes(skill) ? 'selected' : ''}`}
                      onClick={() => toggleSkill(category, skill)}
                    >
                      {skills[category].includes(skill) ? '✅' : '⚪'} {skill}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="form-actions">
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: Identify Skill Gaps →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skill Gaps Analysis */}
        {step === 2 && (
          <div className="form-step">
            <div className="tee-badge transformation">🔄 Transformation</div>
            <h2>Identify Your Skill Gaps</h2>
            <p className="step-description">
              What skills do you NEED to build your legacy but don't have yet?
              Think about your Table focus and TLI goals. What's missing?
            </p>

            <div className="skill-gaps-section">
              <div className="gap-input-group">
                <input
                  type="text"
                  placeholder="Type a skill you need to acquire (e.g., 'Facebook Ads', 'Public Speaking')..."
                  className="gap-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSkillGap(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add"
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    addSkillGap(input.value);
                    input.value = '';
                  }}
                >
                  + Add Gap
                </button>
              </div>

              <div className="gaps-list">
                {skillGaps.length === 0 ? (
                  <p className="empty-state">No skill gaps added yet. Start identifying what you need to learn!</p>
                ) : (
                  skillGaps.map(gap => (
                    <div key={gap} className="gap-item">
                      <span>🎯 {gap}</span>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeSkillGap(gap)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: Set Your Goals →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals & Tasks */}
        {step === 3 && (
          <div className="form-step">
            <div className="tee-badge empowerment">⚡ Empowerment</div>
            <h2>Set Your Goals & Assignments</h2>
            <p className="step-description">
              Define specific, actionable goals to bridge your skill gaps and advance your TLI level.
              What will you accomplish in the next 30-90 days?
            </p>

            <div className="goals-section">
              <div className="goal-creator">
                <input
                  type="text"
                  placeholder="Goal title (e.g., 'Complete Facebook Ads course')"
                  className="goal-input"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
                <input
                  type="date"
                  className="goal-deadline"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
                <select
                  className="goal-priority"
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <button type="button" className="btn-add" onClick={addGoal}>
                  + Add Goal
                </button>
              </div>

              <div className="goals-list">
                {goals.length === 0 ? (
                  <p className="empty-state">No goals set yet. Start adding your action items!</p>
                ) : (
                  goals.map(goal => (
                    <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''} priority-${goal.priority}`}>
                      <div className="goal-checkbox">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={() => toggleGoalComplete(goal.id)}
                        />
                      </div>
                      <div className="goal-content">
                        <div className="goal-title">{goal.title}</div>
                        <div className="goal-meta">
                          {goal.deadline && <span>📅 {new Date(goal.deadline).toLocaleDateString()}</span>}
                          <span className={`priority-badge priority-${goal.priority}`}>
                            {goal.priority === 'high' && '🔴 High'}
                            {goal.priority === 'medium' && '🟡 Medium'}
                            {goal.priority === 'low' && '🟢 Low'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeGoal(goal.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next: Review & Complete →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Complete */}
        {step === 4 && (
          <div className="form-step">
            <div className="tee-badge transformation">🎯 Complete</div>
            <h2>Review Your Skills Assessment</h2>
            <p className="step-description">
              Review your skills inventory, gaps, and goals. You can always update these later.
            </p>

            <div className="review-section">
              <div className="review-card">
                <h3>💪 Current Skills ({getTotalSkillsSelected()})</h3>
                <div className="review-tags">
                  {Object.entries(skills).flatMap(([category, skillsList]) =>
                    skillsList.map(skill => (
                      <span key={skill} className="review-tag">{skill}</span>
                    ))
                  )}
                </div>
              </div>

              <div className="review-card">
                <h3>🎯 Skill Gaps ({skillGaps.length})</h3>
                <div className="review-list">
                  {skillGaps.map(gap => (
                    <div key={gap} className="review-item">🎯 {gap}</div>
                  ))}
                </div>
              </div>

              <div className="review-card">
                <h3>📋 Goals & Assignments ({goals.length})</h3>
                <div className="review-list">
                  {goals.map(goal => (
                    <div key={goal.id} className="review-item">
                      {goal.completed ? '✅' : '⚪'} {goal.title}
                      {goal.deadline && ` (Due: ${new Date(goal.deadline).toLocaleDateString()})`}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="completion-message">
              <p>
                🎉 <strong>Great work!</strong> You've completed your Skills Assessment.
                This is your blueprint for growth. Keep updating it as you progress through your TLI journey!
              </p>
            </div>

            <div className="form-actions">
              <button type="button" onClick={prevStep} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={handleSubmit} className="btn-complete">
                🎉 Complete Milestone 2
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Export & Share */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <ExportShare
          milestoneData={{ skills, skillGaps, goals }}
          milestoneName="Skills Assessment"
          milestoneNumber={2}
        />
      </div>
    </div>
  );
};

export default SkillsAssessment;
