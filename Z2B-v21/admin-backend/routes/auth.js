const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');

// Unified Login - Handles both Admin (username) and User (email) logins
router.post('/login', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const loginIdentifier = username || email;

        // Validate input
        if (!loginIdentifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/Username and password are required'
            });
        }

        // Check if it's admin login (has username field)
        if (username) {
            // Admin Login
            const adminUsername = process.env.ADMIN_USERNAME || 'admin';
            const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Z2B2024!';

            if (username !== adminUsername || password !== adminPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate JWT token for admin
            const token = jwt.sign(
                { username: adminUsername, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                message: 'Login successful',
                token,
                admin: { username: adminUsername, role: 'admin' }
            });
        }

        // User Login (email provided)
        if (email) {
            // Find user by email
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check account status
            if (user.accountStatus === 'SUSPENDED' || user.accountStatus === 'BLOCKED') {
                return res.status(403).json({
                    success: false,
                    message: `Your account has been ${user.accountStatus.toLowerCase()}. Please contact support.`
                });
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate JWT token for user
            const token = jwt.sign(
                { userId: user._id, email: user.email, tier: user.tier, role: 'user' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    tier: user.tier,
                    referralCode: user.referralCode,
                    fuelCredits: user.fuelCredits,
                    accountStatus: user.accountStatus,
                    isBetaTester: user.isBetaTester,
                    freeAppAccess: user.freeAppAccess
                }
            });
        }

        // Neither username nor email provided
        return res.status(400).json({
            success: false,
            message: 'Email or username is required'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

module.exports = router;


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

        // Prepare user data
        const selectedTier = tier || 'FAM';
        const userData = {
            firstName,
            lastName,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            tier: selectedTier,
            sponsorId,
            sponsorCode,
            accountStatus,
            isEmailVerified: true, // Auto-verify for public registration
            createdByAdmin: false
        };

        // FAM Tier Auto-Benefits: 5 credits/month for 3 months + Coach Manlaw access
        if (selectedTier === 'FAM') {
            const now = new Date();
            const threeMonthsLater = new Date(now);
            threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

            userData.fuelCredits = 5; // Initial 5 credits
            userData.famStartDate = now;
            userData.famExpiryDate = threeMonthsLater;
            userData.lastCreditRefresh = now;
            userData.famMonthsRemaining = 3;
            userData.freeAppAccess = {
                coachManlaw: true // Auto-enable Coach Manlaw for FAM
            };
        }

        // Create new user
        const user = new User(userData);

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
// DEPLOYMENT TEST 1762032783
