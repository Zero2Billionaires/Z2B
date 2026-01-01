import fetch from 'node-fetch';

/**
 * D-ID Service for AI Video Generation
 * Integrates with D-ID API to create talking avatar videos
 *
 * API Documentation: https://docs.d-id.com/reference/api-overview
 */
class DIDService {
    constructor() {
        this.apiUrl = 'https://api.d-id.com';
        this.apiKey = process.env.DID_API_KEY;
        this.defaultDriver = 'bank://lively/driver-01';
        this.defaultVoice = {
            type: 'microsoft',
            voice_id: 'en-US-JennyNeural'
        };
    }

    /**
     * Create a talking avatar video
     * @param {Object} options - Video creation options
     * @returns {Promise<Object>} D-ID talk response
     */
    async createTalk(options) {
        try {
            const {
                sourceImage,      // URL or base64 image
                script,           // Text to speak
                voiceId = 'en-US-JennyNeural',
                voiceType = 'microsoft',
                webhookUrl = null,
                config = {}
            } = options;

            if (!this.apiKey) {
                throw new Error('D-ID API key not configured. Please set DID_API_KEY in environment.');
            }

            if (!sourceImage) {
                throw new Error('Source image is required');
            }

            if (!script || script.trim().length === 0) {
                throw new Error('Script is required');
            }

            // Build request payload
            const payload = {
                source_url: sourceImage,
                script: {
                    type: 'text',
                    input: script,
                    provider: {
                        type: voiceType,
                        voice_id: voiceId
                    }
                },
                config: {
                    driver_url: config.driverUrl || this.defaultDriver,
                    result_format: config.resultFormat || 'mp4',
                    stitch: config.stitch !== false,
                    ...config
                }
            };

            // Add webhook if provided
            if (webhookUrl) {
                payload.webhook = webhookUrl;
            }

            const response = await fetch(`${this.apiUrl}/talks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`D-ID API error: ${error.message || response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                talkId: data.id,
                status: data.status,
                createdAt: data.created_at,
                data: data
            };

        } catch (error) {
            console.error('D-ID createTalk error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get the status of a video generation
     * @param {string} talkId - D-ID talk ID
     * @returns {Promise<Object>} Talk status
     */
    async getTalkStatus(talkId) {
        try {
            if (!this.apiKey) {
                throw new Error('D-ID API key not configured');
            }

            if (!talkId) {
                throw new Error('Talk ID is required');
            }

            const response = await fetch(`${this.apiUrl}/talks/${talkId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${this.apiKey}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`D-ID API error: ${error.message || response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                talkId: data.id,
                status: data.status,
                videoUrl: data.result_url || null,
                createdAt: data.created_at,
                duration: data.duration || 0,
                data: data
            };

        } catch (error) {
            console.error('D-ID getTalkStatus error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get the completed video URL
     * @param {string} talkId - D-ID talk ID
     * @returns {Promise<Object>} Video result
     */
    async getTalkResult(talkId) {
        try {
            const statusResult = await this.getTalkStatus(talkId);

            if (!statusResult.success) {
                return statusResult;
            }

            // Check if video is ready
            if (statusResult.status !== 'done') {
                return {
                    success: false,
                    status: statusResult.status,
                    message: `Video is still ${statusResult.status}. Please try again later.`
                };
            }

            return {
                success: true,
                videoUrl: statusResult.videoUrl,
                duration: statusResult.duration,
                status: statusResult.status,
                data: statusResult.data
            };

        } catch (error) {
            console.error('D-ID getTalkResult error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * List available voices
     * @param {string} provider - Voice provider (microsoft, amazon, google)
     * @returns {Promise<Object>} Available voices
     */
    async listVoices(provider = 'microsoft') {
        try {
            if (!this.apiKey) {
                throw new Error('D-ID API key not configured');
            }

            const response = await fetch(`${this.apiUrl}/tts/voices?provider=${provider}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${this.apiKey}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`D-ID API error: ${error.message || response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                voices: data,
                provider: provider
            };

        } catch (error) {
            console.error('D-ID listVoices error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete a video
     * @param {string} talkId - D-ID talk ID
     * @returns {Promise<Object>} Deletion result
     */
    async deleteTalk(talkId) {
        try {
            if (!this.apiKey) {
                throw new Error('D-ID API key not configured');
            }

            if (!talkId) {
                throw new Error('Talk ID is required');
            }

            const response = await fetch(`${this.apiUrl}/talks/${talkId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${this.apiKey}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`D-ID API error: ${error.message || response.statusText}`);
            }

            return {
                success: true,
                message: 'Video deleted successfully'
            };

        } catch (error) {
            console.error('D-ID deleteTalk error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get list of talks (with pagination)
     * @param {number} page - Page number
     * @param {number} limit - Results per page
     * @returns {Promise<Object>} List of talks
     */
    async listTalks(page = 1, limit = 10) {
        try {
            if (!this.apiKey) {
                throw new Error('D-ID API key not configured');
            }

            const response = await fetch(`${this.apiUrl}/talks?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${this.apiKey}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`D-ID API error: ${error.message || response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                talks: data.talks || [],
                pagination: {
                    page: page,
                    limit: limit,
                    total: data.total || 0
                }
            };

        } catch (error) {
            console.error('D-ID listTalks error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Upload image to D-ID
     * @param {string} imageUrl - URL of the image to upload
     * @returns {Promise<Object>} Upload result
     */
    async uploadImage(imageUrl) {
        try {
            if (!this.apiKey) {
                throw new Error('D-ID API key not configured');
            }

            if (!imageUrl) {
                throw new Error('Image URL is required');
            }

            const response = await fetch(`${this.apiUrl}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${this.apiKey}`
                },
                body: JSON.stringify({
                    url: imageUrl
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`D-ID API error: ${error.message || response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                imageUrl: data.url,
                imageId: data.id,
                data: data
            };

        } catch (error) {
            console.error('D-ID uploadImage error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check API credits
     * @returns {Promise<Object>} Credits information
     */
    async getCredits() {
        try {
            if (!this.apiKey) {
                throw new Error('D-ID API key not configured');
            }

            const response = await fetch(`${this.apiUrl}/credits`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${this.apiKey}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`D-ID API error: ${error.message || response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                credits: data.credits || 0,
                data: data
            };

        } catch (error) {
            console.error('D-ID getCredits error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Poll for video completion
     * @param {string} talkId - D-ID talk ID
     * @param {number} maxAttempts - Maximum polling attempts
     * @param {number} interval - Polling interval in ms
     * @returns {Promise<Object>} Final video result
     */
    async pollForCompletion(talkId, maxAttempts = 30, interval = 3000) {
        let attempts = 0;

        return new Promise((resolve, reject) => {
            const pollInterval = setInterval(async () => {
                attempts++;

                try {
                    const result = await this.getTalkStatus(talkId);

                    if (!result.success) {
                        clearInterval(pollInterval);
                        reject(new Error(result.error));
                        return;
                    }

                    // Video completed successfully
                    if (result.status === 'done') {
                        clearInterval(pollInterval);
                        resolve({
                            success: true,
                            videoUrl: result.videoUrl,
                            duration: result.duration,
                            attempts: attempts
                        });
                        return;
                    }

                    // Video failed
                    if (result.status === 'error' || result.status === 'rejected') {
                        clearInterval(pollInterval);
                        reject(new Error(`Video generation failed: ${result.status}`));
                        return;
                    }

                    // Max attempts reached
                    if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        reject(new Error(`Polling timeout after ${maxAttempts} attempts`));
                        return;
                    }

                } catch (error) {
                    clearInterval(pollInterval);
                    reject(error);
                }
            }, interval);
        });
    }

    /**
     * Get recommended voices based on use case
     * @param {string} useCase - Use case (coaching, marketing, professional, casual)
     * @returns {Array} Recommended voice IDs
     */
    getRecommendedVoices(useCase = 'professional') {
        const voiceRecommendations = {
            coaching: [
                { id: 'en-US-JennyNeural', name: 'Jenny (US English, Female)', gender: 'female', style: 'friendly' },
                { id: 'en-US-GuyNeural', name: 'Guy (US English, Male)', gender: 'male', style: 'professional' },
                { id: 'en-GB-SoniaNeural', name: 'Sonia (UK English, Female)', gender: 'female', style: 'professional' }
            ],
            marketing: [
                { id: 'en-US-AriaNeural', name: 'Aria (US English, Female)', gender: 'female', style: 'cheerful' },
                { id: 'en-US-DavisNeural', name: 'Davis (US English, Male)', gender: 'male', style: 'enthusiastic' },
                { id: 'en-US-JaneNeural', name: 'Jane (US English, Female)', gender: 'female', style: 'energetic' }
            ],
            professional: [
                { id: 'en-US-JennyNeural', name: 'Jenny (US English, Female)', gender: 'female', style: 'professional' },
                { id: 'en-US-GuyNeural', name: 'Guy (US English, Male)', gender: 'male', style: 'professional' },
                { id: 'en-GB-RyanNeural', name: 'Ryan (UK English, Male)', gender: 'male', style: 'professional' }
            ],
            casual: [
                { id: 'en-US-AmberNeural', name: 'Amber (US English, Female)', gender: 'female', style: 'casual' },
                { id: 'en-US-BrandonNeural', name: 'Brandon (US English, Male)', gender: 'male', style: 'casual' },
                { id: 'en-AU-NatashaNeural', name: 'Natasha (AU English, Female)', gender: 'female', style: 'friendly' }
            ]
        };

        return voiceRecommendations[useCase] || voiceRecommendations.professional;
    }

    /**
     * Generate video with retry logic
     * @param {Object} options - Video creation options
     * @param {number} maxRetries - Maximum retry attempts
     * @returns {Promise<Object>} Video generation result
     */
    async createTalkWithRetry(options, maxRetries = 3) {
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.createTalk(options);

                if (result.success) {
                    return result;
                }

                lastError = result.error;

                // Don't retry on validation errors
                if (result.error && (
                    result.error.includes('required') ||
                    result.error.includes('invalid') ||
                    result.error.includes('not configured')
                )) {
                    break;
                }

                // Wait before retrying
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                }

            } catch (error) {
                lastError = error.message;
            }
        }

        return {
            success: false,
            error: lastError || 'Failed to create video after multiple attempts'
        };
    }
}

// Create singleton instance
const didService = new DIDService();

export default didService;
