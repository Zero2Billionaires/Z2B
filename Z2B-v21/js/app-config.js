/**
 * Z2B Legacy Builders - Central App Configuration
 * Manages app access, tiers, demo mode, and referral tracking
 */

// App Definitions
const Z2B_APPS = {
    ZYRO: {
        id: 'zyro',
        name: 'ZYRO',
        description: 'Gamification Hub - Daily Challenges, Games & Rewards',
        icon: 'fas fa-gamepad',
        url: 'zyro.html',
        category: 'Engagement',
        features: ['Daily Challenges', 'Idea Roulette', 'SideGig Bingo', 'Leaderboards', 'Points & Badges'],
        demoMode: {
            enabled: true,
            duration: 7, // days
            limitations: 'Limited game plays per day'
        }
    },
    COACH_MANLAW: {
        id: 'coach-manlaw',
        name: 'Coach Manlaw',
        description: 'Your AI Billionaire Coach - Four Legs Framework',
        icon: 'fas fa-graduation-cap',
        url: 'coach-manlaw.html',
        category: 'Coaching',
        features: ['AI Coaching', 'BTSS Assessment', 'Four Legs Framework', 'Progress Tracking'],
        demoMode: {
            enabled: true,
            duration: 7,
            limitations: 'Limited AI interactions per day'
        }
    },
    GLOWIE: {
        id: 'glowie',
        name: 'GLOWIE',
        description: 'AI App Builder - Build Instant Apps with Claude 4.5',
        icon: 'fas fa-lightbulb',
        url: 'glowie.html',
        category: 'Development',
        features: ['Instant App Generation', 'Claude 4.5 Integration', 'No-Code Builder', 'Download Apps'],
        demoMode: {
            enabled: true,
            duration: 3,
            limitations: 'Limited to 3 app generations'
        }
    },
    ZYRA: {
        id: 'zyra',
        name: 'ZYRA',
        description: 'AI Sales Agent - Close Deals 24/7',
        icon: 'fas fa-user-tie',
        url: 'zyra.html',
        category: 'Sales',
        features: ['Lead Management', 'AI Conversations', 'Sales Pipeline', 'Revenue Tracking', 'Templates'],
        demoMode: {
            enabled: true,
            duration: 7,
            limitations: 'Limited to 10 leads'
        }
    },
    BENOWN: {
        id: 'benown',
        name: 'BENOWN',
        description: 'AI Content Creator - Generate Viral Content',
        icon: 'fas fa-magic',
        url: 'benown.html',
        category: 'Marketing',
        features: ['Multi-Platform Content', 'AI Generation', 'Hashtag Optimization', 'Content Library'],
        demoMode: {
            enabled: true,
            duration: 7,
            limitations: 'Limited to 5 content pieces per day'
        }
    }
};

// Tier Definitions with App Access
const Z2B_TIERS = {
    FREE: {
        id: 'FREE',
        name: 'Free Demo',
        price: 0,
        period: 'Trial',
        apps: {
            zyro: { access: 'demo', aiF uel: 10 },
            'coach-manlaw': { access: 'demo', aiFuel: 10 }
        },
        tscGenerations: 0,
        tliLevels: 0,
        features: ['7-Day Trial', 'Basic Features', 'Community Access']
    },
    STARTER: {
        id: 'STARTER',
        name: 'Starter',
        price: 299,
        period: 'month',
        apps: {
            zyro: { access: 'full', aiFuel: 100 },
            'coach-manlaw': { access: 'basic', aiFuel: 100 }
        },
        tscGenerations: 3,
        tliLevels: 0,
        features: ['3 Generations TSC', '100 AI Fuel/month', 'Referral Tracking', 'Team Building']
    },
    PRO: {
        id: 'PRO',
        name: 'Pro',
        price: 999,
        period: 'month',
        apps: {
            zyro: { access: 'full', aiFuel: 300 },
            'coach-manlaw': { access: 'pro', aiFuel: 300 },
            glowie: { access: 'full', aiFuel: 300 }
        },
        tscGenerations: 5,
        tliLevels: 7,
        features: ['5 Generations TSC', '300 AI Fuel/month', 'TLI Access (7 Levels)', 'Advanced Analytics']
    },
    ELITE: {
        id: 'ELITE',
        name: 'Elite',
        price: 2999,
        period: 'month',
        apps: {
            zyro: { access: 'full', aiFuel: 1000 },
            'coach-manlaw': { access: 'elite', aiFuel: 1000 },
            glowie: { access: 'unlimited', aiFuel: 1000 },
            zyra: { access: 'full', aiFuel: 1000 },
            benown: { access: 'full', aiFuel: 1000 }
        },
        tscGenerations: 10,
        tliLevels: 10,
        features: ['10 Generations TSC', '1000 AI Fuel/month', 'Full TLI', 'Profit Pool', 'Priority Support']
    },
    LIFETIME: {
        id: 'LIFETIME',
        name: 'Lifetime',
        price: 29999,
        period: 'one-time',
        apps: {
            zyro: { access: 'full', aiFuel: 'unlimited' },
            'coach-manlaw': { access: 'unlimited', aiFuel: 'unlimited' },
            glowie: { access: 'unlimited', aiFuel: 'unlimited' },
            zyra: { access: 'full', aiFuel: 'unlimited' },
            benown: { access: 'full', aiFuel: 'unlimited' }
        },
        tscGenerations: 10,
        tliLevels: 10,
        features: ['ALL APPS Forever', 'Unlimited AI Fuel', 'Full TLI Forever', 'Profit Pool Forever', 'VIP Support', 'Legacy Builder Status']
    }
};

// App Access Management Class
class Z2BAppAccess {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.referrerId = this.getReferrer();
    }

    // Get current user from localStorage
    getCurrentUser() {
        const stored = localStorage.getItem('z2b_current_user');
        if (stored) {
            return JSON.parse(stored);
        }
        // Default demo user
        return {
            id: 'demo_' + Date.now(),
            name: 'Demo User',
            tier: 'FREE',
            aiFuel: 10,
            joinDate: new Date().toISOString(),
            isDemo: true
        };
    }

    // Save user
    saveUser(userData) {
        localStorage.setItem('z2b_current_user', JSON.stringify(userData));
        this.currentUser = userData;
    }

    // Get referrer ID
    getReferrer() {
        return localStorage.getItem('z2b_referrer') || null;
    }

    // Set referrer
    setReferrer(referrerId) {
        localStorage.setItem('z2b_referrer', referrerId);
        this.referrerId = referrerId;

        // Track referral
        this.trackReferral(referrerId);
    }

    // Track referral
    trackReferral(referrerId) {
        const referrals = JSON.parse(localStorage.getItem('z2b_referrals') || '[]');
        referrals.push({
            referrerId: referrerId,
            prospectId: this.currentUser.id,
            timestamp: new Date().toISOString(),
            status: 'pending' // pending, converted
        });
        localStorage.setItem('z2b_referrals', JSON.stringify(referrals));
    }

    // Check if user has access to app
    hasAppAccess(appId) {
        if (!this.currentUser) return false;

        const userTier = Z2B_TIERS[this.currentUser.tier];
        if (!userTier) return false;

        return appId in userTier.apps;
    }

    // Get app access level
    getAppAccessLevel(appId) {
        if (!this.currentUser) return null;

        const userTier = Z2B_TIERS[this.currentUser.tier];
        if (!userTier || !(appId in userTier.apps)) return null;

        return userTier.apps[appId].access;
    }

    // Check if app is in demo mode
    isAppDemo(appId) {
        const app = Z2B_APPS[appId.toUpperCase().replace('-', '_')];
        if (!app || !app.demoMode) return false;

        return app.demoMode.enabled && this.currentUser.isDemo;
    }

    // Get demo limitations
    getDemoLimitations(appId) {
        const app = Z2B_APPS[appId.toUpperCase().replace('-', '_')];
        if (!app || !app.demoMode) return null;

        return {
            duration: app.demoMode.duration,
            limitations: app.demoMode.limitations,
            daysRemaining: this.getDemoDaysRemaining()
        };
    }

    // Get demo days remaining
    getDemoDaysRemaining() {
        if (!this.currentUser || !this.currentUser.isDemo) return 0;

        const joinDate = new Date(this.currentUser.joinDate);
        const now = new Date();
        const daysPassed = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = 7 - daysPassed;

        return Math.max(0, daysRemaining);
    }

    // Upgrade user tier
    upgradeTier(newTierCode, referrerId = null) {
        this.currentUser.tier = newTierCode;
        this.currentUser.isDemo = false;
        this.currentUser.upgradeDate = new Date().toISOString();

        const newTier = Z2B_TIERS[newTierCode];
        if (newTier) {
            // Set AI Fuel based on tier
            const firstApp = Object.values(newTier.apps)[0];
            this.currentUser.aiFuel = firstApp.aiFuel === 'unlimited' ? 999999 : firstApp.aiFuel;
        }

        // If referrer exists, mark referral as converted
        if (referrerId) {
            this.convertReferral(referrerId);
        }

        this.saveUser(this.currentUser);

        return this.currentUser;
    }

    // Convert referral
    convertReferral(referrerId) {
        const referrals = JSON.parse(localStorage.getItem('z2b_referrals') || '[]');
        const referral = referrals.find(r => r.referrerId === referrerId && r.prospectId === this.currentUser.id);

        if (referral) {
            referral.status = 'converted';
            referral.convertedAt = new Date().toISOString();
            referral.tier = this.currentUser.tier;
            localStorage.setItem('z2b_referrals', JSON.stringify(referrals));

            // Award referrer (this would be handled by backend in production)
            console.log(`Referrer ${referrerId} credited for converting ${this.currentUser.id} to ${this.currentUser.tier}`);
        }
    }

    // Generate demo link
    generateDemoLink(appId) {
        const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
        const referrerParam = this.currentUser.id;

        return `${baseUrl}${Z2B_APPS[appId.toUpperCase().replace('-', '_')].url}?demo=true&ref=${referrerParam}`;
    }

    // Get tier comparison for app
    getTierComparison(appId) {
        const comparison = [];

        for (const [tierCode, tierData] of Object.entries(Z2B_TIERS)) {
            const hasAccess = appId in tierData.apps;
            const accessLevel = hasAccess ? tierData.apps[appId].access : 'none';
            const aiFuel = hasAccess ? tierData.apps[appId].aiFuel : 0;

            comparison.push({
                tier: tierCode,
                tierName: tierData.name,
                price: tierData.price,
                period: tierData.period,
                hasAccess,
                accessLevel,
                aiFuel
            });
        }

        return comparison;
    }

    // Get all apps available to current user
    getAvailableApps() {
        const userTier = Z2B_TIERS[this.currentUser.tier];
        if (!userTier) return [];

        const available = [];

        for (const [appKey, appData] of Object.entries(Z2B_APPS)) {
            const appId = appData.id;
            const hasAccess = appId in userTier.apps;

            if (hasAccess) {
                available.push({
                    ...appData,
                    accessLevel: userTier.apps[appId].access,
                    aiFuel: userTier.apps[appId].aiFuel,
                    isDemo: this.isAppDemo(appId)
                });
            }
        }

        return available;
    }

    // Get locked apps (apps user doesn't have access to)
    getLockedApps() {
        const userTier = Z2B_TIERS[this.currentUser.tier];
        if (!userTier) return Object.values(Z2B_APPS);

        const locked = [];

        for (const [appKey, appData] of Object.entries(Z2B_APPS)) {
            const appId = appData.id;
            const hasAccess = appId in userTier.apps;

            if (!hasAccess) {
                // Find which tier unlocks this app
                const unlockTier = this.findUnlockTier(appId);
                locked.push({
                    ...appData,
                    unlockTier
                });
            }
        }

        return locked;
    }

    // Find which tier unlocks an app
    findUnlockTier(appId) {
        for (const [tierCode, tierData] of Object.entries(Z2B_TIERS)) {
            if (appId in tierData.apps) {
                return {
                    tier: tierCode,
                    tierName: tierData.name,
                    price: tierData.price,
                    period: tierData.period
                };
            }
        }
        return null;
    }
}

// Create global instance
window.Z2BAppAccess = new Z2BAppAccess();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Z2BAppAccess, Z2B_APPS, Z2B_TIERS };
}
