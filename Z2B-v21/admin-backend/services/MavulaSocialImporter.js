const axios = require('axios');
const MavulaProspect = require('../models/MavulaProspect');
const MavulaConversation = require('../models/MavulaConversation');
const MavulaUserSettings = require('../models/MavulaUserSettings');
const MavulaDailyActivity = require('../models/MavulaDailyActivity');

class MavulaSocialImporter {
    constructor() {
        // OAuth credentials from environment
        this.facebook = {
            appId: process.env.FACEBOOK_APP_ID,
            appSecret: process.env.FACEBOOK_APP_SECRET,
            apiVersion: 'v18.0'
        };

        this.instagram = {
            appId: process.env.INSTAGRAM_APP_ID,
            appSecret: process.env.INSTAGRAM_APP_SECRET
        };

        this.tiktok = {
            clientKey: process.env.TIKTOK_CLIENT_KEY,
            clientSecret: process.env.TIKTOK_CLIENT_SECRET
        };

        // Redirect URIs
        this.redirectUri = process.env.FRONTEND_URL || 'http://localhost:5000';
    }

    // ===================================================================
    // FACEBOOK INTEGRATION
    // ===================================================================

    /**
     * Get Facebook OAuth authorization URL
     * @param {String} userId - User ID for state parameter
     * @param {String} redirectUri - Optional custom redirect URI
     */
    getFacebookAuthURL(userId, redirectUri = null) {
        const redirect = redirectUri || `${this.redirectUri}/api/mavula/social/facebook/callback`;

        const params = new URLSearchParams({
            client_id: this.facebook.appId,
            redirect_uri: redirect,
            state: userId,
            scope: [
                'public_profile',
                'email',
                'user_friends'
            ].join(',')
        });

        return `https://www.facebook.com/${this.facebook.apiVersion}/dialog/oauth?${params.toString()}`;
    }

    /**
     * Handle Facebook OAuth callback
     * @param {String} code - Authorization code from Facebook
     * @param {String} userId - User ID from state parameter
     * @param {String} redirectUri - Redirect URI used in auth request
     */
    async handleFacebookCallback(code, userId, redirectUri = null) {
        try {
            console.log('[SOCIAL IMPORT] Processing Facebook callback for user:', userId);

            const redirect = redirectUri || `${this.redirectUri}/api/mavula/social/facebook/callback`;

            // Exchange code for access token
            const tokenResponse = await axios.get(`https://graph.facebook.com/${this.facebook.apiVersion}/oauth/access_token`, {
                params: {
                    client_id: this.facebook.appId,
                    client_secret: this.facebook.appSecret,
                    redirect_uri: redirect,
                    code
                }
            });

            const accessToken = tokenResponse.data.access_token;

            // Store access token in user settings
            await this._storeOAuthToken(userId, 'facebook', {
                accessToken,
                connectedAt: new Date()
            });

            console.log('[SOCIAL IMPORT] Facebook connected successfully');

            return {
                success: true,
                platform: 'facebook',
                accessToken
            };
        } catch (error) {
            console.error('[SOCIAL IMPORT] Facebook callback error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.error?.message || error.message
            };
        }
    }

    /**
     * Import friends from Facebook
     * @param {String} userId - User ID
     */
    async importFacebookFriends(userId) {
        try {
            console.log('[SOCIAL IMPORT] Importing Facebook friends for user:', userId);

            // Get stored access token
            const settings = await MavulaUserSettings.findOne({ userId });
            const accessToken = settings?.socialMediaConnections?.facebook?.accessToken;

            if (!accessToken) {
                return {
                    success: false,
                    message: 'Facebook not connected. Please connect first.'
                };
            }

            // Get user's friends
            const friendsResponse = await axios.get(`https://graph.facebook.com/${this.facebook.apiVersion}/me/friends`, {
                params: {
                    access_token: accessToken,
                    fields: 'id,name,email,picture'
                }
            });

            const friends = friendsResponse.data.data || [];

            console.log(`[SOCIAL IMPORT] Found ${friends.length} Facebook friends`);

            // Note: Due to Facebook API restrictions, only friends who also use the app are returned
            // For full friend list, app needs to be approved by Facebook

            // Import friends as prospects
            const importResult = await this._importProspects(
                userId,
                friends,
                'FACEBOOK',
                this._normalizeFacebookData
            );

            return {
                success: true,
                platform: 'facebook',
                ...importResult
            };
        } catch (error) {
            console.error('[SOCIAL IMPORT] Facebook import error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.error?.message || error.message
            };
        }
    }

    /**
     * Normalize Facebook data to prospect format
     */
    _normalizeFacebookData(friend) {
        return {
            prospectName: friend.name,
            phone: null, // Facebook doesn't provide phone numbers
            email: friend.email || null,
            socialProfile: {
                platform: 'FACEBOOK',
                profileId: friend.id,
                profileUrl: `https://facebook.com/${friend.id}`,
                pictureUrl: friend.picture?.data?.url
            }
        };
    }

    // ===================================================================
    // INSTAGRAM INTEGRATION
    // ===================================================================

    /**
     * Get Instagram OAuth authorization URL
     * Note: Instagram OAuth requires Business/Creator account
     */
    getInstagramAuthURL(userId, redirectUri = null) {
        const redirect = redirectUri || `${this.redirectUri}/api/mavula/social/instagram/callback`;

        const params = new URLSearchParams({
            client_id: this.instagram.appId,
            redirect_uri: redirect,
            scope: 'user_profile,user_media',
            response_type: 'code',
            state: userId
        });

        return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
    }

    /**
     * Handle Instagram OAuth callback
     */
    async handleInstagramCallback(code, userId, redirectUri = null) {
        try {
            console.log('[SOCIAL IMPORT] Processing Instagram callback for user:', userId);

            const redirect = redirectUri || `${this.redirectUri}/api/mavula/social/instagram/callback`;

            // Exchange code for access token
            const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', new URLSearchParams({
                client_id: this.instagram.appId,
                client_secret: this.instagram.appSecret,
                grant_type: 'authorization_code',
                redirect_uri: redirect,
                code
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const accessToken = tokenResponse.data.access_token;
            const instagramUserId = tokenResponse.data.user_id;

            // Exchange short-lived token for long-lived token
            const longLivedResponse = await axios.get('https://graph.instagram.com/access_token', {
                params: {
                    grant_type: 'ig_exchange_token',
                    client_secret: this.instagram.appSecret,
                    access_token: accessToken
                }
            });

            const longLivedToken = longLivedResponse.data.access_token;

            // Store access token
            await this._storeOAuthToken(userId, 'instagram', {
                accessToken: longLivedToken,
                instagramUserId,
                connectedAt: new Date()
            });

            console.log('[SOCIAL IMPORT] Instagram connected successfully');

            return {
                success: true,
                platform: 'instagram',
                accessToken: longLivedToken
            };
        } catch (error) {
            console.error('[SOCIAL IMPORT] Instagram callback error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.error_message || error.message
            };
        }
    }

    /**
     * Import followers from Instagram
     * Note: Instagram API has limitations on follower data
     */
    async importInstagramFollowers(userId) {
        try {
            console.log('[SOCIAL IMPORT] Importing Instagram followers for user:', userId);

            const settings = await MavulaUserSettings.findOne({ userId });
            const accessToken = settings?.socialMediaConnections?.instagram?.accessToken;

            if (!accessToken) {
                return {
                    success: false,
                    message: 'Instagram not connected. Please connect first.'
                };
            }

            // Note: Instagram Basic Display API doesn't provide follower list
            // For follower import, need Instagram Business API with approved permissions

            return {
                success: false,
                message: 'Instagram follower import requires Instagram Business API access. Please use manual import or contact support.',
                requiresBusinessAPI: true
            };
        } catch (error) {
            console.error('[SOCIAL IMPORT] Instagram import error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===================================================================
    // TIKTOK INTEGRATION
    // ===================================================================

    /**
     * Get TikTok OAuth authorization URL
     */
    getTikTokAuthURL(userId, redirectUri = null) {
        const redirect = redirectUri || `${this.redirectUri}/api/mavula/social/tiktok/callback`;

        const params = new URLSearchParams({
            client_key: this.tiktok.clientKey,
            redirect_uri: redirect,
            response_type: 'code',
            scope: 'user.info.basic',
            state: userId
        });

        return `https://www.tiktok.com/auth/authorize/?${params.toString()}`;
    }

    /**
     * Handle TikTok OAuth callback
     */
    async handleTikTokCallback(code, userId, redirectUri = null) {
        try {
            console.log('[SOCIAL IMPORT] Processing TikTok callback for user:', userId);

            const redirect = redirectUri || `${this.redirectUri}/api/mavula/social/tiktok/callback`;

            // Exchange code for access token
            const tokenResponse = await axios.post('https://open-api.tiktok.com/oauth/access_token/', {
                client_key: this.tiktok.clientKey,
                client_secret: this.tiktok.clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirect
            });

            const accessToken = tokenResponse.data.data.access_token;
            const openId = tokenResponse.data.data.open_id;

            // Store access token
            await this._storeOAuthToken(userId, 'tiktok', {
                accessToken,
                openId,
                connectedAt: new Date()
            });

            console.log('[SOCIAL IMPORT] TikTok connected successfully');

            return {
                success: true,
                platform: 'tiktok',
                accessToken
            };
        } catch (error) {
            console.error('[SOCIAL IMPORT] TikTok callback error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Import followers from TikTok
     * Note: TikTok API has strict limitations
     */
    async importTikTokFollowers(userId) {
        try {
            console.log('[SOCIAL IMPORT] TikTok follower import requested for user:', userId);

            return {
                success: false,
                message: 'TikTok API does not provide follower lists. Please use manual import.',
                requiresManualImport: true
            };
        } catch (error) {
            console.error('[SOCIAL IMPORT] TikTok import error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===================================================================
    // GENERIC IMPORT METHODS
    // ===================================================================

    /**
     * Import prospects from social media data
     * @param {String} userId - User ID
     * @param {Array} rawProspects - Array of raw prospect data
     * @param {String} source - Source platform (FACEBOOK, INSTAGRAM, TIKTOK)
     * @param {Function} normalizer - Function to normalize platform-specific data
     */
    async _importProspects(userId, rawProspects, source, normalizer) {
        try {
            const results = {
                imported: 0,
                skipped: 0,
                duplicates: 0,
                errors: []
            };

            // Get existing prospects to check for duplicates
            const existingProspects = await MavulaProspect.find({ userId });

            for (const rawProspect of rawProspects) {
                try {
                    // Normalize data
                    const normalizedData = normalizer(rawProspect);

                    // Skip if no name
                    if (!normalizedData.prospectName) {
                        results.skipped++;
                        continue;
                    }

                    // Check for duplicates
                    const isDuplicate = this._isDuplicate(normalizedData, existingProspects);
                    if (isDuplicate) {
                        results.duplicates++;
                        continue;
                    }

                    // Create prospect
                    const prospect = new MavulaProspect({
                        userId,
                        prospectName: normalizedData.prospectName,
                        phone: normalizedData.phone,
                        email: normalizedData.email,
                        source,
                        socialProfile: normalizedData.socialProfile,
                        leadScore: 30,
                        leadTemperature: 'COLD',
                        conversationStage: 'INITIAL_CONTACT',
                        automationEnabled: true,
                        consentGiven: false, // Social imports require explicit consent
                        consentSource: source
                    });

                    await prospect.save();

                    // Create conversation
                    await MavulaConversation.createForProspect(prospect._id, userId);

                    results.imported++;
                } catch (prospectError) {
                    console.error('[SOCIAL IMPORT] Error importing prospect:', prospectError);
                    results.errors.push({
                        prospect: rawProspect,
                        error: prospectError.message
                    });
                }
            }

            // Update daily activity
            if (results.imported > 0) {
                const todayActivity = await MavulaDailyActivity.getTodayActivity(userId);
                await todayActivity.updateAchievements({ prospectsAdded: results.imported });
            }

            console.log(`[SOCIAL IMPORT] Import complete:`, results);

            return results;
        } catch (error) {
            console.error('[SOCIAL IMPORT] Import error:', error);
            throw error;
        }
    }

    /**
     * Check if prospect is duplicate
     */
    _isDuplicate(normalizedData, existingProspects) {
        for (const existing of existingProspects) {
            // Check by name (case insensitive)
            if (existing.prospectName.toLowerCase() === normalizedData.prospectName.toLowerCase()) {
                return true;
            }

            // Check by email
            if (normalizedData.email && existing.email === normalizedData.email) {
                return true;
            }

            // Check by phone
            if (normalizedData.phone && existing.phone === normalizedData.phone) {
                return true;
            }

            // Check by social profile ID
            if (normalizedData.socialProfile && existing.socialProfile) {
                if (existing.socialProfile.platform === normalizedData.socialProfile.platform &&
                    existing.socialProfile.profileId === normalizedData.socialProfile.profileId) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Store OAuth token in user settings
     */
    async _storeOAuthToken(userId, platform, tokenData) {
        try {
            let settings = await MavulaUserSettings.findOne({ userId });

            if (!settings) {
                settings = await MavulaUserSettings.initializeForUser(userId);
            }

            if (!settings.socialMediaConnections) {
                settings.socialMediaConnections = {};
            }

            settings.socialMediaConnections[platform] = tokenData;
            await settings.save();

            console.log(`[SOCIAL IMPORT] OAuth token stored for ${platform}`);
        } catch (error) {
            console.error('[SOCIAL IMPORT] Error storing OAuth token:', error);
            throw error;
        }
    }

    /**
     * Disconnect social media account
     */
    async disconnectSocial(userId, platform) {
        try {
            const settings = await MavulaUserSettings.findOne({ userId });

            if (!settings || !settings.socialMediaConnections) {
                return {
                    success: false,
                    message: 'No social connections found'
                };
            }

            if (settings.socialMediaConnections[platform]) {
                delete settings.socialMediaConnections[platform];
                await settings.save();

                console.log(`[SOCIAL IMPORT] Disconnected ${platform} for user ${userId}`);

                return {
                    success: true,
                    message: `${platform} disconnected successfully`
                };
            }

            return {
                success: false,
                message: `${platform} not connected`
            };
        } catch (error) {
            console.error('[SOCIAL IMPORT] Disconnect error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Get social connection status
     */
    async getConnectionStatus(userId) {
        try {
            const settings = await MavulaUserSettings.findOne({ userId });

            const status = {
                facebook: {
                    connected: !!settings?.socialMediaConnections?.facebook?.accessToken,
                    connectedAt: settings?.socialMediaConnections?.facebook?.connectedAt
                },
                instagram: {
                    connected: !!settings?.socialMediaConnections?.instagram?.accessToken,
                    connectedAt: settings?.socialMediaConnections?.instagram?.connectedAt
                },
                tiktok: {
                    connected: !!settings?.socialMediaConnections?.tiktok?.accessToken,
                    connectedAt: settings?.socialMediaConnections?.tiktok?.connectedAt
                }
            };

            return {
                success: true,
                status
            };
        } catch (error) {
            console.error('[SOCIAL IMPORT] Status check error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
}

module.exports = new MavulaSocialImporter();
