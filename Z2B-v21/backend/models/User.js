const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Basic Information
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    idNumber: { type: String },

    // Authentication
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },

    // Tier & Membership
    tier: {
        type: String,
        enum: ['FAM', 'BRONZE', 'COPPER', 'SILVER', 'GOLD', 'PLATINUM', 'LIFETIME'],
        default: 'FAM'
    },
    isBetaTester: { type: Boolean, default: false },
    betaLockPrice: { type: Number, default: null },

    // Sponsor & Placement
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sponsorCode: { type: String },
    referralCode: { type: String, unique: true, required: true },
    placementPosition: { type: String }, // Position 1, 2, or 3 for 3x3 matrix
    placementParentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who they are placed under

    // Strategic Placement System
    registrationType: {
        type: String,
        enum: ['SELF', 'MANUAL', 'SPILLOVER'],
        default: 'SELF'
    }, // SELF = via link, MANUAL = builder registered, SPILLOVER = FAM spillover
    recruitingBuilderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who recruited them (for ISP credit)
    ispBeneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who gets ISP commission (usually recruiting builder)
    placementStatus: {
        type: String,
        enum: ['PENDING_PLACEMENT', 'PLACED', 'AUTO_PLACED'],
        default: 'AUTO_PLACED'
    }, // Manual recruits can be pending strategic placement
    placementLocked: { type: Boolean, default: false }, // Once placed, cannot be changed
    placementLockedAt: { type: Date }, // When placement was locked

    // AI Fuel Credits
    fuelCredits: { type: Number, default: 0 },
    fuelExpiryDate: { type: Date },
    fuelPurchaseHistory: [{
        amount: Number,
        pvPoints: Number,
        purchaseDate: Date,
        expiryDate: Date,
        transactionId: String
    }],

    // PV Points
    currentMonthPV: { type: Number, default: 0 },
    lifetimePV: { type: Number, default: 0 },
    lastPVReset: { type: Date, default: Date.now },

    // Team Structure (Phased 12x12 Matrix: Four stages of 3x3)
    directDownline: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Up to 12 direct positions (3 per phase)
    teamLeft: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Legacy binary support
    teamRight: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Legacy binary support
    totalTeamSize: { type: Number, default: 0 },
    directReferrals: { type: Number, default: 0 },
    personalSales: { type: Number, default: 0 }, // Personal sales count for spillover qualification
    matrixLevel: { type: Number, default: 0 }, // Level in the matrix (0 = top)
    matrixPhase: { type: Number, default: 1 }, // Current phase (1-4), each phase = 3x3 for 3 generations
    maxPositionsInPhase: { type: Number, default: 3 }, // 3 positions per phase

    // FAM Spillover System
    famUpgradeDeadline: { type: Date }, // 90 days from registration for FAM members
    isSpilloverEligible: { type: Boolean, default: false }, // FAM who didn't upgrade after 90 days
    qualifiedForSpillovers: { type: Boolean, default: false }, // Has 2+ personal sales
    spilloverQueuePosition: { type: Number }, // Position in spillover queue
    receivedSpillovers: { type: Number, default: 0 }, // Count of spillovers received

    // App Access Grants (for admin to give free access)
    freeAppAccess: {
        zyro: { type: Boolean, default: false },
        zyra: { type: Boolean, default: false },
        benown: { type: Boolean, default: false },
        glowie: { type: Boolean, default: false },
        zynect: { type: Boolean, default: false },
        vidzie: { type: Boolean, default: false },
        zynth: { type: Boolean, default: false },
        coachManlaw: { type: Boolean, default: false }
    },

    // Earnings
    totalEarnings: { type: Number, default: 0 },
    withdrawableBalance: { type: Number, default: 0 },

    // Status
    accountStatus: {
        type: String,
        enum: ['ACTIVE', 'SUSPENDED', 'BLOCKED', 'PENDING'],
        default: 'ACTIVE'
    },
    accountNotes: { type: String }, // Admin notes about this user
    freeAccess: { type: Boolean, default: false }, // Admin granted free tier access

    // Banking Information
    bankName: { type: String },
    accountNumber: { type: String },
    accountType: { type: String },
    branchCode: { type: String },

    // Metadata
    lastLogin: { type: Date },
    registrationIP: { type: String },
    createdByAdmin: { type: Boolean, default: false }
}, {
    timestamps: true,
    collection: 'users',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for full name
userSchema.virtual('name').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Generate unique referral code and set FAM upgrade deadline before saving
userSchema.pre('save', async function(next) {
    // Generate referral code if not exists
    if (!this.referralCode) {
        this.referralCode = `Z2B${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }

    // Set FAM upgrade deadline (90 days from registration) for new FAM members
    if (this.isNew && this.tier === 'FAM') {
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
        this.famUpgradeDeadline = ninetyDaysFromNow;
    }

    // Check if FAM member qualifies for spillovers (2+ personal sales)
    if (this.personalSales >= 2 && !this.qualifiedForSpillovers) {
        this.qualifiedForSpillovers = true;
    }

    next();
});

module.exports = mongoose.model('User', userSchema);
