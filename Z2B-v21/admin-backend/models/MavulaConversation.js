const mongoose = require('mongoose');

const mavulaConversationSchema = new mongoose.Schema({
    prospectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MavulaProspect',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    messages: [{
        role: {
            type: String,
            enum: ['AI', 'PROSPECT', 'SYSTEM'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        messageType: {
            type: String,
            enum: ['TEXT', 'OPENER', 'FOLLOW_UP', 'OBJECTION_RESPONSE', 'CLOSE', 'NURTURE', 'SYSTEM_NOTE']
        },

        // WhatsApp Integration
        whatsappMessageId: String,
        whatsappStatus: {
            type: String,
            enum: ['SENT', 'DELIVERED', 'READ', 'FAILED']
        },
        whatsappError: String,

        // AI Generation Metadata
        aiProvider: {
            type: String,
            enum: ['CLAUDE', 'OPENAI', 'NONE']
        },
        promptUsed: String,
        tokensUsed: Number,
        generationTime: Number, // milliseconds

        // Response Tracking
        wasEdited: {
            type: Boolean,
            default: false
        },
        editedBy: {
            type: String,
            enum: ['USER', 'SYSTEM']
        },
        originalContent: String,

        // Sentiment & Analysis
        sentiment: {
            type: String,
            enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE']
        },
        detectedIntent: String,
        buyingSignals: [String]
    }],

    // Conversation Metrics
    totalMessages: {
        type: Number,
        default: 0
    },
    prospectResponses: {
        type: Number,
        default: 0
    },
    aiMessages: {
        type: Number,
        default: 0
    },

    conversationStartDate: {
        type: Date,
        default: Date.now
    },
    lastMessageDate: Date,
    isActive: {
        type: Boolean,
        default: true
    },

    // AI Context for continuity
    conversationSummary: String, // Claude-generated summary for context
    keyTakeaways: [String],
    lastSummaryUpdate: Date
}, {
    timestamps: true,
    collection: 'mavula_conversations'
});

// Indexes for performance
mavulaConversationSchema.index({ prospectId: 1 }, { unique: true });
mavulaConversationSchema.index({ userId: 1, lastMessageDate: -1 });
mavulaConversationSchema.index({ prospectId: 1, 'messages.timestamp': -1 });
mavulaConversationSchema.index({ userId: 1, isActive: 1 });

// Method to add a message
mavulaConversationSchema.methods.addMessage = function(messageData) {
    this.messages.push(messageData);

    // Update metrics
    this.totalMessages = this.messages.length;
    this.lastMessageDate = new Date();

    if (messageData.role === 'PROSPECT') {
        this.prospectResponses++;
    } else if (messageData.role === 'AI') {
        this.aiMessages++;
    }

    return this.save();
};

// Method to get recent messages (for AI context)
mavulaConversationSchema.methods.getRecentMessages = function(limit = 20) {
    return this.messages.slice(-limit);
};

// Method to get conversation history for AI
mavulaConversationSchema.methods.getFormattedHistory = function(limit = 10) {
    const recentMessages = this.messages.slice(-limit);

    return recentMessages.map(msg => ({
        role: msg.role === 'AI' ? 'assistant' : msg.role === 'PROSPECT' ? 'user' : 'system',
        content: msg.content
    }));
};

// Static method to create conversation for new prospect
mavulaConversationSchema.statics.createForProspect = async function(prospectId, userId) {
    const existing = await this.findOne({ prospectId });
    if (existing) {
        return existing;
    }

    const conversation = new this({
        prospectId,
        userId,
        messages: [],
        conversationStartDate: new Date(),
        isActive: true
    });

    return await conversation.save();
};

// Static method to get conversations needing summary update
mavulaConversationSchema.statics.getNeedingSummary = async function(userId, daysOld = 1) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await this.find({
        userId,
        isActive: true,
        totalMessages: { $gte: 5 },
        $or: [
            { lastSummaryUpdate: null },
            { lastSummaryUpdate: { $lte: cutoffDate } }
        ]
    }).limit(20);
};

// Pre-save hook to maintain message count
mavulaConversationSchema.pre('save', function(next) {
    if (this.isModified('messages')) {
        this.totalMessages = this.messages.length;
        this.prospectResponses = this.messages.filter(m => m.role === 'PROSPECT').length;
        this.aiMessages = this.messages.filter(m => m.role === 'AI').length;

        // Update last message date
        if (this.messages.length > 0) {
            this.lastMessageDate = this.messages[this.messages.length - 1].timestamp;
        }
    }
    next();
});

const MavulaConversation = mongoose.model('MavulaConversation', mavulaConversationSchema);

module.exports = MavulaConversation;
