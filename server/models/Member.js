import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  membershipNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^Z2B\d{7}$/  // Format: Z2B + 7 digits (e.g., Z2B0000001)
  },
  // Keep old field for backwards compatibility
  membershipId: {
    type: String,
    required: false
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  tier: {
    type: String,
    enum: ['FAM', 'Bronze', 'Copper', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'FAM'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  },
  referralLink: String,
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  isBetaTester: {
    type: Boolean,
    default: false
  },
  betaPosition: Number,
  joinedDate: {
    type: Date,
    default: Date.now
  },
  builderSales: {
    type: Number,
    default: 0
  },
  totalCommissions: {
    type: Number,
    default: 0
  },
  pv: {
    type: Number,
    default: 0
  },
  // Team composition tracking for TLI qualification
  teamComposition: {
    totalMembers: {
      type: Number,
      default: 0
    },
    tierCounts: {
      FAM: { type: Number, default: 0 },
      Bronze: { type: Number, default: 0 },
      Copper: { type: Number, default: 0 },
      Silver: { type: Number, default: 0 },
      Gold: { type: Number, default: 0 },
      Platinum: { type: Number, default: 0 },
      Diamond: { type: Number, default: 0 }
    },
    tierPercentages: {
      FAM: { type: Number, default: 0 },
      Bronze: { type: Number, default: 0 },
      Copper: { type: Number, default: 0 },
      Silver: { type: Number, default: 0 },
      Gold: { type: Number, default: 0 },
      Platinum: { type: Number, default: 0 },
      Diamond: { type: Number, default: 0 }
    },
    silverPlusPercentage: {
      type: Number,
      default: 0
    },
    lastUpdated: Date
  },
  // Diamond tier qualification tracking
  qualifiesAsPlatinum: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Auto-generate membership number before saving
memberSchema.pre('save', async function(next) {
  // Only generate if this is a new document and doesn't have a membership number
  if (this.isNew && !this.membershipNumber) {
    try {
      // Find the highest membership number
      const lastMember = await this.constructor
        .findOne({ membershipNumber: { $regex: /^Z2B\d{7}$/ } })
        .sort({ membershipNumber: -1 })
        .select('membershipNumber');

      let nextNumber = 1;

      if (lastMember && lastMember.membershipNumber) {
        // Extract the numeric part and increment
        const currentNumber = parseInt(lastMember.membershipNumber.substring(3));
        nextNumber = currentNumber + 1;
      }

      // Format with leading zeros (7 digits)
      const paddedNumber = String(nextNumber).padStart(7, '0');
      this.membershipNumber = `Z2B${paddedNumber}`;

      // Set membershipId for backwards compatibility
      this.membershipId = this.membershipNumber;

    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Auto-generate referral link after membership number is set
memberSchema.pre('save', function(next) {
  if (this.membershipNumber && !this.referralLink) {
    // Format: https://z2blegacybuilders.co.za/join?ref=Z2B0000001
    this.referralLink = `https://z2blegacybuilders.co.za/join?ref=${this.membershipNumber}`;
  }
  next();
});

// Method to get referral link
memberSchema.methods.getReferralLink = function() {
  return `https://z2blegacybuilders.co.za/join?ref=${this.membershipNumber}`;
};

// Method to get short referral code (just the membership number)
memberSchema.methods.getReferralCode = function() {
  return this.membershipNumber;
};

// Method to calculate team composition
memberSchema.methods.calculateTeamComposition = async function() {
  const Member = this.constructor;

  // Get all team members (downline)
  const getDownline = async (memberId, allMembers = []) => {
    const directReferrals = await Member.find({ sponsorId: memberId });

    for (const member of directReferrals) {
      allMembers.push(member);
      await getDownline(member._id, allMembers);
    }

    return allMembers;
  };

  const teamMembers = await getDownline(this._id);

  // Calculate tier counts
  const tierCounts = {
    FAM: 0,
    Bronze: 0,
    Copper: 0,
    Silver: 0,
    Gold: 0,
    Platinum: 0,
    Diamond: 0
  };

  teamMembers.forEach(member => {
    if (tierCounts.hasOwnProperty(member.tier)) {
      tierCounts[member.tier]++;
    }
  });

  const totalMembers = teamMembers.length;

  // Calculate percentages
  const tierPercentages = {};
  Object.keys(tierCounts).forEach(tier => {
    tierPercentages[tier] = totalMembers > 0
      ? Math.round((tierCounts[tier] / totalMembers) * 100)
      : 0;
  });

  // Calculate Silver+ percentage (Silver, Gold, Platinum, Diamond)
  const silverPlusCount = tierCounts.Silver + tierCounts.Gold + tierCounts.Platinum + tierCounts.Diamond;
  const silverPlusPercentage = totalMembers > 0
    ? Math.round((silverPlusCount / totalMembers) * 100)
    : 0;

  // Update team composition
  this.teamComposition = {
    totalMembers,
    tierCounts,
    tierPercentages,
    silverPlusPercentage,
    lastUpdated: new Date()
  };

  await this.save();

  return this.teamComposition;
};

// Method to check TLI eligibility based on team composition
memberSchema.methods.checkTLIEligibility = function(requiredSilverPlusPercentage = 10, minTeamSize = 20) {
  // Diamond tier members don't qualify for TLI (white-label)
  if (this.tier === 'Diamond') {
    return {
      eligible: false,
      reason: 'Diamond tier (White-label) - No TLI eligibility',
      teamComposition: this.teamComposition
    };
  }

  const composition = this.teamComposition;

  // Check minimum team size
  if (composition.totalMembers < minTeamSize) {
    return {
      eligible: false,
      reason: `Team size (${composition.totalMembers}) below minimum (${minTeamSize})`,
      teamComposition: composition
    };
  }

  // Check Silver+ percentage requirement
  if (composition.silverPlusPercentage < requiredSilverPlusPercentage) {
    return {
      eligible: false,
      reason: `Silver+ percentage (${composition.silverPlusPercentage}%) below requirement (${requiredSilverPlusPercentage}%)`,
      teamComposition: composition
    };
  }

  return {
    eligible: true,
    reason: 'All TLI team composition requirements met',
    teamComposition: composition
  };
};

const Member = mongoose.model('Member', memberSchema)

export default Member
