const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const MavulaAIService = require('../services/MavulaAIService');
const MavulaProspect = require('../models/MavulaProspect');
const MavulaConversation = require('../models/MavulaConversation');
const MavulaUserSettings = require('../models/MavulaUserSettings');
const User = require('../models/User');

// ===================================================================
// MESSAGE GENERATION ENDPOINTS
// ===================================================================

// POST /api/mavula/ai/generate-opener - Generate ice breaker
router.post('/generate-opener', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { prospectId } = req.body;

        if (!prospectId) {
            return res.status(400).json({
                success: false,
                message: 'Prospect ID is required'
            });
        }

        // Verify prospect belongs to user
        const prospect = await MavulaProspect.findOne({ _id: prospectId, userId });
        if (!prospect) {
            return res.status(404).json({
                success: false,
                message: 'Prospect not found'
            });
        }

        // Generate opener
        const result = await MavulaAIService.generateOpener(prospectId, userId);

        // Deduct AI fuel credits (1 credit per generation)
        const user = await User.findById(userId);
        if (user && user.fuelCredits > 0) {
            user.fuelCredits -= 1;
            await user.save();
        }

        res.json(result);
    } catch (error) {
        console.error('Error generating opener:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/mavula/ai/generate-response - Generate response to prospect
router.post('/generate-response', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { prospectId } = req.body;

        if (!prospectId) {
            return res.status(400).json({
                success: false,
                message: 'Prospect ID is required'
            });
        }

        // Verify prospect
        const prospect = await MavulaProspect.findOne({ _id: prospectId, userId });
        if (!prospect) {
            return res.status(404).json({
                success: false,
                message: 'Prospect not found'
            });
        }

        // Get conversation history
        const conversation = await MavulaConversation.findOne({ prospectId });
        const conversationHistory = conversation ? conversation.getFormattedHistory(10) : [];

        // Generate response
        const result = await MavulaAIService.generateResponse(
            prospectId,
            userId,
            conversationHistory
        );

        // Deduct AI fuel credits
        const user = await User.findById(userId);
        if (user && user.fuelCredits > 0) {
            user.fuelCredits -= 1;
            await user.save();
        }

        res.json(result);
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/mavula/ai/generate-follow-up - Generate follow-up message
router.post('/generate-follow-up', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { prospectId } = req.body;

        if (!prospectId) {
            return res.status(400).json({
                success: false,
                message: 'Prospect ID is required'
            });
        }

        // Verify prospect
        const prospect = await MavulaProspect.findOne({ _id: prospectId, userId });
        if (!prospect) {
            return res.status(404).json({
                success: false,
                message: 'Prospect not found'
            });
        }

        // Calculate days since last contact
        const daysSinceLastContact = prospect.lastContactDate
            ? Math.floor((Date.now() - prospect.lastContactDate) / (1000 * 60 * 60 * 24))
            : 0;

        // Generate follow-up
        const result = await MavulaAIService.generateFollowUp(
            prospectId,
            userId,
            daysSinceLastContact
        );

        // Deduct AI fuel credits
        const user = await User.findById(userId);
        if (user && user.fuelCredits > 0) {
            user.fuelCredits -= 1;
            await user.save();
        }

        res.json(result);
    } catch (error) {
        console.error('Error generating follow-up:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/mavula/ai/generate-objection - Handle objection
router.post('/generate-objection', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { prospectId, objection } = req.body;

        if (!prospectId || !objection) {
            return res.status(400).json({
                success: false,
                message: 'Prospect ID and objection text are required'
            });
        }

        // Verify prospect
        const prospect = await MavulaProspect.findOne({ _id: prospectId, userId });
        if (!prospect) {
            return res.status(404).json({
                success: false,
                message: 'Prospect not found'
            });
        }

        // Get conversation history
        const conversation = await MavulaConversation.findOne({ prospectId });
        const conversationHistory = conversation ? conversation.getFormattedHistory(10) : [];

        // Generate objection handler
        const result = await MavulaAIService.generateObjectionHandler(
            prospectId,
            userId,
            objection,
            conversationHistory
        );

        // Deduct AI fuel credits
        const user = await User.findById(userId);
        if (user && user.fuelCredits > 0) {
            user.fuelCredits -= 1;
            await user.save();
        }

        res.json(result);
    } catch (error) {
        console.error('Error generating objection handler:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/mavula/ai/generate-close - Generate closing message
router.post('/generate-close', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { prospectId } = req.body;

        if (!prospectId) {
            return res.status(400).json({
                success: false,
                message: 'Prospect ID is required'
            });
        }

        // Verify prospect
        const prospect = await MavulaProspect.findOne({ _id: prospectId, userId });
        if (!prospect) {
            return res.status(404).json({
                success: false,
                message: 'Prospect not found'
            });
        }

        // Get conversation history
        const conversation = await MavulaConversation.findOne({ prospectId });
        const conversationHistory = conversation ? conversation.getFormattedHistory(10) : [];

        // Generate closing message
        const result = await MavulaAIService.generateClosingMessage(
            prospectId,
            userId,
            conversationHistory
        );

        // Deduct AI fuel credits
        const user = await User.findById(userId);
        if (user && user.fuelCredits > 0) {
            user.fuelCredits -= 1;
            await user.save();
        }

        res.json(result);
    } catch (error) {
        console.error('Error generating closing message:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===================================================================
// CONVERSATION INTELLIGENCE ENDPOINTS
// ===================================================================

// POST /api/mavula/ai/analyze-sentiment - Analyze prospect sentiment
router.post('/analyze-sentiment', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message text is required'
            });
        }

        const result = await MavulaAIService.analyzeSentiment(message);

        res.json(result);
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/mavula/ai/score-prospect - AI-powered lead scoring
router.post('/score-prospect', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { prospectId } = req.body;

        if (!prospectId) {
            return res.status(400).json({
                success: false,
                message: 'Prospect ID is required'
            });
        }

        // Verify prospect
        const prospect = await MavulaProspect.findOne({ _id: prospectId, userId });
        if (!prospect) {
            return res.status(404).json({
                success: false,
                message: 'Prospect not found'
            });
        }

        // Get conversation history
        const conversation = await MavulaConversation.findOne({ prospectId });
        const conversationHistory = conversation ? conversation.getFormattedHistory(20) : [];

        // Calculate lead score
        const result = await MavulaAIService.calculateLeadScore(
            prospectId,
            conversationHistory
        );

        res.json(result);
    } catch (error) {
        console.error('Error scoring prospect:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/mavula/ai/suggest-action - Suggest next best action
router.post('/suggest-action', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const { prospectId } = req.body;

        if (!prospectId) {
            return res.status(400).json({
                success: false,
                message: 'Prospect ID is required'
            });
        }

        // Verify prospect
        const prospect = await MavulaProspect.findOne({ _id: prospectId, userId });
        if (!prospect) {
            return res.status(404).json({
                success: false,
                message: 'Prospect not found'
            });
        }

        // Get conversation history
        const conversation = await MavulaConversation.findOne({ prospectId });
        const conversationHistory = conversation ? conversation.getFormattedHistory(10) : [];

        // Get AI suggestion
        const result = await MavulaAIService.suggestNextAction(
            prospectId,
            conversationHistory
        );

        res.json(result);
    } catch (error) {
        console.error('Error suggesting action:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===================================================================
// CONTENT PROCESSING ENDPOINTS
// ===================================================================

// POST /api/mavula/ai/summarize - Summarize content
router.post('/summarize', verifyToken, async (req, res) => {
    try {
        const { text, maxLength = 500 } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text content is required'
            });
        }

        const result = await MavulaAIService.generateContentSummary(text, maxLength);

        res.json(result);
    } catch (error) {
        console.error('Error summarizing content:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/mavula/ai/extract-keypoints - Extract key points
router.post('/extract-keypoints', verifyToken, async (req, res) => {
    try {
        const { text, maxPoints = 5 } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text content is required'
            });
        }

        const result = await MavulaAIService.extractKeyPoints(text, maxPoints);

        res.json(result);
    } catch (error) {
        console.error('Error extracting key points:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===================================================================
// AI CREDITS & STATUS
// ===================================================================

// GET /api/mavula/ai/credits - Get user's AI fuel credits balance
router.get('/credits', verifyToken, async (req, res) => {
    try {
        const userId = req.admin.userId || req.admin._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            credits: user.fuelCredits || 0,
            expiryDate: user.fuelExpiryDate
        });
    } catch (error) {
        console.error('Error fetching AI credits:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/mavula/ai/health - Check AI service health
router.get('/health', async (req, res) => {
    try {
        const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
        const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

        res.json({
            success: true,
            services: {
                claude: {
                    configured: hasClaudeKey,
                    model: 'claude-3-5-sonnet-20241022'
                },
                openai: {
                    configured: hasOpenAIKey,
                    model: 'gpt-4-turbo-preview'
                }
            },
            status: (hasClaudeKey && hasOpenAIKey) ? 'OPERATIONAL' : 'DEGRADED'
        });
    } catch (error) {
        console.error('Error checking AI health:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
