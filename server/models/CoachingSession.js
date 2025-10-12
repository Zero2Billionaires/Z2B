const mongoose = require('mongoose');

const coachingSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoachUser',
    required: true
  },

  sessionType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'ad-hoc'],
    required: true
  },

  sessionDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  // Conversation Data
  conversationLog: [{
    role: {
      type: String,
      enum: ['user', 'coach', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Scripture Shared
  scriptureShared: [{
    reference: String,
    verse: String,
    context: String
  }],

  // Action Items Given
  actionItemsGiven: [{
    description: String,
    linkedLeg: {
      type: String,
      enum: ['Mindset Mystery', 'Money Moves', 'Legacy Mission', 'Movement Momentum']
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    dueDate: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Wins Recorded
  winsRecorded: [{
    description: String,
    linkedLeg: String,
    significance: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'small'
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Focus Area
  focusLeg: {
    type: String,
    enum: ['Mindset Mystery', 'Money Moves', 'Legacy Mission', 'Movement Momentum']
  },

  // Session Outcomes
  keyInsights: [String],

  limitingBeliefsAddressed: [String],

  breakthroughMoments: [String],

  // Session Status
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },

  completedAt: Date,

  duration: {
    type: Number, // in minutes
    default: 0
  },

  // User Feedback
  userRating: {
    type: Number,
    min: 1,
    max: 5
  },

  userFeedback: String,

  // AI Model Info
  aiModel: {
    type: String,
    default: 'claude-3.5-sonnet'
  },

  tokensUsed: Number
}, {
  timestamps: true
});

// Generate unique session ID
coachingSessionSchema.pre('save', function(next) {
  if (!this.sessionId) {
    this.sessionId = `CS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Method to add message to conversation
coachingSessionSchema.methods.addMessage = function(role, content) {
  this.conversationLog.push({
    role,
    content,
    timestamp: new Date()
  });
};

// Method to add action item
coachingSessionSchema.methods.addActionItem = function(description, linkedLeg, priority = 'medium', dueDate) {
  this.actionItemsGiven.push({
    description,
    linkedLeg,
    priority,
    dueDate,
    createdAt: new Date()
  });
};

// Method to record win
coachingSessionSchema.methods.recordWin = function(description, linkedLeg, significance = 'small') {
  this.winsRecorded.push({
    description,
    linkedLeg,
    significance,
    recordedAt: new Date()
  });
};

// Method to add scripture
coachingSessionSchema.methods.addScripture = function(reference, verse, context) {
  this.scriptureShared.push({
    reference,
    verse,
    context
  });
};

// Method to complete session
coachingSessionSchema.methods.completeSession = function(duration) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.duration = duration || this.calculateDuration();
};

// Calculate session duration
coachingSessionSchema.methods.calculateDuration = function() {
  if (this.conversationLog.length > 0) {
    const start = this.conversationLog[0].timestamp;
    const end = this.conversationLog[this.conversationLog.length - 1].timestamp;
    return Math.round((end - start) / (1000 * 60)); // minutes
  }
  return 0;
};

// Static method to get user's session history
coachingSessionSchema.statics.getUserSessions = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ sessionDate: -1 })
    .limit(limit)
    .exec();
};

// Static method to get session statistics
coachingSessionSchema.statics.getSessionStats = async function(userId) {
  const sessions = await this.find({ userId });

  return {
    totalSessions: sessions.length,
    dailySessions: sessions.filter(s => s.sessionType === 'daily').length,
    weeklySessions: sessions.filter(s => s.sessionType === 'weekly').length,
    monthlySessions: sessions.filter(s => s.sessionType === 'monthly').length,
    totalWins: sessions.reduce((sum, s) => sum + s.winsRecorded.length, 0),
    totalActions: sessions.reduce((sum, s) => sum + s.actionItemsGiven.length, 0),
    averageRating: sessions
      .filter(s => s.userRating)
      .reduce((sum, s) => sum + s.userRating, 0) / sessions.filter(s => s.userRating).length || 0
  };
};

module.exports = mongoose.model('CoachingSession', coachingSessionSchema);
