import mongoose from 'mongoose';

const VideoTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    category: {
        type: String,
        required: true,
        enum: [
            'marketing',
            'tutorial',
            'testimonial',
            'presentation',
            'coaching',
            'product-demo',
            'social-media',
            'educational',
            'entertainment',
            'other'
        ],
        default: 'marketing'
    },
    videoType: {
        type: String,
        required: true,
        enum: ['avatar', 'presentation', 'tutorial', 'testimonial', 'marketing', 'coaching', 'other'],
        default: 'avatar'
    },

    // Template defaults
    defaults: {
        voiceId: {
            type: String,
            default: 'en-US-JennyNeural'
        },
        voiceGender: {
            type: String,
            enum: ['male', 'female', 'neutral'],
            default: 'female'
        },
        voiceStyle: {
            type: String,
            enum: ['friendly', 'professional', 'cheerful', 'enthusiastic', 'calm', 'energetic'],
            default: 'friendly'
        },
        resolution: {
            type: String,
            enum: ['SD', 'HD', 'FHD'],
            default: 'HD'
        },
        background: {
            type: String,
            default: '#1a1a2e'
        }
    },

    // Script template with placeholders
    scriptTemplate: {
        type: String,
        required: true,
        maxlength: 5000
    },

    // Placeholders used in the template
    placeholders: [{
        key: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        description: String,
        required: {
            type: Boolean,
            default: true
        },
        maxLength: Number,
        placeholder: String,
        defaultValue: String
    }],

    // Example/preview settings
    example: {
        sourceImage: String,
        thumbnailUrl: String,
        previewVideoUrl: String,
        sampleScript: String
    },

    // Usage tracking
    usageCount: {
        type: Number,
        default: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },

    // Template settings
    isActive: {
        type: Boolean,
        default: true
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],

    // Admin tracking
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
VideoTemplateSchema.index({ category: 1, isActive: 1 });
VideoTemplateSchema.index({ featured: 1, order: 1 });
VideoTemplateSchema.index({ usageCount: -1 });
VideoTemplateSchema.index({ 'rating.average': -1 });
VideoTemplateSchema.index({ tags: 1 });

// Instance methods
VideoTemplateSchema.methods.incrementUsage = async function() {
    this.usageCount += 1;
    await this.save();
};

VideoTemplateSchema.methods.addRating = async function(rating) {
    const currentTotal = this.rating.average * this.rating.count;
    this.rating.count += 1;
    this.rating.average = (currentTotal + rating) / this.rating.count;
    await this.save();
};

VideoTemplateSchema.methods.fillTemplate = function(values) {
    let script = this.scriptTemplate;

    // Replace all placeholders
    this.placeholders.forEach(placeholder => {
        const value = values[placeholder.key] || placeholder.defaultValue || '';
        const regex = new RegExp(`{{${placeholder.key}}}`, 'g');
        script = script.replace(regex, value);
    });

    return script;
};

VideoTemplateSchema.methods.validatePlaceholders = function(values) {
    const errors = [];

    this.placeholders.forEach(placeholder => {
        const value = values[placeholder.key];

        // Check required
        if (placeholder.required && (!value || value.trim() === '')) {
            errors.push({
                field: placeholder.key,
                message: `${placeholder.label} is required`
            });
        }

        // Check max length
        if (value && placeholder.maxLength && value.length > placeholder.maxLength) {
            errors.push({
                field: placeholder.key,
                message: `${placeholder.label} must be less than ${placeholder.maxLength} characters`
            });
        }
    });

    return errors;
};

// Static methods
VideoTemplateSchema.statics.getByCategory = async function(category, options = {}) {
    const query = { category, isActive: true };

    if (options.premiumOnly) {
        query.isPremium = true;
    }

    return this.find(query)
        .sort({ featured: -1, order: 1, usageCount: -1 })
        .limit(options.limit || 50);
};

VideoTemplateSchema.statics.getFeatured = async function(limit = 6) {
    return this.find({ isActive: true, featured: true })
        .sort({ order: 1, 'rating.average': -1 })
        .limit(limit);
};

VideoTemplateSchema.statics.getPopular = async function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ usageCount: -1, 'rating.average': -1 })
        .limit(limit);
};

VideoTemplateSchema.statics.getTopRated = async function(limit = 10) {
    return this.find({
        isActive: true,
        'rating.count': { $gte: 5 } // Must have at least 5 ratings
    })
        .sort({ 'rating.average': -1, 'rating.count': -1 })
        .limit(limit);
};

VideoTemplateSchema.statics.searchTemplates = async function(searchTerm, options = {}) {
    const query = {
        isActive: true,
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { tags: { $regex: searchTerm, $options: 'i' } }
        ]
    };

    if (options.category) {
        query.category = options.category;
    }

    return this.find(query)
        .sort({ usageCount: -1, 'rating.average': -1 })
        .limit(options.limit || 20);
};

const VideoTemplate = mongoose.model('VideoTemplate', VideoTemplateSchema);

export default VideoTemplate;
