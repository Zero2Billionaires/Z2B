import express from 'express';
import AppGeneration from '../models/AppGeneration.js';
import UserSettings from '../models/UserSettings.js';
import glowieAI from '../services/glowieAI.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/glowie/generate
 * @desc    Generate a new app using AI
 * @access  Private
 */
router.post('/generate', async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            description,
            appType = 'landing',
            features = {},
            colorScheme = 'z2b',
            useOwnKey = false,
            apiKey: providedApiKey
        } = req.body;

        // Validate required fields
        if (!description || description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Description must be at least 10 characters long'
            });
        }

        if (description.length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Description cannot exceed 2000 characters. Please shorten your description.'
            });
        }

        // Get or create user settings
        const userSettings = await UserSettings.getOrCreate(userId);

        // Check generation limit
        if (!userSettings.canGenerate()) {
            return res.status(429).json({
                success: false,
                message: `Monthly generation limit reached. Limit resets on ${userSettings.glowie.resetDate.toLocaleDateString()}.`,
                monthlyLimit: userSettings.glowie.monthlyLimit,
                monthlyUsage: userSettings.glowie.monthlyUsage
            });
        }

        // Use system-wide API key from environment (set by admin)
        const apiKey = process.env.CLAUDE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: 'AI service not configured. Please contact administrator.'
            });
        }

        // Create initial app generation record
        const appGen = new AppGeneration({
            userId,
            description,
            appType,
            features: {
                mobile: features.mobile !== false,
                darkMode: features.darkMode === true,
                localStorage: features.localStorage !== false,
                animations: features.animations === true,
                icons: features.icons !== false,
                modern: features.modern !== false
            },
            colorScheme,
            status: 'generating'
        });

        await appGen.save();

        // Generate the app with AI
        const result = await glowieAI.generateApp({
            description,
            appType,
            features: appGen.features,
            colorScheme,
            apiKey
        });

        if (!result.success) {
            // Update status to failed
            appGen.status = 'failed';
            appGen.errorMessage = result.error;
            await appGen.save();

            return res.status(500).json({
                success: false,
                message: 'Failed to generate app',
                error: result.error
            });
        }

        // Update app generation with results
        appGen.appName = result.appName;
        appGen.generatedCode = result.code;
        appGen.generationTime = result.generationTime;
        appGen.aiModel = result.model;
        appGen.promptUsed = result.promptUsed;
        appGen.tokensUsed = result.tokensUsed;
        appGen.tags = result.tags;
        appGen.status = 'completed';

        await appGen.save();

        // Increment user's generation count
        await userSettings.incrementGenerations();

        // Return response without full code (code can be fetched separately)
        res.status(201).json({
            success: true,
            message: 'App generated successfully!',
            data: {
                appId: appGen._id,
                appName: appGen.appName,
                appType: appGen.appType,
                generationTime: appGen.generationTime,
                codeSize: appGen.codeSize,
                tags: appGen.tags,
                createdAt: appGen.createdAt,
                remainingGenerations: userSettings.glowie.remainingGenerations
            }
        });

    } catch (error) {
        console.error('Generate app error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating app',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/glowie/app/:appId
 * @desc    Get a generated app by ID
 * @access  Private
 */
router.get('/app/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user._id;

        const app = await AppGeneration.findById(appId);

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'App not found'
            });
        }

        // Check if user owns the app or if it's public
        if (app.userId.toString() !== userId.toString() && !app.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Increment views
        if (app.userId.toString() !== userId.toString()) {
            await app.incrementViews();
        }

        res.json({
            success: true,
            data: app
        });

    } catch (error) {
        console.error('Get app error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/glowie/app/:appId/code
 * @desc    Get the generated code for an app
 * @access  Private
 */
router.get('/app/:appId/code', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user._id;

        const app = await AppGeneration.findById(appId);

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'App not found'
            });
        }

        // Check if user owns the app or if it's public
        if (app.userId.toString() !== userId.toString() && !app.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: {
                code: app.generatedCode,
                appName: app.appName
            }
        });

    } catch (error) {
        console.error('Get code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/glowie/app/:appId/download
 * @desc    Track app download
 * @access  Private
 */
router.post('/app/:appId/download', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user._id;

        const app = await AppGeneration.findById(appId);

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'App not found'
            });
        }

        // Check if user owns the app or if it's public
        if (app.userId.toString() !== userId.toString() && !app.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Increment downloads
        await app.incrementDownloads();

        res.json({
            success: true,
            message: 'Download tracked',
            data: {
                downloads: app.downloads
            }
        });

    } catch (error) {
        console.error('Download tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/glowie/apps
 * @desc    Get all apps for the authenticated user
 * @access  Private
 */
router.get('/apps', async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            page = 1,
            limit = 10,
            appType,
            status = 'completed',
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = { userId };

        // Filter by app type if specified
        if (appType) {
            query.appType = appType;
        }

        // Filter by status if specified
        if (status) {
            query.status = status;
        }

        const sortOrder = order === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortOrder };

        const apps = await AppGeneration.find(query)
            .select('-generatedCode -promptUsed') // Exclude large fields
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await AppGeneration.countDocuments(query);

        res.json({
            success: true,
            data: apps,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get apps error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/glowie/app/:appId
 * @desc    Delete an app
 * @access  Private
 */
router.delete('/app/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user._id;

        const app = await AppGeneration.findById(appId);

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'App not found'
            });
        }

        // Check if user owns the app
        if (app.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Soft delete by updating status
        app.status = 'deleted';
        await app.save();

        res.json({
            success: true,
            message: 'App deleted successfully'
        });

    } catch (error) {
        console.error('Delete app error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/glowie/app/:appId
 * @desc    Update app details (name, rating, etc.)
 * @access  Private
 */
router.put('/app/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user._id;
        const { appName, userRating, feedback, isPublic, tags } = req.body;

        const app = await AppGeneration.findById(appId);

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'App not found'
            });
        }

        // Check if user owns the app
        if (app.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Update fields
        if (appName) app.appName = appName;
        if (userRating) app.userRating = userRating;
        if (feedback) app.feedback = feedback;
        if (typeof isPublic === 'boolean') app.isPublic = isPublic;
        if (tags && Array.isArray(tags)) app.tags = tags;

        await app.save();

        res.json({
            success: true,
            message: 'App updated successfully',
            data: app
        });

    } catch (error) {
        console.error('Update app error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/glowie/app/:appId/share
 * @desc    Generate a shareable link for an app
 * @access  Private
 */
router.post('/app/:appId/share', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user._id;

        const app = await AppGeneration.findById(appId);

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'App not found'
            });
        }

        // Check if user owns the app
        if (app.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Generate share link if not exists
        if (!app.shareLink) {
            await app.generateShareLink();
        }

        res.json({
            success: true,
            data: {
                shareLink: app.shareLink,
                shareUrl: `${req.protocol}://${req.get('host')}/shared/${app.shareLink}`
            }
        });

    } catch (error) {
        console.error('Share app error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/glowie/settings
 * @desc    Get user's Glowie settings
 * @access  Private
 */
router.get('/settings', async (req, res) => {
    try {
        const userId = req.user._id;
        const settings = await UserSettings.getOrCreate(userId);

        res.json({
            success: true,
            data: {
                hasClaudeKey: !!settings.glowie?.claudeApiKey,
                hasOpenAIKey: !!settings.glowie?.openaiApiKey,
                defaultAppType: settings.glowie?.defaultAppType,
                defaultColorScheme: settings.glowie?.defaultColorScheme,
                defaultFeatures: settings.glowie?.defaultFeatures,
                generationsCount: settings.glowie?.generationsCount,
                monthlyLimit: settings.glowie?.monthlyLimit,
                monthlyUsage: settings.glowie?.monthlyUsage,
                remainingGenerations: settings.glowie?.remainingGenerations,
                resetDate: settings.glowie?.resetDate
            }
        });

    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/glowie/settings
 * @desc    Update user's Glowie settings
 * @access  Private
 */
router.put('/settings', async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            claudeApiKey,
            openaiApiKey,
            defaultAppType,
            defaultColorScheme,
            defaultFeatures
        } = req.body;

        const settings = await UserSettings.getOrCreate(userId);

        // Update API keys if provided
        if (claudeApiKey) {
            await settings.updateApiKey('claude', claudeApiKey);
        }

        if (openaiApiKey) {
            await settings.updateApiKey('openai', openaiApiKey);
        }

        // Update preferences
        if (defaultAppType) {
            settings.glowie.defaultAppType = defaultAppType;
        }

        if (defaultColorScheme) {
            settings.glowie.defaultColorScheme = defaultColorScheme;
        }

        if (defaultFeatures) {
            settings.glowie.defaultFeatures = {
                ...settings.glowie.defaultFeatures,
                ...defaultFeatures
            };
        }

        await settings.save();

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: {
                hasClaudeKey: !!settings.glowie?.claudeApiKey,
                hasOpenAIKey: !!settings.glowie?.openaiApiKey,
                defaultAppType: settings.glowie?.defaultAppType,
                defaultColorScheme: settings.glowie?.defaultColorScheme,
                defaultFeatures: settings.glowie?.defaultFeatures
            }
        });

    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/glowie/stats
 * @desc    Get user's generation statistics
 * @access  Private
 */
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await AppGeneration.getUserStats(userId);
        const settings = await UserSettings.getOrCreate(userId);

        res.json({
            success: true,
            data: {
                ...stats,
                monthlyLimit: settings.glowie.monthlyLimit,
                monthlyUsage: settings.glowie.monthlyUsage,
                remainingGenerations: settings.glowie.remainingGenerations
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/glowie/popular
 * @desc    Get popular public apps
 * @access  Private
 */
router.get('/popular', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const apps = await AppGeneration.getPopularApps(parseInt(limit));

        res.json({
            success: true,
            data: apps
        });

    } catch (error) {
        console.error('Get popular apps error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

export default router;
