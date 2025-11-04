const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');

// Tier configurations for payment
const TIER_PRICES = {
    FAM: { name: 'FAM - Free Affiliate', price: 0, betaPrice: 0 },
    BRONZE: { name: 'Bronze Legacy Builder', price: 960, betaPrice: 480 },
    COPPER: { name: 'Copper Legacy Builder', price: 1980, betaPrice: 990 },
    SILVER: { name: 'Silver Legacy Builder', price: 2980, betaPrice: 1490 },
    GOLD: { name: 'Gold Legacy Builder', price: 4980, betaPrice: 2490 },
    PLATINUM: { name: 'Platinum Legacy Builder', price: 6980, betaPrice: 3490 },
    LIFETIME: { name: 'Lifetime Legacy Builder', price: 12000, betaPrice: 6000 }
};

// Yoco API configuration
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY || 'sk_test_960bfde0VBrLlpK098e4ffeb53e1';
const YOCO_API_URL = 'https://payments.yoco.com/api/checkouts';

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

// Get current user data - requires authentication
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
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
        let accountStatus = 'PENDING'; // Default - all new registrations need verification
        // Cash deposits remain PENDING until admin verifies proof of payment
        // Only online payments with successful checkout get ACTIVE status

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

        // Automatic Fuel Credit Allocation Based on Tier
        const tierFuelCredits = {
            'FAM': 5,           // Free Affiliate Member: 5 credits/month for 3 months
            'BRONZE': 100,      // Bronze: 100 credits
            'COPPER': 250,      // Copper: 250 credits
            'SILVER': 500,      // Silver: 500 credits
            'GOLD': 1000,       // Gold: 1,000 credits
            'PLATINUM': 5000,   // Platinum: 5,000 credits
            'LIFETIME': 10000   // Lifetime: 10,000 credits
        };

        // Assign fuel credits based on tier
        userData.fuelCredits = tierFuelCredits[selectedTier] || 0;

        // FAM Tier Special Benefits: 3-month access + Coach Manlaw
        if (selectedTier === 'FAM') {
            const now = new Date();
            const threeMonthsLater = new Date(now);
            threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

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

        // Handle online payment - Create Yoco checkout session
        if (paymentMethod === 'online') {
            try {
                // Get tier price (use beta pricing by default)
                const tierInfo = TIER_PRICES[selectedTier];
                if (!tierInfo) {
                    throw new Error('Invalid tier selected');
                }

                const price = tierInfo.betaPrice || tierInfo.price;
                const amountInCents = price * 100;

                // Generate unique reference
                const reference = `REG-${user.referralCode}-${Date.now()}`;

                // Prepare Yoco checkout payload
                const baseUrl = req.protocol + '://' + req.get('host');
                const payload = {
                    amount: amountInCents,
                    currency: 'ZAR',
                    successUrl: `${baseUrl}/payment-success-register.html?ref=${reference}&userId=${user._id}`,
                    cancelUrl: `${baseUrl}/register.html`,
                    failureUrl: `${baseUrl}/payment-failed.html?ref=${reference}`,
                    metadata: {
                        userId: user._id.toString(),
                        email: user.email,
                        tier: selectedTier,
                        tier_name: tierInfo.name,
                        reference: reference,
                        type: 'registration'
                    }
                };

                // Make API request to Yoco
                const yocoResponse = await fetch(YOCO_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (yocoResponse.ok) {
                    const yocoData = await yocoResponse.json();

                    if (yocoData.redirectUrl) {
                        // Store payment reference with user
                        user.paymentReference = reference;
                        await user.save();

                        // Add payment URL to response
                        response.data.paymentUrl = yocoData.redirectUrl;
                        response.data.paymentReference = reference;
                        response.message += ' Redirecting to payment gateway...';
                    } else {
                        console.error('No redirect URL from Yoco:', yocoData);
                        response.message += ' Payment gateway unavailable. Please contact support.';
                    }
                } else {
                    const errorData = await yocoResponse.json().catch(() => ({}));
                    console.error('Yoco API error:', yocoResponse.status, errorData);
                    response.message += ' Payment gateway unavailable. Please contact support.';
                }
            } catch (paymentError) {
                console.error('Payment setup error:', paymentError);
                response.message += ' Payment gateway unavailable. Please contact support.';
            }
        } else if (paymentMethod === 'cash') {
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

// Verify payment and update user status
router.post('/verify-payment', async (req, res) => {
    try {
        const { userId, paymentReference, status } = req.body;

        if (!userId || !paymentReference || !status) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update payment status
        user.paymentStatus = status;
        if (status === 'COMPLETED') {
            user.accountStatus = 'ACTIVE'; // Activate account on successful payment
        }

        await user.save();

        res.json({
            success: true,
            message: 'Payment status updated successfully',
            data: {
                userId: user._id,
                accountStatus: user.accountStatus,
                paymentStatus: user.paymentStatus
            }
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment'
        });
    }
});

module.exports = router;
// DEPLOYMENT TEST 1762032783
