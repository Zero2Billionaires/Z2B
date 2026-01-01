const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
    // Platform Statistics
    totalUsers: { type: Number, default: 0 },
    totalBetaTesters: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },

    // Tier Distribution
    tierDistribution: {
        FAM: { type: Number, default: 0 },
        BRONZE: { type: Number, default: 0 },
        COPPER: { type: Number, default: 0 },
        SILVER: { type: Number, default: 0 },
        GOLD: { type: Number, default: 0 },
        PLATINUM: { type: Number, default: 0 }
    },

    // Financial Statistics
    totalRevenue: { type: Number, default: 0 },
    totalCommissionsPaid: { type: Number, default: 0 },
    pendingCommissions: { type: Number, default: 0 },
    totalFuelCreditsSold: { type: Number, default: 0 },
    totalPVGenerated: { type: Number, default: 0 },

    // Monthly Snapshots
    monthlyStats: [{
        month: String, // YYYY-MM
        newUsers: Number,
        revenue: Number,
        commissions: Number,
        fuelSales: Number,
        pvGenerated: Number,
        activeUsers: Number
    }],

    // App Usage Statistics
    appUsage: {
        zyro: { type: Number, default: 0 },
        zyra: { type: Number, default: 0 },
        benown: { type: Number, default: 0 },
        glowie: { type: Number, default: 0 },
        zynect: { type: Number, default: 0 },
        vidzie: { type: Number, default: 0 },
        zynth: { type: Number, default: 0 },
        coachManlaw: { type: Number, default: 0 }
    },

    // Last Reset
    lastReset: { type: Date, default: Date.now },
    resetHistory: [{
        resetDate: Date,
        resetBy: String,
        reason: String
    }]
}, {
    timestamps: true,
    collection: 'statistics'
});

module.exports = mongoose.model('Statistics', statisticsSchema);
