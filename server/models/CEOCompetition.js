import mongoose from 'mongoose'

const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quarter: {
    type: String,
    required: true,
    enum: ['Q1', 'Q2', 'Q3', 'Q4']
  },
  year: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  targetType: {
    type: String,
    required: true,
    enum: ['sales', 'recruits', 'team_pv', 'personal_pv', 'team_growth', 'custom']
  },
  targetValue: {
    type: Number,
    required: true
  },
  targetDescription: {
    type: String,
    required: true
  },
  eligibility: {
    minTier: {
      type: String,
      enum: ['FAM', 'BLB', 'CLB', 'SLB', 'GLB', 'PLB', 'DLB'],
      default: 'FAM'
    },
    specificTiers: [{
      type: String,
      enum: ['FAM', 'BLB', 'CLB', 'SLB', 'GLB', 'PLB', 'DLB']
    }],
    allMembers: {
      type: Boolean,
      default: true
    }
  },
  prizes: {
    first: {
      amount: {
        type: Number,
        required: true
      },
      type: {
        type: String,
        enum: ['cash', 'car', 'trip', 'bonus', 'product', 'custom'],
        default: 'cash'
      },
      description: String
    },
    second: {
      amount: Number,
      type: {
        type: String,
        enum: ['cash', 'car', 'trip', 'bonus', 'product', 'custom'],
        default: 'cash'
      },
      description: String
    },
    third: {
      amount: Number,
      type: {
        type: String,
        enum: ['cash', 'car', 'trip', 'bonus', 'product', 'custom'],
        default: 'cash'
      },
      description: String
    },
    additionalPrizes: [{
      position: Number,
      amount: Number,
      type: {
        type: String,
        enum: ['cash', 'car', 'trip', 'bonus', 'product', 'custom'],
        default: 'cash'
      },
      description: String
    }]
  },
  totalPrizePool: {
    type: Number,
    required: true
  },
  participants: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    memberName: String,
    membershipNumber: String,
    tier: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    currentProgress: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  winners: [{
    position: {
      type: Number,
      required: true
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    memberName: String,
    membershipNumber: String,
    finalScore: Number,
    prizeAmount: Number,
    prizeType: String,
    prizeDescription: String,
    awardedAt: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'cancelled'],
      default: 'pending'
    }
  }],
  publishedAt: Date,
  completedAt: Date,
  createdBy: {
    type: String,
    default: 'CEO'
  }
}, {
  timestamps: true
})

// Index for performance
competitionSchema.index({ status: 1, startDate: 1, endDate: 1 })
competitionSchema.index({ quarter: 1, year: 1 })

// Method to check if competition is active
competitionSchema.methods.isActive = function() {
  const now = new Date()
  return this.status === 'active' && now >= this.startDate && now <= this.endDate
}

// Method to get leaderboard
competitionSchema.methods.getLeaderboard = function(limit = 10) {
  return this.participants
    .sort((a, b) => b.currentProgress - a.currentProgress)
    .slice(0, limit)
}

// Method to update participant progress
competitionSchema.methods.updateParticipantProgress = async function(memberId, progress) {
  const participant = this.participants.find(p => p.memberId.toString() === memberId.toString())

  if (participant) {
    participant.currentProgress = progress
    participant.lastUpdated = new Date()
  } else {
    // Auto-enroll participant
    const Member = mongoose.model('Member')
    const member = await Member.findById(memberId)

    if (member) {
      this.participants.push({
        memberId: member._id,
        memberName: member.fullName,
        membershipNumber: member.membershipNumber,
        tier: member.tier,
        currentProgress: progress,
        joinedAt: new Date(),
        lastUpdated: new Date()
      })
    }
  }

  await this.save()
}

// Method to finalize competition and select winners
competitionSchema.methods.finalizeCompetition = async function() {
  if (this.status !== 'active') {
    throw new Error('Only active competitions can be finalized')
  }

  // Sort participants by progress
  const sortedParticipants = this.participants
    .sort((a, b) => b.currentProgress - a.currentProgress)
    .filter(p => p.currentProgress >= this.targetValue) // Only winners who met target

  // Award prizes
  const winners = []

  if (sortedParticipants.length > 0 && this.prizes.first) {
    winners.push({
      position: 1,
      memberId: sortedParticipants[0].memberId,
      memberName: sortedParticipants[0].memberName,
      membershipNumber: sortedParticipants[0].membershipNumber,
      finalScore: sortedParticipants[0].currentProgress,
      prizeAmount: this.prizes.first.amount,
      prizeType: this.prizes.first.type,
      prizeDescription: this.prizes.first.description,
      awardedAt: new Date(),
      paymentStatus: 'pending'
    })
  }

  if (sortedParticipants.length > 1 && this.prizes.second) {
    winners.push({
      position: 2,
      memberId: sortedParticipants[1].memberId,
      memberName: sortedParticipants[1].memberName,
      membershipNumber: sortedParticipants[1].membershipNumber,
      finalScore: sortedParticipants[1].currentProgress,
      prizeAmount: this.prizes.second.amount,
      prizeType: this.prizes.second.type,
      prizeDescription: this.prizes.second.description,
      awardedAt: new Date(),
      paymentStatus: 'pending'
    })
  }

  if (sortedParticipants.length > 2 && this.prizes.third) {
    winners.push({
      position: 3,
      memberId: sortedParticipants[2].memberId,
      memberName: sortedParticipants[2].memberName,
      membershipNumber: sortedParticipants[2].membershipNumber,
      finalScore: sortedParticipants[2].currentProgress,
      prizeAmount: this.prizes.third.amount,
      prizeType: this.prizes.third.type,
      prizeDescription: this.prizes.third.description,
      awardedAt: new Date(),
      paymentStatus: 'pending'
    })
  }

  // Additional prizes
  if (this.prizes.additionalPrizes && this.prizes.additionalPrizes.length > 0) {
    this.prizes.additionalPrizes.forEach(prize => {
      if (sortedParticipants.length >= prize.position) {
        winners.push({
          position: prize.position,
          memberId: sortedParticipants[prize.position - 1].memberId,
          memberName: sortedParticipants[prize.position - 1].memberName,
          membershipNumber: sortedParticipants[prize.position - 1].membershipNumber,
          finalScore: sortedParticipants[prize.position - 1].currentProgress,
          prizeAmount: prize.amount,
          prizeType: prize.type,
          prizeDescription: prize.description,
          awardedAt: new Date(),
          paymentStatus: 'pending'
        })
      }
    })
  }

  this.winners = winners
  this.status = 'completed'
  this.completedAt = new Date()

  await this.save()
  return winners
}

const CEOCompetition = mongoose.model('CEOCompetition', competitionSchema)

export default CEOCompetition
