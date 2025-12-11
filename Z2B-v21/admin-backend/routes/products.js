const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const MarketplaceProduct = require('../models/MarketplaceProduct');

// ============================================================================
// MARKETPLACE PRODUCT MANAGEMENT ROUTES
// ============================================================================

// GET /api/products - Get all active products
router.get('/', async (req, res) => {
    try {
        const products = await MarketplaceProduct.find({
            isActive: true,
            isVisible: true
        })
        .sort({ sortOrder: 1, productName: 1 })
        .select('-__v');

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

// GET /api/products/all - Get all products (including inactive) - Admin only
router.get('/all', verifyToken, async (req, res) => {
    try {
        const products = await MarketplaceProduct.find({})
            .sort({ sortOrder: 1, productName: 1 })
            .select('-__v');

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

// POST /api/products - Create new product
router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            productId,
            productName,
            productSlug,
            icon,
            color,
            description,
            category,
            pricing,
            accessTypes,
            defaultAccessType,
            sortOrder
        } = req.body;

        // Check if product already exists
        const existing = await MarketplaceProduct.findOne({ productId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Product with this ID already exists'
            });
        }

        const product = new MarketplaceProduct({
            productId,
            productName,
            productSlug,
            icon: icon || '📦',
            color: color || '#6B7280',
            description,
            category: category || 'AI_APP',
            pricing,
            accessTypes: accessTypes || ['PAID', 'GIFT', 'BETA', 'ADMIN', 'FREE'],
            defaultAccessType: defaultAccessType || 'PAID',
            sortOrder: sortOrder || 0,
            createdBy: req.admin._id || req.admin.userId
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating product'
        });
    }
});

// PUT /api/products/:id - Update product
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const product = await MarketplaceProduct.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
});

// DELETE /api/products/:id - Soft delete (set inactive)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const product = await MarketplaceProduct.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deactivated successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
});

// POST /api/products/seed - Seed initial products from marketplace
router.post('/seed', verifyToken, async (req, res) => {
    try {
        const initialProducts = [
            { productId: 'coach-manlaw', productName: 'Coach Manlaw', productSlug: 'coach-manlaw', icon: '🎓', color: '#9333EA', description: 'AI Billionaire Coach', category: 'AI_APP', pricing: { payAsYouGo: 499 }, sortOrder: 1 },
            { productId: 'glowie', productName: 'GLOWIE', productSlug: 'glowie', icon: '✨', color: '#EC4899', description: 'AI App Builder', category: 'AI_APP', pricing: { payAsYouGo: 799 }, sortOrder: 2 },
            { productId: 'benown', productName: 'BENOWN', productSlug: 'benown', icon: '📊', color: '#F59E0B', description: 'AI Content Creator', category: 'AI_APP', pricing: { payAsYouGo: 599 }, sortOrder: 3 },
            { productId: 'zyra', productName: 'ZYRA', productSlug: 'zyra', icon: '💼', color: '#10B981', description: 'AI Sales Agent', category: 'AI_APP', pricing: { monthly: 699 }, sortOrder: 4 },
            { productId: 'zynth', productName: 'ZYNTH', productSlug: 'zynth', icon: '🎵', color: '#8B5CF6', description: 'AI Voice Cloning', category: 'AI_APP', pricing: { payAsYouGo: 699 }, sortOrder: 5 },
            { productId: 'vidzie', productName: 'VIDZIE', productSlug: 'vidzie', icon: '🎬', color: '#EF4444', description: 'AI Video Creator', category: 'AI_APP', pricing: { payAsYouGo: 899 }, sortOrder: 6 },
            { productId: 'captionpro', productName: 'CaptionPro', productSlug: 'captionpro', icon: '💬', color: '#3B82F6', description: 'AI Video Captions & Auto-Cut', category: 'TOOL', pricing: { payAsYouGo: 299 }, sortOrder: 7 },
            { productId: 'zyro', productName: 'ZYRO', productSlug: 'zyro', icon: '🎯', color: '#06B6D4', description: 'Gamification Hub', category: 'AI_APP', pricing: { payAsYouGo: 399 }, sortOrder: 8 },
            { productId: 'zynect', productName: 'ZYNECT', productSlug: 'zynect', icon: '🔗', color: '#14B8A6', description: 'Complete CRM', category: 'AI_APP', pricing: { payAsYouGo: 999 }, sortOrder: 9 },
            { productId: 'mavula', productName: 'MAVULA', productSlug: 'mavula', icon: '🤖', color: '#7C3AED', description: 'AI Prospecting Automation', category: 'AI_APP', pricing: { monthly: 497, lifetime: 2997 }, sortOrder: 10 },
            { productId: 'video-creator-tools', productName: 'Video Creator Tools', productSlug: 'video-creator-tools', icon: '🎥', color: '#F97316', description: 'Professional suite with 100 AI Fuel', category: 'TOOL', pricing: { payAsYouGo: 399 }, sortOrder: 11 },
            { productId: 'zyronic-suite', productName: 'Zyronic Suite Enterprise', productSlug: 'zyronic-suite', icon: '🏢', color: '#0EA5E9', description: '8 AI Apps with white-label rights', category: 'SUITE', pricing: { monthly: 19980 }, sortOrder: 12 }
        ];

        let created = 0;
        let skipped = 0;

        for (const productData of initialProducts) {
            const existing = await MarketplaceProduct.findOne({ productId: productData.productId });
            if (!existing) {
                await MarketplaceProduct.create({
                    ...productData,
                    createdBy: req.admin._id || req.admin.userId
                });
                created++;
            } else {
                skipped++;
            }
        }

        res.json({
            success: true,
            message: `Seeded ${created} products (${skipped} already existed)`,
            created,
            skipped
        });
    } catch (error) {
        console.error('Error seeding products:', error);
        res.status(500).json({
            success: false,
            message: 'Error seeding products'
        });
    }
});

module.exports = router;
