const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoachUser',
    required: true
  },

  // Action Item Details
  actionItem: {
    type: String,
    required: true
  },

  actionType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'milestone'],
    default: 'daily'
  },

  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'blocked', 'cancelled'],
    default: 'pending'
  },

  // Linked to Framework
  linkedLeg: {
    type: String,
    enum: ['Mindset Mystery', 'Money Moves', 'Legacy Mission', 'Movement Momentum'],
    required: true
  },

  linkedLegNumber: {
    type: Number,
    min: 1,
    max: 4
  },

  // Priority & Timing
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },

  createdDate: {
    type: Date,
    default: Date.now
  },

  dueDate: Date,

  startedDate: Date,

  completedDate: Date,

  // Session Reference
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoachingSession'
  },

  // Linked Lesson
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },

  // Progress Details
  progressNotes: String,

  blockers: [String],

  supportNeeded: String,

  // Results
  outcome: String,

  impactRating: {
    type: Number,
    min: 1,
    max: 5
  },

  btssImpact: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'positive'
  },

  // Reminders
  reminderSent: {
    type: Boolean,
    default: false
  },

  reminderDate: Date,

  // Reflection
  reflectionQuestions: [{
    question: String,
    answer: String
  }],

  lessonsLearned: [String]
}, {
  timestamps: true
});

// Set linked leg number based on leg name
userProgressSchema.pre('save', function(next) {
  const legMapping = {
    'Mindset Mystery': 1,
    'Money Moves': 2,
    'Legacy Mission': 3,
    'Movement Momentum': 4
  };
  this.linkedLegNumber = legMapping[this.linkedLeg];

  // Set startedDate when status changes to in-progress
  if (this.status === 'in-progress' && !this.startedDate) {
    this.startedDate = new Date();
  }

  // Set completedDate when status changes to completed
  if (this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }

  next();
});

// Method to mark as completed
userProgressSchema.methods.markCompleted = function(outcome, impactRating) {
  this.status = 'completed';
  this.completedDate = new Date();
  if (outcome) this.outcome = outcome;
  if (impactRating) this.impactRating = impactRating;
};

// Method to mark as blocked
userProgressSchema.methods.markBlocked = function(blockers, supportNeeded) {
  this.status = 'blocked';
  if (blockers) this.blockers = blockers;
  if (supportNeeded) this.supportNeeded = supportNeeded;
};

// Method to add reflection
userProgressSchema.methods.addReflection = function(question, answer) {
  this.reflectionQuestions.push({ question, answer });
};

// Static method to get user's active actions
userProgressSchema.statics.getActiveActions = async function(userId) {
  return this.find({
    userId,
    status: { $in: ['pending', 'in-progress', 'blocked'] }
  })
    .sort({ priority: -1, dueDate: 1 })
    .exec();
};

// Static method to get completed actions by leg
userProgressSchema.statics.getCompletedByLeg = async function(userId, linkedLeg) {
  return this.find({
    userId,
    linkedLeg,
    status: 'completed'
  })
    .sort({ completedDate: -1 })
    .exec();
};

// Static method to get completion rate
userProgressSchema.statics.getCompletionRate = async function(userId) {
  const total = await this.countDocuments({ userId });
  const completed = await this.countDocuments({ userId, status: 'completed' });

  return {
    total,
    completed,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
  };
};

// Static method to get overdue actions
userProgressSchema.statics.getOverdueActions = async function(userId) {
  const now = new Date();
  return this.find({
    userId,
    status: { $in: ['pending', 'in-progress'] },
    dueDate: { $lt: now }
  })
    .sort({ dueDate: 1 })
    .exec();
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
