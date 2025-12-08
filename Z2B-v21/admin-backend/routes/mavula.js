const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/auth');

// Services
const MavulaContentProcessor = require('../services/MavulaContentProcessor');

// Models
const MavulaProspect = require('../models/MavulaProspect');
const MavulaConversation = require('../models/MavulaConversation');
const MavulaContentLibrary = require('../models/MavulaContentLibrary');
const MavulaUserSettings = require('../models/MavulaUserSettings');
const MavulaDailyActivity = require('../models/MavulaDailyActivity');
const MavulaAutomationJob = require('../models/MavulaAutomationJob');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/mavula-content/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'content-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// ===================================================================
// PROSPECT MANAGEMENT ROUTES
// ===================================================================

// GET /api/mavula/prospects - Get all prospects for user (with filters)
router.get('/prospects', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const {
            temperature,
            stage,
            converted,
            search,
            page = 1,
            limit = 20,
            sortBy = 'leadScore', // leadScore, createdAt, lastContactDate
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = { userId };

        if (temperature) {
            query.leadTemperature = temperature;
        }

        if (stage) {
            query.conversationStage = stage;
        }

        if (converted !== undefined) {
            query.isConverted = converted === 'true';
        }

        if (search) {
            query.$or = [
                { prospectName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const prospects = await MavulaProspect.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await MavulaProspect.countDocuments(query);

        res.json({
            success: true,
            prospects,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching prospects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/prospects/:id - Get single prospect
router.get('/prospects/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const prospect = await MavulaProspect.findOne({
            _id: req.params.id,
            userId
        });

        if (!prospect) {
            return res.status(404).json({ success: false, message: 'Prospect not found' });
        }

        res.json({ success: true, prospect });
    } catch (error) {
        console.error('Error fetching prospect:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/mavula/prospects - Add new prospect manually
router.post('/prospects', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { prospectName, phone, email, source = 'MANUAL', tags, notes } = req.body;

        // Validate required fields
        if (!prospectName || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Prospect name and phone are required'
            });
        }

        // Check for duplicate (same phone number for this user)
        const existing = await MavulaProspect.findOne({ userId, phone });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Prospect with this phone number already exists'
            });
        }

        // Create prospect
        const prospect = new MavulaProspect({
            userId,
            prospectName,
            phone,
            email,
            source,
            tags,
            notes,
            leadScore: 30, // Default score
            leadTemperature: 'COLD',
            conversationStage: 'INITIAL_CONTACT',
            automationEnabled: true,
            consentGiven: true,
            consentDate: new Date(),
            consentSource: source
        });

        await prospect.save();

        // Create conversation record
        await MavulaConversation.createForProspect(prospect._id, userId);

        // Update daily activity
        const todayActivity = await MavulaDailyActivity.getTodayActivity(userId);
        await todayActivity.updateAchievements({ prospectsAdded: 1 });

        res.status(201).json({ success: true, prospect });
    } catch (error) {
        console.error('Error creating prospect:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/mavula/prospects/bulk - Bulk import prospects
router.post('/prospects/bulk', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { prospects } = req.body; // Array of { prospectName, phone, email }

        if (!Array.isArray(prospects) || prospects.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Prospects array is required'
            });
        }

        const results = {
            success: 0,
            failed: 0,
            duplicates: 0,
            errors: []
        };

        for (const prospectData of prospects) {
            try {
                // Check for duplicate
                const existing = await MavulaProspect.findOne({
                    userId,
                    phone: prospectData.phone
                });

                if (existing) {
                    results.duplicates++;
                    continue;
                }

                // Create prospect
                const prospect = new MavulaProspect({
                    userId,
                    prospectName: prospectData.prospectName,
                    phone: prospectData.phone,
                    email: prospectData.email,
                    source: 'IMPORT',
                    leadScore: 30,
                    leadTemperature: 'COLD',
                    conversationStage: 'INITIAL_CONTACT',
                    automationEnabled: true,
                    consentGiven: true,
                    consentDate: new Date(),
                    consentSource: 'IMPORT'
                });

                await prospect.save();
                await MavulaConversation.createForProspect(prospect._id, userId);
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({
                    prospect: prospectData,
                    error: err.message
                });
            }
        }

        // Update daily activity
        if (results.success > 0) {
            const todayActivity = await MavulaDailyActivity.getTodayActivity(userId);
            await todayActivity.updateAchievements({ prospectsAdded: results.success });
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error('Error bulk importing prospects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/mavula/prospects/:id - Update prospect
router.put('/prospects/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const prospect = await MavulaProspect.findOne({
            _id: req.params.id,
            userId
        });

        if (!prospect) {
            return res.status(404).json({ success: false, message: 'Prospect not found' });
        }

        // Update allowed fields
        const allowedUpdates = [
            'prospectName', 'phone', 'email', 'tags', 'notes',
            'automationEnabled', 'conversationContext'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                prospect[field] = req.body[field];
            }
        });

        await prospect.save();

        res.json({ success: true, prospect });
    } catch (error) {
        console.error('Error updating prospect:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/mavula/prospects/:id - Delete prospect
router.delete('/prospects/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const prospect = await MavulaProspect.findOneAndDelete({
            _id: req.params.id,
            userId
        });

        if (!prospect) {
            return res.status(404).json({ success: false, message: 'Prospect not found' });
        }

        // Delete associated conversation
        await MavulaConversation.findOneAndDelete({ prospectId: prospect._id });

        // Cancel pending automation jobs
        await MavulaAutomationJob.cancelProspectJobs(prospect._id, 'Prospect deleted');

        res.json({ success: true, message: 'Prospect deleted successfully' });
    } catch (error) {
        console.error('Error deleting prospect:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===================================================================
// CONVERSATION ROUTES
// ===================================================================

// GET /api/mavula/conversations/:prospectId - Get conversation history
router.get('/conversations/:prospectId', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;

        // Verify prospect belongs to user
        const prospect = await MavulaProspect.findOne({
            _id: req.params.prospectId,
            userId
        });

        if (!prospect) {
            return res.status(404).json({ success: false, message: 'Prospect not found' });
        }

        const conversation = await MavulaConversation.findOne({
            prospectId: req.params.prospectId
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        res.json({ success: true, conversation, prospect });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/mavula/conversations/:prospectId/message - Send manual message
router.post('/conversations/:prospectId/message', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { content, messageType = 'TEXT' } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        // Verify prospect
        const prospect = await MavulaProspect.findOne({
            _id: req.params.prospectId,
            userId
        });

        if (!prospect) {
            return res.status(404).json({ success: false, message: 'Prospect not found' });
        }

        // Get conversation
        const conversation = await MavulaConversation.findOne({
            prospectId: req.params.prospectId
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Add message to conversation
        const messageData = {
            role: 'AI', // Manual messages sent by user appear as AI
            content,
            messageType,
            timestamp: new Date(),
            wasEdited: false,
            aiProvider: 'NONE' // Manual message, not AI-generated
        };

        await conversation.addMessage(messageData);

        // Update prospect
        prospect.lastContactDate = new Date();
        prospect.totalMessagesSent++;
        await prospect.save();

        // Update daily activity
        const todayActivity = await MavulaDailyActivity.getTodayActivity(userId);
        await todayActivity.updateAchievements({ messagesSent: 1 });

        res.json({ success: true, message: 'Message sent', conversation });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===================================================================
// SETTINGS ROUTES
// ===================================================================

// GET /api/mavula/settings - Get user settings
router.get('/settings', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;

        let settings = await MavulaUserSettings.findOne({ userId });

        // Initialize if not exists
        if (!settings) {
            settings = await MavulaUserSettings.initializeForUser(userId);
        }

        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/mavula/settings - Update settings
router.put('/settings', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;

        let settings = await MavulaUserSettings.findOne({ userId });

        if (!settings) {
            settings = await MavulaUserSettings.initializeForUser(userId);
        }

        // Update allowed fields
        const allowedUpdates = [
            'dailyProspectTarget', 'dailyConversionTarget',
            'automationEnabled', 'autoResponseEnabled', 'autoFollowUpEnabled',
            'communicationStyle', 'messagePersonalization',
            'activeHours', 'followUpSchedule', 'notifications'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        await settings.save();

        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===================================================================
// DASHBOARD & ANALYTICS ROUTES
// ===================================================================

// GET /api/mavula/dashboard - Get dashboard stats
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;

        // Get today's activity
        const todayActivity = await MavulaDailyActivity.getTodayActivity(userId);

        // Get prospect counts by temperature
        const prospectCounts = await MavulaProspect.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $group: {
                _id: '$leadTemperature',
                count: { $sum: 1 }
            }}
        ]);

        // Get total prospects
        const totalProspects = await MavulaProspect.countDocuments({ userId });

        // Get settings
        const settings = await MavulaUserSettings.findOne({ userId });

        // Format response
        const dashboard = {
            todayActivity: {
                targets: todayActivity.targets,
                achievements: todayActivity.achievements,
                progress: todayActivity.targetProgress,
                prospectsByStage: todayActivity.prospectsByStage,
                prospectsByTemperature: todayActivity.prospectsByTemperature
            },
            totalProspects,
            prospectCounts: prospectCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            weeklyProjection: todayActivity.weeklyProjection,
            settings: {
                automationEnabled: settings?.automationEnabled || false,
                dailyProspectTarget: settings?.dailyProspectTarget || 10,
                dailyConversionTarget: settings?.dailyConversionTarget || 1
            }
        };

        res.json({ success: true, dashboard });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/analytics/weekly - Get weekly projection
router.get('/analytics/weekly', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;

        const projection = await MavulaDailyActivity.calculateWeeklyProjection(userId);

        res.json({ success: true, projection });
    } catch (error) {
        console.error('Error calculating weekly projection:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===================================================================
// AUTOMATION CONTROL ROUTES
// ===================================================================

// POST /api/mavula/automation/start - Start automation
router.post('/automation/start', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;

        const settings = await MavulaUserSettings.findOne({ userId });
        if (!settings) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }

        settings.automationEnabled = true;
        settings.firstActivationDate = settings.firstActivationDate || new Date();
        await settings.save();

        res.json({ success: true, message: 'Automation started' });
    } catch (error) {
        console.error('Error starting automation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/mavula/automation/stop - Stop automation
router.post('/automation/stop', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;

        const settings = await MavulaUserSettings.findOne({ userId });
        if (!settings) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }

        settings.automationEnabled = false;
        await settings.save();

        res.json({ success: true, message: 'Automation stopped' });
    } catch (error) {
        console.error('Error stopping automation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

// ===================================================================
// SOCIAL MEDIA INTEGRATION ROUTES
// ===================================================================

const MavulaSocialImporter = require('../services/MavulaSocialImporter');

// GET /api/mavula/social/status - Get social connection status
router.get('/social/status', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const result = await MavulaSocialImporter.getConnectionStatus(userId);
        res.json(result);
    } catch (error) {
        console.error('Error getting social status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/social/facebook/auth - Get Facebook OAuth URL
router.get('/social/facebook/auth', verifyToken, (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const authURL = MavulaSocialImporter.getFacebookAuthURL(userId);
        res.json({ success: true, authURL });
    } catch (error) {
        console.error('Error generating Facebook auth URL:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/social/facebook/callback - Facebook OAuth callback
router.get('/social/facebook/callback', async (req, res) => {
    try {
        const { code, state: userId } = req.query;

        if (!code || !userId) {
            return res.status(400).send('Missing code or state parameter');
        }

        const result = await MavulaSocialImporter.handleFacebookCallback(code, userId);

        if (result.success) {
            res.send('<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h2>Facebook Connected Successfully!</h2><p>You can close this window.</p></body></html>');
        } else {
            res.status(400).send('<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h2>Connection Failed</h2><p>' + result.message + '</p></body></html>');
        }
    } catch (error) {
        console.error('Error in Facebook callback:', error);
        res.status(500).send('Internal server error');
    }
});

// POST /api/mavula/social/facebook/import - Import Facebook friends
router.post('/social/facebook/import', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const result = await MavulaSocialImporter.importFacebookFriends(userId);
        res.json(result);
    } catch (error) {
        console.error('Error importing Facebook friends:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/social/instagram/auth - Get Instagram OAuth URL
router.get('/social/instagram/auth', verifyToken, (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const authURL = MavulaSocialImporter.getInstagramAuthURL(userId);
        res.json({ success: true, authURL });
    } catch (error) {
        console.error('Error generating Instagram auth URL:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/social/instagram/callback - Instagram OAuth callback
router.get('/social/instagram/callback', async (req, res) => {
    try {
        const { code, state: userId } = req.query;

        if (!code || !userId) {
            return res.status(400).send('Missing code or state parameter');
        }

        const result = await MavulaSocialImporter.handleInstagramCallback(code, userId);

        if (result.success) {
            res.send('<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h2>Instagram Connected Successfully!</h2><p>You can close this window.</p></body></html>');
        } else {
            res.status(400).send('<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h2>Connection Failed</h2><p>' + result.message + '</p></body></html>');
        }
    } catch (error) {
        console.error('Error in Instagram callback:', error);
        res.status(500).send('Internal server error');
    }
});

// POST /api/mavula/social/instagram/import - Import Instagram followers
router.post('/social/instagram/import', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const result = await MavulaSocialImporter.importInstagramFollowers(userId);
        res.json(result);
    } catch (error) {
        console.error('Error importing Instagram followers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/social/tiktok/auth - Get TikTok OAuth URL
router.get('/social/tiktok/auth', verifyToken, (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const authURL = MavulaSocialImporter.getTikTokAuthURL(userId);
        res.json({ success: true, authURL });
    } catch (error) {
        console.error('Error generating TikTok auth URL:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/social/tiktok/callback - TikTok OAuth callback
router.get('/social/tiktok/callback', async (req, res) => {
    try {
        const { code, state: userId } = req.query;

        if (!code || !userId) {
            return res.status(400).send('Missing code or state parameter');
        }

        const result = await MavulaSocialImporter.handleTikTokCallback(code, userId);

        if (result.success) {
            res.send('<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h2>TikTok Connected Successfully!</h2><p>You can close this window.</p></body></html>');
        } else {
            res.status(400).send('<html><body style="font-family: Arial; text-align: center; padding: 50px;"><h2>Connection Failed</h2><p>' + result.message + '</p></body></html>');
        }
    } catch (error) {
        console.error('Error in TikTok callback:', error);
        res.status(500).send('Internal server error');
    }
});

// POST /api/mavula/social/:platform/disconnect - Disconnect social media
router.post('/social/:platform/disconnect', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { platform } = req.params;

        const validPlatforms = ['facebook', 'instagram', 'tiktok'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid platform'
            });
        }

        const result = await MavulaSocialImporter.disconnectSocial(userId, platform);
        res.json(result);
    } catch (error) {
        console.error('Error disconnecting social:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// ===================================================================
// CONTENT MANAGEMENT ROUTES
// ===================================================================

// POST /api/mavula/content/upload-pdf - Upload and process PDF
router.post('/content/upload-pdf', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const metadata = {
            title: req.body.title,
            category: req.body.category,
            tags: req.body.tags ? JSON.parse(req.body.tags) : []
        };

        const result = await MavulaContentProcessor.processPDF(req.file, userId, metadata);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error uploading PDF:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/mavula/content/url - Process URL content
router.post('/content/url', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { url, title, category, tags } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL is required'
            });
        }

        const metadata = { title, category, tags };

        const result = await MavulaContentProcessor.processURL(url, userId, metadata);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error processing URL:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/mavula/content/text - Process text content
router.post('/content/text', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { text, title, category, tags } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text content is required'
            });
        }

        const metadata = { title, category, tags };

        const result = await MavulaContentProcessor.processText(text, userId, metadata);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error processing text:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/content - Get all content for user
router.get('/content', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { category, search, page = 1, limit = 20 } = req.query;

        const query = { userId };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { extractedText: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const content = await MavulaContentLibrary.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await MavulaContentLibrary.countDocuments(query);

        res.json({
            success: true,
            content,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/mavula/content/:id - Get single content
router.get('/content/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const content = await MavulaContentLibrary.findOne({
            _id: req.params.id,
            userId
        });

        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        res.json({ success: true, content });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/mavula/content/:id - Delete content
router.delete('/content/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const result = await MavulaContentProcessor.deleteContent(req.params.id, userId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/mavula/content/:id/share - Share content with team
router.patch('/content/:id/share', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const result = await MavulaContentProcessor.shareWithTeam(req.params.id, userId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error sharing content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

