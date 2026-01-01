/**
 * Z2B MEMBERSHIP: WHOLESALE vs RETAIL PRICING
 * CORRECTED: 5 Tiers with proper app allocation
 * Bronze (2) | Copper (4) | Silver (7) | Gold (11) | Platinum (12)
 */

const Z2B_WHOLESALE_RETAIL_PRICING = {
    // Base retail price per app
    baseRetailPrice: 700,
    baseRetailPV: 35,

    bronze: {
        membershipPrice: 480,
        membershipPV: 24,
        appsIncluded: 2,

        // Non-members pay retail
        retailPrice: 2 * 700, // R1,400
        retailPV: 2 * 35,     // 70 PV

        // Members pay wholesale (membership fee)
        wholesalePrice: 480,
        wholesalePV: 24,

        // Savings by being a member
        savings: (2 * 700) - 480, // R920
        savingsPercent: 66,

        message: 'Bronze Members get 2 apps for R480. Non-members pay R1,400 for the same 2 apps. Save R920 by becoming a Z2B member and buying at wholesale!'
    },

    copper: {
        membershipPrice: 980,
        membershipPV: 49,
        appsIncluded: 4,

        // Non-members pay retail
        retailPrice: 4 * 700, // R2,800
        retailPV: 4 * 35,     // 140 PV

        // Members pay wholesale (membership fee)
        wholesalePrice: 980,
        wholesalePV: 49,

        // Savings by being a member
        savings: (4 * 700) - 980, // R1,820
        savingsPercent: 65,

        message: 'Copper Members get 4 apps for R980. Non-members pay R2,800 for the same 4 apps. Save R1,820 by becoming a Z2B member and buying at wholesale!'
    },

    silver: {
        membershipPrice: 1480,
        membershipPV: 74,
        appsIncluded: 7,

        // Non-members pay retail
        retailPrice: 7 * 700, // R4,900
        retailPV: 7 * 35,     // 245 PV

        // Members pay wholesale (membership fee)
        wholesalePrice: 1480,
        wholesalePV: 74,

        // Savings by being a member
        savings: (7 * 700) - 1480, // R3,420
        savingsPercent: 70,

        message: 'Silver Members get 7 apps for R1,480. Non-members pay R4,900 for the same 7 apps. Save R3,420 by becoming a Z2B member and buying at wholesale!'
    },

    gold: {
        membershipPrice: 2490,
        membershipPV: 124.5,
        appsIncluded: 11,

        // Non-members pay retail
        retailPrice: 11 * 700, // R7,700
        retailPV: 11 * 35,     // 385 PV

        // Members pay wholesale (membership fee)
        wholesalePrice: 2490,
        wholesalePV: 124.5,

        // Savings by being a member
        savings: (11 * 700) - 2490, // R5,210
        savingsPercent: 68,

        message: 'Gold Members get 11 apps for R2,490. Non-members pay R7,700 for the same 11 apps. Save R5,210 by becoming a Z2B member and buying at wholesale!'
    },

    platinum: {
        membershipPrice: 3490,
        membershipPV: 174.5,
        appsIncluded: 12,

        // Non-members pay retail
        retailPrice: 12 * 700, // R8,400
        retailPV: 12 * 35,     // 420 PV

        // Members pay wholesale (membership fee)
        wholesalePrice: 3490,
        wholesalePV: 174.5,

        // Savings by being a member
        savings: (12 * 700) - 3490, // R4,910
        savingsPercent: 58,

        message: 'Platinum Members get ALL 12 apps for R3,490. Non-members pay R8,400 for the same 12 apps. Save R4,910 by becoming a Z2B member and buying at wholesale!'
    }
};

/**
 * MEMBERSHIP VALUE COMPARISON TABLE
 * CORRECTED: 5 tiers
 */
const MEMBERSHIP_COMPARISON_TABLE = {
    headers: ['Tier', 'Apps', 'Member Price (Wholesale)', 'Non-Member Price (Retail)', 'You Save'],

    bronze: {
        tier: 'Bronze',
        apps: '2 apps',
        memberPrice: 'R480',
        nonMemberPrice: 'R1,400 (2 × R700)',
        savings: 'R920 (66%)'
    },

    copper: {
        tier: 'Copper',
        apps: '4 apps',
        memberPrice: 'R980',
        nonMemberPrice: 'R2,800 (4 × R700)',
        savings: 'R1,820 (65%)'
    },

    silver: {
        tier: 'Silver',
        apps: '7 apps',
        memberPrice: 'R1,480',
        nonMemberPrice: 'R4,900 (7 × R700)',
        savings: 'R3,420 (70%)'
    },

    gold: {
        tier: 'Gold',
        apps: '11 apps',
        memberPrice: 'R2,490',
        nonMemberPrice: 'R7,700 (11 × R700)',
        savings: 'R5,210 (68%)'
    },

    platinum: {
        tier: 'Platinum',
        apps: 'ALL 12 apps',
        memberPrice: 'R3,490',
        nonMemberPrice: 'R8,400 (12 × R700)',
        savings: 'R4,910 (58%)'
    }
};

/**
 * UPSELL MESSAGES FOR NON-MEMBERS
 * Simple wholesale vs retail comparison
 */
const UPSELL_MESSAGES = {
    bronze: {
        headline: '💡 Smart Choice Alert!',
        comparison: 'You\'re about to pay R700 for 1 app at retail price.',
        alternative: 'Join Bronze Membership and get 2 apps for R480 (wholesale price)',
        savings: 'Save R920 by buying at wholesale instead of retail!',
        cta: 'Join Bronze - Get Wholesale Pricing'
    },

    copper: {
        headline: '💡 Smart Choice Alert!',
        comparison: 'Buying apps individually at retail? That\'s expensive!',
        alternative: 'Join Copper Membership and get 4 apps for R980 (wholesale price)',
        benefit: 'Non-members pay R2,800 retail. Members pay R980 wholesale.',
        savings: 'Save R1,820 with wholesale pricing!',
        cta: 'Join Copper - Get Wholesale Pricing'
    },

    silver: {
        headline: '💡 Smart Choice Alert!',
        comparison: 'Retail pricing adds up fast!',
        alternative: 'Join Silver Membership and get 7 apps for R1,480 (wholesale price)',
        benefit: 'Non-members pay R4,900 retail. Members pay R1,480 wholesale.',
        savings: 'Save R3,420 with wholesale pricing!',
        cta: 'Join Silver - Get Wholesale Pricing'
    },

    gold: {
        headline: '💡 Smart Choice Alert!',
        comparison: 'Almost there! Get the best value.',
        alternative: 'Join Gold Membership and get 11 apps for R2,490 (wholesale price)',
        benefit: 'Non-members pay R7,700 retail. Members pay R2,490 wholesale.',
        savings: 'Save R5,210 with wholesale pricing!',
        cta: 'Join Gold - Get Wholesale Pricing'
    },

    platinum: {
        headline: '💡 Ultimate Value Alert!',
        comparison: 'Why pay retail when you can buy wholesale?',
        alternative: 'Join Platinum Membership and get ALL 12 apps for R3,490 (wholesale price)',
        benefit: 'Non-members pay R8,400 retail. Members pay R3,490 wholesale.',
        savings: 'Save R4,910 with wholesale pricing + get premium bonuses!',
        cta: 'Join Platinum - Get Ultimate Wholesale Access'
    }
};

/**
 * WHOLESALE ADVANTAGE MESSAGING
 * Key talking points for membership sales
 */
const WHOLESALE_ADVANTAGE = {
    mainMessage: 'As a Z2B Legacy Builder member, you buy ALL our apps at WHOLESALE prices and save big compared to retail!',

    benefits: [
        '✅ Members pay wholesale, non-members pay retail',
        '✅ Same apps, lower price for members',
        '✅ No hidden fees - membership = wholesale access',
        '✅ Upgrade anytime to access more apps',
        '✅ Cancel anytime - no long-term contracts'
    ],

    examples: [
        'Bronze: 2 apps for R480 wholesale vs R1,400 retail (Save R920)',
        'Copper: 4 apps for R980 wholesale vs R2,800 retail (Save R1,820)',
        'Silver: 7 apps for R1,480 wholesale vs R4,900 retail (Save R3,420)',
        'Gold: 11 apps for R2,490 wholesale vs R7,700 retail (Save R5,210)',
        'Platinum: ALL 12 apps for R3,490 wholesale vs R8,400 retail (Save R4,910)'
    ]
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Z2B_WHOLESALE_RETAIL_PRICING,
        MEMBERSHIP_COMPARISON_TABLE,
        UPSELL_MESSAGES,
        WHOLESALE_ADVANTAGE
    };
}
