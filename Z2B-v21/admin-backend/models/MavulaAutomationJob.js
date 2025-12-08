const mongoose = require('mongoose');

const mavulaAutomationJobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    prospectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MavulaProspect',
        required: true,
        index: true
    },

    // Job Details
    jobType: {
        type: String,
        enum: [
            'INITIAL_OUTREACH',       // First contact with prospect
            'FOLLOW_UP',              // Scheduled follow-up
            'RESPONSE_REQUIRED',      // Prospect replied, need AI response
            'STAGE_ADVANCEMENT',      // Move to next conversation stage
            'DORMANT_REACTIVATION',   // Re-engage dormant prospect
            'CONVERSION_ATTEMPT',     // Make the close
            'SUMMARY_UPDATE'          // Update conversation summary
        ],
        required: true
    },

    scheduledFor: {
        type: Date,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
        default: 'PENDING',
        index: true
    },

    // Execution Details
    priority: {
        type: Number,
        default: 5,
        min: 1,
        max: 10 // Higher = more urgent
    },
    maxRetries: {
        type: Number,
        default: 3
    },
    retryCount: {
        type: Number,
        default: 0
    },

    // Job Payload
    messageTemplate: String,
    contextData: mongoose.Schema.Types.Mixed, // Any context needed for message generation

    // Execution Tracking
    startedAt: Date,
    completedAt: Date,
    error: String,
    executionLogs: [String], // Debug logs for troubleshooting

    // Result
    result: {
        success: Boolean,
        messageId: String,
        whatsappMessageId: String,
        aiProvider: String,
        tokensUsed: Number,
        generatedMessage: String,
        errorDetails: String
    }
}, {
    timestamps: true,
    collection: 'mavula_automation_jobs'
});

// Indexes for performance
mavulaAutomationJobSchema.index({ scheduledFor: 1, status: 1 });
mavulaAutomationJobSchema.index({ userId: 1, status: 1 });
mavulaAutomationJobSchema.index({ prospectId: 1, jobType: 1 });
mavulaAutomationJobSchema.index({ status: 1, priority: -1 }); // For job queue processing
mavulaAutomationJobSchema.index({ userId: 1, createdAt: -1 });

// Method to mark as processing
mavulaAutomationJobSchema.methods.markProcessing = function() {
    this.status = 'PROCESSING';
    this.startedAt = new Date();
    return this.save();
};

// Method to mark as completed
mavulaAutomationJobSchema.methods.markCompleted = function(result) {
    this.status = 'COMPLETED';
    this.completedAt = new Date();
    this.result = {
        ...this.result,
        ...result,
        success: true
    };
    return this.save();
};

// Method to mark as failed
mavulaAutomationJobSchema.methods.markFailed = function(error) {
    this.status = 'FAILED';
    this.completedAt = new Date();
    this.error = error;
    this.result = {
        ...this.result,
        success: false,
        errorDetails: error
    };

    // Log for debugging
    this.executionLogs.push(`[FAILED] ${new Date().toISOString()}: ${error}`);

    return this.save();
};

// Method to retry job
mavulaAutomationJobSchema.methods.retry = async function(delayMinutes = 15) {
    if (this.retryCount >= this.maxRetries) {
        this.status = 'FAILED';
        this.error = 'Max retries exceeded';
        return await this.save();
    }

    this.retryCount++;
    this.status = 'PENDING';
    this.scheduledFor = new Date(Date.now() + (delayMinutes * 60 * 1000));
    this.executionLogs.push(`[RETRY ${this.retryCount}] ${new Date().toISOString()}: Rescheduled for ${this.scheduledFor}`);

    return await this.save();
};

// Method to cancel job
mavulaAutomationJobSchema.methods.cancel = function(reason) {
    this.status = 'CANCELLED';
    this.completedAt = new Date();
    this.error = reason;
    this.executionLogs.push(`[CANCELLED] ${new Date().toISOString()}: ${reason}`);
    return this.save();
};

// Static method to create job
mavulaAutomationJobSchema.statics.createJob = async function(jobData) {
    const job = new this({
        userId: jobData.userId,
        prospectId: jobData.prospectId,
        jobType: jobData.jobType,
        scheduledFor: jobData.scheduledFor || new Date(),
        priority: jobData.priority || 5,
        messageTemplate: jobData.messageTemplate,
        contextData: jobData.contextData || {}
    });

    return await job.save();
};

// Static method to get pending jobs (for queue processing)
mavulaAutomationJobSchema.statics.getPendingJobs = async function(limit = 50) {
    const now = new Date();

    return await this.find({
        scheduledFor: { $lte: now },
        status: 'PENDING'
    })
    .sort({ priority: -1, scheduledFor: 1 }) // High priority first, then oldest
    .limit(limit);
};

// Static method to get jobs for a user
mavulaAutomationJobSchema.statics.getUserJobs = async function(userId, status = null) {
    const query = { userId };

    if (status) {
        query.status = status;
    }

    return await this.find(query)
        .sort({ createdAt: -1 })
        .limit(100);
};

// Static method to cleanup old completed jobs
mavulaAutomationJobSchema.statics.cleanupOldJobs = async function(daysOld = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deleteMany({
        status: { $in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
        completedAt: { $lte: cutoffDate }
    });

    return result.deletedCount;
};

// Static method to cancel pending jobs for a prospect
mavulaAutomationJobSchema.statics.cancelProspectJobs = async function(prospectId, reason = 'Prospect manually managed') {
    const jobs = await this.find({
        prospectId,
        status: 'PENDING'
    });

    for (const job of jobs) {
        await job.cancel(reason);
    }

    return jobs.length;
};

// Pre-save hook to add execution log
mavulaAutomationJobSchema.pre('save', function(next) {
    if (!this.executionLogs) {
        this.executionLogs = [];
    }

    if (this.isNew) {
        this.executionLogs.push(`[CREATED] ${new Date().toISOString()}: Job type ${this.jobType} scheduled for ${this.scheduledFor}`);
    }

    next();
});

const MavulaAutomationJob = mongoose.model('MavulaAutomationJob', mavulaAutomationJobSchema);

module.exports = MavulaAutomationJob;
