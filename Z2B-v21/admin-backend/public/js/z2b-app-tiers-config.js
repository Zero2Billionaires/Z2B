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
            package1: {
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
    },

    // BENOWN - AI Content Creator & Blog Writer
    'benown': {
        name: 'BENOWN',
        description: 'AI Content Creator & Blog Writing Assistant',
        icon: 'fas fa-pen-fancy',
        packages: {
            package1: {
                name: 'BENOWN Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '20 blog posts/month',
                    '500 words max per post',
                    'Basic templates (5)',
                    'SEO suggestions',
                    'Grammar check',
                    'Watermarked content'
                ],
                excluded: [
                    'Long-form content',
                    'Custom brand voice',
                    'Multi-language',
                    'API access',
                    'ISP commission'
                ]
            },
            package2: {
                name: 'BENOWN Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '100 blog posts/month',
                    '2,000 words max per post',
                    'ALL templates (30+)',
                    'Advanced SEO optimization',
                    'Plagiarism checker',
                    'NO watermark',
                    'Custom brand voice training',
                    'Content scheduling',
                    'Image suggestions'
                ],
                excluded: [
                    'Unlimited posts',
                    'API access',
                    'White-label',
                    'ISP commission'
                ]
            },
            package3: {
                name: 'BENOWN Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    'UNLIMITED blog posts',
                    '5,000 words max per post',
                    'Multi-language content (20+ languages)',
                    'API access for automation',
                    'Team collaboration (5 writers)',
                    'Advanced analytics & insights',
                    'Content library management',
                    '🏆 GOLD ISP COMMISSION: 28% on all referrals',
                    '💰 Earn from content creator referrals!'
                ],
                excluded: [
                    'White-label reseller rights',
                    'Platinum ISP commission'
                ]
            },
            package4: {
                name: 'BENOWN Ultimate',
                badge: 'ULTIMATE PACKAGE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'UNLIMITED words per post',
                    'White-label rights (RESELL as YOUR tool)',
                    'Remove all BENOWN branding',
                    'Unlimited team members',
                    'Custom AI model training (YOUR writing style)',
                    'Priority API with webhooks',
                    'Dedicated content strategist',
                    '👑 PLATINUM ISP COMMISSION: 30% on all referrals',
                    '💎 Build your content creation empire!'
                ],
                excluded: []
            }
        }
    },

    // ZYRA - AI Sales Agent
    'zyra': {
        name: 'ZYRA',
        description: 'AI Sales Agent & Lead Conversion Bot',
        icon: 'fas fa-chart-line',
        packages: {
            package1: {
                name: 'ZYRA Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '50 conversations/month',
                    'Basic sales scripts (3)',
                    'Email integration',
                    'Lead capture forms',
                    'Basic reporting',
                    'Single product/service'
                ],
                excluded: [
                    'Multi-channel support',
                    'Advanced AI training',
                    'CRM integration',
                    'ISP commission'
                ]
            },
            package2: {
                name: 'ZYRA Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '300 conversations/month',
                    'ALL sales scripts (20+)',
                    'Multi-channel (Email, WhatsApp, SMS)',
                    'CRM integration (5+ platforms)',
                    'Advanced lead scoring',
                    'Follow-up automation',
                    'Multiple products/services',
                    'Conversion analytics',
                    'A/B testing'
                ],
                excluded: [
                    'Voice calls',
                    'API access',
                    'White-label',
                    'ISP commission'
                ]
            },
            package3: {
                name: 'ZYRA Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    'UNLIMITED conversations',
                    'AI voice calls (outbound/inbound)',
                    'Custom sales script AI training',
                    'API access',
                    'Team collaboration (5 sales reps)',
                    'Advanced pipeline management',
                    'Real-time performance dashboard',
                    '🏆 GOLD ISP COMMISSION: 28% on all referrals',
                    '💰 Earn from sales automation referrals!'
                ],
                excluded: [
                    'White-label reseller rights',
                    'Platinum ISP commission'
                ]
            },
            package4: {
                name: 'ZYRA Ultimate',
                badge: 'ULTIMATE PACKAGE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'White-label rights (RESELL as YOUR sales agent)',
                    'Remove all ZYRA branding',
                    'Unlimited team members',
                    'Custom voice training (YOUR sales style)',
                    'Priority API with webhooks',
                    'Dedicated sales strategist',
                    'Enterprise integrations',
                    '👑 PLATINUM ISP COMMISSION: 30% on all referrals',
                    '💎 Build your sales automation empire!'
                ],
                excluded: []
            }
        }
    },

    // ZYNTH - AI Voice Cloning
    'zynth': {
        name: 'ZYNTH',
        description: 'AI Voice Cloning & Text-to-Speech',
        icon: 'fas fa-microphone',
        packages: {
            package1: {
                name: 'ZYNTH Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '30 minutes audio/month',
                    '5 preset AI voices',
                    'Basic text-to-speech',
                    'MP3 export',
                    'Watermarked audio',
                    'Single language (English)'
                ],
                excluded: [
                    'Voice cloning',
                    'Multi-language',
                    'Commercial use',
                    'API access',
                    'ISP commission'
                ]
            },
            package2: {
                name: 'ZYNTH Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '5 hours audio/month',
                    'ALL 50+ AI voices',
                    'Advanced text-to-speech',
                    'Voice cloning (1 custom voice)',
                    'Multi-language (20+ languages)',
                    'NO watermark',
                    'Commercial license',
                    'WAV & MP3 export',
                    'Emotion & tone control'
                ],
                excluded: [
                    'Unlimited voices',
                    'API access',
                    'White-label',
                    'ISP commission'
                ]
            },
            package3: {
                name: 'ZYNTH Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    '20 hours audio/month',
                    'UNLIMITED custom voice clones',
                    'Advanced voice editing',
                    'API access',
                    'Team collaboration (5 users)',
                    'Voice library management',
                    'Batch processing',
                    '🏆 GOLD ISP COMMISSION: 28% on all referrals',
                    '💰 Earn from voice cloning referrals!'
                ],
                excluded: [
                    'White-label reseller rights',
                    'Platinum ISP commission'
                ]
            },
            package4: {
                name: 'ZYNTH Ultimate',
                badge: 'ULTIMATE PACKAGE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'UNLIMITED audio generation',
                    'White-label rights (RESELL as YOUR voice tool)',
                    'Remove all ZYNTH branding',
                    'Unlimited team members',
                    'Custom voice AI training',
                    'Priority API with webhooks',
                    'Dedicated audio engineer support',
                    '👑 PLATINUM ISP COMMISSION: 30% on all referrals',
                    '💎 Build your voice technology empire!'
                ],
                excluded: []
            }
        }
    },

    // ZYRO - Gamification Hub
    'zyro': {
        name: 'ZYRO',
        description: 'Gamification & Engagement Platform',
        icon: 'fas fa-trophy',
        packages: {
            package1: {
                name: 'ZYRO Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '100 active users',
                    'Basic points system',
                    'Simple leaderboards',
                    '5 achievement badges',
                    'Email notifications',
                    'Basic analytics'
                ],
                excluded: [
                    'Custom badges',
                    'Advanced rewards',
                    'Multi-tier challenges',
                    'API access',
                    'ISP commission'
                ]
            },
            package2: {
                name: 'ZYRO Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '500 active users',
                    'Advanced points & rewards system',
                    'Multi-tier leaderboards',
                    'UNLIMITED custom badges',
                    'Challenge creation tools',
                    'Team competitions',
                    'Real-time notifications',
                    'Advanced analytics & insights',
                    'White-label branding'
                ],
                excluded: [
                    'Unlimited users',
                    'API access',
                    'Enterprise features',
                    'ISP commission'
                ]
            },
            package3: {
                name: 'ZYRO Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    '2,000 active users',
                    'API access for integrations',
                    'Custom reward marketplace',
                    'Advanced behavior tracking',
                    'Team collaboration (5 admins)',
                    'A/B testing for engagement',
                    'Priority support',
                    '🏆 GOLD ISP COMMISSION: 28% on all referrals',
                    '💰 Earn from gamification referrals!'
                ],
                excluded: [
                    'Unlimited users',
                    'White-label reseller rights',
                    'Platinum ISP commission'
                ]
            },
            package4: {
                name: 'ZYRO Ultimate',
                badge: 'ULTIMATE PACKAGE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'UNLIMITED active users',
                    'White-label reseller rights',
                    'Remove all ZYRO branding',
                    'Unlimited admin users',
                    'Custom gamification engine',
                    'Priority API with webhooks',
                    'Dedicated engagement strategist',
                    '👑 PLATINUM ISP COMMISSION: 30% on all referrals',
                    '💎 Build your gamification empire!'
                ],
                excluded: []
            }
        }
    },

    // ZYNECT - Complete CRM
    'zynect': {
        name: 'ZYNECT',
        description: 'Complete CRM & Customer Management',
        icon: 'fas fa-users-cog',
        packages: {
            package1: {
                name: 'ZYNECT Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '100 contacts',
                    'Basic contact management',
                    'Email tracking',
                    'Task management',
                    'Simple pipeline (3 stages)',
                    'Basic reporting'
                ],
                excluded: [
                    'Advanced automation',
                    'Multi-pipeline',
                    'Integrations',
                    'API access',
                    'ISP commission'
                ]
            },
            package2: {
                name: 'ZYNECT Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '1,000 contacts',
                    'Advanced contact management',
                    'Email & SMS automation',
                    'Multi-pipeline workflows',
                    'Deal tracking',
                    'Calendar & scheduling',
                    'Integrations (10+ platforms)',
                    'Custom fields & tags',
                    'Advanced reporting & analytics'
                ],
                excluded: [
                    'Unlimited contacts',
                    'API access',
                    'White-label',
                    'ISP commission'
                ]
            },
            package3: {
                name: 'ZYNECT Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    '10,000 contacts',
                    'API access',
                    'Custom workflow automation',
                    'Advanced segmentation',
                    'Team collaboration (5 users)',
                    'Sales forecasting',
                    'AI-powered insights',
                    'Priority support',
                    '🏆 GOLD ISP COMMISSION: 28% on all referrals',
                    '💰 Earn from CRM referrals!'
                ],
                excluded: [
                    'Unlimited contacts',
                    'White-label reseller rights',
                    'Platinum ISP commission'
                ]
            },
            package4: {
                name: 'ZYNECT Ultimate',
                badge: 'ULTIMATE PACKAGE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'UNLIMITED contacts',
                    'White-label reseller rights',
                    'Remove all ZYNECT branding',
                    'Unlimited team members',
                    'Custom CRM development',
                    'Priority API with webhooks',
                    'Dedicated CRM consultant',
                    '👑 PLATINUM ISP COMMISSION: 30% on all referrals',
                    '💎 Build your CRM empire!'
                ],
                excluded: []
            }
        }
    },

    // MAVULA - AI Prospecting Automation
    'mavula': {
        name: 'MAVULA',
        description: 'AI Prospecting & Lead Generation Automation',
        icon: 'fas fa-robot',
        packages: {
            package1: {
                name: 'MAVULA Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '50 prospects/month',
                    'Basic AI conversations',
                    'Email prospecting',
                    'Lead scoring',
                    'Simple follow-ups',
                    'Daily activity tracking'
                ],
                excluded: [
                    'Multi-channel prospecting',
                    'Advanced AI training',
                    'Social media import',
                    'API access',
                    'ISP commission'
                ]
            },
            package2: {
                name: 'MAVULA Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '300 prospects/month',
                    'Advanced AI conversations (24/7)',
                    'Multi-channel (Email, WhatsApp, LinkedIn)',
                    'Social media contact import',
                    'Automated follow-up sequences',
                    'Lead qualification scoring',
                    'Weekly income projections',
                    'Performance analytics',
                    'Campaign management'
                ],
                excluded: [
                    'Unlimited prospects',
                    'API access',
                    'White-label',
                    'ISP commission'
                ]
            },
            package3: {
                name: 'MAVULA Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    '1,000 prospects/month',
                    'AI content training (YOUR pitch)',
                    'API access for integrations',
                    'Team collaboration (5 users)',
                    'Advanced targeting & segmentation',
                    'A/B testing for messages',
                    'Real-time pipeline tracking',
                    '🏆 GOLD ISP COMMISSION: 28% on all referrals',
                    '💰 Earn from prospecting automation!'
                ],
                excluded: [
                    'Unlimited prospects',
                    'White-label reseller rights',
                    'Platinum ISP commission'
                ]
            },
            package4: {
                name: 'MAVULA Ultimate',
                badge: 'ULTIMATE PACKAGE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'UNLIMITED prospects',
                    'White-label reseller rights',
                    'Remove all MAVULA branding',
                    'Unlimited team members',
                    'Custom AI prospecting engine',
                    'Priority API with webhooks',
                    'Dedicated prospecting strategist',
                    '👑 PLATINUM ISP COMMISSION: 30% on all referrals',
                    '💎 Build your prospecting empire!'
                ],
                excluded: []
            }
        }
    },

    // MYDIGITALTWIN - Digital Twin Platform
    'mydigitaltwin': {
        name: 'MyDigitalTwin',
        description: 'AI Digital Twin & Avatar Video Generator',
        icon: 'fas fa-user-circle',
        packages: {
            package1: {
                name: 'MyDigitalTwin Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '10 videos/month',
                    '1 minute max length',
                    '15 voices (African only)',
                    '4 backgrounds',
                    '3 caption styles',
                    'HD quality',
                    'Watermarked output'
                ],
                excluded: [
                    'Custom avatars',
                    'Voice cloning',
                    'Photo upload',
                    'Batch creation',
                    'ISP commission'
                ]
            },
            package2: {
                name: 'MyDigitalTwin Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '30 videos/month',
                    '3 minute max length',
                    'ALL 30+ voices (global)',
                    'ALL backgrounds & caption styles',
                    'Photo upload (YOUR face)',
                    'Full HD quality',
                    'NO watermark',
                    'Batch video creation',
                    'Commercial license'
                ],
                excluded: [
                    'Voice cloning',
                    'Custom avatars',
                    'API access',
                    'White-label',
                    'ISP commission'
                ]
            },
            package3: {
                name: 'MyDigitalTwin Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    '100 videos/month',
                    '5 minute max length',
                    'Voice cloning (YOUR voice)',
                    'Custom avatar creation',
                    '4K Ultra HD quality',
                    'API access',
                    'Team collaboration (5 users)',
                    'Advanced video analytics',
                    '🏆 GOLD ISP COMMISSION: 28% on all referrals',
                    '💰 Earn from digital twin referrals!'
                ],
                excluded: [
                    'Unlimited videos',
                    'White-label reseller rights',
                    'Platinum ISP commission'
                ]
            },
            package4: {
                name: 'MyDigitalTwin Ultimate',
                badge: 'ULTIMATE PACKAGE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'UNLIMITED videos',
                    '10 minute max length',
                    'White-label reseller rights',
                    'Remove Z2B branding completely',
                    'Unlimited team members',
                    'Custom avatar training',
                    'Priority API with webhooks',
                    'Dedicated video strategist',
                    '👑 PLATINUM ISP COMMISSION: 30% on all referrals',
                    '💎 Build your digital twin empire!'
                ],
                excluded: []
            }
        }
    },

    // SHEPHERD-STAFF - Church Management
    'shepherd-staff': {
        name: 'Shepherd Staff',
        description: 'Complete Church Management System',
        icon: 'fas fa-church',
        packages: {
            package1: {
                name: 'Shepherd Staff Starter',
                badge: 'STARTER PACKAGE',
                price: 700,
                pv: 35,
                features: [
                    '100 members',
                    'Basic member database',
                    'Attendance tracking',
                    'Event calendar',
                    'Email notifications',
                    'Basic giving tracking',
                    'Weekly reports'
                ],
                excluded: [
                    'Online giving',
                    'Advanced groups',
                    'Mobile app',
                    'API access',
                    'ISP commission'
                ]
            },
            package2: {
                name: 'Shepherd Staff Pro',
                badge: 'PRO PACKAGE ⭐',
                price: 1900,
                pv: 95,
                popular: true,
                features: [
                    '500 members',
                    'Advanced member management',
                    'Small groups & ministry teams',
                    'Online giving integration',
                    'Volunteer scheduling',
                    'SMS & email campaigns',
                    'Event registration',
                    'Financial reporting',
                    'Mobile app access'
                ],
                excluded: [
                    'Unlimited members',
                    'API access',
                    'Multi-campus',
                    'ISP commission'
                ]
            },
            package3: {
                name: 'Shepherd Staff Premium',
                badge: 'PREMIUM PACKAGE + GOLD ISP',
                price: 3000,
                pv: 150,
                features: [
                    '✅ EVERYTHING IN PRO',
                    '2,000 members',
                    'Multi-campus management',
                    'API access for integrations',
                    'Advanced analytics & insights',
                    'Team collaboration (5 staff)',
                    'Custom workflows',
                    'Live streaming integration',
                    'Priority support',
                    '🏆 GOLD ISP COMMISSION: 28% on all referrals',
                    '💰 Earn from church software referrals!'
                ],
                excluded: [
                    'Unlimited members',
                    'White-label reseller rights',
                    'Platinum ISP commission'
                ]
            },
            package4: {
                name: 'Shepherd Staff Ultimate',
                badge: 'ULTIMATE PACKAGE 👑',
                price: 5000,
                pv: 250,
                features: [
                    '✅ EVERYTHING IN PREMIUM',
                    'UNLIMITED members',
                    'White-label reseller rights',
                    'Custom branding',
                    'Unlimited staff users',
                    'Custom module development',
                    'Priority API with webhooks',
                    'Dedicated church tech consultant',
                    '👑 PLATINUM ISP COMMISSION: 30% on all referrals',
                    '💎 Build your church software empire!'
                ],
                excluded: []
            }
        }
    }
};

// PV Calculation: Price ÷ 20 = PV
// STARTER Package: R700 ÷ 20 = 35 PV
// PRO Package: R1,900 ÷ 20 = 95 PV
// PREMIUM Package: R3,000 ÷ 20 = 150 PV
// ULTIMATE Package: R5,000 ÷ 20 = 250 PV
