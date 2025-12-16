const mongoose = require('mongoose');

// Settings Schema - Stores all configurable platform settings
const settingsSchema = new mongoose.Schema({
    // Tier Pricing Configuration
    tiers: {
        FAM: {
            name: { type: String, default: 'FAM - Free Affiliate' },
            price: { type: Number, default: 0 },
            betaPrice: { type: Number, default: 0 },
            pvPoints: { type: Number, default: 0 },
            ispCommission: { type: Number, default: 20 },
            description: { type: String, default: 'Free Affiliate Membership' }
        },
        BRONZE: {
            name: { type: String, default: 'Bronze Legacy Builder' },
            price: { type: Number, default: 960 },
            betaPrice: { type: Number, default: 480 },
            pvPoints: { type: Number, default: 24 },
            ispCommission: { type: Number, default: 25 },
            description: { type: String, default: 'Coach Manlaw + 1 App (the app that introduced you)' }
        },
        COPPER: {
            name: { type: String, default: 'Copper Legacy Builder' },
            price: { type: Number, default: 1980 },
            betaPrice: { type: Number, default: 990 },
            pvPoints: { type: Number, default: 50 },
            ispCommission: { type: Number, default: 30 },
            description: { type: String, default: 'Coach Manlaw + 2 Apps (intro app + 1 of your choice)' }
        },
        SILVER: {
            name: { type: String, default: 'Silver Legacy Builder' },
            price: { type: Number, default: 2980 },
            betaPrice: { type: Number, default: 1490 },
            pvPoints: { type: Number, default: 74 },
            ispCommission: { type: Number, default: 35 },
            description: { type: String, default: 'Coach Manlaw + 3 Apps (intro app + 2 of your choice)' }
        },
        GOLD: {
            name: { type: String, default: 'Gold Legacy Builder' },
            price: { type: Number, default: 4980 },
            betaPrice: { type: Number, default: 2490 },
            pvPoints: { type: Number, default: 149 },
            ispCommission: { type: Number, default: 40 },
            description: { type: String, default: 'Coach Manlaw + 6 Apps (intro app + 5 of your choice)' }
        },
        PLATINUM: {
            name: { type: String, default: 'Platinum Legacy Builder' },
            price: { type: Number, default: 6980 },
            betaPrice: { type: Number, default: 3490 },
            pvPoints: { type: Number, default: 249 },
            ispCommission: { type: Number, default: 45 },
            description: { type: String, default: 'Coach Manlaw + 8 Apps' }
        }
    },

    // Branding Configuration
    branding: {
        primaryColor: { type: String, default: '#0A2647' },
        secondaryColor: { type: String, default: '#144272' },
        accentColor: { type: String, default: '#205295' },
        goldColor: { type: String, default: '#FFD700' },
        orangeColor: { type: String, default: '#FF6B35' },
        whiteColor: { type: String, default: '#FFFFFF' },
        fontFamily: { type: String, default: "'Poppins', sans-serif" },
        logoUrl: { type: String, default: '' },
        faviconUrl: { type: String, default: '' },
        companyName: { type: String, default: 'Z2B Legacy Builders' },
        tagline: { type: String, default: 'From Zero to Billions with AI-Powered Network Marketing' }
    },

    // Compensation Plan Rules - 7 Income Streams
    compensation: {
        betaTesterLimit: { type: Number, default: 100 },
        betaTesterDiscount: { type: Number, default: 50 }, // Percentage
        monthlyPVRequirement: { type: Boolean, default: true },
        fuelCreditExpiry: { type: Number, default: 90 }, // Days
        allowRollover: { type: Boolean, default: true },
        rolloverMonths: { type: Number, default: 3 },

        // 1. ISP (Individual Sales Profit) - Paid Monthly
        // Percentages defined in tiers (20%-45% based on tier)

        // 2. QPB (Quick Pathfinder Bonus) - Paid Monthly
        qpbFirstThree: { type: Number, default: 7.5 }, // % on first 3 builders
        qpbSubsequent: { type: Number, default: 10 }, // % on subsequent sets of 3

        // 3. TSC (Team Sales Commission) - Paid Monthly
        tscG1: { type: Number, default: 10 }, // Generation 1: 10%
        tscG2: { type: Number, default: 5 },  // Generation 2: 5%
        tscG3: { type: Number, default: 3 },  // Generation 3: 3%
        tscG4: { type: Number, default: 2 },  // Generation 4: 2%
        tscG5to10: { type: Number, default: 1 }, // Generations 5-10: 1% each
        tscMaxLevels: { type: Number, default: 10 },

        // 4. TPB (Team Performance Bonus) - Paid Quarterly
        tpbMaxPercentage: { type: Number, default: 10 }, // Up to 10% subject to tier
        tpbMinActiveBuilders: { type: Number, default: 2 }, // Requires 2+ active builders

        // 5. TLI (Team Leadership Incentive) - Paid Quarterly (CEO Approved)
        tliPoolPercentage: { type: Number, default: 10 }, // 10% of Total TeamPV
        tliMinimumTier: { type: String, default: 'SILVER' }, // Silver tier minimum
        tliMinPV: { type: Number, default: 600 }, // 600 PV monthly × 3 consecutive months
        tliConsecutiveMonths: { type: Number, default: 3 },
        tliMinRange: { type: Number, default: 2500 }, // R2,500 minimum
        tliMaxRange: { type: Number, default: 5000000 }, // R5,000,000 maximum

        // 6. CEO (CEO Awards & Competitions) - Paid Quarterly
        ceoAwardsEnabled: { type: Boolean, default: true },
        ceoQuarterlyCompetitions: { type: Boolean, default: true },

        // 7. MKT (Marketplace Sales) - Paid Monthly
        mktSellerKeepPercentage: { type: Number, default: 95 }, // Seller keeps 95%
        mktPlatformFee: { type: Number, default: 5 } // Platform fee 5%
    },

    // General Platform Settings
    general: {
        platformActive: { type: Boolean, default: true },
        maintenanceMode: { type: Boolean, default: false },
        maintenanceMessage: { type: String, default: 'System under maintenance. Please check back soon.' },
        betaProgramActive: { type: Boolean, default: true },
        allowNewRegistrations: { type: Boolean, default: true },
        requireEmailVerification: { type: Boolean, default: false },
        maxFreeAccountsPerIP: { type: Number, default: 5 }
    }
}, {
    timestamps: true,
    collection: 'settings'
});

module.exports = mongoose.model('Settings', settingsSchema);
