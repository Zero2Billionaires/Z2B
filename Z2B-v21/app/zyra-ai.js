/**
 * ZYRA AI Conversation Engine
 * Powered by OpenAI GPT-4
 */

class ZyraAIEngine {
    constructor(config, firebaseService) {
        this.config = config;
        this.firebase = firebaseService;
        this.conversationHistory = new Map();
    }

    /**
     * Generate AI response based on lead data and conversation history
     */
    async generateResponse(leadId, userMessage, leadData) {
        try {
            // Get conversation history
            const history = await this.getConversationHistory(leadId);

            // Determine conversation stage
            const stage = this.determineStage(leadData, history);

            // Build context for AI
            const context = this.buildContext(leadData, stage, history);

            // Get response from AI
            const aiResponse = await this.callOpenAI(context, userMessage);

            // Save conversation
            await this.saveConversation(leadId, userMessage, aiResponse);

            // Update lead stage if needed
            await this.updateStageIfNeeded(leadId, stage, aiResponse);

            return aiResponse;
        } catch (error) {
            console.error('❌ Error generating AI response:', error);
            return this.getFallbackResponse(leadData);
        }
    }

    /**
     * Build AI context based on lead and conversation data
     */
    buildContext(leadData, stage, history) {
        const persona = this.config.TARGET_PERSONA;
        const personality = this.config.AI_PERSONALITY;
        const flow = this.config.CONVERSATION_FLOW;

        let systemPrompt = `You are ZYRA, an AI sales agent for Zero2Billionaires (Z2B).

YOUR MISSION:
Help entry-level employees (ages ${persona.ageRange.join('-')}) build extra income through Z2B's legitimate business platform.

TARGET AUDIENCE:
- Occupations: ${persona.occupations.join(', ')}
- Main platforms: ${persona.platforms.join(', ')}
- Pain points: ${persona.painPoints.join(', ')}
- Goals: ${persona.goals.join(', ')}

YOUR PERSONALITY:
- Tone: ${personality.tone}
- Style: ${personality.style}
- Use emojis naturally ${personality.emoji_usage ? '✅' : '❌'}
- Approach: ${personality.sales_approach}

CURRENT LEAD INFO:
- Name: ${leadData.name}
- Source: ${leadData.metadata?.source || 'unknown'}
- Score: ${leadData.score || 0}
- Stage: ${stage}

CONVERSATION STAGE: ${stage}

RULES:
1. Keep messages SHORT (2-3 sentences max per message)
2. Be human, friendly, and relatable - NOT robotic
3. Provide VALUE before asking for anything
4. Use their name occasionally (not every message)
5. Match their energy and language style
6. Handle objections with empathy
7. Never be pushy or salesy
8. Use testimonials and social proof when relevant
9. Guide them naturally through the funnel

${this.getStageGuidance(stage, flow)}

CONVERSATION HISTORY:
${this.formatHistory(history)}

Remember: You're helping them change their life, not just making a sale. Be authentic.`;

        return systemPrompt;
    }

    /**
     * Get stage-specific guidance
     */
    getStageGuidance(stage, flow) {
        const stageMap = {
            intro: `INTRO STAGE:
- Welcome them warmly
- Show you understand their struggle
- Ask about their biggest challenge
- Build rapport first`,

            qualify: `QUALIFICATION STAGE:
- Dig deeper into their motivation
- Gauge their interest level
- Qualify their fit for Z2B
- Transition to value if interested`,

            value: `VALUE STAGE:
- Explain Z2B clearly (legit platform, not MLM)
- Show how it helps people like them
- Mention automation and ease
- Offer to send more info/video`,

            objection: `OBJECTION HANDLING:
- Listen and validate their concern
- Address with empathy and facts
- Share relevant testimonials
- Give them space if needed`,

            close: `CLOSING STAGE:
- They're ready! Be excited but calm
- Send signup link with clear next steps
- Offer personal onboarding support
- Make it feel like the right decision`
        };

        return stageMap[stage] || stageMap.intro;
    }

    /**
     * Format conversation history for AI context
     */
    formatHistory(history) {
        if (!history || history.length === 0) {
            return 'No previous messages.';
        }

        return history
            .slice(-10) // Last 10 messages
            .map(msg => `${msg.sender === 'ai' ? 'ZYRA' : 'Lead'}: ${msg.content}`)
            .join('\n');
    }

    /**
     * Call OpenAI API
     */
    async callOpenAI(systemPrompt, userMessage) {
        const apiKey = this.config.OPENAI.apiKey;

        // If no API key, use simulated response
        if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
            console.log('ℹ️ Using simulated AI response (no API key)');
            return this.getSimulatedResponse(userMessage);
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: this.config.OPENAI.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: this.config.OPENAI.maxTokens,
                    temperature: this.config.OPENAI.temperature
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0]) {
                return data.choices[0].message.content.trim();
            } else {
                throw new Error('Invalid OpenAI response');
            }
        } catch (error) {
            console.error('❌ OpenAI API error:', error);
            return this.getFallbackResponse();
        }
    }

    /**
     * Get simulated AI response (for testing without API key)
     */
    getSimulatedResponse(userMessage) {
        const message = userMessage.toLowerCase();

        if (message.includes('interested') || message.includes('yes') || message.includes('tell me more')) {
            return "Awesome! 🎉 So here's the deal - Z2B helps people just like you build real income while working their regular job. Everything is automated, no pitching to friends or family. Want me to send you a quick 2-min video that breaks it all down?";
        }

        if (message.includes('time') || message.includes('busy')) {
            return "I totally get it! That's actually why Z2B is perfect for busy people like you 😊 It's 100% automated - you set it up once and it runs in the background. Most members spend less than 30 mins a week on it. Sound better?";
        }

        if (message.includes('money') || message.includes('afford') || message.includes('cost')) {
            return "Fair question! The starter tier is super affordable - R480/month (that's like R16 a day 😅). And here's the thing: most people make that back in their first week. Would you like to see some testimonials from people who started exactly where you are?";
        }

        if (message.includes('scam') || message.includes('legit') || message.includes('real')) {
            return "Smart to ask! I respect that 💪 Z2B is a legit registered company - been running for years. We're not an MLM or pyramid scheme. You earn by helping others access business tools. Over 10,000 active members. Want me to share some success stories?";
        }

        // Default intro response
        return "Hey! Thanks for your message 👋 Quick question - what's your biggest reason for looking into this? Is it more money, more time, or just trying to escape the 9-to-5 grind?";
    }

    /**
     * Determine conversation stage
     */
    determineStage(leadData, history) {
        if (!history || history.length === 0) {
            return 'intro';
        }

        const score = leadData.score || 0;
        const messageCount = history.length;

        // Stage progression based on score and engagement
        if (score >= 25) return 'close';
        if (score >= 15) return 'value';
        if (score >= 8) return 'qualify';
        if (messageCount >= 3 && score < 8) return 'objection';

        return 'intro';
    }

    /**
     * Get conversation history
     */
    async getConversationHistory(leadId) {
        // Check local cache first
        if (this.conversationHistory.has(leadId)) {
            return this.conversationHistory.get(leadId);
        }

        // Get from Firebase
        const history = await this.firebase.getConversations(leadId);
        this.conversationHistory.set(leadId, history);
        return history;
    }

    /**
     * Save conversation
     */
    async saveConversation(leadId, userMessage, aiResponse) {
        // Save user message
        await this.firebase.addConversationMessage(leadId, {
            sender: 'lead',
            content: userMessage
        });

        // Save AI response
        await this.firebase.addConversationMessage(leadId, {
            sender: 'ai',
            content: aiResponse
        });

        // Update local cache
        const history = await this.firebase.getConversations(leadId);
        this.conversationHistory.set(leadId, history);
    }

    /**
     * Update stage if conversation progresses
     */
    async updateStageIfNeeded(leadId, currentStage, aiResponse) {
        // Simple stage detection based on AI response content
        const response = aiResponse.toLowerCase();

        let newStage = currentStage;

        if (response.includes('signup') || response.includes('ready to start')) {
            newStage = 'close';
        } else if (response.includes('video') || response.includes('testimonial')) {
            newStage = 'value';
        } else if (response.includes('interested') || response.includes('want to know')) {
            newStage = 'qualify';
        }

        if (newStage !== currentStage) {
            await this.firebase.updateLead(leadId, { stage: newStage });
        }
    }

    /**
     * Send automated follow-up
     */
    async sendFollowUp(leadId, leadData) {
        const schedule = this.config.AUTOMATION_SETTINGS.follow_up_schedule;
        const lastContact = leadData.lastContact;

        if (!lastContact) return;

        const timeSinceContact = Date.now() - new Date(lastContact).getTime();

        for (const followUp of schedule) {
            const delayMs = followUp.delay * 1000;

            if (timeSinceContact >= delayMs && !leadData.followUpSent?.[followUp.delay]) {
                // Send follow-up message
                const message = this.personalizeMessage(followUp.message, leadData);

                await this.firebase.addConversationMessage(leadId, {
                    sender: 'ai',
                    content: message,
                    metadata: { type: 'follow_up', delay: followUp.delay }
                });

                // Mark follow-up as sent
                await this.firebase.updateLead(leadId, {
                    [`followUpSent.${followUp.delay}`]: true
                });

                console.log('📨 Follow-up sent to:', leadData.name);
                break;
            }
        }
    }

    /**
     * Personalize message with lead data
     */
    personalizeMessage(template, leadData) {
        return template
            .replace(/{name}/g, leadData.name || 'there')
            .replace(/{occupation}/g, leadData.occupation || 'job')
            .replace(/{pain_point}/g, 'making extra income')
            .replace(/{topic}/g, 'financial freedom');
    }

    /**
     * Get fallback response
     */
    getFallbackResponse(leadData = {}) {
        return `Hey ${leadData.name || 'there'}! Thanks for reaching out 👋 I'm here to help you explore how Z2B can help you build extra income. What questions can I answer for you?`;
    }

    /**
     * Analyze sentiment of user message
     */
    analyzeSentiment(message) {
        const positive = ['yes', 'interested', 'tell me', 'awesome', 'great', 'sounds good'];
        const negative = ['no', 'not interested', 'scam', 'spam', 'stop'];
        const hesitant = ['maybe', 'think', 'not sure', 'later'];

        const msg = message.toLowerCase();

        if (positive.some(word => msg.includes(word))) return 'positive';
        if (negative.some(word => msg.includes(word))) return 'negative';
        if (hesitant.some(word => msg.includes(word))) return 'hesitant';

        return 'neutral';
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.ZyraAIEngine = ZyraAIEngine;
}
