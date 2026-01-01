import mongoose from 'mongoose';

const btssScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoachUser',
    required: true
  },

  scoreDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  // The Four Legs Scores (0-100)
  mindsetMysteryScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },

  moneyMovesScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },

  legacyMissionScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },

  movementMomentumScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },

  // Calculated Fields
  overallBTSS: {
    type: Number,
    min: 0,
    max: 100
  },

  weakestLeg: {
    type: String,
    enum: ['Mindset Mystery', 'Money Moves', 'Legacy Mission', 'Movement Momentum']
  },

  strongestLeg: {
    type: String,
    enum: ['Mindset Mystery', 'Money Moves', 'Legacy Mission', 'Movement Momentum']
  },

  tableStability: {
    type: String,
    enum: ['Foundation', 'Growth', 'Strength', 'Mastery']
  },

  // Assessment Details
  assessmentType: {
    type: String,
    enum: ['self', 'guided', 'monthly'],
    default: 'self'
  },

  notes: String,

  // Detailed Sub-scores (optional for deep assessment)
  mindsetDetails: {
    identityInChrist: { type: Number, min: 0, max: 100 },
    beliefSystems: { type: Number, min: 0, max: 100 },
    visionClarity: { type: Number, min: 0, max: 100 },
    spiritualAlignment: { type: Number, min: 0, max: 100 }
  },

  moneyDetails: {
    incomeGeneration: { type: Number, min: 0, max: 100 },
    investmentStrategy: { type: Number, min: 0, max: 100 },
    assetProtection: { type: Number, min: 0, max: 100 },
    systemsAutomation: { type: Number, min: 0, max: 100 }
  },

  legacyDetails: {
    systemDesign: { type: Number, min: 0, max: 100 },
    purposeAlignment: { type: Number, min: 0, max: 100 },
    generationalWealth: { type: Number, min: 0, max: 100 },
    impactMeasurement: { type: Number, min: 0, max: 100 }
  },

  movementDetails: {
    communityBuilding: { type: Number, min: 0, max: 100 },
    emotionalIntelligence: { type: Number, min: 0, max: 100 },
    networking: { type: Number, min: 0, max: 100 },
    visibility: { type: Number, min: 0, max: 100 }
  }
}, {
  timestamps: true
});

// Calculate overall BTSS and identify weak/strong legs before saving
btssScoreSchema.pre('save', function(next) {
  // Calculate overall BTSS (average of four legs)
  this.overallBTSS = Math.round(
    (this.mindsetMysteryScore +
     this.moneyMovesScore +
     this.legacyMissionScore +
     this.movementMomentumScore) / 4
  );

  // Find weakest and strongest legs
  const legs = {
    'Mindset Mystery': this.mindsetMysteryScore,
    'Money Moves': this.moneyMovesScore,
    'Legacy Mission': this.legacyMissionScore,
    'Movement Momentum': this.movementMomentumScore
  };

  let minScore = 100;
  let maxScore = 0;
  let weakest = '';
  let strongest = '';

  for (const [leg, score] of Object.entries(legs)) {
    if (score < minScore) {
      minScore = score;
      weakest = leg;
    }
    if (score > maxScore) {
      maxScore = score;
      strongest = leg;
    }
  }

  this.weakestLeg = weakest;
  this.strongestLeg = strongest;

  // Determine table stability based on weakest leg
  if (minScore >= 76) {
    this.tableStability = 'Mastery';
  } else if (minScore >= 51) {
    this.tableStability = 'Strength';
  } else if (minScore >= 26) {
    this.tableStability = 'Growth';
  } else {
    this.tableStability = 'Foundation';
  }

  next();
});

// Static method to get latest BTSS for a user
btssScoreSchema.statics.getLatestScore = async function(userId) {
  return this.findOne({ userId })
    .sort({ scoreDate: -1 })
    .exec();
};

// Static method to get BTSS history
btssScoreSchema.statics.getScoreHistory = async function(userId, limit = 12) {
  return this.find({ userId })
    .sort({ scoreDate: -1 })
    .limit(limit)
    .exec();
};

// Static method to calculate growth rate
btssScoreSchema.statics.calculateGrowthRate = async function(userId) {
  const scores = await this.find({ userId })
    .sort({ scoreDate: -1 })
    .limit(2)
    .exec();

  if (scores.length < 2) {
    return null;
  }

  const latest = scores[0].overallBTSS;
  const previous = scores[1].overallBTSS;

  return {
    change: latest - previous,
    percentChange: ((latest - previous) / previous * 100).toFixed(2)
  };
};

export default mongoose.model('BTSSScore', btssScoreSchema);
