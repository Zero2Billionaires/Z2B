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

        // HeyGen avatar mapping (use actual available avatars)
        const avatarMap = {
            'male-professional': 'Aditya_public_1',           // Aditya in Blue blazer
            'female-professional': 'Abigail_standing_office_front',  // Abigail Office Front
            'male-casual': 'Aditya_public_2',                 // Aditya in Blue t-shirt
            'female-casual': 'Abigail_sitting_sofa_front',    // Abigail Sofa Front
            'male-motivational': 'Adrian_public_2_20240312',  // Adrian in Blue Suit
            'default': 'Aditya_public_1'                      // Default to professional male
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

        // Status endpoint uses v1, not v2
        const heygenResponse = await axios.get(
            `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
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

// Get available templates
router.get('/templates', verifyToken, async (req, res) => {
    try {
        const response = await axios.get(
            `${HEYGEN_API_URL}/templates`,
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY
                }
            }
        );

        res.json({
            success: true,
            templates: response.data.data.templates || []
        });

    } catch (error) {
        console.error('Templates Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch templates'
        });
    }
});

// Get template details and variables
router.get('/templates/:templateId', verifyToken, async (req, res) => {
    try {
        const { templateId } = req.params;

        const response = await axios.get(
            `${HEYGEN_API_URL}/template/${templateId}`,
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY
                }
            }
        );

        res.json({
            success: true,
            template: response.data.data,
            variables: response.data.data.variables || []
        });

    } catch (error) {
        console.error('Template Details Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch template details'
        });
    }
});

// Generate video from template
router.post('/generate-from-template', verifyToken, async (req, res) => {
    try {
        const { template_id, variables, test } = req.body;

        console.log('HeyGen Template Generate Request:', {
            template_id,
            variableCount: Object.keys(variables || {}).length,
            test: test || false
        });

        // Validate inputs
        if (!template_id) {
            return res.status(400).json({
                success: false,
                error: 'Template ID is required'
            });
        }

        // Generate video from template
        const heygenResponse = await axios.post(
            `${HEYGEN_API_URL}/template/generate`,
            {
                template_id: template_id,
                variables: variables,
                test: test || false,
                caption: false
            },
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        const videoId = heygenResponse.data.data.video_id;

        console.log('HeyGen Template Video Created:', videoId);

        res.json({
            success: true,
            videoId: videoId,
            message: 'Template video generation started',
            estimatedTime: '2-3 minutes'
        });

    } catch (error) {
        console.error('Template Generate Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message || 'Template video generation failed'
        });
    }
});

// Map our voice names to HeyGen voice IDs (actual available voices)
function mapVoiceToHeyGen(voiceId) {
    const voiceMap = {
        'male-professional': 'acff30ce1e944de8ac429d26fa9367ad',  // Mark - Professional male
        'female-professional': 'fb8c5c3f02854c57a4da182d4ed59467', // Ivy - Professional female
        'male-casual': 'f38a635bee7a4d1f9b0a654a31d050d2',       // Chill Brian - Casual male
        'female-casual': 'e0cc82c22f414c95b1f25696c732f058',      // Cassidy - Casual female
        'male-motivational': 'acff30ce1e944de8ac429d26fa9367ad',  // Mark - Motivational
        'motivational': 'acff30ce1e944de8ac429d26fa9367ad',       // Mark
        'custom': 'acff30ce1e944de8ac429d26fa9367ad'              // Default to Mark
    };
    return voiceMap[voiceId] || 'acff30ce1e944de8ac429d26fa9367ad';
}

module.exports = router;
