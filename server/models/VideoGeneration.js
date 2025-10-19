import mongoose from 'mongoose';

const videoGenerationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Video Details
    videoName: {
        type: String,
        default: function() {
            return `Video-${Date.now()}`;
        }
    },

    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },

    // Video Type & Purpose
    videoType: {
        type: String,
        enum: ['avatar', 'presentation', 'tutorial', 'testimonial', 'marketing', 'coaching', 'other'],
        default: 'avatar'
    },

    purpose: {
        type: String,
        enum: ['glowie-app', 'coach-manlaw', 'standalone', 'zyra', 'marketplace'],
        required: true
    },

    // D-ID Configuration
    did: {
        // Source image for avatar
        sourceImage: {
            type: String, // URL or base64
            required: true
        },

        // Script/Text to speak
        script: {
            type: String,
            required: true,
            maxlength: [5000, 'Script cannot exceed 5000 characters']
        },

        // Voice configuration
        voice: {
            voiceId: {
                type: String,
                default: 'en-US-JennyNeural' // Microsoft Azure voice
            },
            language: {
                type: String,
                default: 'en-US'
            },
            gender: {
                type: String,
                enum: ['male', 'female', 'neutral'],
                default: 'female'
            },
            style: {
                type: String,
                default: 'friendly'
            }
        },

        // D-ID API response
        talkId: {
            type: String, // D-ID talk/video ID
            index: true
        },

        videoUrl: {
            type: String // Generated video URL
        },

        thumbnailUrl: {
            type: String
        },

        // Video settings
        settings: {
            background: {
                type: String,
                default: '#FFFFFF'
            },
            resolution: {
                type: String,
                enum: ['SD', 'HD', 'FHD'],
                default: 'HD'
            },
            duration: {
                type: Number, // in seconds
                default: 0
            },
            fps: {
                type: Number,
                default: 30
            }
        }
    },

    // Generation Status
    status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed', 'deleted'],
        default: 'queued',
        index: true
    },

    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    errorMessage: {
        type: String
    },

    // Processing times
    processingTime: {
        type: Number, // milliseconds
        default: 0
    },

    queuedAt: {
        type: Date,
        default: Date.now
    },

    startedAt: {
        type: Date
    },

    completedAt: {
        type: Date
    },

    // Usage tracking
    views: {
        type: Number,
        default: 0
    },

    downloads: {
        type: Number,
        default: 0
    },

    shares: {
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

    // Rating & feedback
    userRating: {
        type: Number,
        min: 1,
        max: 5
    },

    feedback: {
        type: String,
        maxlength: [500, 'Feedback cannot exceed 500 characters']
    },

    // Tags
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],

    // Related content
    relatedAppId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AppGeneration'
    },

    relatedSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CoachingSession'
    },

    // Metadata
    fileSize: {
        type: Number, // bytes
        default: 0
    },

    format: {
        type: String,
        default: 'mp4'
    },

    version: {
        type: Number,
        default: 1
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
videoGenerationSchema.index({ userId: 1, createdAt: -1 });
videoGenerationSchema.index({ status: 1, queuedAt: 1 });
videoGenerationSchema.index({ purpose: 1, status: 1 });
videoGenerationSchema.index({ 'did.talkId': 1 });

// Virtual for processing duration
videoGenerationSchema.virtual('processingDuration').get(function() {
    if (this.completedAt && this.startedAt) {
        return (this.completedAt - this.startedAt) / 1000; // seconds
    }
    return 0;
});

// Method to increment views
videoGenerationSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Method to increment downloads
videoGenerationSchema.methods.incrementDownloads = function() {
    this.downloads += 1;
    return this.save();
};

// Method to generate share link
videoGenerationSchema.methods.generateShareLink = function() {
    const randomString = Math.random().toString(36).substring(2, 15) +
                         Math.random().toString(36).substring(2, 15);
    this.shareLink = `vidzie-${randomString}`;
    this.isPublic = true;
    return this.save();
};

// Method to update status
videoGenerationSchema.methods.updateStatus = function(status, progress = null) {
    this.status = status;
    if (progress !== null) this.progress = progress;

    if (status === 'processing' && !this.startedAt) {
        this.startedAt = Date.now();
    } else if (status === 'completed') {
        this.completedAt = Date.now();
        this.progress = 100;
        if (this.startedAt) {
            this.processingTime = Date.now() - this.startedAt;
        }
    }

    return this.save();
};

// Static method to get user stats
videoGenerationSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: '$views' },
                totalDownloads: { $sum: '$downloads' },
                avgProcessingTime: { $avg: '$processingTime' },
                avgFileSize: { $avg: '$fileSize' },
                avgRating: { $avg: '$userRating' }
            }
        }
    ]);

    return stats.length > 0 ? stats[0] : {
        totalVideos: 0,
        totalViews: 0,
        totalDownloads: 0,
        avgProcessingTime: 0,
        avgFileSize: 0,
        avgRating: 0
    };
};

// Static method to get popular videos
videoGenerationSchema.statics.getPopularVideos = async function(limit = 10) {
    return this.find({
        isPublic: true,
        status: 'completed'
    })
    .sort({ views: -1, downloads: -1 })
    .limit(limit)
    .select('-did.script')
    .populate('userId', 'name email');
};

// Static method to get videos by purpose
videoGenerationSchema.statics.getByPurpose = async function(userId, purpose) {
    return this.find({
        userId,
        purpose,
        status: 'completed'
    })
    .sort({ createdAt: -1 })
    .select('-did.script');
};

const VideoGeneration = mongoose.model('VideoGeneration', videoGenerationSchema);

export default VideoGeneration;
