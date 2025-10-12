/**
 * ZYRO - Leaderboards System
 * Zero2Billionaires Ecosystem
 *
 * Competitive leaderboards for all ZYRO games
 */

class ZyroLeaderboards {
    constructor(config, firebaseService = null) {
        this.config = config;
        this.firebase = firebaseService;
        this.currentUser = null;
        this.leaderboards = {
            global: [],
            weekly: [],
            monthly: [],
            friends: []
        };
        this.userStats = null;
    }

    /**
     * Initialize leaderboards
     */
    async initialize(userId, userStats) {
        this.currentUser = userId;
        this.userStats = userStats;

        await this.loadLeaderboards();

        return {
            leaderboards: this.getLeaderboardTypes(),
            userRank: this.getUserRank('global'),
            topPlayers: this.getTopPlayers('global', 10)
        };
    }

    /**
     * Get leaderboard types
     */
    getLeaderboardTypes() {
        return [
            {
                id: 'global',
                name: 'Global Leaders',
                description: 'All-time top performers',
                icon: '🌍',
                sortBy: 'totalPoints'
            },
            {
                id: 'weekly',
                name: 'This Week',
                description: 'Top performers this week',
                icon: '📅',
                sortBy: 'weeklyPoints'
            },
            {
                id: 'monthly',
                name: 'This Month',
                description: 'Monthly champions',
                icon: '📆',
                sortBy: 'monthlyPoints'
            },
            {
                id: 'streak',
                name: 'Streak Masters',
                description: 'Longest active streaks',
                icon: '🔥',
                sortBy: 'currentStreak'
            },
            {
                id: 'challenges',
                name: 'Challenge Champions',
                description: 'Most challenges completed',
                icon: '🎯',
                sortBy: 'challengesCompleted'
            },
            {
                id: 'friends',
                name: 'Friends',
                description: 'Your circle of hustlers',
                icon: '👥',
                sortBy: 'totalPoints'
            }
        ];
    }

    /**
     * Update user stats on leaderboard
     */
    async updateUserStats(stats) {
        this.userStats = stats;

        const leaderboardEntry = {
            userId: this.currentUser,
            displayName: stats.displayName || `Player ${this.currentUser.substring(0, 6)}`,
            avatar: stats.avatar || '👤',
            totalPoints: stats.totalPoints || 0,
            level: stats.level || 0,
            levelName: stats.levelName || 'Wannapreneur',
            levelIcon: stats.levelIcon || '🐣',
            currentStreak: stats.currentStreak || 0,
            longestStreak: stats.longestStreak || 0,
            challengesCompleted: stats.challengesCompleted || 0,
            bingoProgress: stats.bingoProgress || 0,
            quizzesTaken: stats.quizzesTaken || 0,
            ideasSpun: stats.ideasSpun || 0,
            madlibsCompleted: stats.madlibsCompleted || 0,
            badges: stats.badges || [],
            updatedAt: new Date().toISOString()
        };

        // Calculate time-based points
        leaderboardEntry.weeklyPoints = this.calculateWeeklyPoints(stats);
        leaderboardEntry.monthlyPoints = this.calculateMonthlyPoints(stats);

        if (this.firebase && this.firebase.isInitialized()) {
            // Update Firebase leaderboard
            await this.firebase.db
                .collection('zyro_leaderboard')
                .doc(this.currentUser)
                .set(leaderboardEntry, { merge: true });

            // Reload leaderboards
            await this.loadLeaderboards();
        } else {
            // Update local leaderboard
            this.updateLocalLeaderboard(leaderboardEntry);
        }

        return {
            success: true,
            entry: leaderboardEntry,
            rank: this.getUserRank('global')
        };
    }

    /**
     * Calculate weekly points (placeholder - would track actual weekly activity)
     */
    calculateWeeklyPoints(stats) {
        // In production, this would query recent activity from last 7 days
        // For now, use a portion of total points as approximation
        return Math.floor((stats.totalPoints || 0) * 0.3);
    }

    /**
     * Calculate monthly points
     */
    calculateMonthlyPoints(stats) {
        // In production, query last 30 days
        return Math.floor((stats.totalPoints || 0) * 0.5);
    }

    /**
     * Load leaderboards from Firebase or localStorage
     */
    async loadLeaderboards() {
        try {
            if (this.firebase && this.firebase.isInitialized()) {
                // Load from Firebase
                const snapshot = await this.firebase.db
                    .collection('zyro_leaderboard')
                    .orderBy('totalPoints', 'desc')
                    .limit(100)
                    .get();

                const entries = [];
                snapshot.forEach(doc => {
                    entries.push(doc.data());
                });

                this.leaderboards.global = entries;
                this.leaderboards.weekly = [...entries].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
                this.leaderboards.monthly = [...entries].sort((a, b) => b.monthlyPoints - a.monthlyPoints);

            } else {
                // Load from localStorage
                this.loadLocalLeaderboards();
            }
        } catch (error) {
            console.error('Error loading leaderboards:', error);
            this.loadLocalLeaderboards();
        }
    }

    /**
     * Load local leaderboards from localStorage
     */
    loadLocalLeaderboards() {
        try {
            const saved = localStorage.getItem('zyro_leaderboard');
            if (saved) {
                const data = JSON.parse(saved);
                this.leaderboards.global = data || [];
                this.leaderboards.weekly = [...this.leaderboards.global].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
                this.leaderboards.monthly = [...this.leaderboards.global].sort((a, b) => b.monthlyPoints - a.monthlyPoints);
            } else {
                this.leaderboards.global = [];
            }
        } catch (e) {
            console.error('Failed to load local leaderboard:', e);
            this.leaderboards.global = [];
        }
    }

    /**
     * Update local leaderboard
     */
    updateLocalLeaderboard(entry) {
        // Remove old entry for this user
        this.leaderboards.global = this.leaderboards.global.filter(
            e => e.userId !== entry.userId
        );

        // Add new entry
        this.leaderboards.global.push(entry);

        // Sort by total points
        this.leaderboards.global.sort((a, b) => b.totalPoints - a.totalPoints);

        // Update weekly and monthly
        this.leaderboards.weekly = [...this.leaderboards.global].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
        this.leaderboards.monthly = [...this.leaderboards.global].sort((a, b) => b.monthlyPoints - a.monthlyPoints);

        // Save to localStorage
        try {
            localStorage.setItem('zyro_leaderboard', JSON.stringify(this.leaderboards.global));
        } catch (e) {
            console.error('Failed to save leaderboard:', e);
        }
    }

    /**
     * Get leaderboard by type
     */
    getLeaderboard(type = 'global', limit = 50) {
        let leaderboard;

        switch (type) {
            case 'weekly':
                leaderboard = this.leaderboards.weekly;
                break;
            case 'monthly':
                leaderboard = this.leaderboards.monthly;
                break;
            case 'streak':
                leaderboard = [...this.leaderboards.global].sort((a, b) => b.currentStreak - a.currentStreak);
                break;
            case 'challenges':
                leaderboard = [...this.leaderboards.global].sort((a, b) => b.challengesCompleted - a.challengesCompleted);
                break;
            case 'friends':
                leaderboard = this.leaderboards.friends;
                break;
            default:
                leaderboard = this.leaderboards.global;
        }

        // Add ranks
        return leaderboard.slice(0, limit).map((entry, index) => ({
            rank: index + 1,
            ...entry,
            isCurrentUser: entry.userId === this.currentUser,
            rankBadge: this.getRankBadge(index + 1)
        }));
    }

    /**
     * Get rank badge
     */
    getRankBadge(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (rank <= 10) return '⭐';
        if (rank <= 50) return '🌟';
        return '💫';
    }

    /**
     * Get top players
     */
    getTopPlayers(type = 'global', limit = 10) {
        return this.getLeaderboard(type, limit);
    }

    /**
     * Get user rank
     */
    getUserRank(type = 'global') {
        const leaderboard = this.getLeaderboard(type, 1000);
        const userEntry = leaderboard.find(entry => entry.userId === this.currentUser);

        if (!userEntry) {
            return {
                rank: null,
                total: leaderboard.length,
                message: 'Not ranked yet'
            };
        }

        return {
            rank: userEntry.rank,
            total: leaderboard.length,
            rankBadge: userEntry.rankBadge,
            percentile: Math.round((1 - (userEntry.rank / leaderboard.length)) * 100),
            message: this.getRankMessage(userEntry.rank)
        };
    }

    /**
     * Get rank message
     */
    getRankMessage(rank) {
        if (rank === 1) return "🏆 You're #1! Absolute legend!";
        if (rank === 2) return "🥈 So close to #1! Keep pushing!";
        if (rank === 3) return "🥉 Top 3! You're crushing it!";
        if (rank <= 10) return `⭐ Top 10! Amazing work!`;
        if (rank <= 50) return `🌟 Top 50! You're doing great!`;
        if (rank <= 100) return `💫 Top 100! Keep climbing!`;
        return `💪 Rank #${rank} - On the rise!`;
    }

    /**
     * Get nearby rivals (players close to user's rank)
     */
    getNearbyRivals(type = 'global', range = 5) {
        const leaderboard = this.getLeaderboard(type, 1000);
        const userEntry = leaderboard.find(entry => entry.userId === this.currentUser);

        if (!userEntry) {
            return [];
        }

        const userRank = userEntry.rank;
        const start = Math.max(0, userRank - range - 1);
        const end = Math.min(leaderboard.length, userRank + range);

        return leaderboard.slice(start, end);
    }

    /**
     * Get category leaders (best in specific activities)
     */
    getCategoryLeaders() {
        return {
            streakMaster: this.getCategoryLeader('currentStreak', '🔥 Streak Master'),
            challengeChamp: this.getCategoryLeader('challengesCompleted', '🎯 Challenge Champion'),
            bingoKing: this.getCategoryLeader('bingoProgress', '🎲 Bingo Royalty'),
            quizGenius: this.getCategoryLeader('quizzesTaken', '🧠 Quiz Genius'),
            ideaMachine: this.getCategoryLeader('ideasSpun', '💡 Idea Machine'),
            comedyGold: this.getCategoryLeader('madlibsCompleted', '🎭 Comedy Gold')
        };
    }

    /**
     * Get category leader
     */
    getCategoryLeader(field, title) {
        if (this.leaderboards.global.length === 0) {
            return { title, leader: null };
        }

        const sorted = [...this.leaderboards.global].sort((a, b) => b[field] - a[field]);
        const leader = sorted[0];

        return {
            title: title,
            leader: {
                displayName: leader.displayName,
                avatar: leader.avatar,
                value: leader[field],
                levelIcon: leader.levelIcon
            }
        };
    }

    /**
     * Get user progress report
     */
    getUserProgressReport(type = 'global') {
        const currentRank = this.getUserRank(type);

        if (!currentRank.rank) {
            return {
                available: false,
                message: 'Complete some activities to get ranked!'
            };
        }

        const leaderboard = this.getLeaderboard(type, 1000);
        const userEntry = leaderboard.find(e => e.userId === this.currentUser);

        // Get next player to beat
        const nextPlayer = currentRank.rank > 1
            ? leaderboard.find(e => e.rank === currentRank.rank - 1)
            : null;

        // Get players chasing user
        const chasers = leaderboard
            .filter(e => e.rank > currentRank.rank && e.rank <= currentRank.rank + 3)
            .slice(0, 3);

        // Calculate points needed to rank up
        const pointsToNextRank = nextPlayer
            ? nextPlayer.totalPoints - userEntry.totalPoints + 1
            : 0;

        return {
            available: true,
            currentRank: currentRank.rank,
            percentile: currentRank.percentile,
            nextPlayer: nextPlayer,
            pointsToNextRank: pointsToNextRank,
            chasers: chasers,
            momentum: this.calculateMomentum(userEntry),
            message: this.getProgressMessage(currentRank.rank, pointsToNextRank)
        };
    }

    /**
     * Calculate momentum (trend indicator)
     */
    calculateMomentum(userEntry) {
        // In production, compare current rank to previous period
        // For now, use weekly vs total points as proxy
        const weeklyRatio = userEntry.totalPoints > 0
            ? userEntry.weeklyPoints / userEntry.totalPoints
            : 0;

        if (weeklyRatio > 0.5) return { trend: 'rising', emoji: '📈', message: 'Hot streak!' };
        if (weeklyRatio > 0.3) return { trend: 'steady', emoji: '➡️', message: 'Consistent' };
        if (weeklyRatio > 0.1) return { trend: 'slowing', emoji: '📉', message: 'Slowing down' };
        return { trend: 'inactive', emoji: '💤', message: 'Get active!' };
    }

    /**
     * Get progress message
     */
    getProgressMessage(rank, pointsNeeded) {
        if (rank === 1) {
            return "👑 Defend your throne! Others are chasing you!";
        } else if (pointsNeeded <= 10) {
            return `🔥 So close! Just ${pointsNeeded} points to rank #${rank - 1}!`;
        } else if (pointsNeeded <= 100) {
            return `💪 ${pointsNeeded} points away from leveling up!`;
        } else {
            return `🎯 Keep hustling! Every point counts!`;
        }
    }

    /**
     * Get achievement milestones
     */
    getAchievementMilestones() {
        const milestones = [];

        // Rank milestones
        const rank = this.getUserRank('global').rank;
        if (rank) {
            if (rank <= 100 && rank > 50) milestones.push({ type: 'rank', target: 50, current: rank, message: 'Reach Top 50!' });
            if (rank <= 50 && rank > 10) milestones.push({ type: 'rank', target: 10, current: rank, message: 'Reach Top 10!' });
            if (rank <= 10 && rank > 3) milestones.push({ type: 'rank', target: 3, current: rank, message: 'Reach Top 3!' });
            if (rank > 1) milestones.push({ type: 'rank', target: 1, current: rank, message: 'Become #1!' });
        }

        return milestones;
    }

    /**
     * Search leaderboard
     */
    searchLeaderboard(query, type = 'global') {
        const leaderboard = this.getLeaderboard(type, 1000);
        const lowerQuery = query.toLowerCase();

        return leaderboard.filter(entry =>
            entry.displayName.toLowerCase().includes(lowerQuery) ||
            entry.userId.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Compare with friend
     */
    compareWithUser(otherUserId, type = 'global') {
        const leaderboard = this.getLeaderboard(type, 1000);
        const currentUser = leaderboard.find(e => e.userId === this.currentUser);
        const otherUser = leaderboard.find(e => e.userId === otherUserId);

        if (!currentUser || !otherUser) {
            return {
                available: false,
                message: 'User not found'
            };
        }

        const comparison = {
            currentUser: {
                rank: currentUser.rank,
                points: currentUser.totalPoints,
                level: currentUser.levelName
            },
            otherUser: {
                rank: otherUser.rank,
                points: otherUser.totalPoints,
                level: otherUser.levelName
            },
            differences: {
                rankDiff: currentUser.rank - otherUser.rank,
                pointsDiff: currentUser.totalPoints - otherUser.totalPoints,
                ahead: currentUser.rank < otherUser.rank
            }
        };

        comparison.message = comparison.differences.ahead
            ? `You're ahead by ${Math.abs(comparison.differences.rankDiff)} ranks!`
            : `You're ${Math.abs(comparison.differences.rankDiff)} ranks behind!`;

        return comparison;
    }

    /**
     * Get leaderboard stats
     */
    getStats() {
        return {
            totalPlayers: this.leaderboards.global.length,
            averagePoints: this.calculateAveragePoints(),
            topScore: this.leaderboards.global.length > 0 ? this.leaderboards.global[0].totalPoints : 0,
            totalPointsAllPlayers: this.calculateTotalPoints(),
            activeThisWeek: this.countActiveThisWeek(),
            averageLevel: this.calculateAverageLevel()
        };
    }

    /**
     * Calculate average points
     */
    calculateAveragePoints() {
        if (this.leaderboards.global.length === 0) return 0;

        const total = this.leaderboards.global.reduce((sum, entry) => sum + entry.totalPoints, 0);
        return Math.round(total / this.leaderboards.global.length);
    }

    /**
     * Calculate total points
     */
    calculateTotalPoints() {
        return this.leaderboards.global.reduce((sum, entry) => sum + entry.totalPoints, 0);
    }

    /**
     * Count active this week
     */
    countActiveThisWeek() {
        return this.leaderboards.global.filter(entry => entry.weeklyPoints > 0).length;
    }

    /**
     * Calculate average level
     */
    calculateAverageLevel() {
        if (this.leaderboards.global.length === 0) return 0;

        const total = this.leaderboards.global.reduce((sum, entry) => sum + entry.level, 0);
        return (total / this.leaderboards.global.length).toFixed(1);
    }

    /**
     * Reset leaderboards (admin only)
     */
    async resetLeaderboards() {
        this.leaderboards = {
            global: [],
            weekly: [],
            monthly: [],
            friends: []
        };

        if (this.firebase && this.firebase.isInitialized()) {
            // Would need admin permissions to delete collection
            console.warn('Firebase leaderboard reset requires admin permissions');
        } else {
            try {
                localStorage.removeItem('zyro_leaderboard');
            } catch (e) {
                console.error('Failed to reset leaderboard:', e);
            }
        }

        return {
            success: true,
            message: 'Leaderboard reset'
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.ZyroLeaderboards = ZyroLeaderboards;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZyroLeaderboards;
}
