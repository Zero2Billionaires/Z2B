/**
 * ZYRO - Hustle MadLibs
 * Zero2Billionaires Ecosystem
 *
 * Fill-in-the-blank business pitch generator
 */

class ZyroHustleMadLibs {
    constructor(config, pointsCallback = null) {
        this.config = config;
        this.pointsCallback = pointsCallback;
        this.currentMadLib = null;
        this.completedMadLibs = [];
    }

    /**
     * Initialize MadLibs
     */
    initialize() {
        this.loadHistory();
        return {
            templates: this.getTemplateList(),
            completed: this.completedMadLibs.length,
            points: this.completedMadLibs.length * this.config.HUSTLE_MADLIBS.rewards.complete
        };
    }

    /**
     * Get list of available templates
     */
    getTemplateList() {
        return this.config.HUSTLE_MADLIBS.templates.map(template => ({
            id: template.id,
            title: template.title,
            description: template.description || 'Fill in the blanks for a hilarious pitch!',
            blanksCount: template.blanks.length,
            difficulty: this.getTemplateDifficulty(template),
            category: template.category || 'business'
        }));
    }

    /**
     * Get template difficulty
     */
    getTemplateDifficulty(template) {
        const blankCount = template.blanks.length;
        if (blankCount <= 5) return 'easy';
        if (blankCount <= 8) return 'medium';
        return 'hard';
    }

    /**
     * Start a new MadLib
     */
    startMadLib(templateId) {
        const template = this.config.HUSTLE_MADLIBS.templates.find(t => t.id === templateId);

        if (!template) {
            return {
                success: false,
                message: 'Template not found'
            };
        }

        this.currentMadLib = {
            id: Date.now(),
            templateId: templateId,
            title: template.title,
            template: template.template,
            blanks: template.blanks.map(blank => ({
                ...blank,
                value: null
            })),
            completed: false,
            startedAt: new Date().toISOString(),
            completedAt: null
        };

        return {
            success: true,
            madlib: this.currentMadLib,
            blanks: this.currentMadLib.blanks,
            message: 'MadLib started! Fill in the blanks!'
        };
    }

    /**
     * Fill in a blank
     */
    fillBlank(blankIndex, value) {
        if (!this.currentMadLib) {
            return {
                success: false,
                message: 'No active MadLib. Start one first!'
            };
        }

        if (blankIndex < 0 || blankIndex >= this.currentMadLib.blanks.length) {
            return {
                success: false,
                message: 'Invalid blank index'
            };
        }

        const blank = this.currentMadLib.blanks[blankIndex];
        blank.value = value;

        return {
            success: true,
            blank: blank,
            allFilled: this.isAllFilled(),
            canComplete: this.isAllFilled()
        };
    }

    /**
     * Fill all blanks at once
     */
    fillAllBlanks(values) {
        if (!this.currentMadLib) {
            return {
                success: false,
                message: 'No active MadLib. Start one first!'
            };
        }

        if (values.length !== this.currentMadLib.blanks.length) {
            return {
                success: false,
                message: 'Incorrect number of values'
            };
        }

        this.currentMadLib.blanks.forEach((blank, index) => {
            blank.value = values[index];
        });

        return {
            success: true,
            allFilled: true,
            canComplete: true
        };
    }

    /**
     * Check if all blanks are filled
     */
    isAllFilled() {
        if (!this.currentMadLib) return false;
        return this.currentMadLib.blanks.every(blank => blank.value && blank.value.trim() !== '');
    }

    /**
     * Complete the MadLib and generate result
     */
    complete() {
        if (!this.currentMadLib) {
            return {
                success: false,
                message: 'No active MadLib'
            };
        }

        if (!this.isAllFilled()) {
            return {
                success: false,
                message: 'Fill in all blanks first!',
                emptyBlanks: this.currentMadLib.blanks
                    .map((b, i) => ({ index: i, ...b }))
                    .filter(b => !b.value || b.value.trim() === '')
            };
        }

        // Generate the completed text
        const result = this.generateResult();

        // Mark as completed
        this.currentMadLib.completed = true;
        this.currentMadLib.completedAt = new Date().toISOString();
        this.currentMadLib.result = result;

        // Calculate humor score
        const humorScore = this.calculateHumorScore(result);
        this.currentMadLib.humorScore = humorScore;

        // Save to history
        this.completedMadLibs.push({
            ...this.currentMadLib
        });
        this.saveHistory();

        // Award points
        const basePoints = this.config.HUSTLE_MADLIBS.rewards.complete;
        const bonusPoints = humorScore >= 80 ? this.config.HUSTLE_MADLIBS.rewards.share : 0;
        const totalPoints = basePoints + bonusPoints;

        if (this.pointsCallback) {
            this.pointsCallback(totalPoints, 'MadLib completed');
        }

        return {
            success: true,
            result: result,
            humorScore: humorScore,
            points: basePoints,
            bonusPoints: bonusPoints,
            totalPoints: totalPoints,
            message: this.getCompletionMessage(humorScore),
            canShare: true
        };
    }

    /**
     * Generate the completed result
     */
    generateResult() {
        let template = this.currentMadLib.template;

        // Replace placeholders with values
        this.currentMadLib.blanks.forEach((blank, index) => {
            const placeholder = `[${blank.type}]`;
            template = template.replace(placeholder, blank.value);
        });

        return template;
    }

    /**
     * Calculate humor score
     */
    calculateHumorScore(result) {
        let score = 50; // Base score

        const funnyWords = [
            'billion', 'millionaire', 'yacht', 'lamborghini', 'diamond',
            'unicorn', 'rocket', 'ninja', 'wizard', 'galaxy', 'quantum',
            'turbo', 'mega', 'ultra', 'supreme', 'legendary', 'epic'
        ];

        const resultLower = result.toLowerCase();

        // Check for funny words
        funnyWords.forEach(word => {
            if (resultLower.includes(word)) {
                score += 5;
            }
        });

        // Length bonus (longer is funnier)
        if (result.length > 200) score += 10;
        if (result.length > 300) score += 10;

        // Exclamation marks (enthusiasm is funny)
        const exclamations = (result.match(/!/g) || []).length;
        score += Math.min(exclamations * 5, 20);

        // Capital letters (LOUD is funny)
        const capitals = (result.match(/[A-Z]/g) || []).length;
        if (capitals > 10) score += 10;

        // Emojis would be funny (but we're working with text)

        // Random factor for fun
        score += Math.random() * 20;

        return Math.min(Math.round(score), 100);
    }

    /**
     * Get completion message
     */
    getCompletionMessage(humorScore) {
        if (humorScore >= 90) {
            return "🤣 COMEDY GOLD! This is absolutely hilarious!";
        } else if (humorScore >= 75) {
            return "😂 Pretty funny! This could go viral!";
        } else if (humorScore >= 60) {
            return "😄 Nice one! Made me chuckle!";
        } else {
            return "😊 Not bad! Try another for more laughs!";
        }
    }

    /**
     * Get random suggestions for a blank type
     */
    getBlankSuggestions(blankType) {
        const suggestions = {
            'ADJECTIVE': [
                'Automated', 'Luxury', 'Viral', 'AI-Powered', 'Revolutionary',
                'Disruptive', 'Epic', 'Legendary', 'Mind-Blowing', 'Insane'
            ],
            'NOUN': [
                'Billionaire', 'Unicorn', 'Empire', 'Dynasty', 'Kingdom',
                'Hustle', 'Grind', 'Vision', 'Dream', 'Journey'
            ],
            'VERB': [
                'Dominate', 'Conquer', 'Crush', 'Disrupt', 'Transform',
                'Revolutionize', 'Innovate', 'Scale', 'Launch', 'Build'
            ],
            'PLURAL_NOUN': [
                'Customers', 'Followers', 'Investors', 'Millionaires', 'Entrepreneurs',
                'Dreams', 'Ideas', 'Opportunities', 'Challenges', 'Goals'
            ],
            'VERB_ING': [
                'Scaling', 'Growing', 'Building', 'Creating', 'Launching',
                'Disrupting', 'Innovating', 'Transforming', 'Hustling', 'Grinding'
            ],
            'ADVERB': [
                'Quickly', 'Exponentially', 'Effortlessly', 'Automatically', 'Instantly',
                'Dramatically', 'Massively', 'Incredibly', 'Spectacularly', 'Powerfully'
            ],
            'NUMBER': [
                '1000', '10,000', '100,000', '1,000,000', '10 million',
                '100 million', '1 billion', '24', '7', '365'
            ],
            'PLACE': [
                'Dubai', 'Silicon Valley', 'Wall Street', 'Hollywood', 'Miami',
                'Manhattan', 'Monaco', 'Malibu', 'The Moon', 'Mars'
            ],
            'PERSON': [
                'Elon Musk', 'Warren Buffett', 'Oprah', 'Mark Zuckerberg', 'Bill Gates',
                'Richard Branson', 'Jeff Bezos', 'Your Future Self', 'A Billionaire Mentor'
            ],
            'EMOTION': [
                'Excited', 'Motivated', 'Inspired', 'Pumped', 'Fired Up',
                'Unstoppable', 'Confident', 'Passionate', 'Determined', 'Fearless'
            ],
            'PRODUCT': [
                'App', 'Course', 'Book', 'Platform', 'System',
                'Framework', 'Blueprint', 'Masterclass', 'Program', 'Academy'
            ],
            'BUSINESS': [
                'SaaS Company', 'E-commerce Store', 'Coaching Business', 'Agency', 'Startup',
                'Consulting Firm', 'Online Course', 'Membership Site', 'Software', 'Platform'
            ]
        };

        return suggestions[blankType] || ['Amazing', 'Incredible', 'Awesome'];
    }

    /**
     * Get a random suggestion for current blank
     */
    getRandomSuggestion(blankIndex) {
        if (!this.currentMadLib) return null;

        const blank = this.currentMadLib.blanks[blankIndex];
        if (!blank) return null;

        const suggestions = this.getBlankSuggestions(blank.type);
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }

    /**
     * Auto-fill with random suggestions (for fun/testing)
     */
    autoFill() {
        if (!this.currentMadLib) {
            return {
                success: false,
                message: 'No active MadLib'
            };
        }

        this.currentMadLib.blanks.forEach((blank, index) => {
            blank.value = this.getRandomSuggestion(index);
        });

        return {
            success: true,
            blanks: this.currentMadLib.blanks,
            message: 'Auto-filled with random words! Complete to see result!'
        };
    }

    /**
     * Get MadLib history
     */
    getHistory(limit = 10) {
        return this.completedMadLibs
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, limit);
    }

    /**
     * Get MadLib by ID
     */
    getMadLibById(madlibId) {
        return this.completedMadLibs.find(m => m.id === madlibId);
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const completed = this.completedMadLibs.length;
        const avgHumorScore = completed > 0
            ? Math.round(this.completedMadLibs.reduce((sum, m) => sum + m.humorScore, 0) / completed)
            : 0;

        const templateCounts = {};
        this.completedMadLibs.forEach(m => {
            templateCounts[m.templateId] = (templateCounts[m.templateId] || 0) + 1;
        });

        const favoriteTemplate = Object.entries(templateCounts)
            .sort((a, b) => b[1] - a[1])[0];

        return {
            totalCompleted: completed,
            averageHumorScore: avgHumorScore,
            favoriteTemplate: favoriteTemplate ? {
                id: favoriteTemplate[0],
                count: favoriteTemplate[1]
            } : null,
            highestScore: completed > 0
                ? Math.max(...this.completedMadLibs.map(m => m.humorScore))
                : 0,
            totalPoints: completed * this.config.HUSTLE_MADLIBS.rewards.complete
        };
    }

    /**
     * Generate shareable content
     */
    generateShareContent(madlibId, platform = 'instagram') {
        const madlib = this.getMadLibById(madlibId);
        if (!madlib) return null;

        const hook = "🎭 I just created the most hilarious business pitch!";
        const hashtags = ['#HustleMadLibs', '#ZYRO', '#Z2B', '#EntrepreneurHumor'];

        const templates = {
            instagram: {
                format: `${hook}\n\n"${madlib.result}"\n\n😂 Humor Score: ${madlib.humorScore}/100\n\n${hashtags.join(' ')}\n\nCreate yours: ${this.config.SOCIAL_SHARING?.shareURL || 'zero2billionaires.com/zyro'}`,
                visual: madlib.result
            },
            tiktok: {
                format: `Watch me pitch this RIDICULOUS business idea! 😂\n\n"${madlib.result}"\n\n${hashtags.slice(0, 3).join(' ')}`,
                visual: madlib.result
            },
            twitter: {
                format: `${hook}\n\n"${madlib.result.substring(0, 150)}${madlib.result.length > 150 ? '...' : ''}"\n\n${hashtags.slice(0, 2).join(' ')}`,
                charCount: null
            },
            facebook: {
                format: `${hook}\n\n${madlib.result}\n\nHumor Score: ${madlib.humorScore}/100 🎯\n\nTry ZYRO MadLibs: ${this.config.SOCIAL_SHARING?.shareURL || 'zero2billionaires.com/zyro'}`
            }
        };

        const content = templates[platform] || templates.instagram;

        if (platform === 'twitter') {
            content.charCount = content.format.length;
            content.withinLimit = content.charCount <= 280;
        }

        return content;
    }

    /**
     * Reset current MadLib
     */
    reset() {
        this.currentMadLib = null;
        return {
            success: true,
            message: 'MadLib reset. Start a new one!'
        };
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('zyro_madlibs_history', JSON.stringify(this.completedMadLibs));
        } catch (e) {
            console.error('Failed to save MadLibs history:', e);
        }
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('zyro_madlibs_history');
            if (saved) {
                this.completedMadLibs = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load MadLibs history:', e);
            this.completedMadLibs = [];
        }
    }

    /**
     * Clear all history
     */
    clearHistory() {
        this.completedMadLibs = [];
        this.currentMadLib = null;
        try {
            localStorage.removeItem('zyro_madlibs_history');
        } catch (e) {
            console.error('Failed to clear history:', e);
        }
    }

    /**
     * Export completed MadLibs
     */
    export() {
        return {
            exportedAt: new Date().toISOString(),
            total: this.completedMadLibs.length,
            madlibs: this.completedMadLibs,
            statistics: this.getStatistics()
        };
    }

    /**
     * Get current progress
     */
    getCurrentProgress() {
        if (!this.currentMadLib) {
            return {
                active: false,
                message: 'No active MadLib'
            };
        }

        const filled = this.currentMadLib.blanks.filter(b => b.value && b.value.trim() !== '').length;
        const total = this.currentMadLib.blanks.length;
        const progress = Math.round((filled / total) * 100);

        return {
            active: true,
            madlib: this.currentMadLib,
            filled: filled,
            total: total,
            progress: progress,
            remaining: total - filled,
            canComplete: filled === total,
            nextBlank: this.currentMadLib.blanks.find(b => !b.value || b.value.trim() === '')
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.ZyroHustleMadLibs = ZyroHustleMadLibs;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZyroHustleMadLibs;
}
