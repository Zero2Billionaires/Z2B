/**
 * BENOWN - AI Content Creator Configuration
 * Zero2Billionaires Ecosystem
 */

const BENOWN_CONFIG = {
    // App Information
    APP_NAME: 'BENOWN',
    VERSION: '1.0.0',
    TAGLINE: 'Your Automated Content Creator - Generate Engaging Content Effortlessly',

    // Firebase Configuration (Shared with ZYRA)
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
        maxTokens: 1000,
        temperature: 0.8 // Higher for more creative content
    },

    // Supported Platforms
    PLATFORMS: {
        INSTAGRAM: {
            name: 'Instagram',
            icon: 'fab fa-instagram',
            color: '#E4405F',
            enabled: true,
            contentTypes: ['image', 'carousel', 'reel', 'story'],
            captionLimit: 2200,
            hashtagLimit: 30,
            imageSize: { width: 1080, height: 1080 },
            videoLength: { reels: 90, stories: 15 }
        },
        TIKTOK: {
            name: 'TikTok',
            icon: 'fab fa-tiktok',
            color: '#000000',
            enabled: true,
            contentTypes: ['video'],
            captionLimit: 150,
            hashtagLimit: 5,
            videoLength: { max: 180, optimal: 15-60 }
        },
        FACEBOOK: {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            color: '#1877F2',
            enabled: true,
            contentTypes: ['post', 'image', 'video', 'link'],
            captionLimit: 63206,
            hashtagLimit: 10,
            imageSize: { width: 1200, height: 630 }
        },
        YOUTUBE: {
            name: 'YouTube',
            icon: 'fab fa-youtube',
            color: '#FF0000',
            enabled: true,
            contentTypes: ['video', 'short'],
            titleLimit: 100,
            descriptionLimit: 5000,
            videoLength: { shorts: 60, regular: 'unlimited' }
        },
        LINKEDIN: {
            name: 'LinkedIn',
            icon: 'fab fa-linkedin',
            color: '#0A66C2',
            enabled: true,
            contentTypes: ['post', 'article', 'image', 'video'],
            captionLimit: 3000,
            articleLimit: 125000
        },
        TWITTER: {
            name: 'Twitter/X',
            icon: 'fab fa-x-twitter',
            color: '#000000',
            enabled: true,
            contentTypes: ['tweet', 'thread', 'image'],
            textLimit: 280,
            imageLimit: 4,
            threadMax: 25
        }
    },

    // Content Types
    CONTENT_TYPES: {
        SOCIAL_POST: {
            name: 'Social Media Post',
            icon: 'fas fa-comment-dots',
            platforms: ['instagram', 'facebook', 'linkedin', 'twitter'],
            templates: ['motivational', 'educational', 'promotional', 'engagement']
        },
        VIDEO_SCRIPT: {
            name: 'Video Script',
            icon: 'fas fa-video',
            platforms: ['tiktok', 'youtube', 'instagram'],
            templates: ['tutorial', 'storytelling', 'testimonial', 'viral-trend']
        },
        BLOG_POST: {
            name: 'Blog Post',
            icon: 'fas fa-newspaper',
            platforms: ['website', 'linkedin'],
            templates: ['how-to', 'listicle', 'case-study', 'opinion']
        },
        EMAIL: {
            name: 'Email Campaign',
            icon: 'fas fa-envelope',
            platforms: ['email'],
            templates: ['welcome', 'newsletter', 'promotional', 'follow-up']
        },
        CAROUSEL: {
            name: 'Carousel Post',
            icon: 'fas fa-images',
            platforms: ['instagram', 'linkedin'],
            slides: { min: 2, max: 10 }
        }
    },

    // AI Content Templates
    TEMPLATES: {
        MOTIVATIONAL: {
            category: 'Engagement',
            prompt: 'Create a motivational post for employees looking to become entrepreneurs',
            tone: 'inspiring, energetic, relatable',
            callToAction: true,
            hashtagStrategy: 'trending + niche'
        },
        EDUCATIONAL: {
            category: 'Value',
            prompt: 'Share a quick tip or lesson about business/entrepreneurship',
            tone: 'helpful, authoritative, clear',
            callToAction: false,
            hashtagStrategy: 'educational'
        },
        PROMOTIONAL: {
            category: 'Sales',
            prompt: 'Promote Z2B platform benefits without being pushy',
            tone: 'exciting, benefit-focused, authentic',
            callToAction: true,
            hashtagStrategy: 'branded + trending'
        },
        ENGAGEMENT: {
            category: 'Community',
            prompt: 'Ask a question or start a conversation with followers',
            tone: 'friendly, curious, community-focused',
            callToAction: false,
            hashtagStrategy: 'engagement-focused'
        },
        TESTIMONIAL: {
            category: 'Social Proof',
            prompt: 'Share a success story or testimonial from Z2B member',
            tone: 'authentic, celebratory, relatable',
            callToAction: true,
            hashtagStrategy: 'success + niche'
        },
        TUTORIAL: {
            category: 'Education',
            prompt: 'Create a step-by-step tutorial or how-to guide',
            tone: 'clear, instructive, encouraging',
            callToAction: false,
            hashtagStrategy: 'how-to + niche'
        }
    },

    // Brand Voice Options
    BRAND_VOICES: {
        PROFESSIONAL: {
            tone: 'formal, authoritative, polished',
            language: 'industry terms, data-driven',
            emoji: 'minimal',
            audience: 'corporate professionals, LinkedIn'
        },
        CASUAL: {
            tone: 'friendly, conversational, approachable',
            language: 'everyday words, relatable',
            emoji: 'moderate',
            audience: 'general audience, Facebook'
        },
        ENERGETIC: {
            tone: 'exciting, dynamic, motivational',
            language: 'action words, power verbs',
            emoji: 'frequent',
            audience: 'young entrepreneurs, Instagram'
        },
        HUMOROUS: {
            tone: 'funny, witty, entertaining',
            language: 'jokes, puns, pop culture',
            emoji: 'creative',
            audience: 'viral content, TikTok'
        },
        INSPIRATIONAL: {
            tone: 'uplifting, empowering, hopeful',
            language: 'aspirational, emotional',
            emoji: 'meaningful',
            audience: 'dreamers, all platforms'
        }
    },

    // Target Audience (Aligned with ZYRA)
    TARGET_AUDIENCE: {
        demographics: {
            age: [22, 40],
            occupations: ['Security Guard', 'Retail Worker', 'Nurse', 'Police Officer', 'Sales Rep', 'Soldier'],
            locations: ['USA', 'South Africa', 'Nigeria', 'Kenya'],
            income: 'Entry-level to mid-level'
        },
        psychographics: {
            interests: ['Financial freedom', 'Side hustles', 'Entrepreneurship', 'Personal development'],
            painPoints: ['Low pay', 'Long hours', 'Job fatigue', 'Lack of growth'],
            goals: ['Extra income', 'Escape 9-to-5', 'Build legacy', 'Work from home'],
            platforms: ['Facebook', 'TikTok', 'Instagram', 'YouTube']
        }
    },

    // Content Calendar Settings
    CALENDAR: {
        defaultPostingFrequency: 'daily', // daily, 3x-week, weekly
        optimalTimes: {
            instagram: ['09:00', '12:00', '19:00'],
            tiktok: ['07:00', '12:00', '18:00', '21:00'],
            facebook: ['10:00', '13:00', '20:00'],
            linkedin: ['08:00', '12:00', '17:00'],
            twitter: ['09:00', '12:00', '15:00', '18:00']
        },
        planningHorizon: 30, // days
        autoPublish: false, // requires social media API integration
        reminderNotifications: true
    },

    // Hashtag Strategy
    HASHTAG_STRATEGY: {
        maxHashtags: {
            instagram: 30,
            tiktok: 5,
            facebook: 10,
            linkedin: 5,
            twitter: 3
        },
        categories: {
            branded: ['#Z2B', '#Zero2Billionaires', '#LegacyBuilders'],
            niche: ['#SideHustle', '#EmployeeToEntrepreneur', '#PassiveIncome'],
            trending: 'auto-detect from platform',
            engagement: ['#MotivationMonday', '#TransformationTuesday', '#SuccessStory']
        },
        mix: {
            branded: 0.2,
            niche: 0.5,
            trending: 0.2,
            engagement: 0.1
        }
    },

    // Content Remixing Rules
    REMIXING: {
        textToImage: {
            enabled: true,
            quoteCard: true,
            infographic: true,
            meme: true
        },
        textToVideo: {
            enabled: true,
            talkingHead: false, // requires video AI
            slideshow: true,
            textAnimation: true
        },
        videoToShorts: {
            enabled: true,
            autoClip: 'highlights',
            duration: [15, 30, 60]
        },
        longFormToSocial: {
            enabled: true,
            chunkSize: 'platform-appropriate',
            seriesMode: true
        }
    },

    // Analytics Tracking
    ANALYTICS: {
        metrics: [
            'impressions',
            'reach',
            'engagement_rate',
            'likes',
            'comments',
            'shares',
            'saves',
            'click_through_rate',
            'follower_growth'
        ],
        benchmarks: {
            excellent: { engagement_rate: 5 },
            good: { engagement_rate: 3 },
            average: { engagement_rate: 1.5 },
            poor: { engagement_rate: 0.5 }
        },
        reportingFrequency: 'weekly',
        insights: {
            bestPerformingContent: true,
            optimalPostingTimes: true,
            audienceGrowth: true,
            contentSuggestions: true
        }
    },

    // ZYRA Integration
    ZYRA_INTEGRATION: {
        enabled: true,
        syncInterval: 3600000, // 1 hour
        dataToReceive: {
            leadInterests: true,
            commonObjections: true,
            trendingPainPoints: true,
            conversionTriggers: true,
            successStories: true
        },
        dataToSend: {
            contentPerformance: true,
            viralTopics: true,
            audienceInsights: true,
            engagementPatterns: true
        }
    },

    // Team & Collaboration
    COLLABORATION: {
        teamMode: true,
        roles: {
            admin: ['create', 'edit', 'delete', 'publish', 'manage_team'],
            creator: ['create', 'edit', 'submit_for_approval'],
            reviewer: ['view', 'comment', 'approve', 'reject'],
            viewer: ['view']
        },
        approvalWorkflow: {
            enabled: false, // toggle on/off
            requireApproval: ['promotional', 'brand-sensitive'],
            approvers: 'admin'
        },
        comments: true,
        versionHistory: true
    },

    // Creativity Boosters
    CREATIVITY_TOOLS: {
        ideaGenerator: {
            enabled: true,
            sources: ['trending_topics', 'zyra_insights', 'viral_content', 'competitor_analysis'],
            brainstormMode: true
        },
        trendAlerts: {
            enabled: true,
            platforms: ['tiktok', 'instagram', 'twitter'],
            notification: 'real-time',
            categories: ['challenges', 'sounds', 'hashtags', 'formats']
        },
        contentSuggestions: {
            enabled: true,
            basedOn: ['past_performance', 'audience_interests', 'seasonal_trends'],
            frequency: 'daily'
        },
        aiEnhancements: {
            improveWriting: true,
            suggestImages: true,
            generateHashtags: true,
            optimizeLength: true,
            addEmojis: true
        }
    },

    // Storage & Library
    CONTENT_LIBRARY: {
        categories: ['drafts', 'scheduled', 'published', 'archived'],
        search: {
            enabled: true,
            filters: ['platform', 'date', 'performance', 'type', 'status']
        },
        duplication: true,
        templates: true,
        favorites: true
    },

    // Automation Features
    AUTOMATION: {
        autoSchedule: {
            enabled: true,
            smartTiming: 'based on audience activity',
            fillCalendar: 'auto-generate content to fill gaps'
        },
        autoHashtags: {
            enabled: true,
            strategy: 'AI-selected based on content'
        },
        autoFormat: {
            enabled: true,
            platformSpecific: 'resize, reformat for each platform'
        },
        recycleContent: {
            enabled: true,
            interval: 90, // days before suggesting repost
            modify: 'update with fresh angle'
        }
    },

    // Performance & Optimization
    PERFORMANCE: {
        contentScoring: {
            enabled: true,
            factors: ['engagement_potential', 'seo_optimization', 'platform_fit', 'brand_alignment']
        },
        abTesting: {
            enabled: true,
            variants: ['caption', 'image', 'hashtags', 'posting_time'],
            duration: 7 // days
        },
        recommendations: {
            enabled: true,
            autoApply: false,
            categories: ['improve_engagement', 'viral_potential', 'seo_boost']
        }
    },

    // User Experience
    UX: {
        mobileOptimized: true,
        darkMode: true,
        dragAndDrop: true,
        aiAssist: {
            enabled: true,
            inlineEditing: true,
            suggestions: 'real-time'
        },
        tutorials: {
            firstTimeUser: true,
            contextualHelp: true,
            videoGuides: true
        }
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.BENOWN_CONFIG = BENOWN_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BENOWN_CONFIG;
}
