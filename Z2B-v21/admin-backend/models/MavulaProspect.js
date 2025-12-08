const mongoose = require('mongoose');

const mavulaProspectSchema = new mongoose.Schema({
    // Ownership & Identity
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    prospectName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String
    },
    source: {
        type: String,
        enum: ['MANUAL', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'IMPORT', 'QUESTIONNAIRE'],
        default: 'MANUAL'
    },
    sourceId: String, // Original social media ID
    sourceProfileUrl: String,

    // Scoring & Classification
    leadScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 30,
        index: true
    },
    leadTemperature: {
        type: String,
        enum: ['COLD', 'WARM', 'HOT', 'CONVERTED', 'LOST', 'DORMANT'],
        default: 'COLD',
        index: true
    },
    scoreFactors: {
        engagementLevel: { type: Number, default: 0, min: 0, max: 25 },
        responseSpeed: { type: Number, default: 0, min: 0, max: 25 },
        questionQuality: { type: Number, default: 0, min: 0, max: 25 },
        commitmentSignals: { type: Number, default: 0, min: 0, max: 25 }
    },

    // Conversation State
    conversationStage: {
        type: String,
        enum: [
            'INITIAL_CONTACT',      // Ice breaker sent
            'TRUST_BUILDING',       // Building rapport
            'NEEDS_DISCOVERY',      // Understanding pain points
            'VALUE_PRESENTATION',   // Presenting opportunity
            'OBJECTION_HANDLING',   // Addressing concerns
            'CLOSING',              // Making the ask
            'FOLLOW_UP',            // Post-close nurturing
            'CONVERTED',            // Successfully converted
            'DORMANT'               // No response for 7+ days
        ],
        default: 'INITIAL_CONTACT',
        index: true
    },

    conversationContext: {
        painPoints: [String],
        interests: [String],
        objections: [String],
        commitmentLevel: String,
        bestTimeToContact: String,
        preferredCommunicationStyle: {
            type: String,
            enum: ['FORMAL', 'CASUAL', 'PROFESSIONAL'],
            default: 'CASUAL'
        },
        // Buying signals
        askedAboutPricing: { type: Boolean, default: false },
        askedAboutHowToJoin: { type: Boolean, default: false },
        sharedPersonalGoals: { type: Boolean, default: false },
        requestedMoreInfo: { type: Boolean, default: false },
        agreedToCall: { type: Boolean, default: false }
    },

    // Automation Tracking
    lastContactDate: {
        type: Date,
        index: true
    },
    nextFollowUpDate: {
        type: Date,
        index: true
    },
    totalMessagesReceived: {
        type: Number,
        default: 0
    },
    totalMessagesSent: {
        type: Number,
        default: 0
    },
    averageResponseTime: Number, // in minutes
    automationEnabled: {
        type: Boolean,
        default: true
    },
    hasEverResponded: {
        type: Boolean,
        default: false
    },

    // Conversion Tracking
    isConverted: {
        type: Boolean,
        default: false,
        index: true
    },
    convertedDate: Date,
    convertedToUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tierJoined: String,
    conversionValue: Number, // Revenue generated

    // Compliance
    consentGiven: {
        type: Boolean,
        default: false
    },
    consentDate: Date,
    consentSource: String,
    dataProcessingPurpose: {
        type: String,
        default: 'Network marketing prospecting and follow-up'
    },
    hasOptedOut: {
        type: Boolean,
        default: false
    },
    optedOutDate: Date,

    // Metadata
    tags: [String], // Custom tags for categorization
    notes: String,  // User's manual notes
}, {
    timestamps: true,
    collection: 'mavula_prospects'
});

// Indexes for performance
mavulaProspectSchema.index({ userId: 1, leadTemperature: 1 });
mavulaProspectSchema.index({ userId: 1, conversationStage: 1 });
mavulaProspectSchema.index({ userId: 1, nextFollowUpDate: 1 });
mavulaProspectSchema.index({ phone: 1, userId: 1 }, { unique: true });
mavulaProspectSchema.index({ userId: 1, createdAt: -1 });
mavulaProspectSchema.index({ userId: 1, leadScore: -1 });
mavulaProspectSchema.index({ userId: 1, isConverted: 1 });

// Virtual for lead priority
mavulaProspectSchema.virtual('leadPriority').get(function() {
    if (this.leadScore >= 70) return 'HIGH';
    if (this.leadScore >= 50) return 'MEDIUM';
    if (this.leadScore >= 30) return 'LOW';
    return 'VERY_LOW';
});

// Method to update lead temperature based on score
mavulaProspectSchema.methods.updateTemperature = function() {
    if (this.isConverted) {
        this.leadTemperature = 'CONVERTED';
    } else if (this.leadScore >= 70) {
        this.leadTemperature = 'HOT';
    } else if (this.leadScore >= 50) {
        this.leadTemperature = 'WARM';
    } else {
        this.leadTemperature = 'COLD';
    }

    // Check for dormant (7+ days no contact)
    const daysSinceContact = (Date.now() - (this.lastContactDate || this.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceContact >= 7 && !this.hasEverResponded && this.conversationStage !== 'CONVERTED') {
        this.leadTemperature = 'DORMANT';
        this.conversationStage = 'DORMANT';
    }
};

// Method to calculate lead score
mavulaProspectSchema.methods.calculateScore = function() {
    const { engagementLevel, responseSpeed, questionQuality, commitmentSignals } = this.scoreFactors;

    this.leadScore = Math.min(
        Math.round(engagementLevel + responseSpeed + questionQuality + commitmentSignals),
        100
    );

    this.updateTemperature();
    return this.leadScore;
};

// Static method to get prospects needing contact
mavulaProspectSchema.statics.getNeedingContact = async function(userId) {
    const now = new Date();

    return await this.find({
        userId,
        automationEnabled: true,
        hasOptedOut: false,
        isConverted: false,
        $or: [
            { lastContactDate: null }, // Never contacted
            { nextFollowUpDate: { $lte: now } } // Follow-up due
        ]
    }).sort({ leadScore: -1, lastContactDate: 1 }).limit(15);
};

// Static method to detect dormant prospects
mavulaProspectSchema.statics.getDormantProspects = async function(userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await this.find({
        userId,
        lastContactDate: { $lte: sevenDaysAgo },
        hasEverResponded: false,
        isConverted: false,
        conversationStage: { $ne: 'DORMANT' }
    });
};

// Pre-save hook to update temperature
mavulaProspectSchema.pre('save', function(next) {
    if (this.isModified('leadScore') || this.isModified('scoreFactors')) {
        this.calculateScore();
    }
    next();
});

const MavulaProspect = mongoose.model('MavulaProspect', mavulaProspectSchema);

module.exports = MavulaProspect;
