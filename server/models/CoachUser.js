import mongoose from 'mongoose';

const coachUserSchema = new mongoose.Schema({
  // Membership Number (Z2B + 7 digits)
  membershipNumber: {
    type: String,
    unique: true,
    sparse: true,  // Allow null values to be non-unique
    match: /^Z2B\d{7}$/  // Format: Z2B + 7 digits (e.g., Z2B0000001)
  },

  // Link to main member account (optional - can register without membership)
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: false
  },

  // Referral Link
  referralLink: {
    type: String
  },

  // Sponsor/Referrer
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoachUser'
  },

  // Basic Info
  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // Don't return password by default
  },

  // Membership Tier
  tier: {
    type: String,
    enum: ['FAM', 'Bronze', 'Copper', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'FAM'
  },

  role: {
    type: String,
    enum: ['user', 'admin', 'coach'],
    default: 'user'
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

// Auto-generate membership number before saving
coachUserSchema.pre('save', async function(next) {
  // Only generate if this is a new document and doesn't have a membership number
  if (this.isNew && !this.membershipNumber) {
    try {
      // Find the highest membership number across both CoachUser and Member collections
      const lastCoachUser = await this.constructor
        .findOne({ membershipNumber: { $regex: /^Z2B\d{7}$/ } })
        .sort({ membershipNumber: -1 })
        .select('membershipNumber');

      const Member = mongoose.model('Member');
      const lastMember = await Member
        .findOne({ membershipNumber: { $regex: /^Z2B\d{7}$/ } })
        .sort({ membershipNumber: -1 })
        .select('membershipNumber');

      let nextNumber = 1;

      // Get the highest number from both collections
      const coachUserNumber = lastCoachUser?.membershipNumber ? parseInt(lastCoachUser.membershipNumber.substring(3)) : 0;
      const memberNumber = lastMember?.membershipNumber ? parseInt(lastMember.membershipNumber.substring(3)) : 0;

      nextNumber = Math.max(coachUserNumber, memberNumber) + 1;

      // Format with leading zeros (7 digits)
      const paddedNumber = String(nextNumber).padStart(7, '0');
      this.membershipNumber = `Z2B${paddedNumber}`;

    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Auto-generate referral link after membership number is set
coachUserSchema.pre('save', function(next) {
  if (this.membershipNumber && !this.referralLink) {
    // Format: https://z2blegacybuilders.co.za/join?ref=Z2B0000001
    this.referralLink = `https://z2blegacybuilders.co.za/join?ref=${this.membershipNumber}`;
  }
  next();
});

// Update lastActive on any interaction
coachUserSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Method to get referral link
coachUserSchema.methods.getReferralLink = function() {
  return `https://z2blegacybuilders.co.za/join?ref=${this.membershipNumber}`;
};

// Method to get short referral code (just the membership number)
coachUserSchema.methods.getReferralCode = function() {
  return this.membershipNumber;
};

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
