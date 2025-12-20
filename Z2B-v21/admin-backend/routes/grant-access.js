const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Grant app access to a user
router.post('/grant-app-access', async (req, res) => {
    try {
        const { userIdentifier, apps } = req.body;

        if (!userIdentifier || !apps || apps.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'User identifier and apps are required'
            });
        }

        // Find user by email or phone
        const user = await User.findOne({
            $or: [
                { email: userIdentifier },
                { phoneNumber: userIdentifier }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Initialize appAccess if it doesn't exist (NEW SYSTEM)
        if (!user.appAccess) {
            user.appAccess = new Map();
        }

        // Grant access to each app using NEW appAccess Map
        const grantedApps = [];
        const now = new Date();

        for (const appId of apps) {
            user.appAccess.set(appId, {
                unlocked: true,
                unlockedAt: now,
                source: 'ADMIN_GRANT',
                isPermanent: true
            });
            grantedApps.push(appId);
        }

        // Mark app selection as completed (avoid redirect loop)
        user.appSelectionCompleted = true;
        if (!user.appSelectionDate) {
            user.appSelectionDate = now;
        }

        await user.save();

        console.log(`✅ Admin granted ${grantedApps.length} apps to ${user.email}`);

        res.json({
            success: true,
            message: `Access granted to ${grantedApps.length} app(s)`,
            user: {
                email: user.email,
                phoneNumber: user.phoneNumber,
                tier: user.tier,
                grantedApps: grantedApps
            }
        });

    } catch (error) {
        console.error('Grant access error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message
        });
    }
});

// Check user's app access
router.get('/check-app-access', async (req, res) => {
    try {
        const { user: userIdentifier } = req.query;

        if (!userIdentifier) {
            return res.status(400).json({
                success: false,
                error: 'User identifier required'
            });
        }

        const user = await User.findOne({
            $or: [
                { email: userIdentifier },
                { phoneNumber: userIdentifier }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get all unlocked apps from NEW appAccess Map
        const grantedApps = [];
        if (user.appAccess) {
            for (const [appId, access] of user.appAccess.entries()) {
                if (access && access.unlocked) {
                    grantedApps.push({
                        appId,
                        source: access.source,
                        unlockedAt: access.unlockedAt
                    });
                }
            }
        }

        res.json({
            success: true,
            user: {
                email: user.email,
                phoneNumber: user.phoneNumber,
                tier: user.tier,
                appSelectionCompleted: user.appSelectionCompleted
            },
            grantedApps: grantedApps,
            totalUnlocked: grantedApps.length
        });

    } catch (error) {
        console.error('Check access error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message
        });
    }
});

// Revoke app access from a user
router.post('/revoke-app-access', async (req, res) => {
    try {
        const { userIdentifier, apps } = req.body;

        if (!userIdentifier || !apps || apps.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'User identifier and apps are required'
            });
        }

        const user = await User.findOne({
            $or: [
                { email: userIdentifier },
                { phoneNumber: userIdentifier }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Revoke access to each app from NEW appAccess Map
        const revokedApps = [];
        if (user.appAccess) {
            for (const appId of apps) {
                if (user.appAccess.has(appId)) {
                    user.appAccess.delete(appId);
                    revokedApps.push(appId);
                }
            }
        }

        await user.save();

        console.log(`✅ Admin revoked ${revokedApps.length} apps from ${user.email}`);

        res.json({
            success: true,
            message: `Access revoked from ${revokedApps.length} app(s)`,
            revokedApps: revokedApps
        });

    } catch (error) {
        console.error('Revoke access error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message
        });
    }
});

module.exports = router;
