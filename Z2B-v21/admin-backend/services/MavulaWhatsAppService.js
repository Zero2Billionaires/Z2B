const axios = require('axios');
const MavulaProspect = require('../models/MavulaProspect');
const MavulaConversation = require('../models/MavulaConversation');
const MavulaDailyActivity = require('../models/MavulaDailyActivity');
const MavulaAIService = require('./MavulaAIService');

class MavulaWhatsAppService {
    constructor() {
        // Twilio configuration (primary)
        this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
        this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        this.twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

        // Ultramsg configuration (fallback)
        this.ultramsgInstanceId = process.env.ULTRAMSG_INSTANCE_ID;
        this.ultramsgToken = process.env.ULTRAMSG_TOKEN;

        // Rate limiting settings
        this.maxMessagesPerDay = 50;
        this.messageDelaySeconds = 30; // Delay between different prospects
        this.sameProspectDelayMinutes = 2; // Delay to same prospect
    }

    // ===================================================================
    // SENDING MESSAGES
    // ===================================================================

    /**
     * Send AI-generated message to prospect
     */
    async sendAIMessage(prospectId, message, userId) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);

            if (!prospect) {
                throw new Error('Prospect not found');
            }

            // Check if prospect has opted out
            if (prospect.hasOptedOut) {
                return {
                    success: false,
                    message: 'Prospect has opted out of messages',
                    code: 'OPTED_OUT'
                };
            }

            // Check rate limit
            const canSend = await this.checkRateLimit(userId);
            if (!canSend) {
                return {
                    success: false,
                    message: 'Daily message limit reached (50 messages)',
                    code: 'RATE_LIMIT_EXCEEDED'
                };
            }

            // Check same prospect delay
            if (prospect.lastContactDate) {
                const minutesSinceLastContact = (Date.now() - prospect.lastContactDate) / (1000 * 60);
                if (minutesSinceLastContact < this.sameProspectDelayMinutes) {
                    return {
                        success: false,
                        message: `Please wait ${this.sameProspectDelayMinutes} minutes between messages to the same prospect`,
                        code: 'SAME_PROSPECT_DELAY'
                    };
                }
            }

            // Format phone number (ensure it has country code)
            const formattedPhone = this.formatPhoneNumber(prospect.phone);

            // Add opt-out footer to message
            const fullMessage = this._addOptOutFooter(message);

            // Try sending via Twilio first, fallback to Ultramsg
            let result;
            try {
                result = await this._sendViaTwilio(formattedPhone, fullMessage);
            } catch (twilioError) {
                console.warn('Twilio failed, trying Ultramsg:', twilioError.message);
                try {
                    result = await this._sendViaUltramsg(formattedPhone, fullMessage);
                } catch (ultramsgError) {
                    console.error('Both providers failed:', ultramsgError.message);
                    throw new Error('Failed to send message via both providers');
                }
            }

            // Update prospect
            prospect.lastContactDate = new Date();
            prospect.totalMessagesSent++;
            await prospect.save();

            // Record in conversation
            const conversation = await MavulaConversation.findOne({ prospectId });
            if (conversation) {
                await conversation.addMessage({
                    role: 'AI',
                    content: message,
                    timestamp: new Date(),
                    whatsappMessageId: result.messageId,
                    whatsappStatus: 'SENT',
                    aiProvider: 'CLAUDE',
                    messageType: 'TEXT'
                });
            }

            // Update daily activity
            const todayActivity = await MavulaDailyActivity.getTodayActivity(userId);
            await todayActivity.updateAchievements({ messagesSent: 1 });

            // Track message sent
            await this._trackMessageSent(userId, prospectId);

            return {
                success: true,
                messageId: result.messageId,
                provider: result.provider,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Error sending AI message:', error);
            throw error;
        }
    }

    /**
     * Send message via Twilio
     */
    async _sendViaTwilio(to, message) {
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;

            const response = await axios.post(url, new URLSearchParams({
                From: this.twilioWhatsAppNumber,
                To: `whatsapp:${to}`,
                Body: message
            }), {
                auth: {
                    username: this.twilioAccountSid,
                    password: this.twilioAuthToken
                }
            });

            return {
                messageId: response.data.sid,
                provider: 'TWILIO',
                status: response.data.status
            };
        } catch (error) {
            console.error('Twilio send error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Send message via Ultramsg
     */
    async _sendViaUltramsg(to, message) {
        try {
            const url = `https://api.ultramsg.com/${this.ultramsgInstanceId}/messages/chat`;

            const response = await axios.post(url, {
                token: this.ultramsgToken,
                to: to,
                body: message
            });

            return {
                messageId: response.data.id || Date.now().toString(),
                provider: 'ULTRAMSG',
                status: 'sent'
            };
        } catch (error) {
            console.error('Ultramsg send error:', error.response?.data || error.message);
            throw error;
        }
    }

    // ===================================================================
    // RECEIVING MESSAGES (Webhook Processing)
    // ===================================================================

    /**
     * Process incoming Twilio webhook
     */
    async processTwilioWebhook(webhookData) {
        try {
            const from = webhookData.From?.replace('whatsapp:', '');
            const body = webhookData.Body;
            const messageId = webhookData.MessageSid;

            return await this.handleIncomingMessage(from, body, messageId, 'TWILIO');
        } catch (error) {
            console.error('Error processing Twilio webhook:', error);
            throw error;
        }
    }

    /**
     * Process incoming Ultramsg webhook
     */
    async processUltramsgWebhook(webhookData) {
        try {
            const from = webhookData.from;
            const body = webhookData.body;
            const messageId = webhookData.id;

            return await this.handleIncomingMessage(from, body, messageId, 'ULTRAMSG');
        } catch (error) {
            console.error('Error processing Ultramsg webhook:', error);
            throw error;
        }
    }

    /**
     * Handle incoming message from prospect
     */
    async handleIncomingMessage(fromPhone, messageBody, messageId, provider) {
        try {
            // Format phone number
            const formattedPhone = this.formatPhoneNumber(fromPhone);

            // Find prospect by phone number
            const prospect = await MavulaProspect.findOne({
                phone: formattedPhone
            });

            if (!prospect) {
                console.log(`Incoming message from unknown number: ${formattedPhone}`);
                return {
                    success: false,
                    message: 'Prospect not found'
                };
            }

            // Check for opt-out keywords
            if (this._isOptOutMessage(messageBody)) {
                return await this._handleOptOut(prospect, messageId);
            }

            // Update prospect
            prospect.totalMessagesReceived++;
            prospect.hasEverResponded = true;

            // Calculate response time
            if (prospect.lastContactDate) {
                const responseTimeMinutes = (Date.now() - prospect.lastContactDate) / (1000 * 60);

                // Update average response time
                if (prospect.averageResponseTime) {
                    prospect.averageResponseTime = (prospect.averageResponseTime + responseTimeMinutes) / 2;
                } else {
                    prospect.averageResponseTime = responseTimeMinutes;
                }
            }

            await prospect.save();

            // Record in conversation
            const conversation = await MavulaConversation.findOne({ prospectId: prospect._id });
            if (conversation) {
                await conversation.addMessage({
                    role: 'PROSPECT',
                    content: messageBody,
                    timestamp: new Date(),
                    whatsappMessageId: messageId,
                    whatsappStatus: 'RECEIVED',
                    messageType: 'TEXT'
                });

                // Analyze sentiment
                try {
                    const sentimentResult = await MavulaAIService.analyzeSentiment(messageBody);

                    // Update last message with sentiment
                    const lastMessage = conversation.messages[conversation.messages.length - 1];
                    lastMessage.sentiment = sentimentResult.sentiment;
                    await conversation.save();
                } catch (err) {
                    console.error('Sentiment analysis failed:', err);
                }
            }

            // Update daily activity
            const todayActivity = await MavulaDailyActivity.getTodayActivity(prospect.userId);
            await todayActivity.updateAchievements({ messagesReceived: 1 });

            // Trigger auto-response if enabled
            const settings = await require('../models/MavulaUserSettings').findOne({
                userId: prospect.userId
            });

            if (settings?.autoResponseEnabled && prospect.automationEnabled) {
                // Create automation job for response
                const MavulaAutomationJob = require('../models/MavulaAutomationJob');

                await MavulaAutomationJob.createJob({
                    userId: prospect.userId,
                    prospectId: prospect._id,
                    jobType: 'RESPONSE_REQUIRED',
                    scheduledFor: new Date(Date.now() + (this.messageDelaySeconds * 1000)), // 30 second delay
                    priority: 8, // High priority for responses
                    contextData: {
                        lastProspectMessage: messageBody
                    }
                });
            }

            return {
                success: true,
                prospectId: prospect._id,
                conversationId: conversation?._id,
                autoResponseScheduled: settings?.autoResponseEnabled
            };
        } catch (error) {
            console.error('Error handling incoming message:', error);
            throw error;
        }
    }

    // ===================================================================
    // RATE LIMITING
    // ===================================================================

    /**
     * Check if user can send more messages today
     */
    async checkRateLimit(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Count unique recipients today
            const MavulaConversation = require('../models/MavulaConversation');

            const conversations = await MavulaConversation.aggregate([
                {
                    $match: {
                        userId: require('mongoose').Types.ObjectId(userId),
                        'messages.timestamp': { $gte: today },
                        'messages.role': 'AI'
                    }
                },
                { $unwind: '$messages' },
                {
                    $match: {
                        'messages.timestamp': { $gte: today },
                        'messages.role': 'AI'
                    }
                },
                {
                    $group: {
                        _id: '$prospectId'
                    }
                },
                { $count: 'uniqueRecipients' }
            ]);

            const uniqueRecipients = conversations[0]?.uniqueRecipients || 0;

            return uniqueRecipients < this.maxMessagesPerDay;
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return false;
        }
    }

    /**
     * Get rate limit status for user
     */
    async getRateLimitStatus(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const MavulaConversation = require('../models/MavulaConversation');

            const conversations = await MavulaConversation.aggregate([
                {
                    $match: {
                        userId: require('mongoose').Types.ObjectId(userId),
                        'messages.timestamp': { $gte: today },
                        'messages.role': 'AI'
                    }
                },
                { $unwind: '$messages' },
                {
                    $match: {
                        'messages.timestamp': { $gte: today },
                        'messages.role': 'AI'
                    }
                },
                {
                    $group: {
                        _id: '$prospectId'
                    }
                },
                { $count: 'uniqueRecipients' }
            ]);

            const used = conversations[0]?.uniqueRecipients || 0;
            const remaining = Math.max(0, this.maxMessagesPerDay - used);

            return {
                limit: this.maxMessagesPerDay,
                used,
                remaining,
                resetTime: new Date(today.getTime() + (24 * 60 * 60 * 1000))
            };
        } catch (error) {
            console.error('Error getting rate limit status:', error);
            throw error;
        }
    }

    // ===================================================================
    // OPT-OUT HANDLING
    // ===================================================================

    /**
     * Check if message is an opt-out request
     */
    _isOptOutMessage(message) {
        const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'opt out', 'opt-out'];
        const lowerMessage = message.toLowerCase().trim();

        return optOutKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    /**
     * Handle opt-out request
     */
    async _handleOptOut(prospect, messageId) {
        try {
            // Mark prospect as opted out
            prospect.hasOptedOut = true;
            prospect.optedOutDate = new Date();
            prospect.automationEnabled = false;
            await prospect.save();

            // Cancel pending automation jobs
            const MavulaAutomationJob = require('../models/MavulaAutomationJob');
            await MavulaAutomationJob.cancelProspectJobs(
                prospect._id,
                'Prospect opted out'
            );

            // Record in conversation
            const conversation = await MavulaConversation.findOne({ prospectId: prospect._id });
            if (conversation) {
                await conversation.addMessage({
                    role: 'SYSTEM',
                    content: 'Prospect opted out of messages',
                    timestamp: new Date(),
                    whatsappMessageId: messageId,
                    messageType: 'SYSTEM_NOTE'
                });
            }

            // Send confirmation message
            const confirmationMessage = 'You have been unsubscribed from MAVULA messages. You will not receive any further messages from us. Thank you.';

            try {
                await this._sendViaTwilio(prospect.phone, confirmationMessage);
            } catch (err) {
                // Silently fail - opt-out is recorded regardless
                console.error('Failed to send opt-out confirmation:', err);
            }

            return {
                success: true,
                message: 'Prospect opted out successfully',
                prospectId: prospect._id
            };
        } catch (error) {
            console.error('Error handling opt-out:', error);
            throw error;
        }
    }

    // ===================================================================
    // HELPER METHODS
    // ===================================================================

    /**
     * Format phone number to international format
     */
    formatPhoneNumber(phone) {
        // Remove all non-numeric characters
        let cleaned = phone.replace(/\D/g, '');

        // If starts with 0 (South African local format), replace with 27
        if (cleaned.startsWith('0')) {
            cleaned = '27' + cleaned.substring(1);
        }

        // If doesn't have country code, assume South Africa (27)
        if (cleaned.length === 9) {
            cleaned = '27' + cleaned;
        }

        // Add + prefix
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }

        return cleaned;
    }

    /**
     * Add opt-out footer to message
     */
    _addOptOutFooter(message) {
        return `${message}\n\n_Reply STOP to unsubscribe_`;
    }

    /**
     * Track message sent for rate limiting
     */
    async _trackMessageSent(userId, prospectId) {
        // This is tracked via conversation messages
        // No additional storage needed
        return true;
    }

    /**
     * Update message status (for delivery tracking)
     */
    async updateMessageStatus(prospectId, whatsappMessageId, status) {
        try {
            const conversation = await MavulaConversation.findOne({ prospectId });

            if (!conversation) {
                return false;
            }

            // Find message and update status
            const message = conversation.messages.find(
                m => m.whatsappMessageId === whatsappMessageId
            );

            if (message) {
                message.whatsappStatus = status;
                await conversation.save();
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error updating message status:', error);
            return false;
        }
    }
}

module.exports = new MavulaWhatsAppService();
