/**
 * ZYRA - AI Sales Agent Configuration
 * Zero2Billionaires Ecosystem
 */

const ZYRA_CONFIG = {
    // App Information
    APP_NAME: 'ZYRA',
    VERSION: '1.0.0',
    TAGLINE: 'From Lead to Close, Without Lifting a Finger',

    // Firebase Configuration (Replace with your actual Firebase config)
    FIREBASE: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID",
        databaseURL: "https://YOUR_PROJECT.firebaseio.com"
    },

    // OpenAI Configuration
    // SECURITY: API key removed from frontend - now handled by backend proxy
    OPENAI: {
        proxyUrl: window.location.origin + '/api/openai-proxy.php', // Backend proxy endpoint
        model: "gpt-4",
        maxTokens: 500,
        temperature: 0.7
    },

    // ManyChat Configuration
    MANYCHAT: {
        apiKey: "YOUR_MANYCHAT_API_KEY",
        baseUrl: "https://api.manychat.com/fb"
    },

    // Lead Sources
    LEAD_SOURCES: {
        FACEBOOK: {
            enabled: true,
            pageId: "YOUR_FACEBOOK_PAGE_ID",
            accessToken: "YOUR_FB_ACCESS_TOKEN",
            webhookSecret: "YOUR_WEBHOOK_SECRET"
        },
        TIKTOK: {
            enabled: true,
            accountId: "YOUR_TIKTOK_ACCOUNT_ID",
            accessToken: "YOUR_TIKTOK_TOKEN"
        }
    },

    // Target Persona
    TARGET_PERSONA: {
        ageRange: [22, 40],
        occupations: [
            'Security Guard',
            'Retail Worker',
            'Nurse',
            'Police Officer',
            'Sales Representative',
            'Soldier',
            'Customer Service Rep',
            'Delivery Driver',
            'Administrative Assistant'
        ],
        locations: ['USA', 'South Africa', 'Nigeria', 'Kenya', 'Ghana'],
        platforms: ['Facebook', 'TikTok'],
        avgDailyUsage: '3-5 hours',
        painPoints: [
            'Long working hours',
            'Low pay',
            'Lack of time for learning',
            'Job fatigue',
            'No career growth'
        ],
        goals: [
            'Financial freedom',
            'Extra income',
            'Escape 9-to-5',
            'Work from home',
            'Build legacy'
        ]
    },

    // AI Personality Settings
    AI_PERSONALITY: {
        tone: 'friendly, confident, relatable mentor',
        style: 'short, simple, human-style messages',
        emoji_usage: true,
        formality: 'casual',
        empathy_level: 'high',
        sales_approach: 'value-first, soft-sell',
        response_patterns: {
            greeting: "Hey {name}! 👋 I saw you're interested in {topic}. Let me help you out!",
            qualification: "Quick question - what's your biggest challenge right now with {pain_point}?",
            objection_handling: "I totally get it, {name}. A lot of people felt that way at first...",
            closing: "Ready to take the next step? I can show you exactly how to get started 🚀"
        }
    },

    // Automation Phases
    PHASES: {
        PHASE_1: {
            name: 'Social Lead Capture',
            status: 'ACTIVE',
            features: [
                'Facebook lead forms integration',
                'TikTok DM capture',
                'Auto-store leads in Firebase',
                'Real-time dashboard sync',
                'Webhook triggers'
            ]
        },
        PHASE_2: {
            name: 'AI Chat Funnel',
            status: 'ACTIVE',
            features: [
                'ManyChat integration',
                'OpenAI conversation engine',
                'Auto-qualify leads',
                'Engagement scoring',
                'Chat history storage'
            ]
        },
        PHASE_3: {
            name: 'Smart Closing System',
            status: 'INACTIVE',
            features: [
                'Stripe/Paystack integration',
                'Auto checkout',
                'Payment reminders',
                'Revenue analytics',
                'Conversion tracking'
            ]
        }
    },

    // Lead Qualification Criteria
    LEAD_SCORING: {
        engagement_points: {
            opened_message: 1,
            replied: 3,
            asked_question: 5,
            clicked_link: 7,
            requested_info: 10
        },
        qualification_stages: {
            cold: { min: 0, max: 5, label: 'Cold', color: '#2196F3' },
            warm: { min: 6, max: 15, label: 'Warm', color: '#FF9800' },
            hot: { min: 16, max: 30, label: 'Hot', color: '#F44336' },
            ready: { min: 31, max: 100, label: 'Ready to Buy', color: '#4CAF50' }
        },
        auto_qualify_threshold: 16
    },

    // Conversation Flow
    CONVERSATION_FLOW: {
        stage_1_intro: {
            trigger: 'new_lead',
            delay: 60, // seconds
            messages: [
                "Hey {name}! 👋",
                "I noticed you're interested in building extra income while working your {occupation}.",
                "I totally get it - those long hours can be draining 😮‍💨",
                "Quick question: What's your biggest reason for looking into this?"
            ]
        },
        stage_2_qualify: {
            trigger: 'user_response',
            messages: [
                "Love that, {name}! 💪",
                "So here's the thing - a lot of people in your shoes have used this exact system to make an extra R5,000-R15,000/month.",
                "All while working their regular job.",
                "Does that sound like something you'd be interested in?"
            ]
        },
        stage_3_value: {
            trigger: 'interested',
            messages: [
                "Awesome! Let me break it down for you...",
                "This is a legit business platform (not MLM, not a scam 😂)",
                "You basically help others build their own side hustle, and you earn commissions.",
                "The best part? Everything is automated. No cold calling, no pitching to friends.",
                "Want me to send you a quick video that explains it all?"
            ]
        },
        stage_4_objection: {
            trigger: 'hesitation',
            common_objections: {
                no_time: "I hear you! That's why this is 100% automated. You literally set it up once and it runs in the background.",
                no_money: "Totally fair. The entry level is super affordable - way less than a night out. And it pays for itself in week 1 for most people.",
                skeptical: "Smart to be cautious! Check out some testimonials from people just like you who were skeptical at first: [link]",
                need_to_think: "No pressure at all! Take your time. I'll check back with you tomorrow. Sound good?"
            }
        },
        stage_5_close: {
            trigger: 'ready',
            messages: [
                "Perfect timing, {name}! 🎉",
                "Here's your personalized signup link: {signup_url}",
                "Choose the tier that fits you best (most people start with Bronze for R480/month)",
                "Once you're in, I'll personally walk you through the setup. Deal?"
            ]
        }
    },

    // Benown Integration
    BENOWN_INTEGRATION: {
        enabled: true,
        data_sync_interval: 3600000, // 1 hour in ms
        sync_data: {
            lead_interests: true,
            common_objections: true,
            trending_pain_points: true,
            high_performing_content: true,
            conversion_triggers: true
        },
        content_strategy_feed: {
            weekly_report: true,
            real_time_alerts: true,
            performance_metrics: true
        }
    },

    // Analytics Configuration
    ANALYTICS: {
        track_events: [
            'lead_captured',
            'message_sent',
            'message_read',
            'link_clicked',
            'objection_raised',
            'deal_closed',
            'payment_completed'
        ],
        dashboard_refresh_rate: 30000, // 30 seconds
        reports: {
            daily: true,
            weekly: true,
            monthly: true
        }
    },

    // Automation Controls
    AUTOMATION_SETTINGS: {
        auto_response_enabled: true,
        auto_follow_up_enabled: true,
        auto_qualify_enabled: true,
        working_hours: {
            mode: '24/7', // or 'business', 'extended', 'custom'
            timezone: 'Africa/Johannesburg',
            custom_hours: {
                start: '07:00',
                end: '22:00'
            }
        },
        response_delay: {
            min: 30, // seconds
            max: 120
        },
        follow_up_schedule: [
            { delay: 86400, message: "Hey {name}, just checking in! Did you get a chance to watch that video?" },
            { delay: 259200, message: "No worries if you're still thinking it over. Any questions I can answer?" },
            { delay: 604800, message: "Last check-in! If you're ready to start building your side income, I'm here 💪" }
        ]
    },

    // Notifications
    NOTIFICATIONS: {
        notify_on_new_lead: true,
        notify_on_hot_lead: true,
        notify_on_objection: true,
        notify_on_sale: true,
        channels: {
            email: true,
            sms: false,
            dashboard: true,
            webhook: false
        }
    },

    // Security & Privacy
    SECURITY: {
        encrypt_lead_data: true,
        gdpr_compliant: true,
        data_retention_days: 365,
        api_rate_limits: {
            openai: 60, // requests per minute
            manychat: 30,
            firebase: 1000
        }
    }
};

// Environment-specific overrides
if (typeof window !== 'undefined') {
    window.ZYRA_CONFIG = ZYRA_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZYRA_CONFIG;
}
