/**
 * BENOWN AI Content Generation Engine
 * Powered by OpenAI GPT-4
 */

class BenownAIEngine {
    constructor(config) {
        this.config = config;
        this.generationHistory = [];
    }

    /**
     * Generate content based on type, platform, and template
     */
    async generateContent(contentType, platform, template, customPrompt = null, brandSettings = {}) {
        try {
            const platformConfig = this.config.PLATFORMS[platform.toUpperCase()];
            const templateConfig = this.config.TEMPLATES[template.toUpperCase()];
            const brandVoice = brandSettings.voice || 'CASUAL';

            // Build AI prompt
            const prompt = this.buildPrompt(contentType, platformConfig, templateConfig, customPrompt, brandSettings);

            // Generate content
            const content = await this.callOpenAI(prompt);

            // Optimize for platform
            const optimized = this.optimizeForPlatform(content, platformConfig, contentType);

            // Generate hashtags
            const hashtags = await this.generateHashtags(content, platform, template);

            // Save to history
            this.saveToHistory({
                contentType,
                platform,
                template,
                content: optimized,
                hashtags,
                timestamp: new Date().toISOString()
            });

            return {
                content: optimized,
                hashtags,
                platform,
                metadata: {
                    contentType,
                    template,
                    characterCount: optimized.length,
                    estimatedReach: this.estimateReach(platform),
                    suggestions: this.getSuggestions(optimized, platformConfig)
                }
            };

        } catch (error) {
            console.error('❌ Content generation error:', error);
            return this.getFallbackContent(contentType, platform, template);
        }
    }

    /**
     * Build comprehensive AI prompt
     */
    buildPrompt(contentType, platformConfig, templateConfig, customPrompt, brandSettings) {
        const audience = this.config.TARGET_AUDIENCE;
        const voice = this.config.BRAND_VOICES[brandSettings.voice || 'CASUAL'];

        let systemPrompt = `You are BENOWN, an AI content creator for the Zero2Billionaires (Z2B) platform.

YOUR MISSION:
Create engaging, authentic social media content for employees who want to become entrepreneurs.

TARGET AUDIENCE:
- Age: ${audience.demographics.age.join('-')} years old
- Occupations: ${audience.demographics.occupations.join(', ')}
- Pain Points: ${audience.psychographics.painPoints.join(', ')}
- Goals: ${audience.psychographics.goals.join(', ')}
- Interests: ${audience.psychographics.interests.join(', ')}

PLATFORM: ${platformConfig.name}
- Character limit: ${platformConfig.captionLimit || 'flexible'}
- Content type: ${contentType}

TEMPLATE: ${templateConfig.category}
- Purpose: ${templateConfig.prompt}
- Tone: ${templateConfig.tone}
- Call to Action: ${templateConfig.callToAction ? 'Yes - include clear CTA' : 'No CTA needed'}

BRAND VOICE: ${voice.tone}
- Language style: ${voice.language}
- Emoji usage: ${voice.emoji}
- Best for: ${voice.audience}

BRAND SETTINGS:
${brandSettings.tagline ? `- Tagline: "${brandSettings.tagline}"` : ''}
${brandSettings.values ? `- Core values: ${brandSettings.values}` : ''}
${brandSettings.uniqueSellingPoint ? `- USP: ${brandSettings.uniqueSellingPoint}` : ''}

CONTENT RULES:
1. Be AUTHENTIC - sound like a real person, not a corporate robot
2. Lead with VALUE - help first, sell second
3. Use STORYTELLING - make it relatable and emotional
4. Keep it SCANNABLE - short paragraphs, line breaks
5. Include EMOJIS naturally (${voice.emoji} usage)
6. End with a QUESTION or CTA to boost engagement
7. AVOID: corporate jargon, being salesy, overused phrases

${customPrompt ? `SPECIAL INSTRUCTIONS: ${customPrompt}` : ''}

EXAMPLE GOOD CONTENT:
"Just finished a 12-hour shift as a security guard 😮‍💨

You know what kept me going? Knowing my side hustle is building in the background while I work.

Zero2Billionaires taught me that you don't need to quit your job to start building your empire.

You just need the right system.

Who else is building their Plan B while working their 9-to-5? Drop a 👋 below!"

Now create compelling ${contentType} content for ${platformConfig.name}.`;

        return systemPrompt;
    }

    /**
     * Call OpenAI API
     */
    async callOpenAI(prompt) {
        const apiKey = this.config.OPENAI.apiKey;

        // If no API key, use simulated response
        if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
            console.log('ℹ️ Using simulated content (no API key)');
            return this.getSimulatedContent(prompt);
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
                        { role: 'system', content: prompt },
                        { role: 'user', content: 'Generate the content now.' }
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
            return this.getSimulatedContent(prompt);
        }
    }

    /**
     * Get simulated content for testing
     */
    getSimulatedContent(prompt) {
        const simulatedPosts = {
            motivational: `Ever feel like you're working hard but going nowhere? 😓

I used to think the same thing - until I discovered Zero2Billionaires.

Now I'm building my financial freedom WHILE working my regular job. No quitting. No risk. Just smart moves.

If I can do it, so can you 💪

Who's ready to transform their life? Comment "READY" below! 👇`,

            educational: `Quick tip for aspiring entrepreneurs: 💡

You don't need to choose between your job and your dreams.

Start small:
✅ 30 mins a day learning
✅ Build systems that work while you sleep
✅ Leverage automation tools (like Z2B!)
✅ Focus on ONE income stream first

What's your biggest challenge starting a side hustle? Let me know! 👇`,

            promotional: `Remember when I said I'd never escape the 9-to-5? 🤔

Well, last month I earned an extra R8,500 with Zero2Billionaires... while still working my regular job.

No MLM. No sketchy schemes. Just a legit platform that automates the heavy lifting.

Want to see how? Drop a "INFO" and I'll send you the details 📲`,

            engagement: `Real talk: What would you do with an extra R5,000 a month? 💭

Me? I'd finally:
- Take my family on that vacation 🏖️
- Pay off some debt
- Start investing
- Sleep better at night knowing I'm building something

Your turn - what's YOUR dream? Let's motivate each other! 👇`,

            testimonial: `Meet Sarah - nurse, mom of 2, and now a BOSS 👑

She joined Z2B 3 months ago while working night shifts.

Today? She's earning R12,000/month extra. All automated.

"I thought it was too good to be true. But here I am, living proof it works!" - Sarah

Your success story starts today. Who's next? 🚀`,

            tutorial: `How to start your side hustle in 30 minutes: 🚀

Step 1: Pick ONE thing you're good at (or want to learn)
Step 2: Join a platform that does the heavy lifting (like Z2B)
Step 3: Set up automation so it runs 24/7
Step 4: Watch it grow while you work your day job
Step 5: Scale when you're ready

That's it. No need to overcomplicate.

Who's starting TODAY? Let me know! 💪`
        };

        // Try to match template from prompt
        for (const [key, content] of Object.entries(simulatedPosts)) {
            if (prompt.toLowerCase().includes(key)) {
                return content;
            }
        }

        // Default fallback
        return simulatedPosts.motivational;
    }

    /**
     * Optimize content for specific platform
     */
    optimizeForPlatform(content, platformConfig, contentType) {
        let optimized = content;

        // Trim to character limit if needed
        if (platformConfig.captionLimit && optimized.length > platformConfig.captionLimit) {
            optimized = optimized.substring(0, platformConfig.captionLimit - 3) + '...';
        }

        // Platform-specific formatting
        switch (platformConfig.name) {
            case 'Twitter/X':
                // Keep it concise for Twitter
                optimized = this.createThreadIfNeeded(optimized, platformConfig.textLimit);
                break;

            case 'LinkedIn':
                // Add professional formatting
                optimized = this.formatForLinkedIn(optimized);
                break;

            case 'TikTok':
                // Extract key message for short caption
                optimized = this.extractKeyMessage(optimized, 150);
                break;
        }

        return optimized;
    }

    /**
     * Generate hashtags based on content and platform
     */
    async generateHashtags(content, platform, template) {
        const strategy = this.config.HASHTAG_STRATEGY;
        const maxTags = strategy.maxHashtags[platform.toLowerCase()] || 10;

        let hashtags = [];

        // Add branded hashtags
        const brandedCount = Math.ceil(maxTags * strategy.mix.branded);
        hashtags.push(...strategy.categories.branded.slice(0, brandedCount));

        // Add niche hashtags
        const nicheCount = Math.ceil(maxTags * strategy.mix.niche);
        hashtags.push(...strategy.categories.niche.slice(0, nicheCount));

        // Add engagement hashtags
        const engagementCount = Math.ceil(maxTags * strategy.mix.engagement);
        hashtags.push(...strategy.categories.engagement.slice(0, engagementCount));

        // Generate content-specific hashtags from AI
        const aiHashtags = await this.generateAIHashtags(content, maxTags - hashtags.length);
        hashtags.push(...aiHashtags);

        // Ensure we don't exceed max
        return hashtags.slice(0, maxTags);
    }

    /**
     * Generate AI-powered hashtags
     */
    async generateAIHashtags(content, count) {
        // Simulated hashtag generation
        const commonHashtags = [
            '#Entrepreneurship', '#SideHustle', '#PassiveIncome', '#FinancialFreedom',
            '#WorkFromHome', '#BusinessOwner', '#MoneyMindset', '#WealthBuilding',
            '#OnlineBusiness', '#EntrepreneurLife', '#SuccessMindset', '#DreamBig',
            '#BossLife', '#HustleHard', '#MillionaireMindset', '#FutureMillionaire'
        ];

        // Simple keyword extraction (in production, use NLP)
        const keywords = content.toLowerCase().match(/\b(success|freedom|income|business|entrepreneur|money|wealth|build|hustle)\b/g) || [];

        const relevantTags = commonHashtags.filter(tag =>
            keywords.some(keyword => tag.toLowerCase().includes(keyword))
        );

        return relevantTags.slice(0, count);
    }

    /**
     * Create Twitter thread if content is too long
     */
    createThreadIfNeeded(content, limit) {
        if (content.length <= limit) {
            return content;
        }

        // Split into tweets
        const sentences = content.split(/[.!?]+/);
        let thread = [];
        let currentTweet = '';

        sentences.forEach(sentence => {
            if ((currentTweet + sentence).length < limit - 10) {
                currentTweet += sentence + '. ';
            } else {
                thread.push(currentTweet.trim());
                currentTweet = sentence + '. ';
            }
        });

        if (currentTweet) {
            thread.push(currentTweet.trim());
        }

        return thread.map((tweet, i) => `${i + 1}/ ${tweet}`).join('\n\n');
    }

    /**
     * Format content for LinkedIn
     */
    formatForLinkedIn(content) {
        // Add extra line breaks for readability
        return content
            .replace(/\n/g, '\n\n')
            .replace(/([.!?])\s+/g, '$1\n\n');
    }

    /**
     * Extract key message for short platforms
     */
    extractKeyMessage(content, maxLength) {
        const sentences = content.split(/[.!?]+/);
        let message = sentences[0];

        if (message.length > maxLength) {
            message = message.substring(0, maxLength - 3) + '...';
        }

        return message + '...';
    }

    /**
     * Estimate potential reach
     */
    estimateReach(platform) {
        const estimates = {
            instagram: '500-2,000',
            tiktok: '1,000-10,000',
            facebook: '300-1,500',
            linkedin: '200-800',
            youtube: '100-500',
            twitter: '400-2,000'
        };

        return estimates[platform.toLowerCase()] || '500-1,500';
    }

    /**
     * Get content improvement suggestions
     */
    getSuggestions(content, platformConfig) {
        const suggestions = [];

        // Check length
        if (content.length < 50) {
            suggestions.push('Consider adding more details for better engagement');
        }

        // Check for emojis
        const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
        if (emojiCount === 0) {
            suggestions.push('Add emojis to make content more engaging');
        }

        // Check for CTA
        const hasCTA = /\?(comment|share|tag|drop|let me know|what do you think)/i.test(content);
        if (!hasCTA) {
            suggestions.push('Add a call-to-action question to boost engagement');
        }

        // Check line breaks
        const lines = content.split('\n').length;
        if (lines < 3 && content.length > 100) {
            suggestions.push('Add line breaks for better readability');
        }

        return suggestions;
    }

    /**
     * Generate video script
     */
    async generateVideoScript(topic, duration, platform) {
        const prompt = `Create a ${duration}-second video script for ${platform} about: ${topic}

Format:
[HOOK] (0-3s): Attention-grabbing opening
[PROBLEM] (3-10s): Address pain point
[SOLUTION] (10-25s): Present Z2B as solution
[PROOF] (25-40s): Share testimonial or result
[CTA] (40-${duration}s): Clear call to action

Make it conversational and energetic!`;

        const script = await this.callOpenAI(prompt);
        return this.formatVideoScript(script);
    }

    /**
     * Format video script with timestamps
     */
    formatVideoScript(rawScript) {
        return {
            formatted: rawScript,
            sections: this.extractScriptSections(rawScript),
            visualSuggestions: this.generateVisualSuggestions(rawScript),
            bgmSuggestion: 'Upbeat, motivational music',
            duration: '30-60 seconds'
        };
    }

    /**
     * Extract script sections
     */
    extractScriptSections(script) {
        const sections = [];
        const matches = script.match(/\[(.*?)\](.*?)(?=\[|$)/gs);

        if (matches) {
            matches.forEach(match => {
                const title = match.match(/\[(.*?)\]/)[1];
                const content = match.replace(/\[.*?\]/, '').trim();
                sections.push({ title, content });
            });
        }

        return sections;
    }

    /**
     * Generate visual suggestions for video
     */
    generateVisualSuggestions(script) {
        return [
            'Show text overlay with key points',
            'Use dynamic transitions between scenes',
            'Include before/after comparison',
            'Add testimonial screenshots',
            'End with website/signup link overlay'
        ];
    }

    /**
     * Save generation to history
     */
    saveToHistory(generation) {
        this.generationHistory.push(generation);

        // Keep last 100 generations
        if (this.generationHistory.length > 100) {
            this.generationHistory.shift();
        }
    }

    /**
     * Get fallback content
     */
    getFallbackContent(contentType, platform, template) {
        return {
            content: this.getSimulatedContent('fallback'),
            hashtags: ['#Z2B', '#SideHustle', '#PassiveIncome'],
            platform,
            metadata: {
                contentType,
                template,
                characterCount: 250,
                estimatedReach: '500-1,500',
                suggestions: ['AI generation failed - using fallback content']
            }
        };
    }

    /**
     * Generate content ideas
     */
    async generateIdeas(topic, count = 10) {
        const prompt = `Generate ${count} engaging social media content ideas about: ${topic}

Target audience: Entry-level employees (22-40) wanting to become entrepreneurs
Format: One-line content ideas that would work on Instagram, TikTok, or Facebook

Make them:
- Relatable to 9-to-5 workers
- Focused on side hustles and financial freedom
- Mix of motivational, educational, and engagement posts`;

        const ideas = await this.callOpenAI(prompt);
        return ideas.split('\n').filter(idea => idea.trim().length > 0);
    }

    /**
     * Remix content for different platforms
     */
    async remixContent(originalContent, fromPlatform, toPlatform) {
        const targetPlatform = this.config.PLATFORMS[toPlatform.toUpperCase()];

        const prompt = `Adapt this ${fromPlatform} content for ${toPlatform}:

Original:
${originalContent}

Platform requirements:
- Max length: ${targetPlatform.captionLimit || 'flexible'}
- Tone: ${toPlatform === 'linkedin' ? 'more professional' : 'keep casual'}
- Format: ${targetPlatform.contentTypes.join(', ')}

Optimize for ${toPlatform} while keeping the core message.`;

        const remixed = await this.callOpenAI(prompt);
        return this.optimizeForPlatform(remixed, targetPlatform, 'SOCIAL_POST');
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.BenownAIEngine = BenownAIEngine;
}
