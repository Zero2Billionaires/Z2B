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
