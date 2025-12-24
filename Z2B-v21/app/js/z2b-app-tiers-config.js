/**
 * Z2B Individual App 4-Package Pricing Configuration
 * December 24, 2025
 *
 * PRODUCT PACKAGE PRICING STRUCTURE:
 * - STARTER Package: R700/month - Basic features
 * - PRO Package: R1,900/month - Advanced features
 * - PREMIUM Package: R3,000/month - ALL features + Gold Tier ISP (28%)
 * - ULTIMATE Package: R5,000/month - Everything + White-label + Platinum Tier ISP (30%)
 *
 * NOTE: "Packages" refers to individual app pricing tiers
 *       "Tiers" refers to membership levels (Bronze, Copper, Silver, Gold, Platinum)
 */

const Z2B_APP_PACKAGES = {
    // VIDZIE - AI Video Generator
    'vidzie': {
        name: 'VIDZIE',
        description: 'HeyGen-Style AI Avatar Video Generator',
        icon: 'fas fa-video',
        packages: {
            package1: {
                name: 'VIDZIE Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '10 videos/month',
                    '1 minute max length',
                    '2 AI voices (African only)',
                    '720p resolution',
                    'Watermarked output',
                    'Basic backgrounds (4)',
                    'Email support (24-48h)'
                ],
                excluded: [
                    'Voice cloning',
                    'Custom avatars',
                    'API access',
                    'White-label',
                    'Profit sharing'
                ]
            },
            package2: {
                name: 'VIDZIE Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '30 videos/month',
                    '3 minute max length',
                    'ALL 30+ AI voices (global)',
                    '1080p Full HD resolution',
                    'NO watermark',
                    'ALL backgrounds & settings',
                    'Priority support (12-24h)',
                    'Commercial license',
                    'Batch creation'
                ],
                excluded: [
                    'Voice cloning',
                    'Custom avatars',
                    'API access',
                    'White-label',
                    'Profit sharing'
                ]
            },
            package3: {
                name: 'VIDZIE Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    '100 videos/month',
                    '5 minute max length',
                    'Voice cloning (YOUR voice)',
                    'Custom avatars (upload photo)',
                    '4K Ultra HD resolution',
                    'API access',
                    'Team collaboration (5 users)',
                    'Advanced analytics',
                    'Premium support (4-8h)',
                    '🏆 GOLD ISP COMMISSION: 28% on all referrals',
                    '💰 Earn passive income from network building',
                    '📊 Same commission rate as Gold membership tier!'
                ],
                excluded: [
                    'White-label (resell rights)',
                    'Platinum profit sharing (30%)'
                ]
            },
            package4: {
                name: 'VIDZIE Ultimate',
                badge: 'ULTIMATE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'UNLIMITED videos',
                    '10 minute max length',
                    'Custom voice training (AI learns YOUR voice perfectly)',
                    'Custom avatar training (AI learns YOUR face)',
                    'White-label rights (RESELL as YOUR brand)',
                    'Remove Z2B branding completely',
                    'Unlimited team members',
                    'Dedicated account manager',
                    'Priority feature requests',
                    'Advanced API with webhooks',
                    '👑 PLATINUM ISP COMMISSION: 30% on all referrals',
                    '💎 HIGHEST commission rate in the entire platform!',
                    '🏆 Maximum earning potential + reseller rights!'
                ],
                excluded: []
            }
        }
    },

    // COACH MANLAW - AI Billionaire Coach
    'coach-manlaw': {
        name: 'Coach ManLaw',
        description: 'AI Billionaire Coach - 90-Day Transformation',
        icon: 'fas fa-robot',
        packages: {
            tier1: {
                name: 'Coach ManLaw Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    'Daily AI coaching sessions (text)',
                    'Basic mindset training',
                    '30-day transformation module',
                    'Email coaching support',
                    'Progress tracking dashboard'
                ],
                excluded: [
                    'Voice coaching',
                    'Video coaching',
                    'Live sessions',
                    'Profit sharing'
                ]
            },
            package2: {
                name: 'Coach ManLaw Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    'Daily AI coaching (text + voice)',
                    'Advanced mindset & business training',
                    'Full 90-day transformation program',
                    'Priority coaching support',
                    'Weekly accountability check-ins',
                    'Business planning tools',
                    'Financial goal tracking'
                ],
                excluded: [
                    'Video coaching with avatar',
                    'Live group sessions',
                    'Profit sharing'
                ]
            },
            package3: {
                name: 'Coach ManLaw Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    'AI video coaching with ManLaw avatar',
                    'Live group coaching sessions (weekly)',
                    'Custom business plan creation',
                    '1-on-1 strategy sessions',
                    'Advanced wealth-building modules',
                    'Entrepreneur community access',
                    '🏆 GOLD PROFIT SHARING: 28% commission',
                    '💰 Earn while you transform!'
                ],
                excluded: [
                    'White-label (rebrand as your coach)',
                    'Platinum profit sharing'
                ]
            },
            package4: {
                name: 'Coach ManLaw Ultimate',
                badge: 'ULTIMATE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'White-label rights (REBRAND as YOUR coaching program)',
                    'Unlimited 1-on-1 sessions',
                    'Custom avatar training (AI learns YOUR coaching style)',
                    'Resell as your own coaching product',
                    'VIP entrepreneur mastermind access',
                    'Dedicated success manager',
                    '👑 PLATINUM PROFIT SHARING: 30% commission',
                    '💎 Build your own coaching empire!'
                ],
                excluded: []
            }
        }
    },

    // CAPTIONPRO - AI Video Captions & Auto-Cut
    'captionpro': {
        name: 'CaptionPro',
        description: 'AI Video Captions & Auto-Cut Reels',
        icon: 'fas fa-closed-captioning',
        packages: {
            tier1: {
                name: 'CaptionPro Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '20 videos/month',
                    '5 minutes max per video',
                    'Basic caption styles (3)',
                    'Auto-cut reels',
                    'HD export (1080p)',
                    'Watermarked output'
                ],
                excluded: [
                    'Advanced caption animations',
                    'Custom branding',
                    'Batch processing',
                    'Profit sharing'
                ]
            },
            package2: {
                name: 'CaptionPro Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '100 videos/month',
                    '15 minutes max per video',
                    'ALL caption styles (20+)',
                    'Advanced auto-cut with AI scene detection',
                    '4K export',
                    'NO watermark',
                    'Custom branding (logo overlay)',
                    'Batch processing (10 videos at once)',
                    'Priority rendering'
                ],
                excluded: [
                    'API access',
                    'White-label',
                    'Profit sharing'
                ]
            },
            package3: {
                name: 'CaptionPro Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    'UNLIMITED videos',
                    '30 minutes max per video',
                    'API access for automation',
                    'Custom caption style creator',
                    'Team collaboration (5 users)',
                    'Advanced analytics',
                    '🏆 GOLD PROFIT SHARING: 28% commission',
                    '💰 Earn from referrals!'
                ],
                excluded: [
                    'White-label reseller rights',
                    'Platinum profit sharing'
                ]
            },
            package4: {
                name: 'CaptionPro Ultimate',
                badge: 'ULTIMATE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'White-label rights (RESELL as YOUR brand)',
                    'Remove all CaptionPro branding',
                    'Unlimited team members',
                    'Priority API with webhooks',
                    'Custom caption AI training',
                    'Dedicated support manager',
                    '👑 PLATINUM PROFIT SHARING: 30% commission',
                    '💎 Build your video editing empire!'
                ],
                excluded: []
            }
        }
    },

    // GLOWIE - AI Content Creator
    'glowie': {
        name: 'GLOWIE',
        description: 'AI Content Creation & Social Media Manager',
        icon: 'fas fa-sparkles',
        packages: {
            tier1: {
                name: 'GLOWIE Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '50 AI posts/month',
                    'Basic templates (10)',
                    '3 social platforms',
                    'Content calendar',
                    'Basic analytics'
                ],
                excluded: ['Advanced AI', 'Multi-platform', 'Profit sharing']
            },
            package2: {
                name: 'GLOWIE Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '200 AI posts/month',
                    'ALL templates (50+)',
                    'ALL social platforms (10+)',
                    'Advanced content calendar',
                    'Brand voice customization',
                    'Hashtag generator',
                    'Engagement analytics'
                ],
                excluded: ['API', 'White-label', 'Profit sharing']
            },
            package3: {
                name: 'GLOWIE Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    'UNLIMITED AI posts',
                    'API access',
                    'Team collaboration (5 users)',
                    'Advanced AI training on YOUR content',
                    '🏆 GOLD PROFIT SHARING: 28%'
                ],
                excluded: ['White-label', 'Platinum profit']
            },
            package4: {
                name: 'GLOWIE Ultimate',
                badge: 'ULTIMATE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'White-label reseller rights',
                    'Unlimited team members',
                    'Custom AI model training',
                    '👑 PLATINUM PROFIT SHARING: 30%'
                ],
                excluded: []
            }
        }
    }

    // NOTE: Add remaining 8 apps with same structure:
    // - BENOWN, ZYRA, ZYNTH, ZYRO, ZYNECT, MAVULA, MYDIGITALTWIN, SHEPHERD-STAFF
};

// PV Calculation: Price ÷ 20 = PV
// STARTER Package: R700 ÷ 20 = 35 PV
// PRO Package: R1,900 ÷ 20 = 95 PV
// PREMIUM Package: R3,000 ÷ 20 = 150 PV
// ULTIMATE Package: R5,000 ÷ 20 = 250 PV
