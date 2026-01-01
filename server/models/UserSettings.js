import mongoose from 'mongoose';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

// Encryption helper functions
function encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!text) return null;
    try {
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

const userSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Glowie Settings
    glowie: {
        // Encrypted API keys
        claudeApiKey: {
            type: String,
            set: encrypt,
            get: decrypt
        },

        openaiApiKey: {
            type: String,
            set: encrypt,
            get: decrypt
        },

        // Preferences
        defaultAppType: {
            type: String,
            enum: ['landing', 'dashboard', 'form', 'game', 'tool', 'other'],
            default: 'landing'
        },

        defaultColorScheme: {
            type: String,
            enum: ['z2b', 'modern', 'vibrant', 'minimal', 'custom'],
            default: 'z2b'
        },

        defaultFeatures: {
            mobile: { type: Boolean, default: true },
            darkMode: { type: Boolean, default: false },
            localStorage: { type: Boolean, default: true },
            animations: { type: Boolean, default: false },
            icons: { type: Boolean, default: true },
            modern: { type: Boolean, default: true }
        },

        // Usage tracking
        generationsCount: {
            type: Number,
            default: 0
        },

        lastGenerationDate: {
            type: Date
        },

        // Subscription/Limits
        monthlyLimit: {
            type: Number,
            default: 10 // Free tier
        },

        monthlyUsage: {
            type: Number,
            default: 0
        },

        resetDate: {
            type: Date,
            default: function() {
                const date = new Date();
                date.setMonth(date.getMonth() + 1);
                return date;
            }
        }
    },

    // VIDZIE (D-ID Video Generation) Settings
    vidzie: {
        // Encrypted D-ID API key (if user has their own)
        didApiKey: {
            type: String,
            set: encrypt,
            get: decrypt
        },

        // Preferences
        defaultVideoType: {
            type: String,
            enum: ['avatar', 'presentation', 'tutorial', 'testimonial', 'marketing', 'coaching', 'other'],
            default: 'avatar'
        },

        defaultVoiceId: {
            type: String,
            default: 'en-US-JennyNeural'
        },

        defaultVoiceGender: {
            type: String,
            enum: ['male', 'female', 'neutral'],
            default: 'female'
        },

        defaultResolution: {
            type: String,
            enum: ['SD', 'HD', 'FHD'],
            default: 'HD'
        },

        // Usage tracking
        videosGenerated: {
            type: Number,
            default: 0
        },

        lastVideoDate: {
            type: Date
        },

        // Subscription/Limits (shares limit with Glowie for now)
        monthlyVideoLimit: {
            type: Number,
            default: 10 // Free tier
        },

        monthlyVideoUsage: {
            type: Number,
            default: 0
        },

        videoResetDate: {
            type: Date,
            default: function() {
                const date = new Date();
                date.setMonth(date.getMonth() + 1);
                return date;
            }
        },

        // Favorite source images
        favoriteImages: [{
            name: String,
            url: String,
            addedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },

    // Coach ManLaw Settings
    coaching: {
        reminderEnabled: {
            type: Boolean,
            default: true
        },

        reminderTime: {
            type: String,
            default: '09:00' // 9 AM
        },

        weeklyCheckInDay: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            default: 'monday'
        },

        emailNotifications: {
            type: Boolean,
            default: true
        }
    },

    // Marketplace Settings
    marketplace: {
        notifyNewProducts: {
            type: Boolean,
            default: true
        },

        savedProducts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],

        viewedProducts: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },

    // General Platform Settings
    general: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'dark'
        },

        language: {
            type: String,
            default: 'en'
        },

        timezone: {
            type: String,
            default: 'America/New_York'
        },

        emailDigest: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'never'],
            default: 'weekly'
        }
    },

    // Privacy Settings
    privacy: {
        shareProgress: {
            type: Boolean,
            default: true
        },

        showInLeaderboard: {
            type: Boolean,
            default: true
        },

        allowMessaging: {
            type: Boolean,
            default: true
        }
    }

}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        getters: true
    },
    toObject: {
        virtuals: true,
        getters: true
    }
});

// Virtual for API key status (without revealing the key)
userSettingsSchema.virtual('glowie.hasClaudeKey').get(function() {
    return !!this.glowie?.claudeApiKey;
});

userSettingsSchema.virtual('glowie.hasOpenAIKey').get(function() {
    return !!this.glowie?.openaiApiKey;
});

// Virtual for remaining generations this month
userSettingsSchema.virtual('glowie.remainingGenerations').get(function() {
    if (!this.glowie) return 0;
    return Math.max(0, this.glowie.monthlyLimit - this.glowie.monthlyUsage);
});

// VIDZIE virtuals
userSettingsSchema.virtual('vidzie.hasDIDKey').get(function() {
    return !!this.vidzie?.didApiKey;
});

userSettingsSchema.virtual('vidzie.remainingVideos').get(function() {
    if (!this.vidzie) return 0;
    return Math.max(0, this.vidzie.monthlyVideoLimit - this.vidzie.monthlyVideoUsage);
});

// Method to check if user can generate
userSettingsSchema.methods.canGenerate = function() {
    // Check if monthly limit is reached
    if (this.glowie.monthlyUsage >= this.glowie.monthlyLimit) {
        // Check if we need to reset the counter
        if (new Date() >= this.glowie.resetDate) {
            this.glowie.monthlyUsage = 0;
            const resetDate = new Date();
            resetDate.setMonth(resetDate.getMonth() + 1);
            this.glowie.resetDate = resetDate;
            return true;
        }
        return false;
    }
    return true;
};

// Method to increment generation count
userSettingsSchema.methods.incrementGenerations = function() {
    if (!this.glowie) {
        this.glowie = {};
    }
    this.glowie.generationsCount = (this.glowie.generationsCount || 0) + 1;
    this.glowie.monthlyUsage = (this.glowie.monthlyUsage || 0) + 1;
    this.glowie.lastGenerationDate = new Date();
    return this.save();
};

// Method to update API key
userSettingsSchema.methods.updateApiKey = function(service, apiKey) {
    if (service === 'claude') {
        this.glowie.claudeApiKey = apiKey;
    } else if (service === 'openai') {
        this.glowie.openaiApiKey = apiKey;
    }
    return this.save();
};

// Method to get API key (decrypted)
userSettingsSchema.methods.getApiKey = function(service) {
    if (service === 'claude') {
        return this.glowie?.claudeApiKey;
    } else if (service === 'openai') {
        return this.glowie?.openaiApiKey;
    } else if (service === 'did') {
        return this.vidzie?.didApiKey;
    }
    return null;
};

// Method to check if user can generate videos
userSettingsSchema.methods.canGenerateVideo = function() {
    // Check if monthly video limit is reached
    if (this.vidzie.monthlyVideoUsage >= this.vidzie.monthlyVideoLimit) {
        // Check if we need to reset the counter
        if (new Date() >= this.vidzie.videoResetDate) {
            this.vidzie.monthlyVideoUsage = 0;
            const resetDate = new Date();
            resetDate.setMonth(resetDate.getMonth() + 1);
            this.vidzie.videoResetDate = resetDate;
            return true;
        }
        return false;
    }
    return true;
};

// Method to increment video generation count
userSettingsSchema.methods.incrementVideoGenerations = function() {
    if (!this.vidzie) {
        this.vidzie = {};
    }
    this.vidzie.videosGenerated = (this.vidzie.videosGenerated || 0) + 1;
    this.vidzie.monthlyVideoUsage = (this.vidzie.monthlyVideoUsage || 0) + 1;
    this.vidzie.lastVideoDate = new Date();
    return this.save();
};

// Method to add favorite image
userSettingsSchema.methods.addFavoriteImage = function(name, url) {
    if (!this.vidzie) {
        this.vidzie = {};
    }
    if (!this.vidzie.favoriteImages) {
        this.vidzie.favoriteImages = [];
    }
    this.vidzie.favoriteImages.push({ name, url });
    return this.save();
};

// Method to remove favorite image
userSettingsSchema.methods.removeFavoriteImage = function(imageId) {
    if (this.vidzie && this.vidzie.favoriteImages) {
        this.vidzie.favoriteImages = this.vidzie.favoriteImages.filter(
            img => img._id.toString() !== imageId.toString()
        );
    }
    return this.save();
};

// Static method to get or create settings
userSettingsSchema.statics.getOrCreate = async function(userId) {
    let settings = await this.findOne({ userId });

    if (!settings) {
        settings = await this.create({
            userId,
            glowie: {
                defaultAppType: 'landing',
                defaultColorScheme: 'z2b',
                generationsCount: 0,
                monthlyLimit: 10,
                monthlyUsage: 0
            }
        });
    }

    return settings;
};

// Pre-save middleware to handle monthly reset
userSettingsSchema.pre('save', function(next) {
    // Reset Glowie monthly usage
    if (this.glowie && this.glowie.resetDate && new Date() >= this.glowie.resetDate) {
        this.glowie.monthlyUsage = 0;
        const resetDate = new Date();
        resetDate.setMonth(resetDate.getMonth() + 1);
        this.glowie.resetDate = resetDate;
    }

    // Reset VIDZIE monthly usage
    if (this.vidzie && this.vidzie.videoResetDate && new Date() >= this.vidzie.videoResetDate) {
        this.vidzie.monthlyVideoUsage = 0;
        const videoResetDate = new Date();
        videoResetDate.setMonth(videoResetDate.getMonth() + 1);
        this.vidzie.videoResetDate = videoResetDate;
    }

    next();
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;
