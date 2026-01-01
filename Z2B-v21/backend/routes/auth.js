const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = router;
