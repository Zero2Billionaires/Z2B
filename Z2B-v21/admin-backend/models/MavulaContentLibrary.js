const mongoose = require('mongoose');

const mavulaContentLibrarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Content Identity
    title: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['PDF', 'URL', 'TEXT', 'VIDEO_LINK'],
        required: true
    },
    category: {
        type: String,
        enum: ['COMPANY_INFO', 'PRODUCT_INFO', 'TRAINING', 'TESTIMONIALS', 'FAQ', 'SCRIPTS', 'OTHER'],
        default: 'OTHER'
    },

    // Content Storage
    originalContent: String, // URL or text content
    uploadedFile: {
        filename: String,
        filepath: String,
        size: Number,
        mimeType: String
    },

    // AI Processing
    extractedText: {
        type: String,
        text: true // Enable text indexing for search
    },
    aiSummary: String, // Claude/OpenAI-generated summary
    keyPoints: [String],
    trainingEmbeddings: [Number], // For vector similarity (future enhancement)

    processingStatus: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    processingError: String,
    lastProcessedDate: Date,

    // Usage Tracking
    isActive: {
        type: Boolean,
        default: true
    },
    isSharedWithTeam: {
        type: Boolean,
        default: false
    },
    sharedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, // If this content was shared from an upline
    sharedDate: Date,

    usageCount: {
        type: Number,
        default: 0
    },
    lastUsedDate: Date,

    // Metadata
    tags: [String],
    description: String
}, {
    timestamps: true,
    collection: 'mavula_content_library'
});

// Indexes for performance
mavulaContentLibrarySchema.index({ userId: 1, category: 1 });
mavulaContentLibrarySchema.index({ userId: 1, isActive: 1 });
mavulaContentLibrarySchema.index({ userId: 1, isSharedWithTeam: 1 });
mavulaContentLibrarySchema.index({ extractedText: 'text' }); // Full-text search

// Method to increment usage count
mavulaContentLibrarySchema.methods.recordUsage = function() {
    this.usageCount++;
    this.lastUsedDate = new Date();
    return this.save();
};

// Method to share with team
mavulaContentLibrarySchema.methods.shareWithTeam = async function() {
    this.isSharedWithTeam = true;
    this.sharedDate = new Date();
    await this.save();

    // Get user's downline from MatrixStructure
    const MatrixStructure = mongoose.model('MatrixStructure');
    const userMatrix = await MatrixStructure.findOne({ userId: this.userId });

    if (!userMatrix) {
        return { success: false, message: 'User matrix not found' };
    }

    // Get all downline members (up to 10 levels)
    const downline = await userMatrix.getMatrixDescendants(10);

    // Create shared copies for each downline member
    const MavulaContentLibrary = mongoose.model('MavulaContentLibrary');
    let sharedCount = 0;

    for (const member of downline) {
        // Check if already shared to this user
        const existing = await MavulaContentLibrary.findOne({
            userId: member.userId,
            sharedFrom: this.userId,
            title: this.title + ' (Shared by upline)'
        });

        if (!existing) {
            const sharedContent = new MavulaContentLibrary({
                userId: member.userId,
                title: this.title + ' (Shared by upline)',
                contentType: this.contentType,
                category: this.category,
                originalContent: this.originalContent,
                extractedText: this.extractedText,
                aiSummary: this.aiSummary,
                keyPoints: this.keyPoints,
                processingStatus: 'COMPLETED',
                isActive: true,
                isSharedWithTeam: false, // Can't re-share
                sharedFrom: this.userId,
                sharedDate: new Date()
            });

            await sharedContent.save();
            sharedCount++;
        }
    }

    return {
        success: true,
        sharedWith: sharedCount,
        totalDownline: downline.length
    };
};

// Static method to get user's content library (including shared from upline)
mavulaContentLibrarySchema.statics.getUserLibrary = async function(userId, category = null) {
    const query = {
        userId,
        isActive: true
    };

    if (category) {
        query.category = category;
    }

    return await this.find(query).sort({ lastUsedDate: -1, createdAt: -1 });
};

// Static method to get content summary for AI context
mavulaContentLibrarySchema.statics.getContentSummaryForAI = async function(userId, limit = 5) {
    const contents = await this.find({
        userId,
        isActive: true,
        processingStatus: 'COMPLETED'
    }).sort({ usageCount: -1, lastUsedDate: -1 }).limit(limit);

    return contents.map(c => ({
        title: c.title,
        category: c.category,
        summary: c.aiSummary || c.extractedText?.substring(0, 500) || '',
        keyPoints: c.keyPoints
    }));
};

const MavulaContentLibrary = mongoose.model('MavulaContentLibrary', mavulaContentLibrarySchema);

module.exports = MavulaContentLibrary;
