import express from 'express';
import VideoTemplate from '../models/VideoTemplate.js';
import VideoGeneration from '../models/VideoGeneration.js';
import didService from '../services/didService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All template routes require authentication
router.use(protect);

// Get all templates (with filters)
router.get('/templates', async (req, res) => {
    try {
        const {
            category,
            featured,
            premium,
            search,
            sort = 'popular',
            limit = 50
        } = req.query;

        let templates;

        if (search) {
            // Search templates
            templates = await VideoTemplate.searchTemplates(search, {
                category,
                limit: parseInt(limit)
            });
        } else if (featured === 'true') {
            // Get featured templates
            templates = await VideoTemplate.getFeatured(parseInt(limit));
        } else if (category) {
            // Get by category
            templates = await VideoTemplate.getByCategory(category, {
                premiumOnly: premium === 'true',
                limit: parseInt(limit)
            });
        } else {
            // Get all active templates
            const query = { isActive: true };
            if (premium === 'true') query.isPremium = true;

            let sortOption = {};
            switch (sort) {
                case 'popular':
                    sortOption = { usageCount: -1 };
                    break;
                case 'rating':
                    sortOption = { 'rating.average': -1 };
                    break;
                case 'newest':
                    sortOption = { createdAt: -1 };
                    break;
                case 'alphabetical':
                    sortOption = { name: 1 };
                    break;
                default:
                    sortOption = { featured: -1, order: 1 };
            }

            templates = await VideoTemplate.find(query)
                .sort(sortOption)
                .limit(parseInt(limit));
        }

        res.json({
            success: true,
            data: {
                templates,
                count: templates.length
            }
        });

    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch templates',
            error: error.message
        });
    }
});

// Get template by ID
router.get('/templates/:templateId', async (req, res) => {
    try {
        const template = await VideoTemplate.findOne({
            _id: req.params.templateId,
            isActive: true
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.json({
            success: true,
            data: { template }
        });

    } catch (error) {
        console.error('Get template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch template',
            error: error.message
        });
    }
});

// Get templates by category
router.get('/templates/category/:category', async (req, res) => {
    try {
        const templates = await VideoTemplate.getByCategory(req.params.category, {
            limit: parseInt(req.query.limit) || 50
        });

        res.json({
            success: true,
            data: {
                templates,
                category: req.params.category,
                count: templates.length
            }
        });

    } catch (error) {
        console.error('Get category templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category templates',
            error: error.message
        });
    }
});

// Get popular templates
router.get('/popular-templates', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const templates = await VideoTemplate.getPopular(limit);

        res.json({
            success: true,
            data: {
                templates,
                count: templates.length
            }
        });

    } catch (error) {
        console.error('Get popular templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular templates',
            error: error.message
        });
    }
});

// Get top-rated templates
router.get('/top-rated-templates', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const templates = await VideoTemplate.getTopRated(limit);

        res.json({
            success: true,
            data: {
                templates,
                count: templates.length
            }
        });

    } catch (error) {
        console.error('Get top-rated templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top-rated templates',
            error: error.message
        });
    }
});

// Generate video from template
router.post('/generate-from-template', async (req, res) => {
    try {
        const {
            templateId,
            placeholderValues,
            sourceImage,
            videoName,
            customSettings
        } = req.body;

        // Validate required fields
        if (!templateId || !sourceImage) {
            return res.status(400).json({
                success: false,
                message: 'Template ID and source image are required'
            });
        }

        // Get template
        const template = await VideoTemplate.findOne({
            _id: templateId,
            isActive: true
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Validate placeholder values
        const validationErrors = template.validatePlaceholders(placeholderValues || {});
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid placeholder values',
                errors: validationErrors
            });
        }

        // Fill template with values
        const script = template.fillTemplate(placeholderValues || {});

        // Merge template defaults with custom settings
        const settings = {
            ...template.defaults,
            ...customSettings
        };

        // Create D-ID talk
        const didResult = await didService.createTalkWithRetry({
            sourceImage,
            script,
            voiceId: settings.voiceId,
            voiceType: 'microsoft',
            config: {
                result_format: settings.resolution === 'FHD' ? '1920x1080' :
                               settings.resolution === 'HD' ? '1280x720' : '640x480'
            }
        });

        if (!didResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to start video generation',
                error: didResult.error
            });
        }

        // Create video generation record
        const videoGeneration = new VideoGeneration({
            userId: req.user._id,
            videoName: videoName || `${template.name} Video`,
            description: `Generated from template: ${template.name}`,
            videoType: template.videoType,
            purpose: 'standalone',
            templateId: template._id,
            did: {
                sourceImage,
                script,
                voice: {
                    voiceId: settings.voiceId,
                    language: 'en-US',
                    gender: settings.voiceGender,
                    style: settings.voiceStyle
                },
                talkId: didResult.talkId,
                settings: {
                    background: settings.background,
                    resolution: settings.resolution
                }
            },
            status: 'processing',
            progress: 0
        });

        await videoGeneration.save();

        // Increment template usage
        await template.incrementUsage();

        res.status(201).json({
            success: true,
            message: 'Video generation started from template',
            data: {
                videoId: videoGeneration._id,
                templateId: template._id,
                templateName: template.name,
                talkId: didResult.talkId,
                status: 'processing',
                estimatedTime: '10-30 seconds'
            }
        });

    } catch (error) {
        console.error('Generate from template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate video from template',
            error: error.message
        });
    }
});

// Preview template script (fill placeholders without generating)
router.post('/templates/:templateId/preview', async (req, res) => {
    try {
        const template = await VideoTemplate.findOne({
            _id: req.params.templateId,
            isActive: true
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        const { placeholderValues } = req.body;

        // Validate placeholders
        const validationErrors = template.validatePlaceholders(placeholderValues || {});

        // Fill template
        const previewScript = template.fillTemplate(placeholderValues || {});

        res.json({
            success: true,
            data: {
                script: previewScript,
                characterCount: previewScript.length,
                validationErrors,
                isValid: validationErrors.length === 0
            }
        });

    } catch (error) {
        console.error('Preview template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to preview template',
            error: error.message
        });
    }
});

// Rate template
router.post('/templates/:templateId/rate', async (req, res) => {
    try {
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const template = await VideoTemplate.findById(req.params.templateId);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        await template.addRating(rating);

        res.json({
            success: true,
            message: 'Template rated successfully',
            data: {
                newAverage: template.rating.average,
                totalRatings: template.rating.count
            }
        });

    } catch (error) {
        console.error('Rate template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to rate template',
            error: error.message
        });
    }
});

// Get template categories
router.get('/template-categories', async (req, res) => {
    try {
        const categories = await VideoTemplate.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating.average' },
                    totalUsage: { $sum: '$usageCount' }
                }
            },
            { $sort: { totalUsage: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                categories: categories.map(cat => ({
                    name: cat._id,
                    count: cat.count,
                    averageRating: cat.avgRating,
                    totalUsage: cat.totalUsage
                }))
            }
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
});

// Admin: Create new template (admin only)
router.post('/admin/templates', async (req, res) => {
    try {
        // TODO: Add admin check middleware
        // if (!req.user.isAdmin) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Admin access required'
        //     });
        // }

        const templateData = {
            ...req.body,
            createdBy: req.user._id
        };

        const template = new VideoTemplate(templateData);
        await template.save();

        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: { template }
        });

    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.message
        });
    }
});

// Admin: Update template (admin only)
router.put('/admin/templates/:templateId', async (req, res) => {
    try {
        // TODO: Add admin check middleware

        const template = await VideoTemplate.findByIdAndUpdate(
            req.params.templateId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.json({
            success: true,
            message: 'Template updated successfully',
            data: { template }
        });

    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update template',
            error: error.message
        });
    }
});

// Admin: Delete template (admin only)
router.delete('/admin/templates/:templateId', async (req, res) => {
    try {
        // TODO: Add admin check middleware

        const template = await VideoTemplate.findByIdAndUpdate(
            req.params.templateId,
            { isActive: false },
            { new: true }
        );

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.json({
            success: true,
            message: 'Template deactivated successfully'
        });

    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete template',
            error: error.message
        });
    }
});

export default router;
