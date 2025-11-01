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
            .select('firstName lastName email referralCode tier');

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

module.exports = router;
