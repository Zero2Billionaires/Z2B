import express from 'express';
import VideoGeneration from '../models/VideoGeneration.js';
import UserSettings from '../models/UserSettings.js';
import didService from '../services/didService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/vidzie/generate
 * @desc    Generate a new video using D-ID
 * @access  Private
 */
router.post('/generate', async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            videoName,
            description,
            videoType = 'avatar',
            purpose,
            sourceImage,
            script,
            voiceId = 'en-US-JennyNeural',
            voiceType = 'microsoft',
            voiceGender = 'female',
            voiceStyle = 'friendly',
            settings = {}
        } = req.body;

        // Validate required fields
        if (!purpose) {
            return res.status(400).json({
                success: false,
                message: 'Purpose is required (glowie-app, coach-manlaw, standalone, zyra, marketplace)'
            });
        }

        if (!sourceImage) {
            return res.status(400).json({
                success: false,
                message: 'Source image is required'
            });
        }

        if (!script || script.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Script must be at least 10 characters long'
            });
        }

        if (script.length > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Script cannot exceed 5000 characters'
            });
        }

        // Get or create user settings
        const userSettings = await UserSettings.getOrCreate(userId);

        // Check if user can generate videos (using Glowie limits for now)
        if (!userSettings.canGenerate()) {
            return res.status(429).json({
                success: false,
                message: `Monthly generation limit reached. Limit resets on ${userSettings.glowie.resetDate.toLocaleDateString()}.`,
                monthlyLimit: userSettings.glowie.monthlyLimit,
                monthlyUsage: userSettings.glowie.monthlyUsage
            });
        }

        // Create initial video generation record
        const videoGen = new VideoGeneration({
            userId,
            videoName: videoName || `Video-${Date.now()}`,
            description,
            videoType,
            purpose,
            did: {
                sourceImage,
                script,
                voice: {
                    voiceId,
                    language: voiceId.split('-').slice(0, 2).join('-'), // Extract language
                    gender: voiceGender,
                    style: voiceStyle
                },
                settings: {
                    background: settings.background || '#FFFFFF',
                    resolution: settings.resolution || 'HD',
                    duration: 0,
                    fps: settings.fps || 30
                }
            },
            status: 'queued'
        });

        await videoGen.save();

        // Generate video with D-ID
        const result = await didService.createTalkWithRetry({
            sourceImage,
            script,
            voiceId,
            voiceType,
            config: settings
        });

        if (!result.success) {
            // Update status to failed
            videoGen.status = 'failed';
            videoGen.errorMessage = result.error;
            await videoGen.save();

            return res.status(500).json({
                success: false,
                message: 'Failed to generate video',
                error: result.error
            });
        }

        // Update video generation with D-ID response
        videoGen.did.talkId = result.talkId;
        videoGen.status = 'processing';
        videoGen.startedAt = Date.now();
        await videoGen.save();

        // Increment user's generation count
        await userSettings.incrementGenerations();

        // Return response without full details
        res.status(201).json({
            success: true,
            message: 'Video generation started!',
            data: {
                videoId: videoGen._id,
                videoName: videoGen.videoName,
                videoType: videoGen.videoType,
                purpose: videoGen.purpose,
                status: videoGen.status,
                talkId: result.talkId,
                createdAt: videoGen.createdAt,
                remainingGenerations: userSettings.glowie.remainingGenerations
            }
        });

    } catch (error) {
        console.error('Generate video error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating video',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/vidzie/video/:videoId
 * @desc    Get a video by ID
 * @access  Private
 */
router.get('/video/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        const video = await VideoGeneration.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user owns the video or if it's public
        if (video.userId.toString() !== userId.toString() && !video.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Increment views if not owner
        if (video.userId.toString() !== userId.toString()) {
            await video.incrementViews();
        }

        res.json({
            success: true,
            data: video
        });

    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/vidzie/video/:videoId/status
 * @desc    Check video generation status
 * @access  Private
 */
router.get('/video/:videoId/status', async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        const video = await VideoGeneration.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user owns the video
        if (video.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // If video is processing, check D-ID status
        if (video.status === 'processing' && video.did.talkId) {
            const didStatus = await didService.getTalkStatus(video.did.talkId);

            if (didStatus.success) {
                // Update video status based on D-ID response
                if (didStatus.status === 'done') {
                    video.did.videoUrl = didStatus.videoUrl;
                    video.status = 'completed';
                    video.completedAt = Date.now();
                    video.progress = 100;
                    if (video.startedAt) {
                        video.processingTime = Date.now() - video.startedAt;
                    }
                    video.did.settings.duration = didStatus.duration || 0;
                    await video.save();
                } else if (didStatus.status === 'error' || didStatus.status === 'rejected') {
                    video.status = 'failed';
                    video.errorMessage = 'D-ID video generation failed';
                    await video.save();
                } else {
                    // Still processing, estimate progress
                    const elapsedTime = Date.now() - video.startedAt;
                    const estimatedProgress = Math.min(90, Math.floor(elapsedTime / 1000)); // 1% per second, max 90%
                    video.progress = estimatedProgress;
                    await video.save();
                }
            }
        }

        res.json({
            success: true,
            data: {
                videoId: video._id,
                status: video.status,
                progress: video.progress,
                videoUrl: video.did.videoUrl,
                errorMessage: video.errorMessage,
                processingTime: video.processingTime,
                completedAt: video.completedAt
            }
        });

    } catch (error) {
        console.error('Get video status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/vidzie/videos
 * @desc    Get all videos for the authenticated user
 * @access  Private
 */
router.get('/videos', async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            page = 1,
            limit = 10,
            videoType,
            purpose,
            status,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = { userId };

        // Filter by video type if specified
        if (videoType) {
            query.videoType = videoType;
        }

        // Filter by purpose if specified
        if (purpose) {
            query.purpose = purpose;
        }

        // Filter by status if specified
        if (status) {
            query.status = status;
        }

        const sortOrder = order === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortOrder };

        const videos = await VideoGeneration.find(query)
            .select('-did.script') // Exclude large script field
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await VideoGeneration.countDocuments(query);

        res.json({
            success: true,
            data: videos,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/vidzie/video/:videoId
 * @desc    Delete a video
 * @access  Private
 */
router.delete('/video/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        const video = await VideoGeneration.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user owns the video
        if (video.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Soft delete by updating status
        video.status = 'deleted';
        await video.save();

        // Optionally delete from D-ID
        if (video.did.talkId) {
            await didService.deleteTalk(video.did.talkId);
        }

        res.json({
            success: true,
            message: 'Video deleted successfully'
        });

    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/vidzie/video/:videoId
 * @desc    Update video details (name, rating, etc.)
 * @access  Private
 */
router.put('/video/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;
        const { videoName, userRating, feedback, isPublic, tags } = req.body;

        const video = await VideoGeneration.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user owns the video
        if (video.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Update fields
        if (videoName) video.videoName = videoName;
        if (userRating) video.userRating = userRating;
        if (feedback) video.feedback = feedback;
        if (typeof isPublic === 'boolean') video.isPublic = isPublic;
        if (tags && Array.isArray(tags)) video.tags = tags;

        await video.save();

        res.json({
            success: true,
            message: 'Video updated successfully',
            data: video
        });

    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/vidzie/video/:videoId/share
 * @desc    Generate a shareable link for a video
 * @access  Private
 */
router.post('/video/:videoId/share', async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        const video = await VideoGeneration.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user owns the video
        if (video.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Generate share link if not exists
        if (!video.shareLink) {
            await video.generateShareLink();
        }

        res.json({
            success: true,
            data: {
                shareLink: video.shareLink,
                shareUrl: `${req.protocol}://${req.get('host')}/shared/${video.shareLink}`
            }
        });

    } catch (error) {
        console.error('Share video error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/vidzie/video/:videoId/download
 * @desc    Track video download
 * @access  Private
 */
router.post('/video/:videoId/download', async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        const video = await VideoGeneration.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user owns the video or if it's public
        if (video.userId.toString() !== userId.toString() && !video.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Increment downloads
        await video.incrementDownloads();

        res.json({
            success: true,
            message: 'Download tracked',
            data: {
                downloads: video.downloads
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
 * @route   GET /api/vidzie/voices
 * @desc    Get available voices for video generation
 * @access  Private
 */
router.get('/voices', async (req, res) => {
    try {
        const { provider = 'microsoft', useCase = 'professional' } = req.query;

        // Get recommended voices based on use case
        const recommended = didService.getRecommendedVoices(useCase);

        // Optionally fetch all voices from D-ID
        let allVoices = null;
        if (req.query.fetchAll === 'true') {
            const result = await didService.listVoices(provider);
            if (result.success) {
                allVoices = result.voices;
            }
        }

        res.json({
            success: true,
            data: {
                recommended,
                all: allVoices,
                provider,
                useCase
            }
        });

    } catch (error) {
        console.error('Get voices error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/vidzie/stats
 * @desc    Get user's video generation statistics
 * @access  Private
 */
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await VideoGeneration.getUserStats(userId);
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
 * @route   GET /api/vidzie/popular
 * @desc    Get popular public videos
 * @access  Private
 */
router.get('/popular', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const videos = await VideoGeneration.getPopularVideos(parseInt(limit));

        res.json({
            success: true,
            data: videos
        });

    } catch (error) {
        console.error('Get popular videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/vidzie/credits
 * @desc    Check D-ID API credits
 * @access  Private
 */
router.get('/credits', async (req, res) => {
    try {
        const result = await didService.getCredits();

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch credits',
                error: result.error
            });
        }

        res.json({
            success: true,
            data: {
                credits: result.credits
            }
        });

    } catch (error) {
        console.error('Get credits error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/vidzie/video/:videoId/poll
 * @desc    Poll for video completion (long-running request)
 * @access  Private
 */
router.post('/video/:videoId/poll', async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;
        const { maxAttempts = 30, interval = 3000 } = req.body;

        const video = await VideoGeneration.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user owns the video
        if (video.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!video.did.talkId) {
            return res.status(400).json({
                success: false,
                message: 'Video has no D-ID talk ID'
            });
        }

        // Poll for completion
        const result = await didService.pollForCompletion(
            video.did.talkId,
            maxAttempts,
            interval
        );

        // Update video with result
        video.did.videoUrl = result.videoUrl;
        video.status = 'completed';
        video.completedAt = Date.now();
        video.progress = 100;
        if (video.startedAt) {
            video.processingTime = Date.now() - video.startedAt;
        }
        video.did.settings.duration = result.duration || 0;
        await video.save();

        res.json({
            success: true,
            message: 'Video completed successfully',
            data: {
                videoId: video._id,
                videoUrl: result.videoUrl,
                duration: result.duration,
                attempts: result.attempts
            }
        });

    } catch (error) {
        console.error('Poll video error:', error);

        // Update video status to failed
        const { videoId } = req.params;
        const video = await VideoGeneration.findById(videoId);
        if (video) {
            video.status = 'failed';
            video.errorMessage = error.message;
            await video.save();
        }

        res.status(500).json({
            success: false,
            message: 'Video generation failed',
            error: error.message
        });
    }
});

export default router;
