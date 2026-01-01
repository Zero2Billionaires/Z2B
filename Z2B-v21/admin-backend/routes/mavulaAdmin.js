const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

// ============================================================================
// MAVULA ADMIN ROUTES - For granting/revoking access from admin panel
// ============================================================================

// GET /api/users/all - Get all users (for admin panel)
router.get('/all', verifyToken, async (req, res) => {
    try {
        const users = await User.find({})
            .select('z2bId fullName email tier mavulaAccess mavulaAccessType mavulaGrantedDate mavulaExpiryDate createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// GET /api/users/mavula-users - Get only users with MAVULA access
router.get('/mavula-users', verifyToken, async (req, res) => {
    try {
        const users = await User.find({ mavulaAccess: true })
            .select('z2bId fullName email tier mavulaAccessType mavulaGrantedDate mavulaExpiryDate mavulaGrantedBy mavulaAccessNotes')
            .sort({ mavulaGrantedDate: -1 });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error fetching MAVULA users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching MAVULA users'
        });
    }
});

// POST /api/users/grant-mavula-access - Grant MAVULA access to a user
router.post('/grant-mavula-access', verifyToken, async (req, res) => {
    try {
        const {
            userId,
            accessType, // PAID, GIFT, BETA, ADMIN
            subscriptionPlan, // MONTHLY, LIFETIME (for PAID)
            expiryDate,
            notes,
            sendCredentials
        } = req.body;

        if (!userId || !accessType) {
            return res.status(400).json({
                success: false,
                message: 'User ID and access type are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user already has access
        if (user.mavulaAccess) {
            return res.status(400).json({
                success: false,
                message: 'User already has MAVULA access'
            });
        }

        // Update user with MAVULA access
        user.mavulaAccess = true;
        user.mavulaAccessType = accessType;
        user.mavulaSubscriptionPlan = subscriptionPlan || null;
        user.mavulaGrantedDate = new Date();
        user.mavulaExpiryDate = expiryDate ? new Date(expiryDate) : null;
        user.mavulaGrantedBy = req.admin._id || req.admin.userId;
        user.mavulaAccessNotes = notes || '';

        await user.save();

        // Send credentials if requested
        if (sendCredentials) {
            // TODO: Implement email/WhatsApp sending
            // await sendMavulaCredentials(user);
            console.log(`✉️ Credentials should be sent to: ${user.email} / ${user.phone}`);
        }

        res.json({
            success: true,
            message: 'MAVULA access granted successfully',
            user: {
                z2bId: user.z2bId,
                fullName: user.fullName,
                email: user.email,
                mavulaAccessType: user.mavulaAccessType
            }
        });

    } catch (error) {
        console.error('Error granting MAVULA access:', error);
        res.status(500).json({
            success: false,
            message: 'Error granting MAVULA access'
        });
    }
});

// POST /api/users/revoke-mavula-access - Revoke MAVULA access
router.post('/revoke-mavula-access', verifyToken, async (req, res) => {
    try {
        const { userId, reason } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.mavulaAccess) {
            return res.status(400).json({
                success: false,
                message: 'User does not have MAVULA access'
            });
        }

        // Revoke access
        user.mavulaAccess = false;
        user.mavulaRevokedDate = new Date();
        user.mavulaRevokedBy = req.admin._id || req.admin.userId;
        user.mavulaRevocationReason = reason || 'Not specified';

        await user.save();

        // TODO: Send notification to user about revocation

        res.json({
            success: true,
            message: 'MAVULA access revoked successfully'
        });

    } catch (error) {
        console.error('Error revoking MAVULA access:', error);
        res.status(500).json({
            success: false,
            message: 'Error revoking MAVULA access'
        });
    }
});

// GET /api/payments/pending-mavula - Get pending MAVULA payment approvals
router.get('/pending-mavula', verifyToken, async (req, res) => {
    try {
        // This would fetch from a MavulaPayment model or similar
        // For now, return empty array as placeholder

        // TODO: Create MavulaPayment model and implement this
        const pendingPayments = [];

        res.json({
            success: true,
            payments: pendingPayments
        });

    } catch (error) {
        console.error('Error fetching pending payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending payments'
        });
    }
});

// POST /api/payments/approve-mavula - Approve payment and grant access
router.post('/approve-mavula', verifyToken, async (req, res) => {
    try {
        const { paymentId, userId } = req.body;

        if (!paymentId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID and User ID are required'
            });
        }

        // TODO: Implement payment approval logic
        // 1. Find payment record
        // 2. Mark as approved
        // 3. Grant MAVULA access to user
        // 4. Send credentials to user

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Grant access
        user.mavulaAccess = true;
        user.mavulaAccessType = 'PAID';
        user.mavulaSubscriptionPlan = 'MONTHLY'; // or LIFETIME based on payment
        user.mavulaGrantedDate = new Date();
        user.mavulaGrantedBy = req.admin._id || req.admin.userId;
        user.mavulaAccessNotes = `Payment approved (ID: ${paymentId})`;

        await user.save();

        // TODO: Send credentials to user

        res.json({
            success: true,
            message: 'Payment approved and MAVULA access granted'
        });

    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving payment'
        });
    }
});

// POST /api/payments/reject-mavula - Reject payment
router.post('/reject-mavula', verifyToken, async (req, res) => {
    try {
        const { paymentId, reason } = req.body;

        if (!paymentId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID and reason are required'
            });
        }

        // TODO: Implement payment rejection logic
        // 1. Find payment record
        // 2. Mark as rejected with reason
        // 3. Notify user

        res.json({
            success: true,
            message: 'Payment rejected successfully'
        });

    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting payment'
        });
    }
});

module.exports = router;
