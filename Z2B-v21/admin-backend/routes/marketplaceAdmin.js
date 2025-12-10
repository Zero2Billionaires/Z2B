const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

const MarketplaceProduct = require('../models/MarketplaceProduct');
// ============================================================================
// MARKETPLACE PRODUCT ACCESS ADMIN ROUTES
// For granting/revoking access to ALL marketplace products
// Products: MAVULA, ZYRO, ZYRA, BENOWN, GLOWIE, VIDZIE, ZYNTH, ZYNECT
// ============================================================================


// GET /api/users/all - Get all users (for admin panel)
router.get('/all', verifyToken, async (req, res) => {
    try {
        const users = await User.find({})
            .select('z2bId fullName email tier marketplaceAccess createdAt')
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

// GET /api/users/product-access/:productId - Get users with access to specific product
router.get('/product-access/:productId', verifyToken, async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate product exists in database
        const product = await MarketplaceProduct.findOne({ productId, isActive: true });
        if (!product) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or inactive product ID'
            });
        }

        const queryField = `marketplaceAccess.${productId}.hasAccess`;
        const query = {};
        query[queryField] = true;

        const users = await User.find(query)
            .select(`z2bId fullName email tier marketplaceAccess.${productId}`)
            .sort({ [`marketplaceAccess.${productId}.grantedDate`]: -1 });

        res.json({
            success: true,
            productId,
            users
        });
    } catch (error) {
        console.error(`Error fetching ${req.params.productId} users:`, error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product users'
        });
    }
});

// GET /api/users/marketplace-stats - Get statistics for all products
router.get('/marketplace-stats', verifyToken, async (req, res) => {
    try {
        const stats = {};

        // Fetch all active products from database
        const products = await MarketplaceProduct.find({ isActive: true });

        for (const product of products) {
            const productId = product.productId;
            const queryField = `marketplaceAccess.${productId}.hasAccess`;
            const query = {};
            query[queryField] = true;

            const total = await User.countDocuments(query);

            // Count by access type
            const paidQuery = { ...query };
            paidQuery[`marketplaceAccess.${productId}.accessType`] = 'PAID';
            const paid = await User.countDocuments(paidQuery);

            const giftQuery = { ...query };
            giftQuery[`marketplaceAccess.${productId}.accessType`] = 'GIFT';
            const gift = await User.countDocuments(giftQuery);

            const betaQuery = { ...query };
            betaQuery[`marketplaceAccess.${productId}.accessType`] = 'BETA';
            const beta = await User.countDocuments(betaQuery);

            stats[productId] = {
                total,
                paid,
                gift,
                beta,
                free: gift + beta
            };
        }

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching marketplace stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// POST /api/users/grant-product-access - Grant access to a marketplace product
router.post('/grant-product-access', verifyToken, async (req, res) => {
    try {
        const {
            userId,
            productId,
            accessType, // PAID, GIFT, BETA, ADMIN, FREE
            subscriptionPlan, // MONTHLY, LIFETIME, PAY_AS_GO
            expiryDate,
            notes,
            sendCredentials
        } = req.body;

        if (!userId || !productId || !accessType) {
            return res.status(400).json({
                success: false,
                message: 'User ID, product ID, and access type are required'
            });
        }

        // Validate product exists in database
        const product = await MarketplaceProduct.findOne({ productId, isActive: true });
        if (!product) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or inactive product ID'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Initialize marketplaceAccess if it doesn't exist
        if (!user.marketplaceAccess) {
            user.marketplaceAccess = {};
        }
        if (!user.marketplaceAccess[productId]) {
            user.marketplaceAccess[productId] = {};
        }

        // Check if user already has access
        if (user.marketplaceAccess[productId].hasAccess) {
            return res.status(400).json({
                success: false,
                message: `User already has ${productId.toUpperCase()} access`
            });
        }

        // Grant access
        user.marketplaceAccess[productId] = {
            hasAccess: true,
            accessType,
            subscriptionPlan: subscriptionPlan || null,
            grantedDate: new Date(),
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            grantedBy: req.admin._id || req.admin.userId,
            notes: notes || ''
        };

        // Mark the field as modified (Mongoose subdocument requirement)
        user.markModified('marketplaceAccess');
        await user.save();

        // Send credentials if requested
        if (sendCredentials) {
            // TODO: Implement email/WhatsApp sending
            console.log(`✉️ ${productId.toUpperCase()} credentials should be sent to: ${user.email} / ${user.phone}`);
        }

        res.json({
            success: true,
            message: `${productId.toUpperCase()} access granted successfully`,
            user: {
                z2bId: user.z2bId,
                fullName: user.fullName,
                email: user.email,
                productId,
                accessType: user.marketplaceAccess[productId].accessType
            }
        });

    } catch (error) {
        console.error('Error granting product access:', error);
        res.status(500).json({
            success: false,
            message: 'Error granting product access'
        });
    }
});

// POST /api/users/revoke-product-access - Revoke product access
router.post('/revoke-product-access', verifyToken, async (req, res) => {
    try {
        const { userId, productId, reason } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and product ID are required'
            });
        }

        // Validate product exists in database
        const product = await MarketplaceProduct.findOne({ productId, isActive: true });
        if (!product) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or inactive product ID'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.marketplaceAccess || !user.marketplaceAccess[productId] || !user.marketplaceAccess[productId].hasAccess) {
            return res.status(400).json({
                success: false,
                message: `User does not have ${productId.toUpperCase()} access`
            });
        }

        // Revoke access
        user.marketplaceAccess[productId].hasAccess = false;
        user.marketplaceAccess[productId].revokedDate = new Date();
        user.marketplaceAccess[productId].revokedBy = req.admin._id || req.admin.userId;
        user.marketplaceAccess[productId].revocationReason = reason || 'Not specified';

        user.markModified('marketplaceAccess');
        await user.save();

        res.json({
            success: true,
            message: `${productId.toUpperCase()} access revoked successfully`
        });

    } catch (error) {
        console.error('Error revoking product access:', error);
        res.status(500).json({
            success: false,
            message: 'Error revoking product access'
        });
    }
});

// GET /api/payments/pending-marketplace - Get pending payment approvals (all products)
router.get('/pending-marketplace', verifyToken, async (req, res) => {
    try {
        // TODO: Create MarketplacePayment model and implement this
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

// POST /api/payments/approve-marketplace - Approve payment and grant access
router.post('/approve-marketplace', verifyToken, async (req, res) => {
    try {
        const { paymentId, userId, productId } = req.body;

        if (!paymentId || !userId || !productId) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID, User ID, and Product ID are required'
            });
        // Validate product exists in database
        const product = await MarketplaceProduct.findOne({ productId, isActive: true });
        if (!product) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or inactive product ID'
            });
        }
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Initialize marketplaceAccess if needed
        if (!user.marketplaceAccess) user.marketplaceAccess = {};
        if (!user.marketplaceAccess[productId]) user.marketplaceAccess[productId] = {};

        // Grant access
        user.marketplaceAccess[productId] = {
            hasAccess: true,
            accessType: 'PAID',
            subscriptionPlan: 'MONTHLY', // Determine from payment
            grantedDate: new Date(),
            grantedBy: req.admin._id || req.admin.userId,
            notes: `Payment approved (ID: ${paymentId})`
        };

        user.markModified('marketplaceAccess');
        await user.save();

        res.json({
            success: true,
            message: `Payment approved and ${productId.toUpperCase()} access granted`
        });

    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving payment'
        });
    }
});

// POST /api/payments/reject-marketplace - Reject payment
router.post('/reject-marketplace', verifyToken, async (req, res) => {
    try {
        const { paymentId, reason } = req.body;

        if (!paymentId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID and reason are required'
            });
        }

        // TODO: Implement payment rejection logic

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
