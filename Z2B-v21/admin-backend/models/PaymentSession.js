const mongoose = require('mongoose');

// Payment Session Schema - Tracks all payment sessions
const paymentSessionSchema = new mongoose.Schema({
    reference: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    tierCode: {
        type: String,
        required: true
    },
    referralCode: {
        type: String,
        default: null
    },
    checkoutId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'ZAR'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    collection: 'payment_sessions'
});

// Index for quick lookups
paymentSessionSchema.index({ reference: 1 });
paymentSessionSchema.index({ checkoutId: 1 });
paymentSessionSchema.index({ status: 1 });

module.exports = mongoose.model('PaymentSession', paymentSessionSchema);
