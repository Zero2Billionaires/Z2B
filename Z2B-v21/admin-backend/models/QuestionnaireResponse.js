const mongoose = require('mongoose');

const questionnaireResponseSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true
    },
    age: String,
    currentRole: String,
    yearsEmployed: String,

    // Pain Points & Motivations
    biggestFrustration: String,
    financialPressure: String,
    timeFreedom: String,
    fulfillment: String,
    stuckFeeling: String,

    // Goals & Vision
    idealLife: String,
    legacyDesire: String,
    incomeGoal: String,
    whyEntrepreneur: [String],

    // Business & Ideas
    businessIdea: String,
    problemsSolved: String,
    helpOthers: String,

    // Skills & Experience
    formalEducation: String,
    informalSkills: [String],
    techComfort: String,
    naturalTalents: String,
    passionateAbout: String,

    // Challenges & Achievements
    majorChallenges: String,
    proudMoments: String,

    // Network & Support
    networkSize: String,
    supportSystem: String,

    // Readiness & Commitment
    mindsetReadiness: String,
    timeCommitment: String,
    biggestFear: String,
    needMost: [String],

    // Calculated Results
    readinessScore: {
        type: Number,
        default: 0
    },
    insights: [String],
    gaps: [String],

    // Lead Scoring
    leadScore: {
        type: String,
        enum: ['HOT', 'WARM', 'COLD', 'NOT_READY'],
        default: 'WARM'
    },

    // Contact & Follow-up
    contactedAt: Date,
    followUpStatus: {
        type: String,
        enum: ['PENDING', 'CONTACTED', 'REGISTERED', 'NOT_INTERESTED'],
        default: 'PENDING'
    },
    notes: String,

    // Metadata
    submittedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    referralSource: String
}, {
    timestamps: true
});

// Indexes for efficient querying
questionnaireResponseSchema.index({ name: 1 });
questionnaireResponseSchema.index({ readinessScore: -1 });
questionnaireResponseSchema.index({ leadScore: 1 });
questionnaireResponseSchema.index({ followUpStatus: 1 });
questionnaireResponseSchema.index({ submittedAt: -1 });

// Virtual for calculating lead priority
questionnaireResponseSchema.virtual('leadPriority').get(function() {
    if (this.readinessScore >= 70) return 'HIGH';
    if (this.readinessScore >= 50) return 'MEDIUM';
    if (this.readinessScore >= 30) return 'LOW';
    return 'VERY_LOW';
});

// Method to calculate lead score based on readiness
questionnaireResponseSchema.methods.calculateLeadScore = function() {
    if (this.readinessScore >= 70) {
        this.leadScore = 'HOT';
    } else if (this.readinessScore >= 50) {
        this.leadScore = 'WARM';
    } else if (this.readinessScore >= 30) {
        this.leadScore = 'COLD';
    } else {
        this.leadScore = 'NOT_READY';
    }
    return this.leadScore;
};

// Static method to get summary statistics
questionnaireResponseSchema.statics.getStats = async function() {
    const total = await this.countDocuments();
    const hot = await this.countDocuments({ leadScore: 'HOT' });
    const warm = await this.countDocuments({ leadScore: 'WARM' });
    const cold = await this.countDocuments({ leadScore: 'COLD' });
    const notReady = await this.countDocuments({ leadScore: 'NOT_READY' });

    const pending = await this.countDocuments({ followUpStatus: 'PENDING' });
    const contacted = await this.countDocuments({ followUpStatus: 'CONTACTED' });
    const registered = await this.countDocuments({ followUpStatus: 'REGISTERED' });

    const avgScore = await this.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$readinessScore' } } }
    ]);

    return {
        total,
        leadScores: { hot, warm, cold, notReady },
        followUpStatus: { pending, contacted, registered },
        averageScore: avgScore[0]?.avgScore || 0
    };
};

const QuestionnaireResponse = mongoose.model('QuestionnaireResponse', questionnaireResponseSchema);

module.exports = QuestionnaireResponse;
