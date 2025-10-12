/**
 * ZYRO - Gamified Entrepreneurship App
 * "Play. Fail. Hustle. Share. Repeat."
 * Zero2Billionaires Ecosystem
 */

const ZYRO_CONFIG = {
    // App Information
    APP_NAME: 'ZYRO',
    VERSION: '1.0.0',
    TAGLINE: 'Play. Fail. Hustle. Share. Repeat.',
    DESCRIPTION: 'Where entrepreneurship meets fun - gamified challenges, absurd ideas, and viral content!',

    // Theme & Branding
    THEME: {
        primaryColor: '#FF6B35',      // Vibrant orange
        secondaryColor: '#FFD700',    // Gold
        accentColor: '#9D4EDD',       // Purple
        backgroundColor: '#FFF8F0',   // Warm white
        textColor: '#2D3047',         // Dark blue-gray
        successColor: '#06D6A0',      // Teal
        funColor: '#F72585'           // Hot pink
    },

    // Target Audience
    TARGET_AUDIENCE: {
        description: 'Employees wanting side hustles, aspiring entrepreneurs',
        age: [22, 40],
        mindset: 'Curious, playful, social media savvy, meme lovers',
        platforms: ['TikTok', 'Instagram', 'WhatsApp', 'Twitter/X'],
        engagement_style: 'Quick, fun, shareable micro-interactions'
    },

    // Gamification System
    GAMIFICATION: {
        pointsPerAction: {
            daily_challenge: 50,
            idea_spin: 10,
            bingo_complete: 100,
            madlib_create: 25,
            quiz_complete: 75,
            social_share: 30,
            streak_bonus: 20,
            friend_invite: 100,
            app_integration: 150
        },
        levels: [
            { name: 'Wannapreneur', minPoints: 0, badge: '🐣', color: '#FFE5B4' },
            { name: 'Side Hustler', minPoints: 500, badge: '💪', color: '#FFD700' },
            { name: 'Grind Master', minPoints: 1500, badge: '🔥', color: '#FF6B35' },
            { name: 'Boss Mode', minPoints: 3000, badge: '👑', color: '#9D4EDD' },
            { name: 'Empire Builder', minPoints: 5000, badge: '🚀', color: '#06D6A0' },
            { name: 'Billionaire Mindset', minPoints: 10000, badge: '💎', color: '#F72585' }
        ],
        badges: {
            streak_3: { name: '3-Day Streak', emoji: '🔥', description: 'On fire!' },
            streak_7: { name: 'Week Warrior', emoji: '⚡', description: 'Full week committed!' },
            streak_30: { name: 'Monthly Mogul', emoji: '💫', description: 'Unstoppable!' },
            first_spin: { name: 'Idea Spinner', emoji: '🎰', description: 'First spin complete' },
            bingo_master: { name: 'Bingo Boss', emoji: '🎯', description: 'First bingo completed' },
            social_butterfly: { name: 'Viral Vibes', emoji: '🦋', description: '10+ shares' },
            quiz_king: { name: 'Self-Aware CEO', emoji: '🧠', description: 'All quizzes done' },
            madlib_genius: { name: 'Wordsmith', emoji: '✍️', description: '50+ MadLibs' },
            app_explorer: { name: 'Ecosystem Expert', emoji: '🔗', description: 'Tried all Z2B apps' }
        },
        streaks: {
            dailyResetTime: '00:00',
            timezone: 'Africa/Johannesburg',
            bonusMultiplier: {
                3: 1.2,   // 20% bonus after 3 days
                7: 1.5,   // 50% bonus after 1 week
                30: 2.0   // 100% bonus after 1 month
            }
        }
    },

    // Daily Hustle Challenges
    DAILY_CHALLENGES: [
        {
            id: 'pitch_office_item',
            title: 'Luxury Sales Pitch',
            description: 'Pitch your office chair as a luxury product in 30 seconds',
            difficulty: 'easy',
            points: 50,
            timeLimit: 60,
            category: 'Sales',
            shareable: true,
            prompt: 'Record yourself giving a luxury sales pitch for a random office item'
        },
        {
            id: 'trade_up',
            title: 'Trade Master',
            description: 'Trade your pen for something better (virtual or real!)',
            difficulty: 'medium',
            points: 75,
            timeLimit: 300,
            category: 'Negotiation',
            shareable: true,
            prompt: 'Screenshot your "trade" and share the story'
        },
        {
            id: 'elevator_pitch',
            title: 'Elevator Pitch',
            description: 'Pitch Z2B to someone in 30 seconds',
            difficulty: 'medium',
            points: 100,
            timeLimit: 30,
            category: 'Marketing',
            shareable: true,
            prompt: 'Practice your Z2B elevator pitch'
        },
        {
            id: 'find_solution',
            title: 'Problem Solver',
            description: 'Identify 3 problems at your job that could be business ideas',
            difficulty: 'easy',
            points: 50,
            timeLimit: 180,
            category: 'Ideas',
            shareable: true,
            prompt: 'What frustrates you at work? That's a business opportunity!'
        },
        {
            id: 'revenue_brainstorm',
            title: 'Money Maker',
            description: 'List 5 ways you could earn R100 this week',
            difficulty: 'easy',
            points: 50,
            timeLimit: 120,
            category: 'Finance',
            shareable: true,
            prompt: 'Get creative! Even small ideas count.'
        },
        {
            id: 'network_challenge',
            title: 'Network Ninja',
            description: 'Message 3 people about their side hustles',
            difficulty: 'hard',
            points: 150,
            timeLimit: 600,
            category: 'Networking',
            shareable: true,
            prompt: 'Ask genuinely - learn from others'
        },
        {
            id: 'social_audit',
            title: 'Social Spy',
            description: 'Find 3 successful entrepreneurs on social media and analyze their content',
            difficulty: 'medium',
            points: 75,
            timeLimit: 300,
            category: 'Learning',
            shareable: true,
            prompt: 'What makes their content engaging? Take notes!'
        }
    ],

    // Idea Roulette
    IDEA_ROULETTE: {
        categories: [
            {
                name: 'Absurd Combos',
                prefix: ['Luxury', 'Budget', 'Automated', 'Subscription-based', 'On-demand'],
                business: ['Dog Walking', 'Laundry Service', 'Motivational Texting', 'Sock Matching', 'Plant Whispering'],
                suffix: ['for Billionaires', 'for Introverts', 'While You Sleep', 'via TikTok', 'with AI']
            },
            {
                name: 'Weird Services',
                ideas: [
                    'Rent-a-Friend for awkward family dinners',
                    'Professional line-stander for busy people',
                    'Excuse generator as a service',
                    'Social media ghostwriter for pets',
                    'Professional procrastination coach',
                    'Mood-based playlist curator for workouts',
                    'Compliment delivery service',
                    'Break-up text writer',
                    'Instagram caption writer for food pics',
                    'Professional mourner for hire'
                ]
            },
            {
                name: 'Trendy Twists',
                templates: [
                    'Uber for {service}',
                    'Tinder but for {activity}',
                    'Netflix of {product}',
                    'AirBnB for {item}',
                    'Amazon Prime for {niche}',
                    'OnlyFans but for {skill}'
                ],
                replacements: {
                    service: ['therapy', 'gardening', 'karaoke', 'napping'],
                    activity: ['finding gym buddies', 'board games', 'complaining', 'studying'],
                    product: ['socks', 'houseplants', 'motivational quotes', 'snacks'],
                    item: ['office chairs', 'books', 'gaming consoles', 'power tools'],
                    niche: ['cat owners', 'entrepreneurs', 'procrastinators', 'night owls'],
                    skill: ['cooking tips', 'Excel tutorials', 'dad jokes', 'life advice']
                }
            }
        ],
        miniChallenges: [
            'Create a logo for this idea using emojis',
            'Write a 10-word tagline',
            'Name 3 potential customers',
            'Design a TikTok ad concept',
            'Estimate startup cost in candy bars'
        ],
        shareTemplates: [
            'I just spun: {idea} 🎰 Should I build this? 😂 #ZYRO #Z2B',
            'My next billion-dollar idea: {idea} 💡 You in? #ZYRO',
            'Rate this business idea 1-10: {idea} 🚀 #EntrepreneurLife #ZYRO'
        ]
    },

    // SideGig Bingo
    SIDEGIG_BINGO: {
        tasks: [
            // Row 1
            { text: 'Follow Z2B on TikTok', points: 20, difficulty: 'easy', icon: '📱' },
            { text: 'Share ZYRO with 3 friends', points: 50, difficulty: 'medium', icon: '🤝' },
            { text: 'Complete a daily challenge', points: 50, difficulty: 'easy', icon: '✅' },
            { text: 'Spin Idea Roulette 5 times', points: 30, difficulty: 'easy', icon: '🎰' },
            { text: 'Post about Z2B', points: 75, difficulty: 'medium', icon: '📣' },

            // Row 2
            { text: 'Earn 500 points', points: 100, difficulty: 'hard', icon: '💯' },
            { text: 'Try Glowie app', points: 150, difficulty: 'medium', icon: '📲' },
            { text: 'Create 10 MadLibs', points: 50, difficulty: 'medium', icon: '✍️' },
            { text: 'Take CEO/Minion Quiz', points: 75, difficulty: 'easy', icon: '🧠' },
            { text: '3-day streak', points: 100, difficulty: 'medium', icon: '🔥' },

            // Row 3
            { text: 'Invite a friend to ZYRO', points: 100, difficulty: 'medium', icon: '💌' },
            { text: 'Share on Instagram Story', points: 50, difficulty: 'easy', icon: '📸' },
            { text: '⭐ FREE SPACE ⭐', points: 0, difficulty: 'free', icon: '⭐' },
            { text: 'Generate content with Benown', points: 150, difficulty: 'medium', icon: '🎨' },
            { text: 'Watch ManlaW coaching video', points: 50, difficulty: 'easy', icon: '🎓' },

            // Row 4
            { text: 'Complete 5 challenges', points: 200, difficulty: 'hard', icon: '🏆' },
            { text: 'Reach "Boss Mode" level', points: 250, difficulty: 'hard', icon: '👑' },
            { text: 'Share to TikTok', points: 75, difficulty: 'medium', icon: '🎵' },
            { text: 'Try Zyra AI chat', points: 150, difficulty: 'medium', icon: '🤖' },
            { text: 'Earn 5 badges', points: 200, difficulty: 'hard', icon: '🎖️' },

            // Row 5
            { text: 'Create viral meme', points: 100, difficulty: 'medium', icon: '😂' },
            { text: 'Complete full bingo row', points: 300, difficulty: 'hard', icon: '🎯' },
            { text: 'Use all Z2B apps', points: 500, difficulty: 'hard', icon: '🔗' },
            { text: 'Join Z2B community', points: 50, difficulty: 'easy', icon: '👥' },
            { text: '30-day streak (ultimate!)', points: 1000, difficulty: 'legendary', icon: '💎' }
        ],
        prizes: {
            one_line: { points: 150, badge: 'bingo_line', title: 'Line Winner' },
            two_lines: { points: 350, badge: 'bingo_double', title: 'Double Trouble' },
            full_bingo: { points: 1000, badge: 'bingo_master', title: 'Bingo Boss', reward: 'Unlock premium feature' },
            blackout: { points: 5000, badge: 'bingo_legend', title: 'Legendary Hustler', reward: 'Lifetime VIP' }
        }
    },

    // Hustle MadLibs
    HUSTLE_MADLIBS: {
        templates: [
            {
                title: 'Billion Dollar Pitch',
                template: "My startup, {company_name}, is disrupting the {industry} industry by offering {adjective} {product} for {target_audience}. We're like {comparison} but for {niche}. Our secret sauce? {crazy_feature}. Investors are gonna {reaction}!",
                prompts: {
                    company_name: 'Cool company name',
                    industry: 'Industry (e.g., food, tech)',
                    adjective: 'Adjective (e.g., revolutionary)',
                    product: 'Product/service',
                    target_audience: 'Target customers',
                    comparison: 'Famous company',
                    niche: 'Specific niche',
                    crazy_feature: 'Unique feature',
                    reaction: 'Reaction verb'
                }
            },
            {
                title: 'LinkedIn Flex',
                template: "Excited to announce that {company_name} just raised ${amount} in {funding_type} funding! 🚀 Our mission is to {mission} through {method}. Special shoutout to {person} for believing in us. {hashtag} {hashtag} #Blessed",
                prompts: {
                    company_name: 'Your startup name',
                    amount: 'Dollar amount',
                    funding_type: 'Type of funding',
                    mission: 'Your mission',
                    method: 'How you do it',
                    person: 'Someone to thank',
                    hashtag: 'Trendy hashtag (2x)'
                }
            },
            {
                title: 'Side Hustle Story',
                template: "Started {business} while working as a {job}. First month? Made R{amount}. People said I was {insult}, but now I'm {achievement}. My secret? {advice}. Who's ready to quit their {job} and chase {dream}?",
                prompts: {
                    business: 'Side hustle',
                    job: 'Your day job',
                    amount: 'Money amount',
                    insult: 'What doubters said',
                    achievement: 'Current status',
                    advice: 'One tip',
                    dream: 'Ultimate goal'
                }
            },
            {
                title: 'Entrepreneur Origin Story',
                template: "I used to be a {occupation} making R{salary}/month. One day, I had a crazy idea: {idea}. Everyone thought I was {reaction}. Fast forward {timeframe}, and now {outcome}. If I can do it, so can you! 💪",
                prompts: {
                    occupation: 'Old job',
                    salary: 'Old salary',
                    idea: 'Your crazy idea',
                    reaction: 'How people reacted',
                    timeframe: 'Time period',
                    outcome: 'Current result'
                }
            }
        ],
        aiEnhancement: true,
        shareFormat: 'image_with_text', // or 'text_only', 'story_format'
        viralHooks: [
            'Drop a 🔥 if you relate!',
            'Tag someone who needs to see this!',
            'Rate this pitch 1-10 in comments 👇',
            'Should I actually build this? 😂'
        ]
    },

    // CEO or Minion Quiz
    QUIZ_TEMPLATES: [
        {
            id: 'ceo_or_minion',
            title: 'CEO or Minion?',
            description: 'Find out if you're ready to boss up or still stuck in the 9-to-5 grind!',
            questions: [
                {
                    question: 'It's Monday morning. Your first thought?',
                    options: [
                        { text: 'Ugh, another week...', points: 0, trait: 'minion' },
                        { text: 'Let's crush these goals!', points: 3, trait: 'ceo' },
                        { text: 'Coffee first, then we'll see', points: 1, trait: 'hustler' }
                    ]
                },
                {
                    question: 'Your boss asks you to work overtime for free. You:',
                    options: [
                        { text: 'Say yes immediately (I need this job)', points: 0, trait: 'minion' },
                        { text: 'Negotiate for comp time or pay', points: 2, trait: 'hustler' },
                        { text: 'Politely decline - my time is valuable', points: 3, trait: 'ceo' }
                    ]
                },
                {
                    question: 'You have R5,000 extra. What do you do?',
                    options: [
                        { text: 'Savings account (safe and boring)', points: 1, trait: 'minion' },
                        { text: 'Invest in my side hustle', points: 3, trait: 'ceo' },
                        { text: 'Splurge on something fun, save the rest', points: 2, trait: 'hustler' }
                    ]
                },
                {
                    question: 'Someone criticizes your business idea. You:',
                    options: [
                        { text: 'Give up immediately', points: 0, trait: 'minion' },
                        { text: 'Prove them wrong by executing it', points: 3, trait: 'ceo' },
                        { text: 'Consider their feedback, then decide', points: 2, trait: 'hustler' }
                    ]
                },
                {
                    question: 'Your dream Friday night is:',
                    options: [
                        { text: 'Netflix and chill (literally just chill)', points: 1, trait: 'minion' },
                        { text: 'Working on my side hustle', points: 3, trait: 'ceo' },
                        { text: 'Hanging with friends, but thinking about business', points: 2, trait: 'hustler' }
                    ]
                },
                {
                    question: 'When you hear "passive income," you think:',
                    options: [
                        { text: 'Sounds like a scam', points: 0, trait: 'minion' },
                        { text: 'That's the dream! How do I start?', points: 3, trait: 'ceo' },
                        { text: 'Interested but skeptical', points: 1, trait: 'hustler' }
                    ]
                },
                {
                    question: 'Your current relationship with risk:',
                    options: [
                        { text: 'Avoid at all costs', points: 0, trait: 'minion' },
                        { text: 'Calculated risks only', points: 2, trait: 'hustler' },
                        { text: 'Fortune favors the bold!', points: 3, trait: 'ceo' }
                    ]
                },
                {
                    question: 'How do you feel about your current job?',
                    options: [
                        { text: 'It pays the bills', points: 1, trait: 'minion' },
                        { text: 'It's a stepping stone to my empire', points: 3, trait: 'ceo' },
                        { text: 'It's okay, but I want more', points: 2, trait: 'hustler' }
                    ]
                }
            ],
            results: {
                minion: {
                    title: '😬 Minion Mindset',
                    score: [0, 8],
                    description: 'You're stuck in employee mode! But don't worry - ZYRO is here to help you break free. Start with small daily challenges and build that CEO confidence!',
                    advice: 'Try our Daily Hustle Challenges to shift your mindset!',
                    nextStep: 'Start a 7-day ZYRO challenge streak',
                    shareable: true,
                    certificate: true
                },
                hustler: {
                    title: '💪 Side Hustler',
                    score: [9, 16],
                    description: 'You've got the hunger! You're thinking like an entrepreneur but still need that extra push. Keep grinding - you're on the right track!',
                    advice: 'Check out Z2B tools to automate your hustle!',
                    nextStep: 'Try Glowie or Benown to scale your efforts',
                    shareable: true,
                    certificate: true
                },
                ceo: {
                    title: '👑 CEO Material',
                    score: [17, 24],
                    description: 'You're READY! You think like a boss, act like a boss, and you're about to BE a boss. The only thing holding you back is taking action. Let's go!',
                    advice: 'Join Z2B and start building your empire TODAY!',
                    nextStep: 'Explore all Z2B apps and build your system',
                    shareable: true,
                    certificate: true
                }
            }
        },
        {
            id: 'entrepreneur_readiness',
            title: 'Are You Ready to Quit Your Job?',
            description: 'Let's see if you're financially and mentally ready to go full-time entrepreneur!',
            questions: [
                // Similar structure, 8-10 questions
                // Results: "Not Yet", "Almost There", "Go For It!"
            ]
        }
    ],

    // Social Sharing
    SOCIAL_SHARING: {
        platforms: {
            tiktok: {
                enabled: true,
                icon: 'fab fa-tiktok',
                color: '#000000',
                url: 'https://www.tiktok.com/upload',
                hashtags: ['#ZYRO', '#Z2B', '#SideHustle', '#Entrepreneur', '#PlayToHustle']
            },
            instagram: {
                enabled: true,
                icon: 'fab fa-instagram',
                color: '#E4405F',
                url: 'https://www.instagram.com/',
                hashtags: ['#ZYRO', '#Z2B', '#EntrepreneurLife', '#HustleHard']
            },
            whatsapp: {
                enabled: true,
                icon: 'fab fa-whatsapp',
                color: '#25D366',
                url: 'https://wa.me/?text=',
                shareText: 'Check out ZYRO - it's making entrepreneurship FUN! 🚀'
            },
            twitter: {
                enabled: true,
                icon: 'fab fa-x-twitter',
                color: '#000000',
                url: 'https://twitter.com/intent/tweet?text=',
                hashtags: ['ZYRO', 'Z2B', 'EntrepreneurLife']
            }
        },
        viralHooks: {
            challenges: 'I just completed {challenge} on ZYRO! Can you beat my score? 💪 #ZYRO #Z2B',
            ideas: 'My next billion-dollar idea: {idea} 😂 Rate it 1-10! #ZYRO',
            quiz: 'I'm a {result}! Take the quiz and see what you are 👉 #ZYRO #EntrepreneurQuiz',
            bingo: 'Just completed BINGO on ZYRO! 🎯 Who else is building their empire? #ZYRO #Z2B',
            madlib: 'Check out my startup pitch: {madlib} 🚀 Should I build this? #ZYRO'
        },
        incentives: {
            firstShare: { points: 50, badge: 'first_share' },
            tenShares: { points: 300, badge: 'social_butterfly' },
            viralPost: { points: 500, badge: 'viral_king', threshold: '100+ likes' }
        }
    },

    // Ecosystem Integration
    INTEGRATION: {
        glowie: {
            enabled: true,
            hook: 'Build an instant app for your crazy idea!',
            cta: 'Create App with Glowie →',
            url: 'glowie.html'
        },
        benown: {
            enabled: true,
            hook: 'Generate viral content for your idea!',
            cta: 'Create Content with Benown →',
            url: 'benown.html'
        },
        zyra: {
            enabled: true,
            hook: 'Let AI practice sales pitches with you!',
            cta: 'Try Zyra AI Sales Agent →',
            url: 'zyra.html'
        },
        manlaw: {
            enabled: true,
            hook: 'Get personalized coaching based on your quiz results!',
            cta: 'Chat with Coach ManlaW →',
            url: 'coach-manlaw.html'
        }
    },

    // Notifications & Engagement
    NOTIFICATIONS: {
        dailyChallenge: {
            enabled: true,
            time: '08:00',
            message: 'Your daily SideHustle challenge is ready! 🚀'
        },
        streakReminder: {
            enabled: true,
            time: '20:00',
            message: 'Don't break your streak! Come back and play 🔥'
        },
        newFeature: {
            enabled: true,
            message: 'New challenge unlocked! Come check it out 🎉'
        },
        friendActivity: {
            enabled: true,
            message: '{friend} just beat your score! Time to reclaim your crown 👑'
        }
    },

    // Leaderboards
    LEADERBOARDS: {
        categories: [
            { name: 'Top Hustlers', metric: 'total_points', timeframe: 'all_time' },
            { name: 'Weekly Winners', metric: 'points', timeframe: 'week' },
            { name: 'Streak Kings', metric: 'current_streak', timeframe: 'current' },
            { name: 'Social Shares', metric: 'shares', timeframe: 'month' },
            { name: 'Challenge Masters', metric: 'challenges_completed', timeframe: 'all_time' }
        ],
        prizes: {
            weekly_winner: 'Feature on Z2B social media + 500 bonus points',
            monthly_winner: 'Free Z2B Bronze membership for 1 month',
            yearly_winner: 'Free Z2B Gold membership for 6 months + personal coaching session'
        },
        displayTop: 10
    },

    // Firebase Collections
    FIREBASE_COLLECTIONS: {
        users: 'zyro_users',
        challenges: 'zyro_challenges',
        spins: 'zyro_idea_spins',
        bingos: 'zyro_bingos',
        madlibs: 'zyro_madlibs',
        quizzes: 'zyro_quiz_results',
        leaderboards: 'zyro_leaderboards',
        shares: 'zyro_social_shares'
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.ZYRO_CONFIG = ZYRO_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZYRO_CONFIG;
}
