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
    placementPosition: { type: String }, // LEFT or RIGHT for binary

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

    // Team Structure
    teamLeft: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teamRight: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    totalTeamSize: { type: Number, default: 0 },
    directReferrals: { type: Number, default: 0 },

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
    collection: 'users'
});

// Generate unique referral code before saving
userSchema.pre('save', async function(next) {
    if (!this.referralCode) {
        this.referralCode = `Z2B${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
