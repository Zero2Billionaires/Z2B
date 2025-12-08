const mongoose = require('mongoose');

const mavulaDailyActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    }, // Date only (no time) - stored as midnight UTC

    // Daily Targets & Achievement
    targets: {
        prospectsTarget: { type: Number, default: 10 },
        conversionsTarget: { type: Number, default: 1 }
    },

    achievements: {
        prospectsAdded: { type: Number, default: 0 },
        conversationsStarted: { type: Number, default: 0 },
        messagesReceived: { type: Number, default: 0 },
        messagesSent: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        revenueGenerated: { type: Number, default: 0 }
    },

    // Stage Distribution
    prospectsByStage: {
        INITIAL_CONTACT: { type: Number, default: 0 },
        TRUST_BUILDING: { type: Number, default: 0 },
        NEEDS_DISCOVERY: { type: Number, default: 0 },
        VALUE_PRESENTATION: { type: Number, default: 0 },
        OBJECTION_HANDLING: { type: Number, default: 0 },
        CLOSING: { type: Number, default: 0 },
        FOLLOW_UP: { type: Number, default: 0 },
        CONVERTED: { type: Number, default: 0 },
        DORMANT: { type: Number, default: 0 }
    },

    // Lead Temperature Distribution
    prospectsByTemperature: {
        HOT: { type: Number, default: 0 },
        WARM: { type: Number, default: 0 },
        COLD: { type: Number, default: 0 },
        CONVERTED: { type: Number, default: 0 },
        LOST: { type: Number, default: 0 },
        DORMANT: { type: Number, default: 0 }
    },

    // AI Usage
    aiCreditsUsed: { type: Number, default: 0 },
    claudeTokensUsed: { type: Number, default: 0 },
    openaiTokensUsed: { type: Number, default: 0 },
    aiGenerationCount: { type: Number, default: 0 },

    // Weekly Projection (calculated on Sundays)
    weeklyProjection: {
        estimatedConversions: { type: Number, default: 0 },
        estimatedRevenue: { type: Number, default: 0 },
        projectionDate: Date,
        conversionRate: { type: Number, default: 0 }
    },

    // Performance Metrics
    targetCompletionRate: { type: Number, default: 0 }, // Percentage of targets met
    isTargetMet: { type: Boolean, default: false }
}, {
    timestamps: true,
    collection: 'mavula_daily_activity'
});

// Compound unique index: one record per user per date
mavulaDailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });
mavulaDailyActivitySchema.index({ userId: 1, date: -1 });
mavulaDailyActivitySchema.index({ date: -1 });

// Virtual for target completion percentage
mavulaDailyActivitySchema.virtual('targetProgress').get(function() {
    const prospectProgress = this.targets.prospectsTarget > 0
        ? (this.achievements.prospectsAdded / this.targets.prospectsTarget) * 100
        : 0;

    const conversionProgress = this.targets.conversionsTarget > 0
        ? (this.achievements.conversions / this.targets.conversionsTarget) * 100
        : 0;

    return {
        prospects: Math.min(prospectProgress, 100),
        conversions: Math.min(conversionProgress, 100),
        overall: Math.min((prospectProgress + conversionProgress) / 2, 100)
    };
});

// Method to update achievements
mavulaDailyActivitySchema.methods.updateAchievements = function(updates) {
    Object.keys(updates).forEach(key => {
        if (this.achievements[key] !== undefined) {
            this.achievements[key] += updates[key];
        }
    });

    // Check if targets met
    this.isTargetMet = (
        this.achievements.prospectsAdded >= this.targets.prospectsTarget &&
        this.achievements.conversions >= this.targets.conversionsTarget
    );

    return this.save();
};

// Method to update prospect distribution
mavulaDailyActivitySchema.methods.updateProspectDistribution = async function() {
    const MavulaProspect = mongoose.model('MavulaProspect');

    // Count by stage
    const stageDistribution = await MavulaProspect.aggregate([
        { $match: { userId: this.userId } },
        { $group: { _id: '$conversationStage', count: { $sum: 1 } } }
    ]);

    // Reset counts
    Object.keys(this.prospectsByStage).forEach(stage => {
        this.prospectsByStage[stage] = 0;
    });

    // Update counts
    stageDistribution.forEach(item => {
        if (this.prospectsByStage[item._id] !== undefined) {
            this.prospectsByStage[item._id] = item.count;
        }
    });

    // Count by temperature
    const temperatureDistribution = await MavulaProspect.aggregate([
        { $match: { userId: this.userId } },
        { $group: { _id: '$leadTemperature', count: { $sum: 1 } } }
    ]);

    // Reset counts
    Object.keys(this.prospectsByTemperature).forEach(temp => {
        this.prospectsByTemperature[temp] = 0;
    });

    // Update counts
    temperatureDistribution.forEach(item => {
        if (this.prospectsByTemperature[item._id] !== undefined) {
            this.prospectsByTemperature[item._id] = item.count;
        }
    });

    return await this.save();
};

// Static method to get or create today's activity
mavulaDailyActivitySchema.statics.getTodayActivity = async function(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Midnight

    let activity = await this.findOne({ userId, date: today });

    if (!activity) {
        // Get user's settings for targets
        const MavulaUserSettings = mongoose.model('MavulaUserSettings');
        const settings = await MavulaUserSettings.findOne({ userId });

        activity = new this({
            userId,
            date: today,
            targets: {
                prospectsTarget: settings?.dailyProspectTarget || 10,
                conversionsTarget: settings?.dailyConversionTarget || 1
            }
        });

        await activity.save();
        await activity.updateProspectDistribution();
    }

    return activity;
};

// Static method to calculate weekly projection
mavulaDailyActivitySchema.statics.calculateWeeklyProjection = async function(userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activities = await this.find({
        userId,
        date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    if (activities.length === 0) {
        return {
            estimatedConversions: 0,
            estimatedRevenue: 0,
            conversionRate: 0
        };
    }

    // Calculate metrics
    const totalConversations = activities.reduce((sum, a) => sum + a.achievements.conversationsStarted, 0);
    const totalConversions = activities.reduce((sum, a) => sum + a.achievements.conversions, 0);
    const totalRevenue = activities.reduce((sum, a) => sum + a.achievements.revenueGenerated, 0);

    const conversionRate = totalConversations > 0 ? (totalConversions / totalConversations) : 0;
    const avgRevenuePerConversion = totalConversions > 0 ? (totalRevenue / totalConversions) : 500; // Default R500

    // Get user's settings for daily target
    const MavulaUserSettings = mongoose.model('MavulaUserSettings');
    const settings = await MavulaUserSettings.findOne({ userId });
    const dailyProspectTarget = settings?.dailyProspectTarget || 10;

    // Project for next 7 days
    const projectedConversations = dailyProspectTarget * 7;
    const projectedConversions = Math.round(projectedConversations * conversionRate);
    const projectedRevenue = Math.round(projectedConversions * avgRevenuePerConversion);

    return {
        estimatedConversions: projectedConversions,
        estimatedRevenue: projectedRevenue,
        conversionRate: (conversionRate * 100).toFixed(1)
    };
};

const MavulaDailyActivity = mongoose.model('MavulaDailyActivity', mavulaDailyActivitySchema);

module.exports = MavulaDailyActivity;
