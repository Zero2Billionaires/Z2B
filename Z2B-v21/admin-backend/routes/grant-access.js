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

        // Initialize appAccessGrants if it doesn't exist
        if (!user.appAccessGrants) {
            user.appAccessGrants = new Map();
        }

        // Grant access to each app
        const grantedApps = [];
        for (const appId of apps) {
            user.appAccessGrants.set(appId, {
                granted: true,
                grantedAt: new Date(),
                grantedBy: 'manual-grant',
                expiresAt: null // No expiration for manual grants
            });
            grantedApps.push(appId);
        }

        await user.save();

        res.json({
            success: true,
            message: `Access granted to ${grantedApps.length} app(s)`,
            user: {
                email: user.email,
                phoneNumber: user.phoneNumber,
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

        // Get all granted apps
        const grantedApps = [];
        if (user.appAccessGrants) {
            for (const [appId, access] of user.appAccessGrants.entries()) {
                if (access.granted) {
                    grantedApps.push(appId);
                }
            }
        }

        res.json({
            success: true,
            user: {
                email: user.email,
                phoneNumber: user.phoneNumber
            },
            grantedApps: grantedApps
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

        // Revoke access to each app
        const revokedApps = [];
        if (user.appAccessGrants) {
            for (const appId of apps) {
                if (user.appAccessGrants.has(appId)) {
                    user.appAccessGrants.delete(appId);
                    revokedApps.push(appId);
                }
            }
        }

        await user.save();

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
