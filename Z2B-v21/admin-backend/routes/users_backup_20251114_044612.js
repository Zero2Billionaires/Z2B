const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/emailService');

// Get All Users (with pagination and filtering)
router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.tier) filter.tier = req.query.tier;
        if (req.query.status) filter.accountStatus = req.query.status;
        if (req.query.search) {
            filter.$or = [
                { firstName: new RegExp(req.query.search, 'i') },
                { lastName: new RegExp(req.query.search, 'i') },
                { email: new RegExp(req.query.search, 'i') },
                { referralCode: new RegExp(req.query.search, 'i') }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// Get User by Referral Code (PUBLIC - No auth required)
router.get('/by-referral/:referralCode', async (req, res) => {
    try {
        const user = await User.findOne({ referralCode: req.params.referralCode })
            .select('firstName lastName email referralCode tier memberId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user by referral code:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        });
    }
});

// Get Single User by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('sponsorId', 'firstName lastName email referralCode');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        });
    }
});

// Create New User (Admin Registration)
router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            tier,
            isBetaTester,
            sponsorCode,
            password
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password || 'Welcome@123', 10);

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            tier: tier || 'FAM',
            isBetaTester: isBetaTester || false,
            sponsorCode,
            password: hashedPassword,
            isEmailVerified: true,
            createdByAdmin: true,
            accountStatus: 'ACTIVE'
        });

        await user.save();

        // Send welcome email (don't wait for it, send async)
        const plainPassword = password || 'Welcome@123';
        sendWelcomeEmail({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            referralCode: user.referralCode,
            tier: user.tier
        }, plainPassword).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating user',
            error: process.env.NODE_ENV === 'production' ? error.message : error.toString()
        });
    }
});

// Update User
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updates = req.body;

        // Don't allow password update through this route
        delete updates.password;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
});

// Grant Free Access to Apps
router.post('/:id/grant-access', verifyToken, async (req, res) => {
    try {
        const { apps } = req.body; // { zyro: true, zyra: true, ... }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.freeAppAccess = { ...user.freeAppAccess, ...apps };
        await user.save();

        res.json({
            success: true,
            message: 'App access granted successfully',
            data: user.freeAppAccess
        });
    } catch (error) {
        console.error('Error granting access:', error);
        res.status(500).json({
            success: false,
            message: 'Error granting app access'
        });
    }
});

// Add Fuel Credits
router.post('/:id/add-fuel', verifyToken, async (req, res) => {
    try {
        const { credits, reason } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.fuelCredits += parseInt(credits);
        user.accountNotes = (user.accountNotes || '') + `\n[${new Date().toISOString()}] Admin added ${credits} fuel credits. Reason: ${reason || 'N/A'}`;
        await user.save();

        res.json({
            success: true,
            message: `${credits} fuel credits added successfully`,
            data: {
                newBalance: user.fuelCredits
            }
        });
    } catch (error) {
        console.error('Error adding fuel:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding fuel credits'
        });
    }
});

// Change User Tier
router.post('/:id/change-tier', verifyToken, async (req, res) => {
    try {
        const { tier, reason } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const oldTier = user.tier;
        user.tier = tier;
        user.accountNotes = (user.accountNotes || '') + `\n[${new Date().toISOString()}] Admin changed tier from ${oldTier} to ${tier}. Reason: ${reason || 'N/A'}`;
        await user.save();

        res.json({
            success: true,
            message: `User tier changed from ${oldTier} to ${tier}`,
            data: {
                oldTier,
                newTier: tier
            }
        });
    } catch (error) {
        console.error('Error changing tier:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing user tier'
        });
    }
});

// Delete User
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
});

// ============================================
// FAM TIER CREDIT SYSTEM ENDPOINTS
// ============================================

// Monthly Credit Refresh for FAM Members (Run this monthly via cron or manually)
router.post('/fam/refresh-credits', verifyToken, async (req, res) => {
    try {
        const now = new Date();

        // Find all active FAM members who haven't expired
        const famUsers = await User.find({
            tier: 'FAM',
            famExpiryDate: { $gt: now }, // Not expired yet
            famMonthsRemaining: { $gt: 0 } // Still have months remaining
        });

        let refreshedCount = 0;
        let skippedCount = 0;
        const refreshResults = [];

        for (const user of famUsers) {
            // Check if it's been at least 30 days since last refresh
            const lastRefresh = user.lastCreditRefresh || user.famStartDate;
            const daysSinceRefresh = (now - lastRefresh) / (1000 * 60 * 60 * 24);

            if (daysSinceRefresh >= 30) {
                // Add 5 credits
                user.fuelCredits += 5;
                user.lastCreditRefresh = now;
                user.famMonthsRemaining = Math.max(0, user.famMonthsRemaining - 1);

                await user.save();

                refreshedCount++;
                refreshResults.push({
                    userId: user._id,
                    name: `${user.firstName} ${user.lastName}`,
                    creditsAdded: 5,
                    newBalance: user.fuelCredits,
                    monthsRemaining: user.famMonthsRemaining
                });
            } else {
                skippedCount++;
            }
        }

        res.json({
            success: true,
            message: `FAM credit refresh completed`,
            data: {
                totalFAMUsers: famUsers.length,
                refreshedCount,
                skippedCount,
                refreshResults
            }
        });
    } catch (error) {
        console.error('Error refreshing FAM credits:', error);
        res.status(500).json({
            success: false,
            message: 'Error refreshing FAM credits'
        });
    }
});

// Check and Handle FAM Expiry (Run this daily via cron or manually)
router.post('/fam/check-expiry', verifyToken, async (req, res) => {
    try {
        const now = new Date();

        // Find all FAM members who have expired
        const expiredFAM = await User.find({
            tier: 'FAM',
            famExpiryDate: { $lte: now }, // Expired
            accountStatus: 'ACTIVE' // Still active (not yet processed)
        });

        let expiredCount = 0;
        const expiredResults = [];

        for (const user of expiredFAM) {
            // Change account status to PENDING (requires upgrade)
            user.accountStatus = 'PENDING';
            user.accountNotes = (user.accountNotes || '') +
                `\n[${now.toISOString()}] FAM 3-month trial expired. Account suspended pending upgrade.`;
            user.famMonthsRemaining = 0;

            // Optionally: Disable Coach Manlaw access
            if (user.freeAppAccess) {
                user.freeAppAccess.coachManlaw = false;
            }

            await user.save();

            expiredCount++;
            expiredResults.push({
                userId: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                expiredOn: user.famExpiryDate
            });
        }

        res.json({
            success: true,
            message: `FAM expiry check completed`,
            data: {
                expiredCount,
                expiredResults
            }
        });
    } catch (error) {
        console.error('Error checking FAM expiry:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking FAM expiry'
        });
    }
});

// Get FAM Statistics
router.get('/fam/stats', verifyToken, async (req, res) => {
    try {
        const now = new Date();

        const totalFAM = await User.countDocuments({ tier: 'FAM' });
        const activeFAM = await User.countDocuments({
            tier: 'FAM',
            famExpiryDate: { $gt: now }
        });
        const expiredFAM = await User.countDocuments({
            tier: 'FAM',
            famExpiryDate: { $lte: now }
        });

        // Get FAM members expiring soon (within 7 days)
        const sevenDaysFromNow = new Date(now);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const expiringSoon = await User.find({
            tier: 'FAM',
            famExpiryDate: {
                $gt: now,
                $lte: sevenDaysFromNow
            }
        }).select('firstName lastName email famExpiryDate famMonthsRemaining');

        res.json({
            success: true,
            data: {
                totalFAM,
                activeFAM,
                expiredFAM,
                expiringSoonCount: expiringSoon.length,
                expiringSoon
            }
        });
    } catch (error) {
        console.error('Error fetching FAM stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching FAM statistics'
        });
    }
});

// Get Team Network / Family Tree for Admin
router.get('/team-tree', verifyToken, async (req, res) => {
    try {
        const userId = req.query.userId; // MongoDB _id
        const memberId = req.query.memberId; // Z2B member ID (e.g., Z2BGL123)

        // Recursive function to build team tree
        async function buildTreeNode(user) {
            const children = await User.find({ sponsorId: user._id })
                .select('firstName lastName email referralCode tier memberId createdAt accountStatus')
                .lean();

            const node = {
                id: user._id.toString(),
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                referralCode: user.referralCode,
                memberId: user.memberId,
                tier: user.tier,
                joinedDate: user.createdAt,
                status: user.accountStatus,
                teamSize: 0,
                children: []
            };

            // Recursively build children nodes
            for (const child of children) {
                const childNode = await buildTreeNode(child);
                node.children.push(childNode);
                node.teamSize += 1 + childNode.teamSize; // Count child + all their descendants
            }

            return node;
        }

        let treeData;

        if (userId || memberId) {
            // Get tree for specific user by MongoDB _id or Z2B member ID
            let user;
            if (memberId) {
                // Search by Z2B member ID (e.g., Z2BGL123)
                user = await User.findOne({ memberId: memberId }).select('firstName lastName email referralCode tier memberId createdAt accountStatus sponsorId');
            } else {
                // Search by MongoDB _id
                user = await User.findById(userId).select('firstName lastName email referralCode tier memberId createdAt accountStatus sponsorId');
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: memberId ? `User with member ID ${memberId} not found` : 'User not found'
                });
            }
            treeData = await buildTreeNode(user);
        } else {
            // Get all root users (users with no sponsor or invalid sponsorId)
            const rootUsers = await User.find({
                $or: [
                    { sponsorId: null },
                    { sponsorId: { $exists: false } }
                ]
            }).select('firstName lastName email referralCode tier memberId createdAt accountStatus').lean();

            // Build trees for all root users
            treeData = {
                name: 'Z2B Legacy Builders Network',
                children: [],
                teamSize: 0
            };

            for (const rootUser of rootUsers) {
                const rootNode = await buildTreeNode(rootUser);
                treeData.children.push(rootNode);
                treeData.teamSize += 1 + rootNode.teamSize;
            }
        }

        res.json({
            success: true,
            data: treeData
        });
    } catch (error) {
        console.error('Error building team tree:', error);
        res.status(500).json({
            success: false,
            message: 'Error building team tree'
        });
    }
});

module.exports = router;
