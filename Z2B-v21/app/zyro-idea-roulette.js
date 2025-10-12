/**
 * ZYRO - Idea Roulette
 * Zero2Billionaires Ecosystem
 *
 * Spin for absurd (and sometimes brilliant) business ideas
 * AI-powered idea generation and validation
 */

class ZyroIdeaRoulette {
    constructor(config, aiEngine = null) {
        this.config = config;
        this.aiEngine = aiEngine;
        this.currentIdea = null;
        this.ideaHistory = [];
        this.spinning = false;
    }

    /**
     * Initialize the Idea Roulette
     */
    initialize() {
        this.loadIdeaHistory();
        return {
            categories: this.getCategories(),
            totalIdeas: this.getTotalPossibleIdeas(),
            savedIdeas: this.ideaHistory.length
        };
    }

    /**
     * Get all available categories
     */
    getCategories() {
        return this.config.IDEA_ROULETTE.categories.map(cat => ({
            name: cat.name,
            description: cat.description || '',
            count: cat.prefix.length * cat.business.length * cat.suffix.length
        }));
    }

    /**
     * Calculate total possible ideas
     */
    getTotalPossibleIdeas() {
        return this.config.IDEA_ROULETTE.categories.reduce((total, cat) => {
            return total + (cat.prefix.length * cat.business.length * cat.suffix.length);
        }, 0);
    }

    /**
     * Spin the roulette (with animation support)
     */
    async spin(categoryName = null, useAI = false) {
        if (this.spinning) {
            return {
                success: false,
                message: 'Already spinning! Wait for it...'
            };
        }

        this.spinning = true;

        try {
            // Select category
            const category = categoryName
                ? this.config.IDEA_ROULETTE.categories.find(c => c.name === categoryName)
                : this.getRandomCategory();

            if (!category) {
                throw new Error('Category not found');
            }

            // Generate idea
            let idea;
            if (useAI && this.aiEngine) {
                idea = await this.generateAIIdea(category);
            } else {
                idea = this.generateRandomIdea(category);
            }

            // Save to history
            this.currentIdea = idea;
            this.saveToHistory(idea);

            // Award points
            const points = this.config.IDEA_ROULETTE.rewards.spin;
            const bonusPoints = idea.isViralWorthy ? this.config.IDEA_ROULETTE.rewards.share : 0;

            this.spinning = false;

            return {
                success: true,
                idea: idea,
                points: points,
                bonusPoints: bonusPoints,
                message: this.getSpinMessage(idea)
            };

        } catch (error) {
            this.spinning = false;
            console.error('Spin error:', error);
            return {
                success: false,
                message: 'Spin failed! Try again.',
                error: error.message
            };
        }
    }

    /**
     * Generate a random idea from category
     */
    generateRandomIdea(category) {
        const prefix = this.getRandomItem(category.prefix);
        const business = this.getRandomItem(category.business);
        const suffix = this.getRandomItem(category.suffix);

        const ideaText = `${prefix} ${business} ${suffix}`;

        return {
            id: Date.now(),
            text: ideaText,
            category: category.name,
            parts: { prefix, business, suffix },
            generatedAt: new Date().toISOString(),
            source: 'random',
            isViralWorthy: this.isIdeaViralWorthy(ideaText),
            absurdityScore: this.calculateAbsurdityScore(prefix, business, suffix),
            viabilityScore: this.calculateViabilityScore(prefix, business, suffix)
        };
    }

    /**
     * Generate AI-enhanced idea
     */
    async generateAIIdea(category) {
        try {
            const randomBase = this.generateRandomIdea(category);

            if (!this.aiEngine) {
                // No AI engine - return random idea with AI flag
                return { ...randomBase, source: 'random', aiEnhanced: false };
            }

            // Use AI to enhance/validate the idea
            const prompt = `You are a creative business idea generator for ZYRO, a playful app for aspiring entrepreneurs.

Given this absurd business idea: "${randomBase.text}"

Generate a creative enhancement with:
1. A catchy tagline (max 10 words)
2. A hilarious elevator pitch (max 30 words)
3. One "genius" feature
4. One "wait, this might actually work" insight
5. A ridiculous first customer story (max 20 words)

Keep it funny, playful, and motivational. Format as JSON:
{
    "tagline": "...",
    "pitch": "...",
    "feature": "...",
    "insight": "...",
    "story": "..."
}`;

            let aiResponse;
            if (this.aiEngine.config.OPENAI.apiKey !== 'YOUR_OPENAI_API_KEY') {
                // Real AI call
                aiResponse = await this.aiEngine.callOpenAI(prompt, {
                    model: 'gpt-3.5-turbo',
                    temperature: 0.9,
                    maxTokens: 300
                });
            } else {
                // Simulated AI response
                aiResponse = this.getSimulatedAIResponse(randomBase.text);
            }

            // Parse AI response
            let enhancement;
            try {
                enhancement = typeof aiResponse === 'string'
                    ? JSON.parse(aiResponse)
                    : aiResponse;
            } catch (e) {
                enhancement = this.getSimulatedAIResponse(randomBase.text);
            }

            return {
                ...randomBase,
                source: 'ai',
                aiEnhanced: true,
                enhancement: enhancement,
                isViralWorthy: true // AI ideas are always viral-worthy!
            };

        } catch (error) {
            console.error('AI generation error:', error);
            // Fall back to random idea
            return this.generateRandomIdea(category);
        }
    }

    /**
     * Get simulated AI response (when no API key)
     */
    getSimulatedAIResponse(ideaText) {
        const templates = [
            {
                tagline: "Because why not? 🚀",
                pitch: "Disrupting an industry that didn't know it needed disruption. It's like Uber, but different.",
                feature: "AI-powered algorithm that uses blockchain... somehow",
                insight: "Actually solves procrastination by making work feel like play",
                story: "First customer was a confused billionaire who thought it was brilliant"
            },
            {
                tagline: "The future is weird. Join us. 🎉",
                pitch: "What if I told you that people would pay for this? Because they will.",
                feature: "Subscription model with gamification and social proof",
                insight: "Taps into FOMO better than any social media platform",
                story: "Beta tester made $500 in first week, quit their job, bought a yacht"
            },
            {
                tagline: "Too crazy to fail 💪",
                pitch: "Everyone laughed at the idea. Now they're asking for equity.",
                feature: "Viral loop built into the core experience",
                insight: "People don't know they need it until they try it",
                story: "Customer testimonial: 'This changed my life. I don't know how.'"
            }
        ];

        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Check if idea has viral potential
     */
    isIdeaViralWorthy(ideaText) {
        const viralKeywords = [
            'billionaire', 'automated', 'while you sleep', 'ai-powered',
            'subscription', 'luxury', 'viral', 'tiktok', 'crypto', 'nft'
        ];

        const lowerIdea = ideaText.toLowerCase();
        return viralKeywords.some(keyword => lowerIdea.includes(keyword));
    }

    /**
     * Calculate absurdity score (0-100)
     */
    calculateAbsurdityScore(prefix, business, suffix) {
        const absurdPrefixes = ['luxury', 'ai-powered', 'blockchain-based', 'celebrity'];
        const absurdBusinesses = ['dog walking', 'motivational texting', 'plant whispering'];
        const absurdSuffixes = ['for billionaires', 'via tiktok', 'using only emojis'];

        let score = 50; // Base score

        if (absurdPrefixes.some(p => prefix.toLowerCase().includes(p))) score += 20;
        if (absurdBusinesses.some(b => business.toLowerCase().includes(b))) score += 20;
        if (absurdSuffixes.some(s => suffix.toLowerCase().includes(s))) score += 20;

        return Math.min(100, score);
    }

    /**
     * Calculate viability score (0-100) - inversely related to absurdity
     */
    calculateViabilityScore(prefix, business, suffix) {
        const viablePrefixes = ['online', 'local', 'mobile app'];
        const viableBusinesses = ['consulting', 'coaching', 'content creation'];
        const viableSuffixes = ['for busy professionals', 'on a budget'];

        let score = 30; // Base score

        if (viablePrefixes.some(p => prefix.toLowerCase().includes(p))) score += 25;
        if (viableBusinesses.some(b => business.toLowerCase().includes(b))) score += 25;
        if (viableSuffixes.some(s => suffix.toLowerCase().includes(s))) score += 25;

        return Math.min(100, score);
    }

    /**
     * Get spin message
     */
    getSpinMessage(idea) {
        const absurdity = idea.absurdityScore;

        if (absurdity >= 80) {
            return "🤪 PEAK ABSURDITY! This is either genius or madness!";
        } else if (absurdity >= 60) {
            return "😄 Pretty wild! Might go viral on TikTok!";
        } else if (idea.viabilityScore >= 70) {
            return "🤔 Wait... this might actually work!";
        } else {
            return "✨ Not bad! Give it some thought!";
        }
    }

    /**
     * Save idea to history
     */
    saveToHistory(idea) {
        this.ideaHistory.unshift(idea);

        // Limit history to 50 ideas
        if (this.ideaHistory.length > 50) {
            this.ideaHistory = this.ideaHistory.slice(0, 50);
        }

        // Save to localStorage
        try {
            localStorage.setItem('zyro_idea_history', JSON.stringify(this.ideaHistory));
        } catch (e) {
            console.error('Failed to save idea history:', e);
        }
    }

    /**
     * Load idea history from localStorage
     */
    loadIdeaHistory() {
        try {
            const saved = localStorage.getItem('zyro_idea_history');
            if (saved) {
                this.ideaHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load idea history:', e);
            this.ideaHistory = [];
        }
    }

    /**
     * Get idea history
     */
    getHistory(limit = 10) {
        return this.ideaHistory.slice(0, limit);
    }

    /**
     * Get idea by ID
     */
    getIdeaById(ideaId) {
        return this.ideaHistory.find(idea => idea.id === ideaId);
    }

    /**
     * Mark idea as favorite
     */
    favoriteIdea(ideaId) {
        const idea = this.getIdeaById(ideaId);
        if (idea) {
            idea.favorited = true;
            idea.favoritedAt = new Date().toISOString();
            this.saveHistory();
            return true;
        }
        return false;
    }

    /**
     * Remove idea from favorites
     */
    unfavoriteIdea(ideaId) {
        const idea = this.getIdeaById(ideaId);
        if (idea) {
            idea.favorited = false;
            delete idea.favoritedAt;
            this.saveHistory();
            return true;
        }
        return false;
    }

    /**
     * Get favorite ideas
     */
    getFavorites() {
        return this.ideaHistory.filter(idea => idea.favorited);
    }

    /**
     * Get ideas by category
     */
    getIdeasByCategory(categoryName) {
        return this.ideaHistory.filter(idea => idea.category === categoryName);
    }

    /**
     * Get viral-worthy ideas
     */
    getViralIdeas() {
        return this.ideaHistory.filter(idea => idea.isViralWorthy);
    }

    /**
     * Generate idea validation report
     */
    generateValidationReport(ideaId) {
        const idea = this.getIdeaById(ideaId);
        if (!idea) return null;

        return {
            idea: idea.text,
            scores: {
                absurdity: idea.absurdityScore,
                viability: idea.viabilityScore,
                viral: idea.isViralWorthy ? 100 : 50
            },
            rating: this.getOverallRating(idea),
            recommendation: this.getRecommendation(idea),
            nextSteps: this.getNextSteps(idea),
            similarIdeas: this.findSimilarIdeas(idea)
        };
    }

    /**
     * Get overall rating
     */
    getOverallRating(idea) {
        const viability = idea.viabilityScore;

        if (viability >= 80) return { stars: 5, label: 'Actually Brilliant!' };
        if (viability >= 60) return { stars: 4, label: 'Worth Exploring' };
        if (viability >= 40) return { stars: 3, label: 'Needs Work' };
        if (viability >= 20) return { stars: 2, label: 'Pretty Absurd' };
        return { stars: 1, label: 'Pure Comedy' };
    }

    /**
     * Get recommendation
     */
    getRecommendation(idea) {
        if (idea.viabilityScore >= 70 && idea.isViralWorthy) {
            return "💎 Hidden gem! Research this seriously.";
        } else if (idea.viabilityScore >= 60) {
            return "🤔 Could work with some tweaking.";
        } else if (idea.absurdityScore >= 80) {
            return "😂 Share this for laughs! Might go viral.";
        } else {
            return "🎲 Spin again for better luck!";
        }
    }

    /**
     * Get next steps
     */
    getNextSteps(idea) {
        if (idea.viabilityScore >= 70) {
            return [
                'Research existing competitors',
                'Validate with target audience',
                'Create a simple MVP',
                'Test on small scale',
                'Share with Z2B community'
            ];
        } else if (idea.isViralWorthy) {
            return [
                'Create a funny TikTok about it',
                'Share on social media',
                'See if anyone actually wants it',
                'If yes: build it!',
                'If no: at least you got likes!'
            ];
        } else {
            return [
                'Spin again for more ideas',
                'Combine with another idea',
                'Ask "what if..." questions',
                'Share with friends for feedback',
                'Keep brainstorming!'
            ];
        }
    }

    /**
     * Find similar ideas in history
     */
    findSimilarIdeas(idea, limit = 3) {
        return this.ideaHistory
            .filter(i => i.id !== idea.id)
            .filter(i =>
                i.category === idea.category ||
                i.parts.business === idea.parts.business
            )
            .slice(0, limit);
    }

    /**
     * Generate shareable content for social media
     */
    generateShareContent(ideaId, platform = 'instagram') {
        const idea = this.getIdeaById(ideaId);
        if (!idea) return null;

        const baseContent = {
            idea: idea.text,
            hook: "🎲 Just spun this business idea on ZYRO!",
            cta: "What do you think? Genius or madness? 😂",
            hashtags: this.config.SOCIAL_SHARING.hooks.map(h => h.hashtag),
            url: this.config.SOCIAL_SHARING.shareURL || 'https://zero2billionaires.com/zyro'
        };

        const templates = {
            instagram: {
                ...baseContent,
                format: `${baseContent.hook}\n\n💡 "${idea.text}"\n\n${baseContent.cta}\n\n${baseContent.hashtags.slice(0, 5).join(' ')}\n\n👉 Try ZYRO: ${baseContent.url}`,
                imageText: idea.text
            },
            tiktok: {
                ...baseContent,
                format: `POV: You just discovered your billion-dollar idea 💰\n\n"${idea.text}"\n\nRate it 1-10! 👇`,
                hashtags: ['#businessideas', '#entrepreneur', '#zyro', ...baseContent.hashtags.slice(0, 2)]
            },
            twitter: {
                ...baseContent,
                format: `🎲 Spun this idea on @ZyroApp:\n\n"${idea.text}"\n\nGenius or madness?\n\n${baseContent.hashtags.slice(0, 3).join(' ')}`,
                charCount: null // Will calculate
            },
            facebook: {
                ...baseContent,
                format: `${baseContent.hook}\n\n💡 ${idea.text}\n\n${baseContent.cta}\n\nTry ZYRO and spin your own: ${baseContent.url}`
            }
        };

        const content = templates[platform] || templates.instagram;

        // Calculate character count for Twitter
        if (platform === 'twitter') {
            content.charCount = content.format.length;
            content.withinLimit = content.charCount <= 280;
        }

        return content;
    }

    /**
     * Get statistics
     */
    getStatistics() {
        return {
            totalSpins: this.ideaHistory.length,
            favoriteCount: this.getFavorites().length,
            viralIdeas: this.getViralIdeas().length,
            aiEnhanced: this.ideaHistory.filter(i => i.aiEnhanced).length,
            categoryCounts: this.getCategoryCounts(),
            topCategory: this.getTopCategory(),
            avgAbsurdity: this.getAverageScore('absurdityScore'),
            avgViability: this.getAverageScore('viabilityScore')
        };
    }

    /**
     * Get category counts
     */
    getCategoryCounts() {
        const counts = {};
        this.ideaHistory.forEach(idea => {
            counts[idea.category] = (counts[idea.category] || 0) + 1;
        });
        return counts;
    }

    /**
     * Get top category
     */
    getTopCategory() {
        const counts = this.getCategoryCounts();
        const entries = Object.entries(counts);
        if (entries.length === 0) return null;

        return entries.reduce((top, current) =>
            current[1] > top[1] ? current : top
        );
    }

    /**
     * Get average score
     */
    getAverageScore(scoreKey) {
        if (this.ideaHistory.length === 0) return 0;

        const sum = this.ideaHistory.reduce((total, idea) =>
            total + (idea[scoreKey] || 0), 0
        );

        return Math.round(sum / this.ideaHistory.length);
    }

    /**
     * Helper: Get random item from array
     */
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Helper: Get random category
     */
    getRandomCategory() {
        return this.getRandomItem(this.config.IDEA_ROULETTE.categories);
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('zyro_idea_history', JSON.stringify(this.ideaHistory));
        } catch (e) {
            console.error('Failed to save idea history:', e);
        }
    }

    /**
     * Clear all history
     */
    clearHistory() {
        this.ideaHistory = [];
        this.currentIdea = null;
        try {
            localStorage.removeItem('zyro_idea_history');
        } catch (e) {
            console.error('Failed to clear history:', e);
        }
    }

    /**
     * Export ideas as JSON
     */
    exportIdeas() {
        return {
            exportedAt: new Date().toISOString(),
            totalIdeas: this.ideaHistory.length,
            ideas: this.ideaHistory,
            statistics: this.getStatistics()
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.ZyroIdeaRoulette = ZyroIdeaRoulette;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZyroIdeaRoulette;
}
