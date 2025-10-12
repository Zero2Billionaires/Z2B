/**
 * ZYRO - Social Sharing System
 * Zero2Billionaires Ecosystem
 *
 * Viral sharing mechanics with hooks, tracking, and rewards
 */

class ZyroSocialSharing {
    constructor(config, pointsCallback = null) {
        this.config = config;
        this.pointsCallback = pointsCallback;
        this.shareHistory = [];
        this.referrals = [];
        this.viralCoefficient = 0;
    }

    /**
     * Initialize social sharing system
     */
    initialize() {
        this.loadHistory();
        this.calculateViralCoefficient();

        return {
            totalShares: this.shareHistory.length,
            totalReferrals: this.referrals.length,
            viralCoefficient: this.viralCoefficient,
            platforms: this.getSupportedPlatforms(),
            hooks: this.config.SOCIAL_SHARING.hooks
        };
    }

    /**
     * Get supported platforms
     */
    getSupportedPlatforms() {
        return this.config.SOCIAL_SHARING.platforms.map(platform => ({
            id: platform.id,
            name: platform.name,
            icon: platform.icon,
            bestFor: platform.bestFor
        }));
    }

    /**
     * Generate shareable content
     */
    generateShareContent(contentType, data, platform = 'instagram') {
        const platformConfig = this.config.SOCIAL_SHARING.platforms.find(p => p.id === platform);

        if (!platformConfig) {
            return {
                success: false,
                message: 'Platform not supported'
            };
        }

        let content;

        switch (contentType) {
            case 'challenge':
                content = this.generateChallengeShare(data, platform);
                break;
            case 'idea':
                content = this.generateIdeaShare(data, platform);
                break;
            case 'bingo':
                content = this.generateBingoShare(data, platform);
                break;
            case 'madlib':
                content = this.generateMadLibShare(data, platform);
                break;
            case 'quiz':
                content = this.generateQuizShare(data, platform);
                break;
            case 'achievement':
                content = this.generateAchievementShare(data, platform);
                break;
            case 'streak':
                content = this.generateStreakShare(data, platform);
                break;
            case 'level_up':
                content = this.generateLevelUpShare(data, platform);
                break;
            default:
                return {
                    success: false,
                    message: 'Content type not supported'
                };
        }

        // Add viral hooks
        content = this.addViralHooks(content, contentType, platform);

        // Add platform-specific optimizations
        content = this.optimizeForPlatform(content, platformConfig);

        return {
            success: true,
            content: content,
            platform: platform,
            contentType: contentType,
            shareUrl: this.generateShareUrl(contentType, data)
        };
    }

    /**
     * Generate challenge share content
     */
    generateChallengeShare(data, platform) {
        const hook = this.getRandomHook('challenge');

        return {
            text: `${hook}\n\n✅ Today's Challenge: ${data.challengeTitle}\n\n💪 Completed in record time!\n🔥 ${data.streak}-day streak going strong!\n\nJoin me on ZYRO!`,
            hashtags: ['#DailyChallenge', '#ZYRO', '#Z2B', '#EntrepreneurLife', '#HustleMode'],
            visual: `🎯 ${data.challengeTitle}\n✅ COMPLETED`,
            cta: 'Try the challenge yourself!',
            shareData: data
        };
    }

    /**
     * Generate idea share content
     */
    generateIdeaShare(data, platform) {
        const hook = this.getRandomHook('idea');

        return {
            text: `${hook}\n\n💡 "${data.idea}"\n\n${data.absurdityScore >= 80 ? '😂 Pure comedy!' : '🤔 Wait, this might work!'}\n\nAbsurdity: ${data.absurdityScore}/100\nViability: ${data.viabilityScore}/100\n\nSpin your own idea on ZYRO! 🎲`,
            hashtags: ['#IdeaRoulette', '#BusinessIdea', '#ZYRO', '#Entrepreneur', '#StartupHumor'],
            visual: `🎲 IDEA ROULETTE\n\n"${data.idea}"\n\n${data.absurdityScore}% Absurd | ${data.viabilityScore}% Viable`,
            cta: 'Spin and find YOUR billion-dollar idea!',
            shareData: data
        };
    }

    /**
     * Generate bingo share content
     */
    generateBingoShare(data, platform) {
        const hook = this.getRandomHook('bingo');

        return {
            text: `${hook}\n\n🎯 Progress: ${data.completed}/25 tasks (${data.progress}%)\n🔥 ${data.bingos} bingos completed!\n💰 ${data.totalPoints} points earned\n\n${data.isFullBoard ? '🎉 FULL BOARD! I\'m a legend!' : 'Almost there! 💪'}\n\nJoin the challenge!`,
            hashtags: ['#SideGigBingo', '#ZYRO', '#Z2B', '#HustleBingo', '#EntrepreneurChallenge'],
            visual: data.boardVisual || this.generateBingoVisual(data),
            cta: 'Start your own Bingo board!',
            shareData: data
        };
    }

    /**
     * Generate MadLib share content
     */
    generateMadLibShare(data, platform) {
        const hook = this.getRandomHook('madlib');

        return {
            text: `${hook}\n\n"${data.result}"\n\n😂 Humor Score: ${data.humorScore}/100\n\nI can't stop laughing! Try ZYRO MadLibs! 🎭`,
            hashtags: ['#HustleMadLibs', '#ZYRO', '#Z2B', '#EntrepreneurHumor', '#BusinessPitch'],
            visual: `🎭 HUSTLE MADLIBS\n\n"${data.result.substring(0, 150)}..."`,
            cta: 'Create your own hilarious pitch!',
            shareData: data
        };
    }

    /**
     * Generate quiz share content
     */
    generateQuizShare(data, platform) {
        const hook = this.getRandomHook('quiz');

        return {
            text: `${hook}\n\n${data.emoji} I'm a ${data.resultType.toUpperCase()}!\n\n"${data.description}"\n\n📊 Score: ${data.score}/${data.maxScore} (${data.percentage}%)\n\nWhat's YOUR entrepreneur type? 🎯`,
            hashtags: ['#CEOorMinion', '#ZYRO', '#Z2B', '#EntrepreneurQuiz', '#PersonalityTest'],
            visual: `${data.emoji}\n\n${data.resultType.toUpperCase()}\n\n${data.percentage}%`,
            cta: 'Discover your entrepreneur personality!',
            shareData: data
        };
    }

    /**
     * Generate achievement share content
     */
    generateAchievementShare(data, platform) {
        return {
            text: `🏆 Achievement Unlocked!\n\n${data.emoji} ${data.name}\n\n${data.description}\n\nAnother milestone on my entrepreneur journey! 🚀\n\n#ZYRO #Z2B #Achievement`,
            hashtags: ['#ZYRO', '#Z2B', '#EntrepreneurWin', '#MilestoneUnlocked'],
            visual: `🏆\n\n${data.name}\n\nACHIEVED`,
            cta: 'Start your journey!',
            shareData: data
        };
    }

    /**
     * Generate streak share content
     */
    generateStreakShare(data, platform) {
        return {
            text: `🔥 ${data.streak}-DAY STREAK!\n\n${data.streak >= 30 ? '🏆 LEGENDARY!' : data.streak >= 7 ? '💪 On fire!' : '🚀 Building momentum!'}\n\nConsistent action = Success!\n\nJoin me on ZYRO! 🎯\n\n#ZYRO #Z2B #Consistency #Streak`,
            hashtags: ['#ZYRO', '#Z2B', '#DailyHustle', '#Consistency', '#EntrepreneurLife'],
            visual: `🔥\n\n${data.streak} DAYS\n\nSTREAK ACTIVE`,
            cta: 'Start your streak today!',
            shareData: data
        };
    }

    /**
     * Generate level up share content
     */
    generateLevelUpShare(data, platform) {
        return {
            text: `⬆️ LEVEL UP!\n\n${data.badge} ${data.levelName}\n\n💰 ${data.totalPoints} total points\n📈 Keep climbing!\n\nThe journey continues! 🚀\n\n#ZYRO #Z2B #LevelUp #Progress`,
            hashtags: ['#ZYRO', '#Z2B', '#LevelUp', '#EntrepreneurJourney', '#Progress'],
            visual: `${data.badge}\n\n${data.levelName}\n\nLEVEL ${data.level}`,
            cta: 'Level up your life!',
            shareData: data
        };
    }

    /**
     * Get random viral hook
     */
    getRandomHook(contentType) {
        const hooks = this.config.SOCIAL_SHARING.hooks.filter(h =>
            h.contentType === contentType || h.contentType === 'all'
        );

        if (hooks.length === 0) {
            return "🚀 Check out what I just did on ZYRO!";
        }

        const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
        return randomHook.text;
    }

    /**
     * Add viral hooks to content
     */
    addViralHooks(content, contentType, platform) {
        // Add call-to-action
        if (!content.cta) {
            content.cta = this.getDefaultCTA(contentType);
        }

        // Add share URL with tracking
        content.shareUrl = this.config.SOCIAL_SHARING.shareURL || 'https://zero2billionaires.com/zyro';
        content.trackingUrl = this.addTrackingParams(content.shareUrl, contentType, platform);

        // Add urgency/scarcity where appropriate
        if (contentType === 'challenge' || contentType === 'streak') {
            content.urgency = "Join today's challenge!";
        }

        // Add social proof elements
        content.socialProof = this.getSocialProof();

        return content;
    }

    /**
     * Get default CTA
     */
    getDefaultCTA(contentType) {
        const ctas = {
            challenge: 'Try the challenge yourself!',
            idea: 'Spin your own billion-dollar idea!',
            bingo: 'Start your Bingo board!',
            madlib: 'Create your hilarious pitch!',
            quiz: 'Discover your entrepreneur type!',
            achievement: 'Unlock your achievements!',
            streak: 'Start your streak today!',
            level_up: 'Level up with ZYRO!'
        };

        return ctas[contentType] || 'Join ZYRO today!';
    }

    /**
     * Add tracking parameters
     */
    addTrackingParams(url, contentType, platform) {
        const params = new URLSearchParams({
            utm_source: platform,
            utm_medium: 'social',
            utm_campaign: 'zyro_share',
            utm_content: contentType,
            ref: this.generateReferralCode()
        });

        return `${url}?${params.toString()}`;
    }

    /**
     * Generate referral code
     */
    generateReferralCode() {
        return `ZYRO${Date.now().toString(36).toUpperCase()}`;
    }

    /**
     * Get social proof
     */
    getSocialProof() {
        const proofs = [
            '✅ Join 10,000+ hustlers',
            '🌟 Rated 5-stars by entrepreneurs',
            '🚀 Featured in Z2B community',
            '💪 Trusted by aspiring CEOs',
            '🎯 #1 entrepreneur gamification app'
        ];

        return proofs[Math.floor(Math.random() * proofs.length)];
    }

    /**
     * Optimize content for platform
     */
    optimizeForPlatform(content, platformConfig) {
        const optimized = { ...content };

        // Character limits
        if (platformConfig.id === 'twitter' && optimized.text.length > 280) {
            optimized.text = optimized.text.substring(0, 250) + '...';
            optimized.truncated = true;
        }

        // Hashtag limits
        const maxHashtags = platformConfig.hashtagLimit || 10;
        if (optimized.hashtags && optimized.hashtags.length > maxHashtags) {
            optimized.hashtags = optimized.hashtags.slice(0, maxHashtags);
        }

        // Platform-specific formatting
        if (platformConfig.id === 'linkedin') {
            optimized.tone = 'professional';
            optimized.hashtags = optimized.hashtags.filter(h =>
                !h.includes('humor') && !h.includes('funny')
            );
        }

        if (platformConfig.id === 'tiktok') {
            optimized.tone = 'energetic';
            optimized.callToAction = '👇 Link in bio to play!';
        }

        return optimized;
    }

    /**
     * Generate Bingo visual
     */
    generateBingoVisual(data) {
        let visual = '🎯 SIDEGIG BINGO\n\n';
        visual += `${data.completed}/25 Complete\n`;
        visual += `${data.bingos} Bingos\n\n`;

        // Simple progress bar
        const progress = Math.round(data.progress / 10);
        visual += '▓'.repeat(progress) + '░'.repeat(10 - progress);
        visual += `\n${data.progress}%`;

        return visual;
    }

    /**
     * Track a share
     */
    trackShare(contentType, platform, content) {
        const share = {
            id: Date.now(),
            contentType: contentType,
            platform: platform,
            content: content,
            sharedAt: new Date().toISOString(),
            referralCode: this.generateReferralCode(),
            clicks: 0,
            conversions: 0
        };

        this.shareHistory.push(share);
        this.saveHistory();

        // Award points for sharing
        const points = this.config.IDEA_ROULETTE?.rewards?.share || 25;
        if (this.pointsCallback) {
            this.pointsCallback(points, 'Content shared');
        }

        return {
            success: true,
            share: share,
            points: points,
            message: 'Shared successfully! Watch your impact grow! 🚀'
        };
    }

    /**
     * Track a referral (when someone joins via share)
     */
    trackReferral(referralCode, userId) {
        const referral = {
            id: Date.now(),
            referralCode: referralCode,
            userId: userId,
            joinedAt: new Date().toISOString()
        };

        this.referrals.push(referral);
        this.saveHistory();

        // Find original share
        const originalShare = this.shareHistory.find(s =>
            s.referralCode === referralCode
        );

        if (originalShare) {
            originalShare.conversions++;
            this.saveHistory();
        }

        // Award bonus points for successful referral
        const bonusPoints = 100;
        if (this.pointsCallback) {
            this.pointsCallback(bonusPoints, 'Referral bonus');
        }

        this.calculateViralCoefficient();

        return {
            success: true,
            referral: referral,
            bonusPoints: bonusPoints,
            message: 'Referral tracked! Bonus points awarded! 🎉'
        };
    }

    /**
     * Calculate viral coefficient
     */
    calculateViralCoefficient() {
        if (this.shareHistory.length === 0) {
            this.viralCoefficient = 0;
            return;
        }

        // Viral Coefficient = (Shares × Conversion Rate)
        const totalShares = this.shareHistory.length;
        const totalConversions = this.referrals.length;
        const conversionRate = totalConversions / totalShares;

        // Average shares per user (assume 1 user for now, can be enhanced)
        const avgSharesPerUser = totalShares;

        this.viralCoefficient = parseFloat((avgSharesPerUser * conversionRate).toFixed(2));
    }

    /**
     * Get sharing statistics
     */
    getStatistics() {
        const platformBreakdown = {};
        this.shareHistory.forEach(share => {
            platformBreakdown[share.platform] = (platformBreakdown[share.platform] || 0) + 1;
        });

        const contentTypeBreakdown = {};
        this.shareHistory.forEach(share => {
            contentTypeBreakdown[share.contentType] = (contentTypeBreakdown[share.contentType] || 0) + 1;
        });

        const totalClicks = this.shareHistory.reduce((sum, share) => sum + (share.clicks || 0), 0);
        const totalConversions = this.shareHistory.reduce((sum, share) => sum + (share.conversions || 0), 0);

        return {
            totalShares: this.shareHistory.length,
            totalReferrals: this.referrals.length,
            totalClicks: totalClicks,
            totalConversions: totalConversions,
            viralCoefficient: this.viralCoefficient,
            platformBreakdown: platformBreakdown,
            contentTypeBreakdown: contentTypeBreakdown,
            topPlatform: this.getTopPlatform(platformBreakdown),
            topContent: this.getTopContent(contentTypeBreakdown),
            conversionRate: this.shareHistory.length > 0
                ? ((totalConversions / this.shareHistory.length) * 100).toFixed(2)
                : 0
        };
    }

    /**
     * Get top platform
     */
    getTopPlatform(breakdown) {
        const entries = Object.entries(breakdown);
        if (entries.length === 0) return null;

        return entries.reduce((top, current) =>
            current[1] > top[1] ? current : top
        );
    }

    /**
     * Get top content type
     */
    getTopContent(breakdown) {
        const entries = Object.entries(breakdown);
        if (entries.length === 0) return null;

        return entries.reduce((top, current) =>
            current[1] > top[1] ? current : top
        );
    }

    /**
     * Get share history
     */
    getHistory(limit = 20) {
        return this.shareHistory
            .sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt))
            .slice(0, limit);
    }

    /**
     * Generate share buttons HTML (for easy integration)
     */
    generateShareButtons(content, platforms = ['instagram', 'tiktok', 'twitter', 'facebook']) {
        const buttons = platforms.map(platform => {
            const config = this.config.SOCIAL_SHARING.platforms.find(p => p.id === platform);
            if (!config) return '';

            const shareUrl = content.trackingUrl || content.shareUrl;
            const text = encodeURIComponent(content.text);

            let url;
            switch (platform) {
                case 'twitter':
                    url = `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`;
                    break;
                case 'facebook':
                    url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${text}`;
                    break;
                case 'linkedin':
                    url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
                    break;
                default:
                    // For Instagram, TikTok - copy to clipboard
                    url = '#';
            }

            return {
                platform: platform,
                name: config.name,
                icon: config.icon,
                url: url,
                action: ['instagram', 'tiktok'].includes(platform) ? 'copy' : 'open'
            };
        });

        return buttons;
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('zyro_share_history', JSON.stringify({
                shares: this.shareHistory,
                referrals: this.referrals
            }));
        } catch (e) {
            console.error('Failed to save share history:', e);
        }
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('zyro_share_history');
            if (saved) {
                const data = JSON.parse(saved);
                this.shareHistory = data.shares || [];
                this.referrals = data.referrals || [];
            }
        } catch (e) {
            console.error('Failed to load share history:', e);
            this.shareHistory = [];
            this.referrals = [];
        }
    }

    /**
     * Clear all history
     */
    clearHistory() {
        this.shareHistory = [];
        this.referrals = [];
        this.viralCoefficient = 0;
        try {
            localStorage.removeItem('zyro_share_history');
        } catch (e) {
            console.error('Failed to clear history:', e);
        }
    }

    /**
     * Export data
     */
    export() {
        return {
            exportedAt: new Date().toISOString(),
            shares: this.shareHistory,
            referrals: this.referrals,
            statistics: this.getStatistics()
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.ZyroSocialSharing = ZyroSocialSharing;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZyroSocialSharing;
}
