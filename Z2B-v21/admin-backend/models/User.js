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
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

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
    referralCode: { type: String, unique: true },
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

    // FAM Tier Benefits (30 days, 5 credits/week)
    famStartDate: { type: Date },
    famExpiryDate: { type: Date },
    lastCreditRefresh: { type: Date },
    famWeeksRemaining: { type: Number, default: 0 },

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

    // MAVULA Access Management
    mavulaAccess: { type: Boolean, default: false },
    mavulaAccessType: {
        type: String,
        enum: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        default: null
    },
    mavulaSubscriptionPlan: {
        type: String,
        enum: ['MONTHLY', 'LIFETIME'],
        default: null
    },
    mavulaGrantedDate: { type: Date },
    mavulaExpiryDate: { type: Date },
    mavulaGrantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mavulaAccessNotes: { type: String },
    mavulaRevokedDate: { type: Date },
    mavulaRevokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mavulaRevocationReason: { type: String },

    // Marketplace Product Access Management (DYNAMIC - supports ANY product)
    marketplaceAccess: {
        type: Map,
        of: {
            hasAccess: { type: Boolean, default: false },
            accessType: { type: String, enum: ['PAID', 'GIFT', 'BETA', 'ADMIN', 'FREE'] },
            subscriptionPlan: { type: String, enum: ['MONTHLY', 'LIFETIME', 'PAY_AS_GO'] },
            grantedDate: { type: Date },
            expiryDate: { type: Date },
            grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            notes: { type: String },
            revokedDate: { type: Date },
            revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            revocationReason: { type: String }
        },
        default: {}
    },

    // Tier-Based App Access System (NEW)
    introApp: {
        type: String,
        default: null
        // App that brought user to Z2B (e.g., 'mydigitaltwin', 'mavula')
    },
    selectedApps: {
        type: [String],
        default: []
        // User-selected apps beyond mandatory ones
    },
    appSelectionDate: {
        type: Date,
        default: null
    },
    appSelectionCompleted: {
        type: Boolean,
        default: false
    },
    appAccess: {
        type: Map,
        of: {
            unlocked: { type: Boolean, default: false },
            unlockedAt: { type: Date },
            source: {
                type: String,
                enum: ['TIER_DEFAULT', 'INTRO_APP', 'USER_SELECTED', 'ADMIN_GRANT', 'PURCHASE'],
                default: 'TIER_DEFAULT'
            },
            isPermanent: { type: Boolean, default: true }
        },
        default: {}
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

    // Payment Information
    paymentReference: { type: String },
    paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },

    // Metadata
    lastLogin: { type: Date },
    registrationIP: { type: String },
    createdByAdmin: { type: Boolean, default: false }
}, {
    timestamps: true,
    collection: 'users'
});

// Generate unique referral code before saving (Z2B + 7 digits)
userSchema.pre('save', async function(next) {
    if (!this.referralCode) {
        // Generate 7-digit random number (0000000 to 9999999)
        const randomNum = Math.floor(Math.random() * 10000000);
        this.referralCode = `Z2B${randomNum.toString().padStart(7, '0')}`;

        // Ensure uniqueness - if code exists, regenerate
        const User = mongoose.model('User');
        const existingUser = await User.findOne({ referralCode: this.referralCode });
        if (existingUser) {
            // Recursively try again with a different number
            this.referralCode = null;
            return this.save();
        }
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
