/**
 * ZYRO - Z2B Ecosystem Integration
 * Zero2Billionaires Platform
 *
 * Connects ZYRO with ZYRA, BENOWN, GLOWIE, and MANLAW
 */

class ZyroZ2BIntegration {
    constructor(config, firebaseService = null) {
        this.config = config;
        this.firebase = firebaseService;
        this.currentUser = null;
        this.apps = {
            zyro: { name: 'ZYRO', icon: '🎮', status: 'active' },
            zyra: { name: 'ZYRA', icon: '🤖', status: 'connected' },
            benown: { name: 'BENOWN', icon: '🎨', status: 'connected' },
            glowie: { name: 'GLOWIE', icon: '✨', status: 'pending' },
            manlaw: { name: 'MANLAW', icon: '⚖️', status: 'pending' }
        };
        this.sharedData = {};
        this.syncQueue = [];
    }

    /**
     * Initialize integration system
     */
    async initialize(userId) {
        this.currentUser = userId;
        await this.loadSharedData();
        await this.syncWithApps();

        return {
            apps: this.getConnectedApps(),
            syncStatus: this.getSyncStatus(),
            sharedData: this.getSharedDataSummary()
        };
    }

    /**
     * Get connected apps
     */
    getConnectedApps() {
        return Object.entries(this.apps).map(([id, app]) => ({
            id,
            ...app,
            url: this.getAppUrl(id)
        }));
    }

    /**
     * Get app URL
     */
    getAppUrl(appId) {
        const baseUrl = '/app/';
        const urls = {
            zyro: `${baseUrl}zyro.html`,
            zyra: `${baseUrl}zyra.html`,
            benown: `${baseUrl}benown.html`,
            glowie: `${baseUrl}glowie.html`,
            manlaw: `${baseUrl}manlaw.html`
        };

        return urls[appId] || '#';
    }

    /**
     * Sync data with all apps
     */
    async syncWithApps() {
        const syncTasks = [];

        // Sync with ZYRA
        if (this.apps.zyra.status === 'connected') {
            syncTasks.push(this.syncWithZyra());
        }

        // Sync with BENOWN
        if (this.apps.benown.status === 'connected') {
            syncTasks.push(this.syncWithBenown());
        }

        // Sync with GLOWIE
        if (this.apps.glowie.status === 'connected') {
            syncTasks.push(this.syncWithGlowie());
        }

        // Sync with MANLAW
        if (this.apps.manlaw.status === 'connected') {
            syncTasks.push(this.syncWithManlaw());
        }

        await Promise.all(syncTasks);

        return {
            success: true,
            syncedApps: syncTasks.length,
            lastSync: new Date().toISOString()
        };
    }

    /**
     * Sync with ZYRA (AI Sales Agent)
     */
    async syncWithZyra() {
        try {
            // Data to send to ZYRA
            const zyroData = {
                userActivity: {
                    engagement: this.calculateEngagementLevel(),
                    interests: this.extractUserInterests(),
                    motivations: this.identifyMotivations(),
                    painPoints: this.identifyPainPoints()
                },
                contentIdeas: this.getContentIdeasForLeads(),
                userPersonality: this.getUserPersonality(),
                lastUpdated: new Date().toISOString()
            };

            // Data to receive from ZYRA
            const zyraData = await this.fetchZyraData();

            if (zyraData) {
                // Use ZYRA insights to personalize ZYRO experience
                this.sharedData.zyra = {
                    leadInsights: zyraData.leadInsights,
                    commonObjections: zyraData.commonObjections,
                    conversionTriggers: zyraData.conversionTriggers,
                    successStories: zyraData.successStories
                };
            }

            await this.saveSharedData();

            return {
                app: 'zyra',
                sent: zyroData,
                received: zyraData,
                success: true
            };

        } catch (error) {
            console.error('ZYRA sync error:', error);
            return {
                app: 'zyra',
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sync with BENOWN (AI Content Creator)
     */
    async syncWithBenown() {
        try {
            // Data to send to BENOWN
            const zyroData = {
                viralContent: {
                    topIdeas: this.getTopViralIdeas(),
                    funnyMadlibs: this.getFunniestMadlibs(),
                    popularQuizResults: this.getPopularQuizResults(),
                    trendingChallenges: this.getTrendingChallenges()
                },
                audienceInsights: {
                    interests: this.extractUserInterests(),
                    personality: this.getUserPersonality(),
                    engagementPatterns: this.getEngagementPatterns()
                },
                contentSuggestions: this.generateContentSuggestions(),
                lastUpdated: new Date().toISOString()
            };

            // Data to receive from BENOWN
            const benownData = await this.fetchBenownData();

            if (benownData) {
                // Use BENOWN content in ZYRO challenges and ideas
                this.sharedData.benown = {
                    contentPerformance: benownData.contentPerformance,
                    viralTopics: benownData.viralTopics,
                    trendingHashtags: benownData.trendingHashtags
                };
            }

            await this.saveSharedData();

            return {
                app: 'benown',
                sent: zyroData,
                received: benownData,
                success: true
            };

        } catch (error) {
            console.error('BENOWN sync error:', error);
            return {
                app: 'benown',
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sync with GLOWIE (Placeholder - app details TBD)
     */
    async syncWithGlowie() {
        try {
            // GLOWIE integration to be implemented
            const zyroData = {
                gamificationData: {
                    points: this.getTotalPoints(),
                    level: this.getUserLevel(),
                    achievements: this.getAchievements()
                }
            };

            return {
                app: 'glowie',
                sent: zyroData,
                received: null,
                success: true,
                note: 'GLOWIE integration pending'
            };

        } catch (error) {
            console.error('GLOWIE sync error:', error);
            return {
                app: 'glowie',
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sync with MANLAW (Placeholder - app details TBD)
     */
    async syncWithManlaw() {
        try {
            // MANLAW integration to be implemented
            const zyroData = {
                userData: {
                    activity: this.getUserActivity(),
                    preferences: this.getUserPreferences()
                }
            };

            return {
                app: 'manlaw',
                sent: zyroData,
                received: null,
                success: true,
                note: 'MANLAW integration pending'
            };

        } catch (error) {
            console.error('MANLAW sync error:', error);
            return {
                app: 'manlaw',
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Fetch ZYRA data
     */
    async fetchZyraData() {
        if (!this.firebase || !this.firebase.isInitialized()) {
            return this.getSimulatedZyraData();
        }

        try {
            const doc = await this.firebase.db
                .collection('zyra_insights')
                .doc(this.currentUser)
                .get();

            return doc.exists ? doc.data() : this.getSimulatedZyraData();
        } catch (error) {
            return this.getSimulatedZyraData();
        }
    }

    /**
     * Get simulated ZYRA data (for testing without Firebase)
     */
    getSimulatedZyraData() {
        return {
            leadInsights: {
                totalLeads: 0,
                hotLeads: 0,
                conversionRate: 0
            },
            commonObjections: [
                'Not enough time',
                'Already tried before',
                'Need more info'
            ],
            conversionTriggers: [
                'Success stories',
                'Limited time offers',
                'Community support'
            ],
            successStories: []
        };
    }

    /**
     * Fetch BENOWN data
     */
    async fetchBenownData() {
        if (!this.firebase || !this.firebase.isInitialized()) {
            return this.getSimulatedBenownData();
        }

        try {
            const doc = await this.firebase.db
                .collection('benown_analytics')
                .doc(this.currentUser)
                .get();

            return doc.exists ? doc.data() : this.getSimulatedBenownData();
        } catch (error) {
            return this.getSimulatedBenownData();
        }
    }

    /**
     * Get simulated BENOWN data
     */
    getSimulatedBenownData() {
        return {
            contentPerformance: {
                totalPosts: 0,
                avgEngagement: 0,
                bestPerforming: null
            },
            viralTopics: [
                'Side hustles',
                'Financial freedom',
                'Success mindset'
            ],
            trendingHashtags: [
                '#SideHustle',
                '#Entrepreneur',
                '#PassiveIncome'
            ]
        };
    }

    /**
     * Calculate engagement level
     */
    calculateEngagementLevel() {
        // Based on ZYRO activity
        const stats = this.loadZyroStats();

        const activityScore = (
            (stats.challengesCompleted || 0) * 2 +
            (stats.ideasSpun || 0) +
            (stats.bingoProgress || 0) * 3 +
            (stats.quizzesTaken || 0) * 2 +
            (stats.madlibsCompleted || 0)
        );

        if (activityScore >= 100) return 'high';
        if (activityScore >= 50) return 'medium';
        if (activityScore >= 10) return 'low';
        return 'new';
    }

    /**
     * Extract user interests
     */
    extractUserInterests() {
        const stats = this.loadZyroStats();
        const interests = [];

        if (stats.quizzesTaken > 0) {
            interests.push('personal_development');
        }

        if (stats.challengesCompleted > 5) {
            interests.push('daily_habits', 'consistency');
        }

        if (stats.ideasSpun > 3) {
            interests.push('entrepreneurship', 'business_ideas');
        }

        if (stats.bingoProgress > 50) {
            interests.push('goal_achievement', 'gamification');
        }

        return interests.length > 0 ? interests : ['general_entrepreneur'];
    }

    /**
     * Identify motivations
     */
    identifyMotivations() {
        const personality = this.getUserPersonality();

        const motivations = [];

        if (personality.type === 'ceo' || personality.type === 'boss') {
            motivations.push('leadership', 'impact', 'legacy');
        }

        if (personality.type === 'hustler') {
            motivations.push('action', 'results', 'growth');
        }

        if (personality.type === 'minion') {
            motivations.push('learning', 'stability', 'support');
        }

        return motivations.length > 0 ? motivations : ['success', 'freedom'];
    }

    /**
     * Identify pain points
     */
    identifyPainPoints() {
        const stats = this.loadZyroStats();
        const painPoints = [];

        if (stats.currentStreak === 0) {
            painPoints.push('consistency', 'motivation');
        }

        if (stats.challengesCompleted < 5) {
            painPoints.push('getting_started', 'action_taking');
        }

        if (stats.totalPoints < 500) {
            painPoints.push('progress', 'results');
        }

        return painPoints.length > 0 ? painPoints : ['time_management', 'focus'];
    }

    /**
     * Get content ideas for leads
     */
    getContentIdeasForLeads() {
        // Get top ideas from Idea Roulette
        const ideas = this.getTopViralIdeas();

        return ideas.map(idea => ({
            text: idea.text,
            viralScore: idea.absurdityScore,
            category: 'business_idea'
        }));
    }

    /**
     * Get user personality
     */
    getUserPersonality() {
        try {
            const quizHistory = JSON.parse(localStorage.getItem('zyro_quiz_history') || '[]');

            if (quizHistory.length > 0) {
                const latestQuiz = quizHistory[0];
                return {
                    type: latestQuiz.resultType,
                    title: latestQuiz.result?.title,
                    traits: latestQuiz.traits
                };
            }
        } catch (e) {
            console.error('Error loading quiz history:', e);
        }

        return {
            type: 'unknown',
            title: 'Aspiring Entrepreneur',
            traits: {}
        };
    }

    /**
     * Get top viral ideas
     */
    getTopViralIdeas() {
        try {
            const ideaHistory = JSON.parse(localStorage.getItem('zyro_idea_history') || '[]');
            return ideaHistory
                .filter(idea => idea.isViralWorthy)
                .sort((a, b) => b.absurdityScore - a.absurdityScore)
                .slice(0, 5);
        } catch (e) {
            return [];
        }
    }

    /**
     * Get funniest madlibs
     */
    getFunniestMadlibs() {
        try {
            const madlibHistory = JSON.parse(localStorage.getItem('zyro_madlibs_history') || '[]');
            return madlibHistory
                .sort((a, b) => b.humorScore - a.humorScore)
                .slice(0, 5);
        } catch (e) {
            return [];
        }
    }

    /**
     * Get popular quiz results
     */
    getPopularQuizResults() {
        try {
            const quizHistory = JSON.parse(localStorage.getItem('zyro_quiz_history') || '[]');

            const resultCounts = {};
            quizHistory.forEach(quiz => {
                resultCounts[quiz.resultType] = (resultCounts[quiz.resultType] || 0) + 1;
            });

            return Object.entries(resultCounts)
                .map(([type, count]) => ({ type, count }))
                .sort((a, b) => b.count - a.count);
        } catch (e) {
            return [];
        }
    }

    /**
     * Get trending challenges
     */
    getTrendingChallenges() {
        try {
            const progress = JSON.parse(localStorage.getItem(`zyro_progress_${this.currentUser}`) || '{}');
            const completed = progress.completedChallenges || [];

            const challengeCounts = {};
            completed.forEach(challenge => {
                challengeCounts[challenge.id] = (challengeCounts[challenge.id] || 0) + 1;
            });

            return Object.entries(challengeCounts)
                .map(([id, count]) => ({ id, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);
        } catch (e) {
            return [];
        }
    }

    /**
     * Get engagement patterns
     */
    getEngagementPatterns() {
        const stats = this.loadZyroStats();

        return {
            preferredGames: this.getPreferredGames(stats),
            activeTime: 'varies', // Could track actual time data
            sessionFrequency: stats.currentStreak > 0 ? 'daily' : 'occasional'
        };
    }

    /**
     * Get preferred games
     */
    getPreferredGames(stats) {
        const games = [];

        if (stats.challengesCompleted > 5) games.push('challenges');
        if (stats.ideasSpun > 3) games.push('idea_roulette');
        if (stats.bingoProgress > 30) games.push('bingo');
        if (stats.quizzesTaken > 0) games.push('quiz');
        if (stats.madlibsCompleted > 0) games.push('madlibs');

        return games.length > 0 ? games : ['all'];
    }

    /**
     * Generate content suggestions for BENOWN
     */
    generateContentSuggestions() {
        const personality = this.getUserPersonality();
        const interests = this.extractUserInterests();

        const suggestions = [];

        // Based on personality
        if (personality.type === 'ceo' || personality.type === 'boss') {
            suggestions.push({
                type: 'leadership',
                topic: 'Leading your first team',
                tone: 'authoritative'
            });
        }

        // Based on interests
        if (interests.includes('entrepreneurship')) {
            suggestions.push({
                type: 'educational',
                topic: 'Side hustle ideas for 2025',
                tone: 'inspirational'
            });
        }

        return suggestions;
    }

    /**
     * Load ZYRO stats
     */
    loadZyroStats() {
        try {
            const progress = JSON.parse(localStorage.getItem(`zyro_progress_${this.currentUser}`) || '{}');
            const ideaHistory = JSON.parse(localStorage.getItem('zyro_idea_history') || '[]');
            const quizHistory = JSON.parse(localStorage.getItem('zyro_quiz_history') || '[]');
            const madlibHistory = JSON.parse(localStorage.getItem('zyro_madlibs_history') || '[]');
            const bingoData = JSON.parse(localStorage.getItem('zyro_bingo_default') || '{}');

            return {
                totalPoints: progress.totalPoints || 0,
                level: progress.level || 0,
                levelName: progress.levelName || 'Wannapreneur',
                currentStreak: progress.streak?.current || 0,
                longestStreak: progress.streak?.longest || 0,
                challengesCompleted: progress.statistics?.totalChallengesCompleted || 0,
                ideasSpun: ideaHistory.length,
                quizzesTaken: quizHistory.length,
                madlibsCompleted: madlibHistory.length,
                bingoProgress: Math.round(((bingoData.completedTasks?.length || 0) / 25) * 100),
                badges: progress.badges || []
            };
        } catch (e) {
            return {
                totalPoints: 0,
                level: 0,
                levelName: 'Wannapreneur',
                currentStreak: 0,
                challengesCompleted: 0,
                ideasSpun: 0,
                quizzesTaken: 0,
                madlibsCompleted: 0,
                bingoProgress: 0,
                badges: []
            };
        }
    }

    /**
     * Get total points (for other apps)
     */
    getTotalPoints() {
        return this.loadZyroStats().totalPoints;
    }

    /**
     * Get user level
     */
    getUserLevel() {
        const stats = this.loadZyroStats();
        return {
            level: stats.level,
            name: stats.levelName
        };
    }

    /**
     * Get achievements
     */
    getAchievements() {
        const stats = this.loadZyroStats();
        return stats.badges;
    }

    /**
     * Get user activity summary
     */
    getUserActivity() {
        const stats = this.loadZyroStats();
        return {
            totalPoints: stats.totalPoints,
            streak: stats.currentStreak,
            gamesPlayed: stats.challengesCompleted + stats.ideasSpun + stats.quizzesTaken + stats.madlibsCompleted,
            lastActive: new Date().toISOString()
        };
    }

    /**
     * Get user preferences
     */
    getUserPreferences() {
        return {
            preferredGames: this.getPreferredGames(this.loadZyroStats()),
            personality: this.getUserPersonality().type,
            interests: this.extractUserInterests()
        };
    }

    /**
     * Get sync status
     */
    getSyncStatus() {
        return {
            lastSync: this.sharedData.lastSync || null,
            pendingSync: this.syncQueue.length,
            connectedApps: Object.values(this.apps).filter(app => app.status === 'connected').length
        };
    }

    /**
     * Get shared data summary
     */
    getSharedDataSummary() {
        return {
            zyra: this.sharedData.zyra ? 'synced' : 'pending',
            benown: this.sharedData.benown ? 'synced' : 'pending',
            glowie: 'pending',
            manlaw: 'pending'
        };
    }

    /**
     * Save shared data
     */
    async saveSharedData() {
        this.sharedData.lastSync = new Date().toISOString();

        try {
            if (this.firebase && this.firebase.isInitialized()) {
                await this.firebase.db
                    .collection('zyro_shared_data')
                    .doc(this.currentUser)
                    .set(this.sharedData, { merge: true });
            } else {
                localStorage.setItem('zyro_shared_data', JSON.stringify(this.sharedData));
            }
        } catch (error) {
            console.error('Error saving shared data:', error);
            localStorage.setItem('zyro_shared_data', JSON.stringify(this.sharedData));
        }
    }

    /**
     * Load shared data
     */
    async loadSharedData() {
        try {
            if (this.firebase && this.firebase.isInitialized()) {
                const doc = await this.firebase.db
                    .collection('zyro_shared_data')
                    .doc(this.currentUser)
                    .get();

                if (doc.exists) {
                    this.sharedData = doc.data();
                }
            } else {
                const saved = localStorage.getItem('zyro_shared_data');
                if (saved) {
                    this.sharedData = JSON.parse(saved);
                }
            }
        } catch (error) {
            console.error('Error loading shared data:', error);
        }
    }

    /**
     * Navigate to app
     */
    navigateToApp(appId) {
        const url = this.getAppUrl(appId);
        window.location.href = url;
    }

    /**
     * Get cross-app recommendations
     */
    getCrossAppRecommendations() {
        const stats = this.loadZyroStats();
        const recommendations = [];

        // Recommend ZYRA if active in ZYRO
        if (stats.challengesCompleted > 10 && stats.totalPoints > 500) {
            recommendations.push({
                app: 'zyra',
                reason: 'You\'re crushing it in ZYRO! Ready to capture real leads with ZYRA?',
                cta: 'Start selling with AI',
                priority: 'high'
            });
        }

        // Recommend BENOWN for content creation
        if (stats.ideasSpun > 5 || stats.madlibsCompleted > 3) {
            recommendations.push({
                app: 'benown',
                reason: 'You\'re creative! Turn those ideas into viral content with BENOWN',
                cta: 'Create viral content',
                priority: 'medium'
            });
        }

        return recommendations;
    }

    /**
     * Export integration data
     */
    export() {
        return {
            apps: this.apps,
            sharedData: this.sharedData,
            userStats: this.loadZyroStats(),
            syncStatus: this.getSyncStatus(),
            exportedAt: new Date().toISOString()
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.ZyroZ2BIntegration = ZyroZ2BIntegration;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZyroZ2BIntegration;
}
