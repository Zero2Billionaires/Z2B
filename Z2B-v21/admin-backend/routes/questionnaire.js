const express = require('express');
const router = express.Router();
const QuestionnaireResponse = require('../models/QuestionnaireResponse');
const { verifyToken } = require('../middleware/auth');

// @route   POST /api/questionnaire/submit
// @desc    Submit questionnaire response (PUBLIC - no auth required)
// @access  Public
router.post('/submit', async (req, res) => {
    try {
        const {
            name,
            age,
            currentRole,
            yearsEmployed,
            biggestFrustration,
            financialPressure,
            timeFreedom,
            fulfillment,
            stuckFeeling,
            idealLife,
            legacyDesire,
            incomeGoal,
            whyEntrepreneur,
            businessIdea,
            problemsSolved,
            helpOthers,
            formalEducation,
            informalSkills,
            techComfort,
            naturalTalents,
            passionateAbout,
            majorChallenges,
            proudMoments,
            networkSize,
            supportSystem,
            mindsetReadiness,
            timeCommitment,
            biggestFear,
            needMost,
            readinessScore,
            insights,
            gaps,
            referralSource
        } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        // Get client info
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Create new questionnaire response
        const response = new QuestionnaireResponse({
            name,
            age,
            currentRole,
            yearsEmployed,
            biggestFrustration,
            financialPressure,
            timeFreedom,
            fulfillment,
            stuckFeeling,
            idealLife,
            legacyDesire,
            incomeGoal,
            whyEntrepreneur,
            businessIdea,
            problemsSolved,
            helpOthers,
            formalEducation,
            informalSkills,
            techComfort,
            naturalTalents,
            passionateAbout,
            majorChallenges,
            proudMoments,
            networkSize,
            supportSystem,
            mindsetReadiness,
            timeCommitment,
            biggestFear,
            needMost,
            readinessScore: readinessScore || 0,
            insights: insights || [],
            gaps: gaps || [],
            ipAddress,
            userAgent,
            referralSource
        });

        // Calculate and set lead score
        response.calculateLeadScore();

        // Save to database
        await response.save();

        res.json({
            success: true,
            message: 'Questionnaire response saved successfully',
            data: {
                id: response._id,
                readinessScore: response.readinessScore,
                leadScore: response.leadScore
            }
        });

    } catch (error) {
        console.error('Error saving questionnaire response:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving questionnaire response',
            error: error.message
        });
    }
});

// @route   GET /api/questionnaire/responses
// @desc    Get all questionnaire responses (with filters)
// @access  Private (Admin only)
router.get('/responses', verifyToken, async (req, res) => {
    try {
        const {
            leadScore,
            followUpStatus,
            minScore,
            maxScore,
            limit = 50,
            page = 1,
            sortBy = 'submittedAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        if (leadScore) query.leadScore = leadScore;
        if (followUpStatus) query.followUpStatus = followUpStatus;
        if (minScore) query.readinessScore = { ...query.readinessScore, $gte: parseInt(minScore) };
        if (maxScore) query.readinessScore = { ...query.readinessScore, $lte: parseInt(maxScore) };

        // Sort options
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get responses
        const responses = await QuestionnaireResponse
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        // Get total count
        const total = await QuestionnaireResponse.countDocuments(query);

        // Get statistics
        const stats = await QuestionnaireResponse.getStats();

        res.json({
            success: true,
            data: {
                responses,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                },
                stats
            }
        });

    } catch (error) {
        console.error('Error fetching questionnaire responses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching questionnaire responses',
            error: error.message
        });
    }
});

// @route   GET /api/questionnaire/responses/:id
// @desc    Get single questionnaire response by ID
// @access  Private (Admin only)
router.get('/responses/:id', verifyToken, async (req, res) => {
    try {
        const response = await QuestionnaireResponse.findById(req.params.id);

        if (!response) {
            return res.status(404).json({
                success: false,
                message: 'Questionnaire response not found'
            });
        }

        res.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Error fetching questionnaire response:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching questionnaire response',
            error: error.message
        });
    }
});

// @route   PUT /api/questionnaire/responses/:id
// @desc    Update questionnaire response (follow-up status, notes, etc.)
// @access  Private (Admin only)
router.put('/responses/:id', verifyToken, async (req, res) => {
    try {
        const { followUpStatus, notes, contactedAt } = req.body;

        const updateData = {};
        if (followUpStatus) updateData.followUpStatus = followUpStatus;
        if (notes !== undefined) updateData.notes = notes;
        if (contactedAt) updateData.contactedAt = contactedAt;

        const response = await QuestionnaireResponse.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!response) {
            return res.status(404).json({
                success: false,
                message: 'Questionnaire response not found'
            });
        }

        res.json({
            success: true,
            message: 'Questionnaire response updated successfully',
            data: response
        });

    } catch (error) {
        console.error('Error updating questionnaire response:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating questionnaire response',
            error: error.message
        });
    }
});

// @route   DELETE /api/questionnaire/responses/:id
// @desc    Delete questionnaire response
// @access  Private (Admin only)
router.delete('/responses/:id', verifyToken, async (req, res) => {
    try {
        const response = await QuestionnaireResponse.findByIdAndDelete(req.params.id);

        if (!response) {
            return res.status(404).json({
                success: false,
                message: 'Questionnaire response not found'
            });
        }

        res.json({
            success: true,
            message: 'Questionnaire response deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting questionnaire response:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting questionnaire response',
            error: error.message
        });
    }
});

// @route   GET /api/questionnaire/stats
// @desc    Get questionnaire statistics
// @access  Private (Admin only)
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const stats = await QuestionnaireResponse.getStats();

        // Get recent responses (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = await QuestionnaireResponse.countDocuments({
            submittedAt: { $gte: sevenDaysAgo }
        });

        // Get top frustrations (most common)
        const topFrustrations = await QuestionnaireResponse.aggregate([
            { $match: { biggestFrustration: { $exists: true, $ne: '' } } },
            { $group: { _id: '$biggestFrustration', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get income goal distribution
        const incomeGoals = await QuestionnaireResponse.aggregate([
            { $match: { incomeGoal: { $exists: true, $ne: '' } } },
            { $group: { _id: '$incomeGoal', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                ...stats,
                recentResponses: recentCount,
                topFrustrations,
                incomeGoals
            }
        });

    } catch (error) {
        console.error('Error fetching questionnaire stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching questionnaire stats',
            error: error.message
        });
    }
});

module.exports = router;
