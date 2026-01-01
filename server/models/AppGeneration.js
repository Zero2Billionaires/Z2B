import mongoose from 'mongoose';

const appGenerationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // App Details
    appName: {
        type: String,
        default: function() {
            return `App-${Date.now()}`;
        }
    },

    description: {
        type: String,
        required: [true, 'App description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    appType: {
        type: String,
        enum: ['landing', 'dashboard', 'form', 'game', 'tool', 'other'],
        required: true
    },

    // Features
    features: {
        mobile: { type: Boolean, default: true },
        darkMode: { type: Boolean, default: false },
        localStorage: { type: Boolean, default: true },
        animations: { type: Boolean, default: false },
        icons: { type: Boolean, default: true },
        modern: { type: Boolean, default: true }
    },

    colorScheme: {
        type: String,
        enum: ['z2b', 'modern', 'vibrant', 'minimal', 'custom'],
        default: 'z2b'
    },

    // Generation Details
    generatedCode: {
        type: String,
        required: function() {
            // Only required if status is 'completed'
            return this.status === 'completed';
        }
    },

    codeSize: {
        type: Number, // in bytes
        default: 0
    },

    generationTime: {
        type: Number, // in milliseconds
        default: 0
    },

    // AI Details
    aiModel: {
        type: String,
        default: 'claude-sonnet-4-20250514'
    },

    promptUsed: {
        type: String
    },

    tokensUsed: {
        type: Number,
        default: 0
    },

    // Status
    status: {
        type: String,
        enum: ['generating', 'completed', 'failed', 'deleted'],
        default: 'completed'
    },

    errorMessage: {
        type: String
    },

    // User Actions
    downloads: {
        type: Number,
        default: 0
    },

    lastDownloaded: {
        type: Date
    },

    views: {
        type: Number,
        default: 0
    },

    // Sharing
    isPublic: {
        type: Boolean,
        default: false
    },

    shareLink: {
        type: String,
        unique: true,
        sparse: true
    },

    // Rating
    userRating: {
        type: Number,
        min: 1,
        max: 5
    },

    feedback: {
        type: String,
        maxlength: [500, 'Feedback cannot exceed 500 characters']
    },

    // Tags for categorization
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],

    // Metadata
    version: {
        type: Number,
        default: 1
    },

    parentAppId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AppGeneration'
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
appGenerationSchema.index({ userId: 1, createdAt: -1 });
appGenerationSchema.index({ appType: 1, status: 1 });
appGenerationSchema.index({ shareLink: 1 });
appGenerationSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for code preview (first 500 chars)
appGenerationSchema.virtual('codePreview').get(function() {
    if (this.generatedCode) {
        return this.generatedCode.substring(0, 500) + '...';
    }
    return '';
});

// Method to increment downloads
appGenerationSchema.methods.incrementDownloads = function() {
    this.downloads += 1;
    this.lastDownloaded = Date.now();
    return this.save();
};

// Method to increment views
appGenerationSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Method to generate share link
appGenerationSchema.methods.generateShareLink = function() {
    const randomString = Math.random().toString(36).substring(2, 15) +
                         Math.random().toString(36).substring(2, 15);
    this.shareLink = `glowie-${randomString}`;
    this.isPublic = true;
    return this.save();
};

// Static method to get user's generation stats
appGenerationSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId), status: 'completed' } },
        {
            $group: {
                _id: null,
                totalApps: { $sum: 1 },
                totalDownloads: { $sum: '$downloads' },
                totalViews: { $sum: '$views' },
                avgGenerationTime: { $avg: '$generationTime' },
                avgCodeSize: { $avg: '$codeSize' },
                avgRating: { $avg: '$userRating' }
            }
        }
    ]);

    return stats.length > 0 ? stats[0] : {
        totalApps: 0,
        totalDownloads: 0,
        totalViews: 0,
        avgGenerationTime: 0,
        avgCodeSize: 0,
        avgRating: 0
    };
};

// Static method to get popular apps
appGenerationSchema.statics.getPopularApps = async function(limit = 10) {
    return this.find({
        isPublic: true,
        status: 'completed'
    })
    .sort({ downloads: -1, views: -1 })
    .limit(limit)
    .select('-generatedCode') // Don't send full code
    .populate('userId', 'name email');
};

// Pre-save middleware
appGenerationSchema.pre('save', function(next) {
    // Calculate code size if generatedCode exists
    if (this.generatedCode) {
        this.codeSize = Buffer.byteLength(this.generatedCode, 'utf8');
    }
    next();
});

const AppGeneration = mongoose.model('AppGeneration', appGenerationSchema);

export default AppGeneration;
