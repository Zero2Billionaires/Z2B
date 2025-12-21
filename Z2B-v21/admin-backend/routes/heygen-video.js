const express = require('express');
const router = express.Router();
const axios = require('axios');

// HeyGen API Configuration
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_k7qKEK401SA_yCBxvSSwA0bhXxDE0P2S6GFAX5UEo2FM';
const HEYGEN_API_URL = 'https://api.heygen.com/v2';

// Auth middleware
const verifyToken = require('../middleware/auth').verifyToken || ((req, res, next) => next());

// Generate video with HeyGen
router.post('/generate', verifyToken, async (req, res) => {
    try {
        const { image, script, voice, avatar_id } = req.body;

        console.log('HeyGen Generate Request:', {
            hasImage: !!image,
            scriptLength: script?.length,
            voice,
            avatar_id
        });

        // Validate inputs
        if (!script || script.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Script must be at least 10 characters'
            });
        }

        // HeyGen avatar mapping (use default avatars from HeyGen)
        const avatarMap = {
            'male-professional': 'Wayne_20240711',
            'female-professional': 'Anna_public_3_20240108',
            'male-casual': 'josh_lite3_20230714',
            'female-casual': 'Susan_public_2_20240328',
            'male-motivational': 'Wayne_20240711',
            'default': 'Wayne_20240711'
        };

        const selectedAvatar = avatar_id || avatarMap[voice] || avatarMap['default'];

        // Create HeyGen video
        const heygenResponse = await axios.post(
            `${HEYGEN_API_URL}/video/generate`,
            {
                video_inputs: [
                    {
                        character: {
                            type: 'avatar',
                            avatar_id: selectedAvatar,
                            avatar_style: 'normal'
                        },
                        voice: {
                            type: 'text',
                            input_text: script,
                            voice_id: mapVoiceToHeyGen(voice)
                        }
                    }
                ],
                dimension: {
                    width: 1280,
                    height: 720
                },
                test: false // Set to true for testing without using credits
            },
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        const videoId = heygenResponse.data.data.video_id;

        console.log('HeyGen Video Created:', videoId);

        res.json({
            success: true,
            videoId: videoId,
            message: 'Video generation started',
            estimatedTime: '2-3 minutes'
        });

    } catch (error) {
        console.error('HeyGen API Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message || 'Video generation failed'
        });
    }
});

// Check video status
router.get('/status/:videoId', verifyToken, async (req, res) => {
    try {
        const { videoId } = req.params;

        console.log('Checking HeyGen status for video:', videoId);

        const heygenResponse = await axios.get(
            `${HEYGEN_API_URL}/video_status.get?video_id=${videoId}`,
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY
                }
            }
        );

        const status = heygenResponse.data.data.status;
        const videoUrl = heygenResponse.data.data.video_url;

        console.log('HeyGen Status:', status);

        res.json({
            success: true,
            status: status === 'completed' ? 'done' : status,
            videoUrl: videoUrl,
            data: heygenResponse.data.data
        });

    } catch (error) {
        console.error('Status Check Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || 'Failed to check status'
        });
    }
});

// Get available avatars
router.get('/avatars', verifyToken, async (req, res) => {
    try {
        const response = await axios.get(
            `${HEYGEN_API_URL}/avatars`,
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY
                }
            }
        );

        res.json({
            success: true,
            avatars: response.data.data.avatars
        });

    } catch (error) {
        console.error('Avatars Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch avatars'
        });
    }
});

// Get available voices
router.get('/voices', verifyToken, async (req, res) => {
    try {
        const response = await axios.get(
            `${HEYGEN_API_URL}/voices`,
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY
                }
            }
        );

        res.json({
            success: true,
            voices: response.data.data.voices
        });

    } catch (error) {
        console.error('Voices Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch voices'
        });
    }
});

// Map our voice names to HeyGen voice IDs
function mapVoiceToHeyGen(voiceId) {
    const voiceMap = {
        'male-professional': '1bd001e7e50f421d891986aad5158bc8',  // Professional male
        'female-professional': '2d5b0e6cf36841b29b7b7f0fa5f6141c', // Professional female
        'male-casual': '1bd001e7e50f421d891986aad5158bc8',       // Casual male
        'female-casual': '2d5b0e6cf36841b29b7b7f0fa5f6141c',      // Casual female
        'male-motivational': '1bd001e7e50f421d891986aad5158bc8',  // Motivational
        'motivational': '1bd001e7e50f421d891986aad5158bc8',
        'custom': '1bd001e7e50f421d891986aad5158bc8'              // Default
    };
    return voiceMap[voiceId] || '1bd001e7e50f421d891986aad5158bc8';
}

module.exports = router;
