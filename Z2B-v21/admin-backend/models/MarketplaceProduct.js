const mongoose = require('mongoose');

const marketplaceProductSchema = new mongoose.Schema({
    // Product Identification
    productId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    productName: {
        type: String,
        required: true
    },
    productSlug: {
        type: String,
        required: true,
        unique: true
    },

    // Display Information
    icon: {
        type: String,
        default: '📦'
    },
    color: {
        type: String,
        default: '#6B7280'
    },
    description: {
        type: String
    },
    category: {
        type: String,
        enum: ['AI_APP', 'EDUCATIONAL', 'SUITE', 'TOOL'],
        default: 'AI_APP'
    },

    // Pricing
    pricing: {
        monthly: { type: Number },
        lifetime: { type: Number },
        payAsYouGo: { type: Number }
    },

    // Access Configuration
    accessTypes: [{
        type: String,
        enum: ['PAID', 'GIFT', 'BETA', 'ADMIN', 'FREE']
    }],
    defaultAccessType: {
        type: String,
        enum: ['PAID', 'GIFT', 'BETA', 'ADMIN', 'FREE'],
        default: 'PAID'
    },

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isVisible: {
        type: Boolean,
        default: true
    },

    // Metadata
    sortOrder: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'marketplace_products'
});

// Indexes
marketplaceProductSchema.index({ productId: 1 });
marketplaceProductSchema.index({ isActive: 1, isVisible: 1 });
marketplaceProductSchema.index({ sortOrder: 1 });

// Pre-save middleware to update timestamps
marketplaceProductSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('MarketplaceProduct', marketplaceProductSchema);
