const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const MavulaContentLibrary = require('../models/MavulaContentLibrary');
const MavulaProspect = require('../models/MavulaProspect');
const MavulaUserSettings = require('../models/MavulaUserSettings');

class MavulaAIService {
    constructor() {
        // Initialize Claude API (Anthropic) - only if real API key provided
        if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('YOUR_')) {
            this.claude = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY
            });
        } else {
            console.warn('⚠️ ANTHROPIC_API_KEY not configured - Claude AI features will not work');
            this.claude = null;
        }

        // Initialize OpenAI API - only if real API key provided
        if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('YOUR_')) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        } else {
            console.warn('⚠️ OPENAI_API_KEY not configured - OpenAI features will not work');
            this.openai = null;
        }

        // Model configurations
        this.claudeModel = 'claude-3-5-sonnet-20241022';
        this.openaiModel = 'gpt-4-turbo-preview';
    }

    // ===================================================================
    // MESSAGE GENERATION (Uses Claude for natural conversations)
    // ===================================================================

    /**
     * Generate ice breaker message for first contact
     */
    async generateOpener(prospectId, userId) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);
            const settings = await MavulaUserSettings.findOne({ userId });
            const contentLibrary = await MavulaContentLibrary.getContentSummaryForAI(userId, 3);

            // Build context
            const systemPrompt = this._buildSystemPrompt(prospect, settings, contentLibrary, 'INITIAL_CONTACT');

            const userPrompt = `Generate a warm, friendly ice-breaker WhatsApp message to start a conversation with ${prospect.prospectName}.

Context:
- Prospect source: ${prospect.source}
- Their profile: ${prospect.sourceProfileUrl || 'Unknown'}

Guidelines:
- Keep it casual and conversational (1-2 sentences max)
- Don't mention Z2B or business yet
- Find common ground or give a genuine compliment
- Ask an open-ended question
- ${settings?.messagePersonalization?.includeEmojis ? 'Include 1-2 emojis naturally' : 'No emojis'}
- Sound human, not salesy

Generate the opener now:`;

            const response = await this._callClaude(systemPrompt, userPrompt, []);

            return {
                success: true,
                message: response.content,
                aiProvider: 'CLAUDE',
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
                model: this.claudeModel
            };
        } catch (error) {
            console.error('Error generating opener:', error);
            throw error;
        }
    }

    /**
     * Generate response to prospect's message
     */
    async generateResponse(prospectId, userId, conversationHistory = []) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);
            const settings = await MavulaUserSettings.findOne({ userId });
            const contentLibrary = await MavulaContentLibrary.getContentSummaryForAI(userId, 5);

            // Build system prompt with current stage context
            const systemPrompt = this._buildSystemPrompt(prospect, settings, contentLibrary, prospect.conversationStage);

            // Get last prospect message
            const lastProspectMessage = conversationHistory
                .filter(m => m.role === 'user')
                .pop();

            const userPrompt = `The prospect just said: "${lastProspectMessage?.content || ''}"

Generate a natural, conversational response that:
1. Acknowledges their message warmly
2. ${this._getStageGuidance(prospect.conversationStage)}
3. Keeps the conversation flowing
4. Stays authentic and human
5. Is 2-3 sentences max

Generate the response now:`;

            const response = await this._callClaude(systemPrompt, userPrompt, conversationHistory);

            return {
                success: true,
                message: response.content,
                aiProvider: 'CLAUDE',
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
                model: this.claudeModel
            };
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    /**
     * Generate follow-up message
     */
    async generateFollowUp(prospectId, userId, daysSinceLastContact) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);
            const settings = await MavulaUserSettings.findOne({ userId });
            const contentLibrary = await MavulaContentLibrary.getContentSummaryForAI(userId, 3);

            const systemPrompt = this._buildSystemPrompt(prospect, settings, contentLibrary, prospect.conversationStage);

            const userPrompt = `It's been ${daysSinceLastContact} days since last contact with ${prospect.prospectName}.
Previous stage: ${prospect.conversationStage}
Pain points identified: ${prospect.conversationContext?.painPoints?.join(', ') || 'None yet'}

Generate a friendly follow-up message that:
1. Feels natural (not pushy)
2. Re-engages them with value
3. Respects their time
4. Invites a response
5. 2-3 sentences max

Generate the follow-up now:`;

            const response = await this._callClaude(systemPrompt, userPrompt, []);

            return {
                success: true,
                message: response.content,
                aiProvider: 'CLAUDE',
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
                model: this.claudeModel
            };
        } catch (error) {
            console.error('Error generating follow-up:', error);
            throw error;
        }
    }

    /**
     * Generate objection handling response
     */
    async generateObjectionHandler(prospectId, userId, objection, conversationHistory = []) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);
            const settings = await MavulaUserSettings.findOne({ userId });
            const contentLibrary = await MavulaContentLibrary.getContentSummaryForAI(userId, 5);

            const systemPrompt = this._buildSystemPrompt(prospect, settings, contentLibrary, 'OBJECTION_HANDLING');

            const userPrompt = `The prospect raised this concern: "${objection}"

Generate a response that:
1. Validates their concern (don't dismiss it)
2. Addresses it with empathy and logic
3. Reframes it positively
4. Keeps them engaged
5. Doesn't sound scripted
6. 2-4 sentences max

Generate the objection response now:`;

            const response = await this._callClaude(systemPrompt, userPrompt, conversationHistory);

            return {
                success: true,
                message: response.content,
                aiProvider: 'CLAUDE',
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
                model: this.claudeModel
            };
        } catch (error) {
            console.error('Error generating objection handler:', error);
            throw error;
        }
    }

    /**
     * Generate closing message (ask for the sale)
     */
    async generateClosingMessage(prospectId, userId, conversationHistory = []) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);
            const settings = await MavulaUserSettings.findOne({ userId });
            const contentLibrary = await MavulaContentLibrary.getContentSummaryForAI(userId, 5);

            const systemPrompt = this._buildSystemPrompt(prospect, settings, contentLibrary, 'CLOSING');

            const userPrompt = `It's time to make the ask. The prospect has shown interest and seems ready.

Generate a closing message that:
1. Summarizes the value they'll get
2. Makes a clear, soft ask (not pushy)
3. Provides next step (registration link)
4. Creates urgency without pressure
5. Feels natural and conversational
6. 3-4 sentences max

Generate the closing message now:`;

            const response = await this._callClaude(systemPrompt, userPrompt, conversationHistory);

            // Append registration link
            const registrationLink = `https://z2blegacybuilders.co.za/register.html?ref=${settings?.referralCode || 'Z2B'}`;
            const finalMessage = `${response.content}\n\nRegister here: ${registrationLink}`;

            return {
                success: true,
                message: finalMessage,
                aiProvider: 'CLAUDE',
                tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
                model: this.claudeModel
            };
        } catch (error) {
            console.error('Error generating closing message:', error);
            throw error;
        }
    }

    // ===================================================================
    // CONTENT GENERATION (Uses OpenAI for structured output)
    // ===================================================================

    /**
     * Generate content summary using OpenAI
     */
    async generateContentSummary(text, maxLength = 500) {
        try {
            const response = await this.openai.chat.completions.create({
                model: this.openaiModel,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a content summarization expert. Create concise, accurate summaries.'
                    },
                    {
                        role: 'user',
                        content: `Summarize the following content in ${maxLength} characters or less. Focus on key points relevant to network marketing and Z2B Legacy Builders:\n\n${text}`
                    }
                ],
                max_tokens: 500,
                temperature: 0.3
            });

            return {
                success: true,
                summary: response.choices[0].message.content,
                tokensUsed: response.usage.total_tokens
            };
        } catch (error) {
            console.error('Error generating summary:', error);
            throw error;
        }
    }

    /**
     * Extract key points from content
     */
    async extractKeyPoints(text, maxPoints = 5) {
        try {
            const response = await this.openai.chat.completions.create({
                model: this.openaiModel,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a content analysis expert. Extract key points in a structured format.'
                    },
                    {
                        role: 'user',
                        content: `Extract ${maxPoints} key points from this content. Return as a JSON array of strings:\n\n${text}`
                    }
                ],
                max_tokens: 500,
                temperature: 0.3,
                response_format: { type: 'json_object' }
            });

            const result = JSON.parse(response.choices[0].message.content);

            return {
                success: true,
                keyPoints: result.keyPoints || result.points || [],
                tokensUsed: response.usage.total_tokens
            };
        } catch (error) {
            console.error('Error extracting key points:', error);
            throw error;
        }
    }

    // ===================================================================
    // INTELLIGENCE & ANALYSIS (Uses Claude for reasoning)
    // ===================================================================

    /**
     * Analyze sentiment of prospect's message
     */
    async analyzeSentiment(message) {
        try {
            const response = await this._callClaude(
                'You are a sentiment analysis expert.',
                `Analyze the sentiment of this message and respond with only one word: POSITIVE, NEUTRAL, or NEGATIVE.\n\nMessage: "${message}"`,
                []
            );

            const sentiment = response.content.trim().toUpperCase();

            return {
                success: true,
                sentiment: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(sentiment) ? sentiment : 'NEUTRAL'
            };
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            return { success: false, sentiment: 'NEUTRAL' };
        }
    }

    /**
     * Calculate lead score based on conversation
     */
    async calculateLeadScore(prospectId, conversationHistory = []) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);

            // Calculate engagement level (0-25)
            const responseRate = prospect.totalMessagesSent > 0
                ? (prospect.totalMessagesReceived / prospect.totalMessagesSent)
                : 0;
            const engagementLevel = Math.min(responseRate * 25, 25);

            // Calculate response speed (0-25)
            let responseSpeed = 0;
            if (prospect.averageResponseTime) {
                if (prospect.averageResponseTime < 60) responseSpeed = 25;
                else if (prospect.averageResponseTime < 240) responseSpeed = 20;
                else if (prospect.averageResponseTime < 1440) responseSpeed = 15;
                else responseSpeed = 10;
            }

            // Use Claude to detect buying signals (0-25)
            const prospectMessages = conversationHistory
                .filter(m => m.role === 'user')
                .map(m => m.content)
                .join('\n');

            const buyingSignalsResponse = await this._callClaude(
                'You are a sales expert analyzing prospect messages for buying signals.',
                `Analyze these messages and rate the buying signal strength from 0-25. Consider: questions about pricing, how to join, expressing goals, requesting info, agreeing to calls.\n\nMessages:\n${prospectMessages}\n\nRespond with only a number from 0-25:`,
                []
            );

            const questionQuality = parseInt(buyingSignalsResponse.content.trim()) || 0;

            // Commitment signals from conversationContext (0-25)
            let commitmentSignals = 0;
            if (prospect.conversationContext?.askedAboutPricing) commitmentSignals += 10;
            if (prospect.conversationContext?.askedAboutHowToJoin) commitmentSignals += 15;
            if (prospect.conversationContext?.sharedPersonalGoals) commitmentSignals += 5;
            if (prospect.conversationContext?.requestedMoreInfo) commitmentSignals += 5;
            if (prospect.conversationContext?.agreedToCall) commitmentSignals += 20;
            commitmentSignals = Math.min(commitmentSignals, 25);

            // Update prospect score
            prospect.scoreFactors = {
                engagementLevel,
                responseSpeed,
                questionQuality,
                commitmentSignals
            };

            const totalScore = prospect.calculateScore();
            await prospect.save();

            return {
                success: true,
                leadScore: totalScore,
                breakdown: {
                    engagementLevel,
                    responseSpeed,
                    questionQuality,
                    commitmentSignals
                }
            };
        } catch (error) {
            console.error('Error calculating lead score:', error);
            throw error;
        }
    }

    /**
     * Suggest next action for prospect
     */
    async suggestNextAction(prospectId, conversationHistory = []) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);

            const prompt = `Based on this prospect's current state, suggest the best next action.

Prospect: ${prospect.prospectName}
Current Stage: ${prospect.conversationStage}
Lead Score: ${prospect.leadScore}
Temperature: ${prospect.leadTemperature}
Days since contact: ${Math.floor((Date.now() - prospect.lastContactDate) / (1000 * 60 * 60 * 24))}
Has responded: ${prospect.hasEverResponded}

Respond with one of these actions and a brief reason:
- SEND_FOLLOW_UP
- ADVANCE_STAGE
- HANDLE_OBJECTION
- CLOSE
- WAIT
- MARK_DORMANT

Format: ACTION | Reason`;

            const response = await this._callClaude(
                'You are a sales strategy expert.',
                prompt,
                []
            );

            const [action, reason] = response.content.split('|').map(s => s.trim());

            return {
                success: true,
                action,
                reason
            };
        } catch (error) {
            console.error('Error suggesting next action:', error);
            throw error;
        }
    }

    // ===================================================================
    // HELPER METHODS
    // ===================================================================

    /**
     * Build system prompt for Claude with context
     */
    _buildSystemPrompt(prospect, settings, contentLibrary, stage) {
        const companyInfo = contentLibrary
            .filter(c => c.category === 'COMPANY_INFO')
            .map(c => `${c.title}: ${c.summary}`)
            .join('\n\n');

        const productInfo = contentLibrary
            .filter(c => c.category === 'PRODUCT_INFO')
            .map(c => `${c.title}: ${c.summary}`)
            .join('\n\n');

        return `You are MAVULA, an AI prospecting assistant for Z2B Legacy Builders, a network marketing platform in South Africa.

YOUR ROLE:
- Help Z2B members prospect and convert leads
- Have natural, human-like WhatsApp conversations
- Build trust before pitching
- Handle objections gracefully
- Never be pushy or salesy

CONVERSATION GUIDELINES:
1. Always be warm, friendly, and authentic
2. Use South African context and language patterns
3. Mirror the prospect's communication style
4. Ask questions to understand pain points
5. Present Z2B as a solution, not a sales pitch
6. ${settings?.messagePersonalization?.includeEmojis ? 'Use emojis sparingly and naturally' : 'No emojis'}
7. Keep messages concise (2-3 sentences max per message)
8. Never mention you're an AI

CURRENT PROSPECT:
Name: ${prospect.prospectName}
Stage: ${stage}
Pain Points: ${prospect.conversationContext?.painPoints?.join(', ') || 'Unknown'}
Interests: ${prospect.conversationContext?.interests?.join(', ') || 'Unknown'}

COMPANY KNOWLEDGE:
${companyInfo || 'Z2B Legacy Builders helps people build passive income through network marketing and AI-powered tools.'}

PRODUCTS/SERVICES:
${productInfo || '7 income streams, AI tools, training programs, and team support.'}

COMMUNICATION STYLE: ${settings?.communicationStyle || 'FRIENDLY'}

Remember: You're having a WhatsApp conversation, not writing an email. Be conversational, brief, and human.`;
    }

    /**
     * Get stage-specific guidance
     */
    _getStageGuidance(stage) {
        const guidance = {
            'INITIAL_CONTACT': 'Build rapport, show genuine interest',
            'TRUST_BUILDING': 'Ask about their situation, listen actively',
            'NEEDS_DISCOVERY': 'Uncover pain points and goals',
            'VALUE_PRESENTATION': 'Show how Z2B solves their problems',
            'OBJECTION_HANDLING': 'Address concerns with empathy',
            'CLOSING': 'Make a soft ask for commitment',
            'FOLLOW_UP': 'Re-engage with value',
            'CONVERTED': 'Congratulate and onboard',
            'DORMANT': 'Gentle re-engagement attempt'
        };

        return guidance[stage] || 'Continue building the relationship';
    }

    /**
     * Call Claude API with error handling
     */
    async _callClaude(systemPrompt, userPrompt, conversationHistory = []) {
        try {
            const messages = [
                ...conversationHistory,
                { role: 'user', content: userPrompt }
            ];

            const response = await this.claude.messages.create({
                model: this.claudeModel,
                max_tokens: 1024,
                system: systemPrompt,
                messages: messages
            });

            return {
                content: response.content[0].text,
                usage: response.usage
            };
        } catch (error) {
            console.error('Claude API error:', error);
            throw new Error(`Claude API failed: ${error.message}`);
        }
    }
}

module.exports = new MavulaAIService();
