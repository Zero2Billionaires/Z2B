const mongoose = require('mongoose');

// ============================================
// Milestone 1 Lead Schema
// ============================================
// Purpose: Track prospects who opt-in for Milestone 1
// Collection: milestone1Leads
// ============================================

const milestone1LeadSchema = new mongoose.Schema({
  // ==========================================
  // BASIC INFO (from landing page form)
  // ==========================================
  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },

  whatsapp: {
    type: String,
    required: true,
    trim: true
  },

  currentSituation: {
    type: String,
    required: true,
    enum: ['employed-fulltime', 'employed-parttime', 'self-employed', 'unemployed', 'student']
  },

  biggestFrustration: {
    type: String,
    required: true
  },

  // ==========================================
  // TRACKING INFO
  // ==========================================
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  source: {
    type: String,
    default: 'landing-page',
    enum: ['landing-page', 'referral', 'social-media', 'direct', 'other']
  },

  // ==========================================
  // MILESTONE 1 COMPLETION TRACKING
  // ==========================================
  milestone1Complete: {
    type: Boolean,
    default: false,
    index: true
  },

  milestone1CompletedAt: {
    type: Date,
    default: null
  },

  // Milestone 1 Interactive Data (Vision Board + SWOT/TEEE)
  milestone1Data: {
    type: Object,
    default: {}
  },

  // ==========================================
  // BRONZE TIER UPSELL TRACKING
  // ==========================================
  bronzeUpsellShown: {
    type: Boolean,
    default: false
  },

  bronzeUpsellDecision: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
    index: true
  },

  bronzeUpsellDecidedAt: {
    type: Date,
    default: null
  },

  // ==========================================
  // STATUS & TIER
  // ==========================================
  status: {
    type: String,
    enum: [
      'new',                      // Just opted in
      'milestone1-in-progress',   // Started M1
      'milestone1-complete',      // Completed M1
      'bronze-pending',           // Accepted upsell, payment pending
      'bronze-member',            // Active Bronze member
      'free-member',              // Declined upsell, using free
      'inactive'                  // No activity in 30+ days
    ],
    default: 'new',
    index: true
  },

  tier: {
    type: String,
    enum: ['free', 'bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'free'
  },

  // ==========================================
  // COMMUNICATION TRACKING
  // ==========================================
  emailSent: {
    type: Boolean,
    default: false
  },

  whatsappSent: {
    type: Boolean,
    default: false
  },

  lastEmailSentAt: {
    type: Date,
    default: null
  },

  emailsReceived: {
    type: Number,
    default: 0
  },

  emailOpens: {
    type: Number,
    default: 0
  },

  emailClicks: {
    type: Number,
    default: 0
  },

  // ==========================================
  // ENGAGEMENT TRACKING
  // ==========================================
  lastActiveAt: {
    type: Date,
    default: Date.now
  },

  loginCount: {
    type: Number,
    default: 0
  },

  // ==========================================
  // REFERRAL TRACKING
  // ==========================================
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },

  referralsCount: {
    type: Number,
    default: 0
  },

  // ==========================================
  // PAYMENT TRACKING (for Bronze Tier)
  // ==========================================
  bronzeSubscriptionId: {
    type: String,
    default: null
  },

  bronzeActivatedAt: {
    type: Date,
    default: null
  },

  bronzeCancelledAt: {
    type: Date,
    default: null
  },

  lastPaymentAt: {
    type: Date,
    default: null
  },

  lifetimeValue: {
    type: Number,
    default: 0
  },

  // ==========================================
  // ADMIN NOTES
  // ==========================================
  notes: {
    type: String,
    default: ''
  },

  tags: [{
    type: String
  }],

  isArchived: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt
  collection: 'milestone1Leads'
});

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================
milestone1LeadSchema.index({ email: 1 });
milestone1LeadSchema.index({ status: 1 });
milestone1LeadSchema.index({ milestone1Complete: 1 });
milestone1LeadSchema.index({ bronzeUpsellDecision: 1 });
milestone1LeadSchema.index({ submittedAt: -1 });
milestone1LeadSchema.index({ tier: 1 });
milestone1LeadSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Calculate days since opt-in
milestone1LeadSchema.virtual('daysSinceOptin').get(function() {
  if (!this.submittedAt) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.submittedAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Calculate days since M1 completion
milestone1LeadSchema.virtual('daysSinceM1Complete').get(function() {
  if (!this.milestone1CompletedAt) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.milestone1CompletedAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Check if user is active (activity in last 7 days)
milestone1LeadSchema.virtual('isActive').get(function() {
  if (!this.lastActiveAt) return false;
  const now = new Date();
  const diffTime = Math.abs(now - this.lastActiveAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
});

// ============================================
// METHODS
// ============================================

// Mark Milestone 1 as complete
milestone1LeadSchema.methods.completeM1 = async function() {
  this.milestone1Complete = true;
  this.milestone1CompletedAt = new Date();
  this.status = 'milestone1-complete';
  this.lastActiveAt = new Date();
  return await this.save();
};

// Accept Bronze Tier upsell
milestone1LeadSchema.methods.acceptBronzeUpsell = async function() {
  this.bronzeUpsellShown = true;
  this.bronzeUpsellDecision = 'accepted';
  this.bronzeUpsellDecidedAt = new Date();
  this.status = 'bronze-pending';
  this.lastActiveAt = new Date();
  return await this.save();
};

// Decline Bronze Tier upsell
milestone1LeadSchema.methods.declineBronzeUpsell = async function() {
  this.bronzeUpsellShown = true;
  this.bronzeUpsellDecision = 'declined';
  this.bronzeUpsellDecidedAt = new Date();
  this.status = 'free-member';
  this.lastActiveAt = new Date();
  return await this.save();
};

// Activate Bronze Tier (after payment)
milestone1LeadSchema.methods.activateBronze = async function(subscriptionId) {
  this.tier = 'bronze';
  this.status = 'bronze-member';
  this.bronzeSubscriptionId = subscriptionId;
  this.bronzeActivatedAt = new Date();
  this.lastPaymentAt = new Date();
  this.lastActiveAt = new Date();
  return await this.save();
};

// Record payment
milestone1LeadSchema.methods.recordPayment = async function(amount) {
  this.lastPaymentAt = new Date();
  this.lifetimeValue += amount;
  return await this.save();
};

// Update last active timestamp
milestone1LeadSchema.methods.updateActivity = async function() {
  this.lastActiveAt = new Date();
  this.loginCount += 1;
  return await this.save();
};

// ============================================
// STATIC METHODS (for querying)
// ============================================

// Get completion rate
milestone1LeadSchema.statics.getCompletionRate = async function() {
  const total = await this.countDocuments();
  const completed = await this.countDocuments({ milestone1Complete: true });
  return total > 0 ? ((completed / total) * 100).toFixed(2) : 0;
};

// Get Bronze acceptance rate
milestone1LeadSchema.statics.getBronzeAcceptanceRate = async function() {
  const completed = await this.countDocuments({ milestone1Complete: true });
  const accepted = await this.countDocuments({ bronzeUpsellDecision: 'accepted' });
  return completed > 0 ? ((accepted / completed) * 100).toFixed(2) : 0;
};

// Get stats for admin dashboard
milestone1LeadSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const completed = await this.countDocuments({ milestone1Complete: true });
  const bronzeAccepted = await this.countDocuments({ bronzeUpsellDecision: 'accepted' });
  const bronzeDeclined = await this.countDocuments({ bronzeUpsellDecision: 'declined' });
  const bronzeMembers = await this.countDocuments({ tier: 'bronze', status: 'bronze-member' });
  const freeMembers = await this.countDocuments({ tier: 'free' });

  return {
    total,
    completed,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) + '%' : '0%',
    bronzeAccepted,
    bronzeDeclined,
    bronzeAcceptanceRate: completed > 0 ? ((bronzeAccepted / completed) * 100).toFixed(2) + '%' : '0%',
    bronzeMembers,
    freeMembers,
    avgLifetimeValue: await this.aggregate([
      { $group: { _id: null, avg: { $avg: '$lifetimeValue' } } }
    ]).then(result => result[0]?.avg || 0)
  };
};

// Find inactive users (no activity in 30+ days)
milestone1LeadSchema.statics.findInactiveUsers = async function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await this.find({
    lastActiveAt: { $lt: cutoffDate },
    isArchived: false
  });
};

// ============================================
// PRE-SAVE HOOKS
// ============================================

// Generate referral code if doesn't exist
milestone1LeadSchema.pre('save', function(next) {
  if (!this.referralCode) {
    const namePart = this.fullName.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = `${namePart}${randomPart}`;
  }
  next();
});

// ============================================
// EXPORT MODEL
// ============================================

module.exports = mongoose.model('Milestone1Lead', milestone1LeadSchema);