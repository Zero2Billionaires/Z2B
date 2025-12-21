const express = require('express');
const router = express.Router();
const axios = require('axios');

// D-ID API Configuration
const DID_API_KEY = process.env.DID_API_KEY || 'emVybzJiaWxsaW9uYWlyZXNAZ21haWwuY29t:ukcyB3Jw1Vg9P1falbuez';
const DID_API_URL = 'https://api.d-id.com';

// Auth middleware (assuming you have one)
const verifyToken = require('../middleware/auth').verifyToken || ((req, res, next) => next());

// Generate video with D-ID
router.post('/generate', verifyToken, async (req, res) => {
    try {
        const { image, script, voice, resolution, background } = req.body;

        console.log('D-ID Generate Request:', {
            hasImage: !!image,
            scriptLength: script?.length,
            voice,
            resolution,
            background
        });

        // Validate inputs
        if (!image) {
            return res.status(400).json({
                success: false,
                error: 'Image is required'
            });
        }

        if (!script || script.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Script must be at least 10 characters'
            });
        }

        // Map our voice to D-ID voice
        const voiceId = mapVoiceToProvider(voice);

        console.log('Creating D-ID talk with image type:', image.startsWith('data:image') ? 'base64' : 'URL');

        // Create D-ID talk (video generation)
        // D-ID supports base64 images directly in source_url
        const didResponse = await axios.post(
            `${DID_API_URL}/talks`,
            {
                source_url: image, // D-ID accepts base64 data URLs directly
                script: {
                    type: 'text',
                    input: script,
                    provider: {
                        type: 'microsoft',
                        voice_id: voiceId
                    }
                },
                config: {
                    fluent: true,
                    pad_audio: 0.0,
                    driver_expressions: {
                        expressions: [
                            {
                                start_frame: 0,
                                expression: 'neutral',
                                intensity: 1.0
                            }
                        ]
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const talkId = didResponse.data.id;

        console.log('D-ID Talk Created:', talkId);

        res.json({
            success: true,
            talkId: talkId,
            message: 'Video generation started',
            estimatedTime: '2-3 minutes'
        });

    } catch (error) {
        console.error('D-ID API Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message || 'Video generation failed'
        });
    }
});

// Check video status
router.get('/status/:talkId', verifyToken, async (req, res) => {
    try {
        const { talkId } = req.params;

        console.log('Checking status for talk:', talkId);

        const didResponse = await axios.get(
            `${DID_API_URL}/talks/${talkId}`,
            {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`
                }
            }
        );

        console.log('D-ID Status:', didResponse.data.status);

        res.json({
            success: true,
            status: didResponse.data.status,
            videoUrl: didResponse.data.result_url,
            duration: didResponse.data.duration,
            data: didResponse.data
        });

    } catch (error) {
        console.error('Status Check Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || 'Failed to check status'
        });
    }
});

// Get available voices
router.get('/voices', async (req, res) => {
    try {
        const response = await axios.get(
            `${DID_API_URL}/tts/voices`,
            {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`
                }
            }
        );

        res.json({
            success: true,
            voices: response.data
        });

    } catch (error) {
        console.error('Voices Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch voices'
        });
    }
});

// Map our voice names to D-ID provider voices
function mapVoiceToProvider(voiceId) {
    const voiceMap = {
        'male-professional': 'en-US-GuyNeural',
        'female-professional': 'en-US-JennyNeural',
        'male-casual': 'en-US-ChristopherNeural',
        'female-casual': 'en-US-AriaNeural',
        'male-motivational': 'en-US-DavisNeural',
        'motivational': 'en-US-DavisNeural',
        'custom': 'en-US-GuyNeural' // Default for voice cloning feature
    };
    return voiceMap[voiceId] || 'en-US-GuyNeural';
}

module.exports = router;
