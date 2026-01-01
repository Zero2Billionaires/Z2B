import mongoose from 'mongoose';

const activityResponseSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    day: {
        type: Number,
        required: true,
        min: 1,
        max: 90
    },
    lessonTitle: {
        type: String,
        required: true
    },
    responseType: {
        type: String,
        enum: ['activity', 'assignment'],
        required: true
    },
    userResponse: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 5000
    },
    coachFeedback: {
        type: String,
        required: false
    },
    feedbackGeneratedAt: {
        type: Date
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    btssImpact: {
        type: String,
        enum: ['mindset', 'money', 'legacy', 'movement', 'all']
    },
    completionStatus: {
        type: String,
        enum: ['submitted', 'reviewed', 'excellent'],
        default: 'submitted'
    },
    userRating: {
        type: Number,
        min: 1,
        max: 5
    }
}, {
    timestamps: true
});

// Index for efficient querying
activityResponseSchema.index({ userId: 1, day: 1 });
activityResponseSchema.index({ userId: 1, submittedAt: -1 });

// Static method to get user's responses for a specific day
activityResponseSchema.statics.getResponsesByDay = async function(userId, day) {
    return await this.find({ userId, day }).sort({ submittedAt: -1 });
};

// Static method to get all user responses
activityResponseSchema.statics.getUserResponses = async function(userId, limit = 50) {
    return await this.find({ userId })
        .sort({ submittedAt: -1 })
        .limit(limit);
};

// Static method to get completion stats
activityResponseSchema.statics.getCompletionStats = async function(userId) {
    const responses = await this.find({ userId });

    const stats = {
        totalSubmissions: responses.length,
        activitiesCompleted: responses.filter(r => r.responseType === 'activity').length,
        assignmentsCompleted: responses.filter(r => r.responseType === 'assignment').length,
        daysWithSubmissions: [...new Set(responses.map(r => r.day))].length,
        byBTSS: {
            mindset: responses.filter(r => r.btssImpact === 'mindset').length,
            money: responses.filter(r => r.btssImpact === 'money').length,
            legacy: responses.filter(r => r.btssImpact === 'legacy').length,
            movement: responses.filter(r => r.btssImpact === 'movement').length,
            all: responses.filter(r => r.btssImpact === 'all').length
        },
        excellentRated: responses.filter(r => r.completionStatus === 'excellent').length
    };

    return stats;
};

const ActivityResponse = mongoose.model('ActivityResponse', activityResponseSchema);

export default ActivityResponse;
