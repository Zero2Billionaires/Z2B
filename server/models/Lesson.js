const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    unique: true,
    required: true
  },

  lessonTitle: {
    type: String,
    required: true
  },

  lessonSlug: {
    type: String,
    unique: true
  },

  // Classification
  legCategory: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    enum: [1, 2, 3, 4]
    // 1 = Mindset Mystery
    // 2 = Money Moves
    // 3 = Legacy Mission
    // 4 = Movement Momentum
  },

  legCategoryName: {
    type: String,
    enum: ['Mindset Mystery', 'Money Moves', 'Legacy Mission', 'Movement Momentum']
  },

  targetStage: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Master', 'All'],
    default: 'All'
  },

  // IMPACT Framework Content
  impactFramework: {
    identify: {
      challenge: String,
      currentState: String,
      painPoints: [String]
    },
    model: {
      biblicalPrinciple: String,
      businessModel: String,
      keyFramework: String
    },
    proof: {
      scriptures: [{
        reference: String,
        verse: String
      }],
      examples: [String],
      successStories: [String]
    },
    apply: {
      actionSteps: [{
        step: String,
        order: Number,
        timeframe: String
      }],
      resources: [String]
    },
    challenge: {
      limitingBeliefs: [String],
      growthTargets: [String],
      stretchGoals: [String]
    },
    transform: {
      expectedOutcomes: [String],
      successMetrics: [String],
      milestones: [String]
    }
  },

  // Lesson Content
  shortDescription: String,

  fullContent: String,

  estimatedDuration: {
    type: Number, // in minutes
    default: 15
  },

  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging'],
    default: 'moderate'
  },

  // Scripture References
  scriptures: [{
    reference: String,
    verse: String,
    application: String
  }],

  // Action Steps (Quick Reference)
  actionSteps: [{
    description: String,
    linkedLeg: String
  }],

  // Multimedia
  videoUrl: String,
  audioUrl: String,
  worksheetUrl: String,
  additionalResources: [String],

  // Tags & Search
  tags: [String],
  keywords: [String],

  // Stats
  completionCount: {
    type: Number,
    default: 0
  },

  averageRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },

  // Status
  isPublished: {
    type: Boolean,
    default: true
  },

  isPremium: {
    type: Boolean,
    default: false
  },

  // Sequencing
  sequenceNumber: Number,
  prerequisiteLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],

  nextRecommendedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }]
}, {
  timestamps: true
});

// Generate lesson slug before saving
lessonSchema.pre('save', function(next) {
  if (!this.lessonSlug) {
    this.lessonSlug = this.lessonTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Set leg category name based on number
  const legNames = {
    1: 'Mindset Mystery',
    2: 'Money Moves',
    3: 'Legacy Mission',
    4: 'Movement Momentum'
  };
  this.legCategoryName = legNames[this.legCategory];

  next();
});

// Method to record completion
lessonSchema.methods.recordCompletion = function() {
  this.completionCount += 1;
};

// Method to update rating
lessonSchema.methods.updateRating = function(newRating) {
  if (!this.averageRating) {
    this.averageRating = newRating;
  } else {
    // Simple average update
    this.averageRating = (this.averageRating + newRating) / 2;
  }
};

// Static method to get lessons by leg
lessonSchema.statics.getLessonsByLeg = async function(legCategory, stage = null) {
  const query = { legCategory, isPublished: true };
  if (stage) {
    query.$or = [
      { targetStage: stage },
      { targetStage: 'All' }
    ];
  }
  return this.find(query).sort({ sequenceNumber: 1 }).exec();
};

// Static method to get recommended lessons for user
lessonSchema.statics.getRecommendedLessons = async function(userId) {
  // This would integrate with CoachUser to get current stage and focus leg
  // For now, return popular lessons
  return this.find({ isPublished: true })
    .sort({ completionCount: -1, averageRating: -1 })
    .limit(5)
    .exec();
};

module.exports = mongoose.model('Lesson', lessonSchema);
