/**
 * ZYRO - Daily Hustle Challenges Engine
 * Zero2Billionaires Ecosystem
 *
 * Manages daily challenges, streaks, and rewards
 */

class ZyroDailyChallenges {
    constructor(config, firebaseService) {
        this.config = config;
        this.firebase = firebaseService;
        this.currentUser = null;
        this.todayChallenge = null;
        this.userProgress = null;
    }

    /**
     * Initialize the challenges system for a user
     */
    async initialize(userId) {
        this.currentUser = userId;
        await this.loadUserProgress();
        await this.assignDailyChallenge();
        return this.getTodayStatus();
    }

    /**
     * Load user progress from Firebase or localStorage
     */
    async loadUserProgress() {
        try {
            if (this.firebase && this.firebase.isInitialized()) {
                // Load from Firebase
                const doc = await this.firebase.db
                    .collection('zyro_users')
                    .doc(this.currentUser)
                    .get();

                if (doc.exists) {
                    this.userProgress = doc.data();
                } else {
                    // Create new user progress
                    this.userProgress = this.createNewUserProgress();
                    await this.saveUserProgress();
                }
            } else {
                // Fall back to localStorage
                const saved = localStorage.getItem(`zyro_progress_${this.currentUser}`);
                if (saved) {
                    this.userProgress = JSON.parse(saved);
                } else {
                    this.userProgress = this.createNewUserProgress();
                    this.saveUserProgressLocal();
                }
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
            // Fall back to new progress
            this.userProgress = this.createNewUserProgress();
        }
    }

    /**
     * Create a new user progress object
     */
    createNewUserProgress() {
        return {
            userId: this.currentUser,
            totalPoints: 0,
            level: 0,
            levelName: this.config.GAMIFICATION.levels[0].name,
            badges: [],
            completedChallenges: [],
            streak: {
                current: 0,
                longest: 0,
                lastCompletedDate: null
            },
            dailyChallenges: {
                current: null,
                assignedDate: null,
                completed: false,
                completedToday: false
            },
            statistics: {
                totalChallengesCompleted: 0,
                totalDaysActive: 0,
                favoriteChallenge: null
            },
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
    }

    /**
     * Assign today's daily challenge
     */
    async assignDailyChallenge() {
        const today = this.getDateString();

        // Check if already assigned for today
        if (this.userProgress.dailyChallenges.assignedDate === today) {
            this.todayChallenge = this.userProgress.dailyChallenges.current;
            return this.todayChallenge;
        }

        // Check streak (did they complete yesterday's challenge?)
        await this.updateStreak();

        // Assign new challenge
        const availableChallenges = this.config.DAILY_CHALLENGES.filter(challenge => {
            // Don't assign same challenge twice in a row
            return challenge.id !== this.userProgress.dailyChallenges.current?.id;
        });

        // Weighted random selection (prefer challenges they haven't done recently)
        const challenge = this.selectWeightedChallenge(availableChallenges);

        this.todayChallenge = {
            ...challenge,
            assignedDate: today,
            completed: false,
            startedAt: new Date().toISOString()
        };

        this.userProgress.dailyChallenges = {
            current: this.todayChallenge,
            assignedDate: today,
            completed: false,
            completedToday: false
        };

        await this.saveUserProgress();
        return this.todayChallenge;
    }

    /**
     * Select a challenge using weighted randomness
     */
    selectWeightedChallenge(challenges) {
        const completionHistory = this.userProgress.completedChallenges || [];

        // Score each challenge (higher = more likely to be selected)
        const scored = challenges.map(challenge => {
            const timesCompleted = completionHistory.filter(c => c.id === challenge.id).length;
            const lastCompleted = completionHistory.reverse().find(c => c.id === challenge.id);
            const daysSinceCompleted = lastCompleted
                ? this.getDaysDifference(lastCompleted.completedAt, new Date().toISOString())
                : 999;

            // Lower score if completed recently or many times
            const weight = Math.max(1, daysSinceCompleted - timesCompleted * 2);

            return { challenge, weight };
        });

        // Weighted random selection
        const totalWeight = scored.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of scored) {
            random -= item.weight;
            if (random <= 0) {
                return item.challenge;
            }
        }

        // Fallback
        return scored[0].challenge;
    }

    /**
     * Update streak based on challenge completion
     */
    async updateStreak() {
        const today = this.getDateString();
        const lastCompleted = this.userProgress.streak.lastCompletedDate;

        if (!lastCompleted) {
            // First time - no streak yet
            return;
        }

        const daysSinceCompleted = this.getDaysDifference(lastCompleted, today);

        if (daysSinceCompleted === 1) {
            // Completed yesterday - continue streak
            // Streak will be incremented when today's challenge is completed
            return;
        } else if (daysSinceCompleted > 1) {
            // Missed a day - reset streak
            this.userProgress.streak.current = 0;
            await this.saveUserProgress();

            // Award "comeback" badge if they had a long streak
            if (this.userProgress.streak.longest >= 7) {
                await this.awardBadge('comeback_king');
            }
        }
    }

    /**
     * Mark today's challenge as complete
     */
    async completeChallenge(proofData = {}) {
        if (!this.todayChallenge) {
            throw new Error('No challenge assigned for today');
        }

        if (this.userProgress.dailyChallenges.completed) {
            return {
                success: false,
                message: 'Challenge already completed today!'
            };
        }

        // Calculate points (base + streak bonus)
        const basePoints = this.todayChallenge.points;
        const streakMultiplier = this.getStreakMultiplier();
        const totalPoints = Math.floor(basePoints * streakMultiplier);

        // Update user progress
        this.userProgress.totalPoints += totalPoints;
        this.userProgress.streak.current += 1;
        this.userProgress.streak.lastCompletedDate = this.getDateString();

        if (this.userProgress.streak.current > this.userProgress.streak.longest) {
            this.userProgress.streak.longest = this.userProgress.streak.current;
        }

        this.userProgress.dailyChallenges.completed = true;
        this.userProgress.dailyChallenges.completedToday = true;

        // Record completed challenge
        this.userProgress.completedChallenges.push({
            id: this.todayChallenge.id,
            title: this.todayChallenge.title,
            points: totalPoints,
            completedAt: new Date().toISOString(),
            proofData: proofData
        });

        this.userProgress.statistics.totalChallengesCompleted += 1;
        this.userProgress.lastActive = new Date().toISOString();

        // Check for level up
        const oldLevel = this.userProgress.level;
        await this.updateLevel();
        const leveledUp = this.userProgress.level > oldLevel;

        // Check for badges
        const newBadges = await this.checkBadges();

        // Save progress
        await this.saveUserProgress();

        return {
            success: true,
            pointsEarned: totalPoints,
            basePoints: basePoints,
            streakBonus: streakMultiplier - 1,
            currentStreak: this.userProgress.streak.current,
            totalPoints: this.userProgress.totalPoints,
            leveledUp: leveledUp,
            newLevel: leveledUp ? this.userProgress.levelName : null,
            newBadges: newBadges,
            message: this.getCompletionMessage(totalPoints, leveledUp, newBadges)
        };
    }

    /**
     * Get streak multiplier
     */
    getStreakMultiplier() {
        const streak = this.userProgress.streak.current;
        const bonuses = this.config.GAMIFICATION.streakBonuses;

        if (streak >= 30) return bonuses.streak_30;
        if (streak >= 14) return bonuses.streak_14;
        if (streak >= 7) return bonuses.streak_7;
        if (streak >= 3) return bonuses.streak_3;

        return 1;
    }

    /**
     * Update user level based on points
     */
    async updateLevel() {
        const levels = this.config.GAMIFICATION.levels;
        const points = this.userProgress.totalPoints;

        for (let i = levels.length - 1; i >= 0; i--) {
            if (points >= levels[i].minPoints) {
                this.userProgress.level = i;
                this.userProgress.levelName = levels[i].name;
                break;
            }
        }
    }

    /**
     * Check and award badges
     */
    async checkBadges() {
        const newBadges = [];
        const allBadges = this.config.GAMIFICATION.badges;
        const userBadges = this.userProgress.badges || [];

        // Streak badges
        const streak = this.userProgress.streak.current;
        const streakBadges = {
            3: 'streak_3',
            7: 'streak_7',
            30: 'streak_30'
        };

        for (const [days, badgeId] of Object.entries(streakBadges)) {
            if (streak >= parseInt(days) && !userBadges.includes(badgeId)) {
                newBadges.push(await this.awardBadge(badgeId));
            }
        }

        // Challenge count badges
        const totalChallenges = this.userProgress.statistics.totalChallengesCompleted;
        const challengeBadges = {
            10: 'first_10',
            50: 'challenge_master',
            100: 'century_club'
        };

        for (const [count, badgeId] of Object.entries(challengeBadges)) {
            if (totalChallenges >= parseInt(count) && !userBadges.includes(badgeId)) {
                newBadges.push(await this.awardBadge(badgeId));
            }
        }

        // Bingo badge (will be awarded by bingo system)
        // Quiz badge (will be awarded by quiz system)

        return newBadges;
    }

    /**
     * Award a badge to the user
     */
    async awardBadge(badgeId) {
        const badge = this.config.GAMIFICATION.badges[badgeId];
        if (!badge) return null;

        if (!this.userProgress.badges) {
            this.userProgress.badges = [];
        }

        if (!this.userProgress.badges.includes(badgeId)) {
            this.userProgress.badges.push(badgeId);
            await this.saveUserProgress();

            return {
                id: badgeId,
                ...badge,
                earnedAt: new Date().toISOString()
            };
        }

        return null;
    }

    /**
     * Get completion message
     */
    getCompletionMessage(points, leveledUp, newBadges) {
        let message = `🎉 Challenge Complete! +${points} points!`;

        if (this.userProgress.streak.current >= 3) {
            message += ` 🔥 ${this.userProgress.streak.current}-day streak!`;
        }

        if (leveledUp) {
            message += ` 🎊 Level Up: ${this.userProgress.levelName}!`;
        }

        if (newBadges.length > 0) {
            const badgeEmojis = newBadges.map(b => b.emoji).join(' ');
            message += ` ${badgeEmojis} New badge${newBadges.length > 1 ? 's' : ''}!`;
        }

        return message;
    }

    /**
     * Get today's challenge status
     */
    getTodayStatus() {
        return {
            challenge: this.todayChallenge,
            completed: this.userProgress.dailyChallenges.completed,
            streak: this.userProgress.streak.current,
            points: this.userProgress.totalPoints,
            level: this.userProgress.levelName,
            nextLevelPoints: this.getNextLevelPoints(),
            canComplete: !this.userProgress.dailyChallenges.completed
        };
    }

    /**
     * Get points needed for next level
     */
    getNextLevelPoints() {
        const levels = this.config.GAMIFICATION.levels;
        const currentLevel = this.userProgress.level;

        if (currentLevel >= levels.length - 1) {
            return null; // Max level
        }

        return levels[currentLevel + 1].minPoints - this.userProgress.totalPoints;
    }

    /**
     * Get challenge history
     */
    getChallengeHistory(limit = 10) {
        const history = this.userProgress.completedChallenges || [];
        return history
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, limit);
    }

    /**
     * Get user statistics
     */
    getStatistics() {
        return {
            totalPoints: this.userProgress.totalPoints,
            level: this.userProgress.levelName,
            levelIcon: this.config.GAMIFICATION.levels[this.userProgress.level].badge,
            totalChallenges: this.userProgress.statistics.totalChallengesCompleted,
            currentStreak: this.userProgress.streak.current,
            longestStreak: this.userProgress.streak.longest,
            badges: this.getUserBadges(),
            badgeCount: this.userProgress.badges?.length || 0,
            completionRate: this.getCompletionRate(),
            daysActive: this.userProgress.statistics.totalDaysActive
        };
    }

    /**
     * Get user badges with details
     */
    getUserBadges() {
        const userBadgeIds = this.userProgress.badges || [];
        const allBadges = this.config.GAMIFICATION.badges;

        return userBadgeIds.map(id => ({
            id,
            ...allBadges[id]
        }));
    }

    /**
     * Calculate completion rate
     */
    getCompletionRate() {
        const totalChallenges = this.userProgress.statistics.totalChallengesCompleted;
        const daysActive = this.getDaysSinceCreated();

        if (daysActive === 0) return 100;

        return Math.round((totalChallenges / daysActive) * 100);
    }

    /**
     * Get days since account creation
     */
    getDaysSinceCreated() {
        return this.getDaysDifference(
            this.userProgress.createdAt,
            new Date().toISOString()
        );
    }

    /**
     * Save user progress to Firebase or localStorage
     */
    async saveUserProgress() {
        try {
            if (this.firebase && this.firebase.isInitialized()) {
                await this.firebase.db
                    .collection('zyro_users')
                    .doc(this.currentUser)
                    .set(this.userProgress, { merge: true });
            } else {
                this.saveUserProgressLocal();
            }
        } catch (error) {
            console.error('Error saving user progress:', error);
            // Fall back to localStorage
            this.saveUserProgressLocal();
        }
    }

    /**
     * Save to localStorage
     */
    saveUserProgressLocal() {
        localStorage.setItem(
            `zyro_progress_${this.currentUser}`,
            JSON.stringify(this.userProgress)
        );
    }

    /**
     * Helper: Get date string (YYYY-MM-DD)
     */
    getDateString(date = new Date()) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Helper: Get difference in days between two dates
     */
    getDaysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Admin: Reset user progress (for testing)
     */
    async resetProgress() {
        this.userProgress = this.createNewUserProgress();
        await this.saveUserProgress();
        return this.userProgress;
    }

    /**
     * Admin: Award points manually
     */
    async awardPoints(points, reason = 'Manual award') {
        this.userProgress.totalPoints += points;
        await this.updateLevel();
        await this.saveUserProgress();

        return {
            success: true,
            pointsAwarded: points,
            totalPoints: this.userProgress.totalPoints,
            reason: reason
        };
    }

    /**
     * Get leaderboard data for this user
     */
    getLeaderboardData() {
        return {
            userId: this.currentUser,
            displayName: this.userProgress.displayName || `User ${this.currentUser.substring(0, 6)}`,
            totalPoints: this.userProgress.totalPoints,
            level: this.userProgress.levelName,
            levelIcon: this.config.GAMIFICATION.levels[this.userProgress.level].badge,
            streak: this.userProgress.streak.current,
            badges: this.userProgress.badges?.length || 0
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.ZyroDailyChallenges = ZyroDailyChallenges;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZyroDailyChallenges;
}
