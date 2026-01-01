const mongoose = require('mongoose');

const mavulaUserSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Daily Targets
    dailyProspectTarget: {
        type: Number,
        default: 10,
        min: 1,
        max: 50
    },
    dailyConversionTarget: {
        type: Number,
        default: 1,
        min: 0,
        max: 10
    },

    // Automation Settings
    automationEnabled: {
        type: Boolean,
        default: false // User must enable manually after setup
    },
    autoResponseEnabled: {
        type: Boolean,
        default: true
    },
    autoFollowUpEnabled: {
        type: Boolean,
        default: true
    },

    // Communication Preferences
    communicationStyle: {
        type: String,
        enum: ['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'ASSERTIVE'],
        default: 'FRIENDLY'
    },
    messagePersonalization: {
        includeName: { type: Boolean, default: true },
        includeEmojis: { type: Boolean, default: true },
        includeTestimonials: { type: Boolean, default: false },
        includeStats: { type: Boolean, default: true }
    },

    // Timing Controls
    activeHours: {
        enabled: { type: Boolean, default: true },
        timezone: { type: String, default: 'Africa/Johannesburg' },
        startTime: { type: String, default: '09:00' }, // 24hr format HH:MM
        endTime: { type: String, default: '18:00' },
        daysOfWeek: { type: [Number], default: [1, 2, 3, 4, 5] } // 0=Sunday, 6=Saturday
    },

    followUpSchedule: {
        firstFollowUp: { type: Number, default: 24 }, // hours after initial contact
        secondFollowUp: { type: Number, default: 72 }, // 3 days
        thirdFollowUp: { type: Number, default: 168 }, // 1 week
        maxFollowUps: { type: Number, default: 5 }
    },

    // Social Media Integration
    socialMediaConnections: {
        facebook: {
            connected: { type: Boolean, default: false },
            accessToken: String,
            tokenExpiry: Date,
            pageId: String,
            pageName: String,
            lastSync: Date
        },
        instagram: {
            connected: { type: Boolean, default: false },
            accessToken: String,
            tokenExpiry: Date,
            accountId: String,
            username: String,
            lastSync: Date
        },
        tiktok: {
            connected: { type: Boolean, default: false },
            accessToken: String,
            tokenExpiry: Date,
            accountId: String,
            username: String,
            lastSync: Date
        }
    },

    // AI Configuration
    aiProvider: {
        conversational: { type: String, default: 'CLAUDE' }, // Claude for coaching/conversations
        contentGeneration: { type: String, default: 'OPENAI' } // GPT-4 for scripts/content
    },

    // Performance Tracking
    stats: {
        totalProspectsAdded: { type: Number, default: 0 },
        totalConversations: { type: Number, default: 0 },
        totalConversions: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 },
        averageConversionTime: { type: Number, default: 0 }, // days
        totalRevenue: { type: Number, default: 0 },
        totalAICreditsUsed: { type: Number, default: 0 }
    },

    // Notifications
    notifications: {
        emailOnConversion: { type: Boolean, default: true },
        whatsappOnHotLead: { type: Boolean, default: true },
        dailySummary: { type: Boolean, default: true },
        weeklySummary: { type: Boolean, default: true }
    },

    // Onboarding
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 1 },
    firstActivationDate: Date,
    lastActiveDate: Date
}, {
    timestamps: true,
    collection: 'mavula_user_settings'
});

// Index
mavulaUserSettingsSchema.index({ userId: 1 }, { unique: true });
mavulaUserSettingsSchema.index({ automationEnabled: 1 });

// Method to check if within active hours
mavulaUserSettingsSchema.methods.isWithinActiveHours = function(date = new Date()) {
    if (!this.activeHours.enabled) {
        return true; // No restrictions
    }

    // Convert date to user's timezone
    const options = { timeZone: this.activeHours.timezone, hour12: false };
    const timeString = date.toLocaleTimeString('en-US', options);
    const [hours, minutes] = timeString.split(':').map(Number);
    const currentTime = hours * 60 + minutes; // minutes since midnight

    // Parse start and end times
    const [startHours, startMinutes] = this.activeHours.startTime.split(':').map(Number);
    const [endHours, endMinutes] = this.activeHours.endTime.split(':').map(Number);
    const startTime = startHours * 60 + startMinutes;
    const endTime = endHours * 60 + endMinutes;

    // Check if current time is within range
    const isTimeInRange = currentTime >= startTime && currentTime <= endTime;

    // Check if current day is allowed
    const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
    const isDayAllowed = this.activeHours.daysOfWeek.includes(dayOfWeek);

    return isTimeInRange && isDayAllowed;
};

// Method to get next active time
mavulaUserSettingsSchema.methods.getNextActiveTime = function(fromDate = new Date()) {
    if (!this.activeHours.enabled) {
        return fromDate;
    }

    const nextTime = new Date(fromDate);
    let attempts = 0;
    const maxAttempts = 14; // Check up to 2 weeks ahead

    while (!this.isWithinActiveHours(nextTime) && attempts < maxAttempts) {
        // If outside active hours, move to next start time
        const [startHours, startMinutes] = this.activeHours.startTime.split(':').map(Number);

        nextTime.setDate(nextTime.getDate() + 1);
        nextTime.setHours(startHours, startMinutes, 0, 0);

        attempts++;
    }

    return nextTime;
};

// Method to update stats
mavulaUserSettingsSchema.methods.updateStats = async function(updates) {
    Object.keys(updates).forEach(key => {
        if (this.stats[key] !== undefined) {
            this.stats[key] = updates[key];
        }
    });

    // Recalculate conversion rate
    if (this.stats.totalConversations > 0) {
        this.stats.conversionRate = (this.stats.totalConversions / this.stats.totalConversations) * 100;
    }

    this.lastActiveDate = new Date();
    return await this.save();
};

// Static method to initialize settings for new user
mavulaUserSettingsSchema.statics.initializeForUser = async function(userId) {
    // Check if already exists
    const existing = await this.findOne({ userId });
    if (existing) {
        return existing;
    }

    // Get user and sponsor info
    const User = mongoose.model('User');
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Try to copy sponsor's settings
    let sponsorSettings = null;
    if (user.sponsorId) {
        sponsorSettings = await this.findOne({ userId: user.sponsorId });
    }

    // Create new settings
    const settings = new this({
        userId,
        automationEnabled: false, // Must enable manually
        communicationStyle: sponsorSettings?.communicationStyle || 'FRIENDLY',
        messagePersonalization: sponsorSettings?.messagePersonalization || {
            includeName: true,
            includeEmojis: true,
            includeTestimonials: false,
            includeStats: true
        },
        activeHours: sponsorSettings?.activeHours || {
            enabled: true,
            timezone: 'Africa/Johannesburg',
            startTime: '09:00',
            endTime: '18:00',
            daysOfWeek: [1, 2, 3, 4, 5]
        },
        followUpSchedule: sponsorSettings?.followUpSchedule || {
            firstFollowUp: 24,
            secondFollowUp: 72,
            thirdFollowUp: 168,
            maxFollowUps: 5
        }
    });

    await settings.save();

    // Grant 5 free AI fuel credits for trial
    user.fuelCredits = (user.fuelCredits || 0) + 5;
    await user.save();

    return settings;
};

const MavulaUserSettings = mongoose.model('MavulaUserSettings', mavulaUserSettingsSchema);

module.exports = MavulaUserSettings;
