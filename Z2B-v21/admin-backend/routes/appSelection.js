const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TierConfig = require('../models/TierConfig');
const { verifyToken } = require('../middleware/auth');

// ============================================================================
// APP SELECTION ROUTES
// ============================================================================
// Handles tier-based app selection after registration

// GET /api/app-selection/status
// Check if user needs to select apps
router.get('/status', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const tierConfig = await TierConfig.findOne({ tier: user.tier });

        if (!tierConfig) {
            return res.status(404).json({ success: false, error: 'Tier configuration not found' });
        }

        // Calculate available slots
        const alreadyUnlocked = user.appAccess ? Array.from(user.appAccess.keys()).length : 0;
        const availableSlots = tierConfig.totalAppsAllowed - alreadyUnlocked;

        res.json({
            success: true,
            needsSelection: !user.appSelectionCompleted && availableSlots > 0,
            tier: user.tier,
            totalAppsAllowed: tierConfig.totalAppsAllowed,
            alreadyUnlocked,
            availableSlots,
            unlockedApps: user.appAccess ? Array.from(user.appAccess.keys()) : [],
            introApp: user.introApp
        });
    } catch (error) {
        console.error('Error in /status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/app-selection/select
// User selects their apps (one-time only)
router.post('/select', verifyToken, async (req, res) => {
    try {
        const { selectedApps } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Validate: selection already completed
        if (user.appSelectionCompleted) {
            return res.status(400).json({
                success: false,
                error: 'App selection already completed. Selections are permanent.'
            });
        }

        // Get tier config
        const tierConfig = await TierConfig.findOne({ tier: user.tier });

        if (!tierConfig) {
            return res.status(404).json({ success: false, error: 'Tier configuration not found' });
        }

        // Calculate how many slots available
        const alreadyUnlocked = user.appAccess ? Array.from(user.appAccess.keys()).length : 0;
        const availableSlots = tierConfig.totalAppsAllowed - alreadyUnlocked;

        // Validate: correct number of selections
        if (!selectedApps || selectedApps.length !== availableSlots) {
            return res.status(400).json({
                success: false,
                error: `Please select exactly ${availableSlots} app(s)`
            });
        }

        // Validate: no duplicates with already unlocked
        const alreadyUnlockedApps = user.appAccess ? Array.from(user.appAccess.keys()) : [];
        for (const app of selectedApps) {
            if (alreadyUnlockedApps.includes(app)) {
                return res.status(400).json({
                    success: false,
                    error: `${app} is already unlocked`
                });
            }
        }

        // Initialize appAccess Map if it doesn't exist
        if (!user.appAccess) {
            user.appAccess = new Map();
        }

        // Unlock selected apps
        for (const appId of selectedApps) {
            user.appAccess.set(appId, {
                unlocked: true,
                unlockedAt: new Date(),
                source: 'USER_SELECTED',
                isPermanent: true
            });
        }

        // Mark selection as completed
        user.selectedApps = selectedApps;
        user.appSelectionDate = new Date();
        user.appSelectionCompleted = true;

        await user.save();

        res.json({
            success: true,
            message: 'Apps unlocked successfully',
            unlockedApps: Array.from(user.appAccess.keys())
        });

    } catch (error) {
        console.error('Error in /select:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
