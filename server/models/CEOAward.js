/**
 * CEO Award Model
 * CEO can create awards (cars, trips, cash, products) requiring board approval
 * Awards are based on previous quarter's cash on hand
 */

import mongoose from 'mongoose';

const ceoAwardSchema = new mongoose.Schema({
  awardId: {
    type: String,
    unique: true,
    default: () => `AWARD${Date.now()}`
  },

  // Award Details
  name: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ['car', 'trip', 'cash', 'product', 'custom'],
    required: true
  },

  value: {
    type: Number,
    required: true
  },

  description: String,

  // For specific types
  details: {
    // For cars
    make: String,
    model: String,
    year: Number,

    // For trips
    destination: String,
    duration: String,
    includesPlusOne: { type: Boolean, default: true },
    allExpensesPaid: { type: Boolean, default: true },

    // For products
    productName: String,
    brand: String,

    // For cash
    paymentMethod: String, // 'bank_transfer', 'check', 'cash'

    // Custom
    customDetails: String
  },

  // Eligibility Criteria
  eligibilityCriteria: {
    minTier: {
      type: String,
      enum: ['FAM', 'Bronze', 'Copper', 'Silver', 'Gold', 'Platinum', 'Diamond']
    },
    minPV: Number,
    minDirectReferrals: Number,
    minTeamSize: Number,
    minTLILevel: Number,
    customCriteria: String
  },

  // Qualification Period
  qualificationPeriod: {
    start: Date,
    end: Date
  },

  numberOfWinners: {
    type: Number,
    default: 1
  },

  // Board Approval (based on previous quarter cash on hand)
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },

  quarterCashOnHand: {
    type: Number,
    required: false
  },

  quarter: String, // e.g., "Q4 2025"

  approvalVotes: [{
    boardMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoachUser',
      required: true
    },
    vote: {
      type: String,
      enum: ['approve', 'reject'],
      required: true
    },
    comment: String,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],

  approvalRequired: {
    type: Number,
    default: 2 // Majority of board members
  },

  // Winners
  winners: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoachUser',
      required: true
    },
    qualificationScore: Number,
    awardedDate: {
      type: Date,
      default: Date.now
    },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'cancelled'],
      default: 'pending'
    },
    fulfillmentNotes: String,
    fulfillmentDate: Date
  }],

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoachUser',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  approvedAt: Date,
  activatedAt: Date,
  completedAt: Date,
  cancelledAt: Date,

  notes: String
}, {
  timestamps: true
});

// Indexes
ceoAwardSchema.index({ status: 1 });
ceoAwardSchema.index({ createdBy: 1 });
ceoAwardSchema.index({ 'qualificationPeriod.start': 1, 'qualificationPeriod.end': 1 });

// Methods
ceoAwardSchema.methods.submitForApproval = async function() {
  this.status = 'pending_approval';
  return await this.save();
};

ceoAwardSchema.methods.addVote = async function(boardMemberId, vote, comment) {
  // Check if board member already voted
  const existingVote = this.approvalVotes.find(
    v => v.boardMember.toString() === boardMemberId.toString()
  );

  if (existingVote) {
    throw new Error('Board member has already voted');
  }

  this.approvalVotes.push({
    boardMember: boardMemberId,
    vote,
    comment,
    votedAt: new Date()
  });

  // Check if we have enough votes to approve/reject
  const approveCount = this.approvalVotes.filter(v => v.vote === 'approve').length;
  const rejectCount = this.approvalVotes.filter(v => v.vote === 'reject').length;

  if (approveCount >= this.approvalRequired) {
    this.status = 'approved';
    this.approvedAt = new Date();
  } else if (rejectCount >= this.approvalRequired) {
    this.status = 'rejected';
  }

  return await this.save();
};

ceoAwardSchema.methods.activate = async function() {
  if (this.status !== 'approved') {
    throw new Error('Award must be approved before activation');
  }
  this.status = 'active';
  this.activatedAt = new Date();
  return await this.save();
};

ceoAwardSchema.methods.selectWinners = async function(winnersData) {
  this.winners = winnersData.map(w => ({
    user: w.userId,
    qualificationScore: w.score,
    awardedDate: new Date(),
    fulfillmentStatus: 'pending'
  }));
  return await this.save();
};

ceoAwardSchema.methods.updateFulfillment = async function(userId, status, notes) {
  const winner = this.winners.find(w => w.user.toString() === userId.toString());
  if (!winner) {
    throw new Error('User is not a winner');
  }

  winner.fulfillmentStatus = status;
  winner.fulfillmentNotes = notes;
  if (status === 'delivered') {
    winner.fulfillmentDate = new Date();
  }

  // Check if all winners are fulfilled
  const allFulfilled = this.winners.every(w => w.fulfillmentStatus === 'delivered');
  if (allFulfilled) {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  return await this.save();
};

const CEOAward = mongoose.model('CEOAward', ceoAwardSchema);

export default CEOAward;
