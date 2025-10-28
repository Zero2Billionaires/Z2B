const express = require('express');
const router = express.Router();
const Statistics = require('../models/Statistics');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Get Current Statistics
router.get('/', verifyToken, async (req, res) => {
    try {
        let stats = await Statistics.findOne();

        // If no stats exist, create and calculate initial stats
        if (!stats) {
            stats = await calculateStatistics();
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// Recalculate Statistics (from database)
router.post('/recalculate', verifyToken, async (req, res) => {
    try {
        const stats = await calculateStatistics();

        res.json({
            success: true,
            message: 'Statistics recalculated successfully',
            data: stats
        });
    } catch (error) {
        console.error('Error recalculating statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error recalculating statistics'
        });
    }
});

// Reset Statistics
router.post('/reset', verifyToken, async (req, res) => {
    try {
        const { reason } = req.body;

        // Save reset to history before resetting
        let stats = await Statistics.findOne();
        if (stats) {
            stats.resetHistory.push({
                resetDate: new Date(),
                resetBy: 'Admin',
                reason: reason || 'Manual reset'
            });
        }

        // Delete and recreate fresh stats
        await Statistics.deleteMany({});

        const newStats = new Statistics({
            lastReset: new Date(),
            resetHistory: stats ? stats.resetHistory : []
        });

        await newStats.save();

        res.json({
            success: true,
            message: 'Statistics reset successfully',
            data: newStats
        });
    } catch (error) {
        console.error('Error resetting statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting statistics'
        });
    }
});

// Helper function to calculate statistics from database
async function calculateStatistics() {
    const users = await User.find();

    const totalUsers = users.length;
    const totalBetaTesters = users.filter(u => u.isBetaTester).length;
    const activeUsers = users.filter(u => u.accountStatus === 'ACTIVE').length;

    const tierDistribution = {
        FAM: users.filter(u => u.tier === 'FAM').length,
        BRONZE: users.filter(u => u.tier === 'BRONZE').length,
        COPPER: users.filter(u => u.tier === 'COPPER').length,
        SILVER: users.filter(u => u.tier === 'SILVER').length,
        GOLD: users.filter(u => u.tier === 'GOLD').length,
        PLATINUM: users.filter(u => u.tier === 'PLATINUM').length
    };

    const totalRevenue = users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0);
    const totalPVGenerated = users.reduce((sum, u) => sum + (u.lifetimePV || 0), 0);

    let stats = await Statistics.findOne();
    if (!stats) {
        stats = new Statistics();
    }

    stats.totalUsers = totalUsers;
    stats.totalBetaTesters = totalBetaTesters;
    stats.activeUsers = activeUsers;
    stats.tierDistribution = tierDistribution;
    stats.totalRevenue = totalRevenue;
    stats.totalPVGenerated = totalPVGenerated;

    await stats.save();

    return stats;
}

module.exports = router;
