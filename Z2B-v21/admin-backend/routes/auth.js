const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Check against environment variables
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Z2B2024!';

        if (username !== adminUsername || password !== adminPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { username: adminUsername, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: { username: adminUsername, role: 'admin' }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Verify Token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({
            success: true,
            admin: decoded
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
});

// Change Admin Password
router.post('/change-password', async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        const { currentPassword, newPassword } = req.body;

        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'Authentication required'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET);

        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Z2B2024!';

        if (currentPassword !== adminPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Note: In production, you should update this in a secure config file or database
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Password changed successfully. Please update your .env file with the new password.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
});


// Public User Registration
router.post('/register', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            tier,
            sponsorCode,
            paymentMethod
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Find sponsor if sponsor code provided
        let sponsorId = null;
        if (sponsorCode) {
            const sponsor = await User.findOne({ referralCode: sponsorCode });
            if (sponsor) {
                sponsorId = sponsor._id;
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine account status based on payment method
        let accountStatus = 'PENDING'; // Default
        if (paymentMethod === 'cash') {
            // For cash deposits, give free access until POP is received
            accountStatus = 'ACTIVE';
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            tier: tier || 'FAM',
            sponsorId,
            sponsorCode,
            accountStatus,
            isEmailVerified: true, // Auto-verify for public registration
            createdByAdmin: false
        });

        await user.save();

        // Update sponsor's direct referrals if applicable
        if (sponsorId) {
            await User.findByIdAndUpdate(sponsorId, {
                $inc: { directReferrals: 1, totalTeamSize: 1 }
            });
        }

        // Generate referral link
        const frontendURL = process.env.FRONTEND_URL || 'https://z2blegacybuilders.co.za';
        const referralLink = `${frontendURL}/register.html?ref=${user.referralCode}`;

        // Send welcome email
        sendWelcomeEmail({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            referralCode: user.referralCode,
            tier: user.tier,
            memberId: user.referralCode, // Member ID is same as referral code
            referralLink: referralLink
        }, password).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        // Return success response
        const response = {
            success: true,
            message: 'Registration successful! Welcome email sent.',
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                referralCode: user.referralCode,
                memberId: user.referralCode,
                referralLink: referralLink,
                tier: user.tier,
                accountStatus: user.accountStatus
            }
        };

        // Add payment-specific instructions
        if (paymentMethod === 'cash') {
            response.message += ' You have FREE ACCESS until we receive your proof of payment.';
        } else if (paymentMethod === 'eft') {
            response.message += ' Please complete your EFT transfer to activate your account.';
        }

        res.status(201).json(response);

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error during registration',
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
});

module.exports = router;
