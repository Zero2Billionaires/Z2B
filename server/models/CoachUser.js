import mongoose from 'mongoose';

const coachUserSchema = new mongoose.Schema({
  // Link to main member account
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },

  // Basic Info
  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  // Journey Stage
  currentStage: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Master'],
    default: 'Beginner'
  },

  stageHistory: [{
    stage: String,
    achievedDate: Date,
    btssScoreAtTime: Number
  }],

  // Current Focus
  currentFocusLeg: {
    type: String,
    enum: ['Mindset Mystery', 'Money Moves', 'Legacy Mission', 'Movement Momentum'],
    default: 'Mindset Mystery'
  },

  // Session Tracking
  totalCoachingSessions: {
    type: Number,
    default: 0
  },

  lastCheckIn: {
    type: Date
  },

  checkInStreak: {
    type: Number,
    default: 0
  },

  // Preferences
  preferredCheckInTime: String,

  notificationsEnabled: {
    type: Boolean,
    default: true
  },

  // Stats
  totalWins: {
    type: Number,
    default: 0
  },

  totalActionsCompleted: {
    type: Number,
    default: 0
  },

  lessonsCompleted: {
    type: Number,
    default: 0
  },

  // Metadata
  joinedDate: {
    type: Date,
    default: Date.now
  },

  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastActive on any interaction
coachUserSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Method to advance stage
coachUserSchema.methods.advanceStage = function(newStage, currentBTSS) {
  this.stageHistory.push({
    stage: newStage,
    achievedDate: new Date(),
    btssScoreAtTime: currentBTSS
  });
  this.currentStage = newStage;
};

// Method to record check-in
coachUserSchema.methods.recordCheckIn = function() {
  const now = new Date();
  const lastCheckIn = this.lastCheckIn;

  // Check if last check-in was yesterday (streak continues)
  if (lastCheckIn) {
    const diffTime = Math.abs(now - lastCheckIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.checkInStreak += 1;
    } else if (diffDays > 1) {
      this.checkInStreak = 1;
    }
  } else {
    this.checkInStreak = 1;
  }

  this.lastCheckIn = now;
  this.totalCoachingSessions += 1;
};

export default mongoose.model('CoachUser', coachUserSchema);
