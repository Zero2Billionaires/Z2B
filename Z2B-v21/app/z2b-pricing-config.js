/**
 * Z2B Apps Pricing Configuration
 * 4-Tier Pricing Strategy: ALL Apps Start at R700 (Retail)
 *
 * PRICING PHILOSOPHY:
 * - Non-Members: Pay RETAIL prices (higher)
 * - Members: Pay WHOLESALE prices (membership advantage)
 * - PV Points: Price ÷ 20 = PV
 * - Each app has 4 tiers with progressive features
 */

const Z2B_PRICING = {
    // TIER 1: MyDigitalTwin - AI Video Cloning
    mydigitaltwin: {
        retail: {
            tier1: {
                name: 'Twin Starter',
                price: 700,
                pv: 35,
                features: [
                    '5 videos/month (1 min each)',
                    '10 voices (African + International)',
                    '2 backgrounds, 2 caption styles',
                    'HD quality with watermark',
                    'Basic support'
                ],
                limits: { videos: 5, duration: 60, voices: 10 }
            },
            tier2: {
                name: 'Twin Basic',
                price: 1400,
                pv: 70,
                features: [
                    '15 videos/month (2 min each)',
                    '20 voices (global)',
                    '6 backgrounds, 5 caption styles',
                    'Full HD, small watermark',
                    'Email support'
                ],
                limits: { videos: 15, duration: 120, voices: 20 }
            },
            tier3: {
                name: 'Twin Pro',
                price: 2100,
                pv: 105,
                features: [
                    '30 videos/month (3 min each)',
                    'ALL 30+ voices',
                    'Voice cloning (YOUR voice)',
                    'Custom avatars (YOUR face)',
                    'ALL backgrounds & styles',
                    'Full HD, NO watermark',
                    'Priority support'
                ],
                limits: { videos: 30, duration: 180, voices: 'unlimited' }
            },
            tier4: {
                name: 'Twin Unlimited',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED videos (3 min each)',
                    'Voice cloning + Custom avatars',
                    'White-label (resell rights)',
                    'API access',
                    '5 team members',
                    '4K quality',
                    '24/7 Priority support'
                ],
                limits: { videos: 'unlimited', duration: 180, voices: 'unlimited' }
            }
        },
        wholesale: {
            tier1: { name: 'Twin Starter', price: 600, pv: 30 },
            tier2: { name: 'Twin Basic', price: 1200, pv: 60 },
            tier3: { name: 'Twin Pro', price: 1900, pv: 95 },
            tier4: { name: 'Twin Unlimited', price: 3000, pv: 150 }
        }
    },

    // TIER 2: Coach ManLaw - AI Billionaire Coach
    coachmanlaw: {
        retail: {
            tier1: {
                name: 'Mindset Starter',
                price: 700,
                pv: 35,
                features: [
                    '10 AI coaching sessions/month',
                    'Basic 4M framework access',
                    'Text-based responses only',
                    'Community group access',
                    'Weekly insights'
                ],
                limits: { sessions: 10, framework: 'basic' }
            },
            tier2: {
                name: 'Legacy Builder',
                price: 1400,
                pv: 70,
                features: [
                    '30 AI coaching sessions/month',
                    'Full 4M framework + BTSS',
                    'Voice + Text responses',
                    'Scripture-based guidance',
                    'Daily insights',
                    'Progress tracking'
                ],
                limits: { sessions: 30, framework: 'full' }
            },
            tier3: {
                name: 'Billionaire Mastery',
                price: 2100,
                pv: 105,
                features: [
                    'UNLIMITED coaching sessions',
                    'Advanced 4M + BTSS + Custom plans',
                    'Voice cloning (Coach speaks as YOU)',
                    'Personal accountability',
                    'Weekly video lessons',
                    'Priority coaching'
                ],
                limits: { sessions: 'unlimited', framework: 'advanced' }
            },
            tier4: {
                name: 'Legacy Empire',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED everything',
                    'White-label coaching (resell)',
                    'Custom AI coach with YOUR brand',
                    'Team coaching (5 members)',
                    'API access',
                    '1-on-1 strategy calls (2/month)'
                ],
                limits: { sessions: 'unlimited', team: 5 }
            }
        },
        wholesale: {
            tier1: { name: 'Mindset Starter', price: 480, pv: 24 },
            tier2: { name: 'Legacy Builder', price: 980, pv: 49 },
            tier3: { name: 'Billionaire Mastery', price: 1480, pv: 74 },
            tier4: { name: 'Legacy Empire', price: 1980, pv: 99 }
        }
    },

    // TIER 3: VIDZIE - AI Avatar Video Generator
    vidzie: {
        retail: {
            tier1: {
                name: 'Video Starter',
                price: 700,
                pv: 35,
                features: [
                    '10 avatar videos/month',
                    '5 avatar options',
                    '10 voices (basic)',
                    '720p quality',
                    'Small watermark',
                    '1-minute max duration'
                ],
                limits: { videos: 10, avatars: 5, duration: 60 }
            },
            tier2: {
                name: 'Creator Pro',
                price: 1400,
                pv: 70,
                features: [
                    '30 avatar videos/month',
                    '15 avatar options',
                    '25 voices (global)',
                    '1080p Full HD',
                    'No watermark',
                    '3-minute max duration',
                    'Background music'
                ],
                limits: { videos: 30, avatars: 15, duration: 180 }
            },
            tier3: {
                name: 'Studio Premium',
                price: 2100,
                pv: 105,
                features: [
                    '100 avatar videos/month',
                    'ALL avatars + Custom avatar',
                    'Voice cloning',
                    '4K quality',
                    '5-minute duration',
                    'Advanced editing',
                    'Priority rendering'
                ],
                limits: { videos: 100, avatars: 'unlimited', duration: 300 }
            },
            tier4: {
                name: 'Agency Ultimate',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED videos',
                    'White-label (remove branding)',
                    'API access',
                    '5 team members',
                    '10-minute duration',
                    'Batch processing',
                    'Resell rights'
                ],
                limits: { videos: 'unlimited', team: 5, duration: 600 }
            }
        },
        wholesale: {
            tier1: { name: 'Video Starter', price: 480, pv: 24 },
            tier2: { name: 'Creator Pro', price: 980, pv: 49 },
            tier3: { name: 'Studio Premium', price: 1480, pv: 74 },
            tier4: { name: 'Agency Ultimate', price: 1980, pv: 99 }
        }
    },

    // TIER 4: Glowie - Instant App Builder
    glowie: {
        retail: {
            tier1: {
                name: 'App Starter',
                price: 700,
                pv: 35,
                features: [
                    '2 apps/month',
                    'Basic templates (10)',
                    'Web app only',
                    'Glowie branding',
                    'Community support'
                ],
                limits: { apps: 2, templates: 10 }
            },
            tier2: {
                name: 'Builder Pro',
                price: 1400,
                pv: 70,
                features: [
                    '5 apps/month',
                    'Pro templates (30)',
                    'Web + Mobile (PWA)',
                    'Custom branding',
                    'Email support',
                    'Basic API integration'
                ],
                limits: { apps: 5, templates: 30 }
            },
            tier3: {
                name: 'Developer Suite',
                price: 2100,
                pv: 105,
                features: [
                    '15 apps/month',
                    'ALL templates + Custom',
                    'Native iOS + Android',
                    'Full customization',
                    'Advanced integrations',
                    'Priority support'
                ],
                limits: { apps: 15, templates: 'unlimited' }
            },
            tier4: {
                name: 'Agency Master',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED apps',
                    'White-label platform',
                    'Resell to clients',
                    '5 team members',
                    'API access',
                    'Custom training'
                ],
                limits: { apps: 'unlimited', team: 5 }
            }
        },
        wholesale: {
            tier1: { name: 'App Starter', price: 480, pv: 24 },
            tier2: { name: 'Builder Pro', price: 980, pv: 49 },
            tier3: { name: 'Developer Suite', price: 1480, pv: 74 },
            tier4: { name: 'Agency Master', price: 1980, pv: 99 }
        }
    },

    // TIER 5: CaptionPro - AI Caption Generator
    captionpro: {
        retail: {
            tier1: {
                name: 'Caption Starter',
                price: 700,
                pv: 35,
                features: [
                    '20 videos/month',
                    '10 caption styles',
                    '15 languages',
                    'Auto-captions only',
                    'Standard fonts'
                ],
                limits: { videos: 20, styles: 10, languages: 15 }
            },
            tier2: {
                name: 'Creator Plus',
                price: 1400,
                pv: 70,
                features: [
                    '50 videos/month',
                    '25 caption styles',
                    '30 languages',
                    'Auto-cut to Reels/Shorts',
                    'Custom fonts + colors',
                    'Emoji support'
                ],
                limits: { videos: 50, styles: 25, languages: 30 }
            },
            tier3: {
                name: 'Studio Pro',
                price: 2100,
                pv: 105,
                features: [
                    '150 videos/month',
                    'ALL styles + Custom',
                    '50+ languages',
                    'Advanced auto-cut',
                    'Animated captions',
                    'B-roll suggestions',
                    'Priority processing'
                ],
                limits: { videos: 150, styles: 'unlimited', languages: 50 }
            },
            tier4: {
                name: 'Agency Elite',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED videos',
                    'White-label',
                    'API access',
                    'Batch processing',
                    '5 team members',
                    'Custom AI training'
                ],
                limits: { videos: 'unlimited', team: 5 }
            }
        },
        wholesale: {
            tier1: { name: 'Caption Starter', price: 480, pv: 24 },
            tier2: { name: 'Creator Plus', price: 980, pv: 49 },
            tier3: { name: 'Studio Pro', price: 1480, pv: 74 },
            tier4: { name: 'Agency Elite', price: 1980, pv: 99 }
        }
    },

    // TIER 6: ZYRO - AI Design Studio
    zyro: {
        retail: {
            tier1: {
                name: 'Design Starter',
                price: 700,
                pv: 35,
                features: [
                    '30 designs/month',
                    '20 templates',
                    'Social media graphics',
                    'Basic editing',
                    'Standard export'
                ],
                limits: { designs: 30, templates: 20 }
            },
            tier2: {
                name: 'Creator Studio',
                price: 1400,
                pv: 70,
                features: [
                    '100 designs/month',
                    '50 templates',
                    'Social + Print + Web',
                    'Advanced editing',
                    'HD export',
                    'Brand kit (3 brands)'
                ],
                limits: { designs: 100, templates: 50, brands: 3 }
            },
            tier3: {
                name: 'Design Pro',
                price: 2100,
                pv: 105,
                features: [
                    '300 designs/month',
                    'ALL templates + Custom',
                    'Video graphics',
                    'Animation support',
                    '4K export',
                    'Unlimited brand kits',
                    'Priority support'
                ],
                limits: { designs: 300, templates: 'unlimited' }
            },
            tier4: {
                name: 'Agency Master',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED designs',
                    'White-label',
                    'API access',
                    '5 team members',
                    'Custom templates',
                    'Client management'
                ],
                limits: { designs: 'unlimited', team: 5 }
            }
        },
        wholesale: {
            tier1: { name: 'Design Starter', price: 480, pv: 24 },
            tier2: { name: 'Creator Studio', price: 980, pv: 49 },
            tier3: { name: 'Design Pro', price: 1480, pv: 74 },
            tier4: { name: 'Agency Master', price: 1980, pv: 99 }
        }
    },

    // TIER 7: ZYRA - AI Business Assistant
    zyra: {
        retail: {
            tier1: {
                name: 'Assistant Lite',
                price: 700,
                pv: 35,
                features: [
                    '100 AI interactions/month',
                    'Email assistance',
                    'Basic scheduling',
                    'Text responses only',
                    'Standard support'
                ],
                limits: { interactions: 100 }
            },
            tier2: {
                name: 'Business Plus',
                price: 1400,
                pv: 70,
                features: [
                    '500 AI interactions/month',
                    'Email + Calendar + Tasks',
                    'Lead qualification',
                    'Voice + Text',
                    'CRM integration (basic)',
                    'Priority support'
                ],
                limits: { interactions: 500 }
            },
            tier3: {
                name: 'Enterprise Pro',
                price: 2100,
                pv: 105,
                features: [
                    '2000 interactions/month',
                    'Full business automation',
                    'Advanced CRM integration',
                    'Custom workflows',
                    'Analytics dashboard',
                    'API access'
                ],
                limits: { interactions: 2000 }
            },
            tier4: {
                name: 'Ultimate Suite',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED interactions',
                    'White-label',
                    '5 team members',
                    'Custom AI training',
                    'Multi-language support',
                    'Dedicated account manager'
                ],
                limits: { interactions: 'unlimited', team: 5 }
            }
        },
        wholesale: {
            tier1: { name: 'Assistant Lite', price: 480, pv: 24 },
            tier2: { name: 'Business Plus', price: 980, pv: 49 },
            tier3: { name: 'Enterprise Pro', price: 1480, pv: 74 },
            tier4: { name: 'Ultimate Suite', price: 1980, pv: 99 }
        }
    },

    // TIER 8: BENOWN - AI Content Creator
    benown: {
        retail: {
            tier1: {
                name: 'Content Starter',
                price: 700,
                pv: 35,
                features: [
                    '50 posts/month',
                    'Social media content',
                    '5 content types',
                    'Basic templates',
                    'Text only'
                ],
                limits: { posts: 50, types: 5 }
            },
            tier2: {
                name: 'Creator Pro',
                price: 1400,
                pv: 70,
                features: [
                    '150 posts/month',
                    'Social + Blog + Email',
                    '15 content types',
                    'Pro templates',
                    'Text + Images',
                    'SEO optimization'
                ],
                limits: { posts: 150, types: 15 }
            },
            tier3: {
                name: 'Marketing Suite',
                price: 2100,
                pv: 105,
                features: [
                    '500 posts/month',
                    'All platforms',
                    'ALL content types',
                    'Custom templates',
                    'Video scripts',
                    'Campaign planner',
                    'Analytics'
                ],
                limits: { posts: 500, types: 'unlimited' }
            },
            tier4: {
                name: 'Agency Ultimate',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED posts',
                    'White-label',
                    'API access',
                    '5 team members',
                    'Client management',
                    'Custom AI training'
                ],
                limits: { posts: 'unlimited', team: 5 }
            }
        },
        wholesale: {
            tier1: { name: 'Content Starter', price: 480, pv: 24 },
            tier2: { name: 'Creator Pro', price: 980, pv: 49 },
            tier3: { name: 'Marketing Suite', price: 1480, pv: 74 },
            tier4: { name: 'Agency Ultimate', price: 1980, pv: 99 }
        }
    },

    // TIER 9: ZYNTH - AI Audio Generator
    zynth: {
        retail: {
            tier1: {
                name: 'Voice Starter',
                price: 700,
                pv: 35,
                features: [
                    '20 audio files/month',
                    '10 voices',
                    '5-minute max length',
                    'MP3 export only',
                    'Standard quality'
                ],
                limits: { files: 20, voices: 10, duration: 300 }
            },
            tier2: {
                name: 'Audio Pro',
                price: 1400,
                pv: 70,
                features: [
                    '75 audio files/month',
                    '30 voices',
                    '15-minute max',
                    'MP3 + WAV export',
                    'HD quality',
                    'Background music'
                ],
                limits: { files: 75, voices: 30, duration: 900 }
            },
            tier3: {
                name: 'Studio Premium',
                price: 2100,
                pv: 105,
                features: [
                    '200 audio files/month',
                    'ALL voices + Custom',
                    '30-minute max',
                    'All formats',
                    'Studio quality',
                    'Voice cloning',
                    'Advanced editing'
                ],
                limits: { files: 200, voices: 'unlimited', duration: 1800 }
            },
            tier4: {
                name: 'Production Suite',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED audio files',
                    'White-label',
                    'API access',
                    '5 team members',
                    '60-minute max',
                    'Commercial rights'
                ],
                limits: { files: 'unlimited', team: 5, duration: 3600 }
            }
        },
        wholesale: {
            tier1: { name: 'Voice Starter', price: 480, pv: 24 },
            tier2: { name: 'Audio Pro', price: 980, pv: 49 },
            tier3: { name: 'Studio Premium', price: 1480, pv: 74 },
            tier4: { name: 'Production Suite', price: 1980, pv: 99 }
        }
    },

    // TIER 10: ZYNECT - AI Email Marketing
    zynect: {
        retail: {
            tier1: {
                name: 'Email Starter',
                price: 700,
                pv: 35,
                features: [
                    '500 contacts',
                    '5,000 emails/month',
                    '10 templates',
                    'Basic automation',
                    'Standard support'
                ],
                limits: { contacts: 500, emails: 5000, templates: 10 }
            },
            tier2: {
                name: 'Marketing Pro',
                price: 1400,
                pv: 70,
                features: [
                    '2,500 contacts',
                    '25,000 emails/month',
                    '30 templates',
                    'Advanced automation',
                    'A/B testing',
                    'Analytics'
                ],
                limits: { contacts: 2500, emails: 25000, templates: 30 }
            },
            tier3: {
                name: 'Business Suite',
                price: 2100,
                pv: 105,
                features: [
                    '10,000 contacts',
                    '100,000 emails/month',
                    'ALL templates',
                    'AI campaign optimizer',
                    'Advanced segmentation',
                    'CRM integration',
                    'Priority support'
                ],
                limits: { contacts: 10000, emails: 100000, templates: 'unlimited' }
            },
            tier4: {
                name: 'Enterprise Master',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED contacts',
                    'UNLIMITED emails',
                    'White-label',
                    'API access',
                    '5 team members',
                    'Dedicated IP',
                    'Account manager'
                ],
                limits: { contacts: 'unlimited', emails: 'unlimited', team: 5 }
            }
        },
        wholesale: {
            tier1: { name: 'Email Starter', price: 480, pv: 24 },
            tier2: { name: 'Marketing Pro', price: 980, pv: 49 },
            tier3: { name: 'Business Suite', price: 1480, pv: 74 },
            tier4: { name: 'Enterprise Master', price: 1980, pv: 99 }
        }
    },

    // TIER 11: Mavula - WhatsApp Automation
    mavula: {
        retail: {
            tier1: {
                name: 'Chat Starter',
                price: 700,
                pv: 35,
                features: [
                    '500 messages/month',
                    '1 WhatsApp number',
                    'Basic automation',
                    'Contact management',
                    'Standard support'
                ],
                limits: { messages: 500, numbers: 1 }
            },
            tier2: {
                name: 'Business Plus',
                price: 1400,
                pv: 70,
                features: [
                    '2,500 messages/month',
                    '3 WhatsApp numbers',
                    'Advanced automation',
                    'Broadcast lists',
                    'Analytics',
                    'Team inbox'
                ],
                limits: { messages: 2500, numbers: 3 }
            },
            tier3: {
                name: 'Enterprise Pro',
                price: 2100,
                pv: 105,
                features: [
                    '10,000 messages/month',
                    '10 WhatsApp numbers',
                    'AI chatbot',
                    'CRM integration',
                    'Payment links',
                    'Advanced analytics',
                    'Priority support'
                ],
                limits: { messages: 10000, numbers: 10 }
            },
            tier4: {
                name: 'Agency Ultimate',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED messages',
                    'UNLIMITED numbers',
                    'White-label',
                    'API access',
                    '5 team members',
                    'Custom integrations',
                    'Dedicated support'
                ],
                limits: { messages: 'unlimited', numbers: 'unlimited', team: 5 }
            }
        },
        wholesale: {
            tier1: { name: 'Chat Starter', price: 480, pv: 24 },
            tier2: { name: 'Business Plus', price: 980, pv: 49 },
            tier3: { name: 'Enterprise Pro', price: 1480, pv: 74 },
            tier4: { name: 'Agency Ultimate', price: 1980, pv: 99 }
        }
    },

    // TIER 12: Shepherd Staff - Church Management
    shepherdstaff: {
        retail: {
            tier1: {
                name: 'Church Starter',
                price: 700,
                pv: 35,
                features: [
                    'Up to 100 members',
                    'Basic member database',
                    'Attendance tracking',
                    'Donation recording',
                    'Standard support'
                ],
                limits: { members: 100 }
            },
            tier2: {
                name: 'Ministry Plus',
                price: 1400,
                pv: 70,
                features: [
                    'Up to 500 members',
                    'Advanced database',
                    'Attendance + Follow-up',
                    'Online giving',
                    'Event management',
                    'SMS notifications'
                ],
                limits: { members: 500 }
            },
            tier3: {
                name: 'Church Pro',
                price: 2100,
                pv: 105,
                features: [
                    'Up to 2,000 members',
                    'Full CRM',
                    'Multi-campus support',
                    'Advanced giving',
                    'Volunteer management',
                    'Custom reports',
                    'Mobile app'
                ],
                limits: { members: 2000 }
            },
            tier4: {
                name: 'Ministry Enterprise',
                price: 2800,
                pv: 140,
                features: [
                    'UNLIMITED members',
                    'White-label',
                    'Multi-church network',
                    '5 staff accounts',
                    'API access',
                    'Custom integrations',
                    'Dedicated support'
                ],
                limits: { members: 'unlimited', team: 5 }
            }
        },
        wholesale: {
            tier1: { name: 'Church Starter', price: 480, pv: 24 },
            tier2: { name: 'Ministry Plus', price: 980, pv: 49 },
            tier3: { name: 'Church Pro', price: 1480, pv: 74 },
            tier4: { name: 'Ministry Enterprise', price: 1980, pv: 99 }
        }
    }
};

/**
 * MEMBERSHIP ADVANTAGE:
 * Members get wholesale pricing (30-40% discount)
 *
 * MEMBERSHIP TIERS:
 * - Bronze (R480/month): Access to ALL Tier 1 apps at wholesale
 * - Copper (R980/month): Access to ALL Tier 1-2 apps at wholesale
 * - Silver (R1,480/month): Access to ALL Tier 1-3 apps at wholesale
 * - Gold (R2,490/month): Access to ALL TIERS at wholesale + extras
 */

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Z2B_PRICING;
}
