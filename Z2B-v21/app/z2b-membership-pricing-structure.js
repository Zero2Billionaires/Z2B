/**
 * Z2B MEMBERSHIP TIERS - CORRECT APP ALLOCATION
 * Aligns membership pricing with app access limits
 */

const Z2B_MEMBERSHIP_TIERS = {
    bronze: {
        price: 480,
        pv: 24,
        appsIncluded: 2,
        tierAccess: 1, // Can access Tier 1 of their apps
        retailComparison: {
            // 2 apps × R700 (retail Tier 1) = R1,400
            appsValue: 2 * 700,
            totalRetail: 1400,
            memberPays: 480,
            savings: 920,
            savingsPercent: '66%'
        },
        description: '2 apps at Tier 1 wholesale pricing',
        upsellMessage: 'Get 2 AI apps for R480 instead of R1,400 retail!'
    },

    copper: {
        price: 980,
        pv: 49,
        appsIncluded: 4,
        tierAccess: 2, // Can access Tier 1-2 of their apps
        retailComparison: {
            // 4 apps × R1,400 (retail Tier 2) = R5,600
            appsValue: 4 * 1400,
            totalRetail: 5600,
            memberPays: 980,
            savings: 4620,
            savingsPercent: '82%'
        },
        description: '4 apps at Tier 1-2 wholesale pricing',
        upsellMessage: 'Get 4 AI apps (up to Tier 2) for R980 instead of R5,600 retail!'
    },

    silver: {
        price: 1480,
        pv: 74,
        appsIncluded: 7,
        tierAccess: 3, // Can access Tier 1-3 of their apps
        retailComparison: {
            // 7 apps × R2,100 (retail Tier 3) = R14,700
            appsValue: 7 * 2100,
            totalRetail: 14700,
            memberPays: 1480,
            savings: 13220,
            savingsPercent: '90%'
        },
        description: '7 apps at Tier 1-3 wholesale pricing',
        upsellMessage: 'Get 7 AI apps (up to Tier 3) for R1,480 instead of R14,700 retail!'
    },

    gold: {
        price: 2490,
        pv: 124.5,
        appsIncluded: 12, // ALL apps
        tierAccess: 4, // Can access ALL tiers (1-4) of ALL apps
        retailComparison: {
            // 12 apps × R2,800 (retail Tier 4) = R33,600
            appsValue: 12 * 2800,
            totalRetail: 33600,
            memberPays: 2490,
            savings: 31110,
            savingsPercent: '93%'
        },
        description: 'ALL 12 apps at ALL tiers wholesale pricing',
        upsellMessage: 'Get ALL 12 AI apps (ALL tiers) for R2,490 instead of R33,600 retail!',
        bonuses: [
            'Deeper TSC generations',
            'TLI access',
            'Maximum earning potential',
            'Priority support',
            'Exclusive trainings'
        ]
    }
};

/**
 * MEMBERSHIP VALUE COMPARISON
 * Shows what members get vs what they'd pay retail
 */
const MEMBERSHIP_VALUE_MATRIX = {
    bronze: {
        tier: 'Bronze',
        monthlyFee: 'R480',
        appsIncluded: '2 apps',
        retailEquivalent: 'R1,400',
        youSave: 'R920 (66%)',
        valueProposition: 'Get 2 AI apps for less than the price of 1!'
    },

    copper: {
        tier: 'Copper',
        monthlyFee: 'R980',
        appsIncluded: '4 apps (Tier 1-2)',
        retailEquivalent: 'R5,600',
        youSave: 'R4,620 (82%)',
        valueProposition: 'Get 4 advanced AI apps for less than 1 retail!'
    },

    silver: {
        tier: 'Silver',
        monthlyFee: 'R1,480',
        appsIncluded: '7 apps (Tier 1-3)',
        retailEquivalent: 'R14,700',
        youSave: 'R13,220 (90%)',
        valueProposition: 'Get 7 premium AI apps at 10% of retail cost!'
    },

    gold: {
        tier: 'Gold',
        monthlyFee: 'R2,490',
        appsIncluded: 'ALL 12 apps (ALL tiers)',
        retailEquivalent: 'R33,600',
        youSave: 'R31,110 (93%)',
        valueProposition: 'Get the ENTIRE AI ecosystem for 7% of retail!'
    }
};

/**
 * APP SELECTION BY TIER
 * Which apps members can choose at each tier level
 */
const APP_SELECTION_RULES = {
    bronze: {
        canChoose: 2,
        from: [
            'MyDigitalTwin', 'Coach ManLaw', 'VIDZIE', 'Glowie',
            'CaptionPro', 'ZYRO', 'ZYRA', 'BENOWN',
            'ZYNTH', 'ZYNECT', 'Mavula', 'Shepherd Staff'
        ],
        tierLevel: 1,
        note: 'Choose any 2 apps, access Tier 1 features'
    },

    copper: {
        canChoose: 4,
        from: 'ALL 12 apps',
        tierLevel: 2,
        note: 'Choose any 4 apps, access up to Tier 2 features'
    },

    silver: {
        canChoose: 7,
        from: 'ALL 12 apps',
        tierLevel: 3,
        note: 'Choose any 7 apps, access up to Tier 3 features'
    },

    gold: {
        canChoose: 12,
        from: 'ALL 12 apps',
        tierLevel: 4,
        note: 'Get ALL apps with ALL tiers unlocked'
    }
};

/**
 * UPSELL MESSAGING FOR NON-MEMBERS
 * When non-member tries to buy individual app
 */
const MEMBERSHIP_UPSELL_MESSAGES = {
    buyingTier1: {
        retailPrice: 'R700',
        upsell: {
            bronze: {
                pitch: 'Wait! Get 2 apps for R480 instead of R700 for 1 app',
                savings: 'Save R220 + get 1 extra app FREE',
                cta: 'Join Bronze Membership'
            }
        }
    },

    buyingTier2: {
        retailPrice: 'R1,400',
        upsell: {
            copper: {
                pitch: 'Get 4 apps (Tier 1-2) for R980 instead of R1,400 for 1 app',
                savings: 'Save R420 + get 3 extra apps FREE',
                cta: 'Join Copper Membership'
            }
        }
    },

    buyingTier3: {
        retailPrice: 'R2,100',
        upsell: {
            silver: {
                pitch: 'Get 7 apps (Tier 1-3) for R1,480 instead of R2,100 for 1 app',
                savings: 'Save R620 + get 6 extra apps FREE',
                cta: 'Join Silver Membership'
            }
        }
    },

    buyingTier4: {
        retailPrice: 'R2,800',
        upsell: {
            gold: {
                pitch: 'Get ALL 12 apps (ALL tiers) for R2,490 instead of R2,800 for 1 app',
                savings: 'Save R310 + get 11 extra apps FREE + bonuses',
                cta: 'Join Gold Membership'
            }
        }
    }
};

/**
 * CORRECTED VALUE CALCULATION
 */
function calculateMembershipValue(tierName) {
    const tier = Z2B_MEMBERSHIP_TIERS[tierName.toLowerCase()];

    return {
        membershipName: tierName,
        monthlyFee: tier.price,
        appsIncluded: tier.appsIncluded,
        maxTierAccess: tier.tierAccess,

        // If buying apps individually at retail
        retailCost: tier.retailComparison.totalRetail,

        // Member pays wholesale via membership
        memberPays: tier.retailComparison.memberPays,

        // Total savings
        savings: tier.retailComparison.savings,
        savingsPercent: tier.retailComparison.savingsPercent,

        // Value proposition
        message: tier.upsellMessage
    };
}

// Examples:
console.log('Bronze Member Value:', calculateMembershipValue('Bronze'));
// Bronze: R480 for 2 apps vs R1,400 retail = Save R920 (66%)

console.log('Gold Member Value:', calculateMembershipValue('Gold'));
// Gold: R2,490 for ALL 12 apps vs R33,600 retail = Save R31,110 (93%)

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Z2B_MEMBERSHIP_TIERS,
        MEMBERSHIP_VALUE_MATRIX,
        APP_SELECTION_RULES,
        MEMBERSHIP_UPSELL_MESSAGES,
        calculateMembershipValue
    };
}
