/**
 * Coach Manlaw 90-Day Transformation Program
 * Employee → Entrepreneur Journey
 * Based on the 4 Legs of the Billion Dollar Table
 */

const MANLAW_CURRICULUM = {
    programName: "90-Day Legacy Builder Transformation",
    totalDays: 90,
    totalWeeks: 13,

    // Program Structure: 85% 4 Legs, 10% Apps, 5% Reflection
    structure: {
        mindsetMystery: { weeks: 4, percentage: 30 },      // Weeks 1-4
        moneyMoves: { weeks: 3, percentage: 25 },          // Weeks 5-7
        legacyMissions: { weeks: 3, percentage: 20 },      // Weeks 8-10
        momentumMovement: { weeks: 3, percentage: 20 },    // Weeks 11-13
        appIntegration: { percentage: 10 },                 // Woven throughout
        reflection: { percentage: 5 }                       // Weekly check-ins
    },

    // PHASE 1: MINDSET MYSTERY (Weeks 1-4) - 30 Days
    phase1_mindset: {
        title: "🧠 MINDSET MYSTERY: From Employee to Visionary",
        objective: "Transform your identity, beliefs, and vision to think like a billionaire",
        weeks: [
            {
                week: 1,
                theme: "Identity Shift: Who You Think You Are",
                focus: "Breaking employee mindset, embracing Legacy Builder identity",
                lessons: [
                    {
                        day: 1,
                        title: "The Employee Trap: Why You're Stuck",
                        content: "Understanding the psychological chains of employment. Biblical foundation: Proverbs 23:7 'As a man thinks, so is he.'",
                        activity: "Write down 5 employee beliefs holding you back. Example: 'I trade time for money.'",
                        assignment: "BTSS Assessment - Baseline measurement. Rate your current Mindset Mystery (0-100)",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 2,
                        title: "Billionaire Thinking: The Mental Shift",
                        content: "How billionaires think differently. Identity vs. Behavior. The power of 'I am' statements.",
                        activity: "Create 5 'I am' declarations. Example: 'I am a wealth creator.' Say them 10x daily.",
                        assignment: "Journal: What would a billionaire version of me do today?",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 3,
                        title: "Vision Clarity: Seeing Your Billion-Dollar Future",
                        content: "The power of crystal-clear vision. Matthew 6:22 - Where your focus goes, energy flows.",
                        activity: "Vision Board Exercise: Draw/write your life 5 years from now as a Legacy Builder",
                        assignment: "Define your 'Why' in one sentence. Example: 'To create generational wealth for my family.'",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 4,
                        title: "Spiritual Alignment: Faith Meets Finance",
                        content: "Philippians 4:13 - God's abundance mindset. Aligning purpose with profit.",
                        activity: "Answer: How can my wealth serve God's purpose? Write 3 ways.",
                        assignment: "Morning prayer/meditation: 'God, align my business with your purpose.'",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 5,
                        title: "Overcoming Limiting Beliefs",
                        content: "Identifying and crushing mental barriers. The lies you've been told about money.",
                        activity: "Belief Inventory: List 10 beliefs about money. Mark helpful vs. harmful.",
                        assignment: "For each harmful belief, write the billionaire counter-belief",
                        btssImpact: "mindset",
                        appConnection: {
                            app: "ZYRO",
                            how: "Play ZYRO's 'CEO or Minion Quiz' to discover your entrepreneur personality. Use insights to strengthen mindset."
                        }
                    }
                ],
                weekend: {
                    reflection: "Review the week: What identity shift did you experience? What old belief died?",
                    application: "Share your #1 breakthrough with someone. Teaching solidifies learning.",
                    btssCheck: "Re-assess Mindset Mystery score. Track improvement."
                }
            },
            {
                week: 2,
                theme: "Mental Wealth: Building Unshakeable Confidence",
                focus: "Developing mental resilience, decision-making power, and unwavering self-belief",
                lessons: [
                    {
                        day: 6,
                        title: "Confidence Formula: Believing Before Seeing",
                        content: "Hebrews 11:1 - Faith is confidence in what we hope for. How self-belief creates reality.",
                        activity: "Past Wins Inventory: List 20 things you've already accomplished. Prove to yourself you CAN.",
                        assignment: "Daily affirmation: 'I am capable of building a billion-dollar legacy.'",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 7,
                        title: "Decision-Making Like a Billionaire",
                        content: "How successful people make fast, confident decisions. The 80/20 decision matrix.",
                        activity: "Practice rapid decision-making: Make 10 small decisions in 10 seconds each",
                        assignment: "Identify 1 big decision you've been avoiding. Make it today with 80% information.",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 8,
                        title: "Failure Reframing: Failing Forward",
                        content: "How billionaires view failure. Thomas Edison's 10,000 attempts. Romans 8:28 - All things work together for good.",
                        activity: "Failure Resume: List 5 past 'failures' and what you learned from each",
                        assignment: "Commit to trying something new this week, expecting to fail first",
                        btssImpact: "mindset",
                        appConnection: {
                            app: "ZYRO",
                            how: "ZYRO's tagline: 'Play. Fail. Hustle. Share. Repeat.' Use the Daily Challenges to practice failing forward in a fun way."
                        }
                    },
                    {
                        day: 9,
                        title: "Thought Leadership: Becoming the Expert",
                        content: "You don't need permission to be a leader. Teaching what you're learning builds authority.",
                        activity: "Create a 1-minute voice note teaching ONE concept from this week",
                        assignment: "Share that voice note on your social media or with 5 people",
                        btssImpact: "mindset",
                        appConnection: {
                            app: "BENOWN",
                            how: "Use BENOWN AI to create social media content from your learning. Turn insights into viral posts."
                        }
                    },
                    {
                        day: 10,
                        title: "The Millionaire Morning Routine",
                        content: "How you start your day determines your success. Proverbs 31 - She rises while it is night.",
                        activity: "Design your ideal morning routine (5:00-7:00 AM): Prayer, Exercise, Learning, Planning",
                        assignment: "Execute your new morning routine for 7 days straight. No excuses.",
                        btssImpact: "mindset",
                        appConnection: null
                    }
                ],
                weekend: {
                    reflection: "How has your confidence grown? What decision did you make that you previously avoided?",
                    application: "Test your new decision-making speed: Make 3 business-related decisions this weekend",
                    btssCheck: "Mindset Mystery progress check. Are you thinking differently?"
                }
            },
            {
                week: 3,
                theme: "Vision Execution: From Dream to Blueprint",
                focus: "Turning vision into concrete goals, plans, and milestones",
                lessons: [
                    {
                        day: 11,
                        title: "Goal Setting Like a Billionaire",
                        content: "SMART goals are for employees. Billionaires set BOLD goals. How to think 10x bigger.",
                        activity: "Write 1 impossible goal for your life. Then ask: 'What if it's actually possible?'",
                        assignment: "Break your 10x goal into quarterly milestones for 1 year",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 12,
                        title: "The Power of Visualization",
                        content: "Olympic athletes visualize winning. You can visualize wealth. Mental rehearsal creates reality.",
                        activity: "5-minute visualization: Close eyes, see yourself living your billion-dollar life. Feel it.",
                        assignment: "Do this visualization every morning for 30 days",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 13,
                        title: "Accountability: The Success Multiplier",
                        content: "Lone wolves die. Packs survive. Ecclesiastes 4:9 - Two are better than one.",
                        activity: "Find 1 accountability partner. Share your 90-day goal with them.",
                        assignment: "Schedule weekly check-ins with your accountability partner",
                        btssImpact: "mindset",
                        appConnection: {
                            app: "ZYRO",
                            how: "Use ZYRO Leaderboards to compete with other Legacy Builders. Community accountability drives results."
                        }
                    },
                    {
                        day: 14,
                        title: "Environment Design: You Are Who You Surround",
                        content: "Proximity is power. The 5-person rule. How environment shapes destiny.",
                        activity: "Audit your circle: List 5 people you spend most time with. Are they elevating or draining you?",
                        assignment: "Unfollow/mute negative influences on social media. Follow 5 successful entrepreneurs.",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 15,
                        title: "Learning Agility: The Billionaire Skill",
                        content: "The faster you learn, the faster you earn. Warren Buffett reads 500 pages daily.",
                        activity: "Commit to learning 1 new skill per month. Pick this month's skill now.",
                        assignment: "Read/watch/listen to 30 minutes of educational content daily",
                        btssImpact: "mindset",
                        appConnection: null
                    }
                ],
                weekend: {
                    reflection: "Is your vision clearer? Are you thinking 10x bigger than before?",
                    application: "Create a visual roadmap: Map out your 1-year journey to your first major milestone",
                    btssCheck: "Mindset Mystery score should be climbing. Measure it."
                }
            },
            {
                week: 4,
                theme: "Mindset Mastery: Cementing the Transformation",
                focus: "Solidifying new identity, eliminating old patterns, becoming unshakeable",
                lessons: [
                    {
                        day: 16,
                        title: "From Scarcity to Abundance",
                        content: "Scarcity mindset vs. Abundance mindset. Luke 6:38 - Give and it shall be given unto you.",
                        activity: "Generosity Practice: Give something valuable today (time, money, knowledge, or connection)",
                        assignment: "Practice abundance thinking: When you see others succeed, celebrate genuinely",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 17,
                        title: "Resilience: The Billionaire Bounce-Back",
                        content: "Why resilient people win. 2 Corinthians 4:8-9 - Pressed but not crushed. How to bounce back faster.",
                        activity: "Resilience Inventory: List 3 setbacks you've overcome. What made you resilient?",
                        assignment: "Write a 'Bounce-Back Plan' for when things go wrong",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 18,
                        title: "Eliminating Distractions: Focus Mastery",
                        content: "Billionaires protect their focus like gold. The cost of distraction. Single-tasking supremacy.",
                        activity: "Time Audit: Track every hour for 1 day. Identify time-wasters.",
                        assignment: "Eliminate #1 time-waster from your life. Delete app, unsubscribe, say no.",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 19,
                        title: "The Gratitude Advantage",
                        content: "1 Thessalonians 5:18 - Give thanks in all circumstances. Gratitude rewires your brain for success.",
                        activity: "Gratitude Journal: Write 10 things you're grateful for. Include 3 disguised as problems.",
                        assignment: "Start daily gratitude practice: 3 things every morning for 30 days",
                        btssImpact: "mindset",
                        appConnection: null
                    },
                    {
                        day: 20,
                        title: "Mindset Graduation: You're No Longer An Employee",
                        content: "Celebrating your mental transformation. Solidifying your new identity as a Legacy Builder.",
                        activity: "Write a 'Declaration of Independence' from employee mindset. Read it aloud.",
                        assignment: "Re-take BTSS Mindset Mystery assessment. Compare to Day 1. Celebrate growth!",
                        btssImpact: "mindset",
                        appConnection: {
                            app: "ZYRO",
                            how: "Share your transformation story on ZYRO. Inspire other builders. Earn points for sharing your journey."
                        }
                    }
                ],
                weekend: {
                    reflection: "PHASE 1 COMPLETE! How has your thinking changed in 4 weeks? Who have you become?",
                    application: "Teach someone else 1 key mindset shift you learned. Create a post/video about it.",
                    btssCheck: "Mindset Mystery should show significant improvement. If not, identify what's blocking you and address it."
                }
            }
        ]
    },

    // PHASE 2: MONEY MOVES (Weeks 5-7) - 21 Days
    phase2_money: {
        title: "💸 MONEY MOVES: Building Wealth Systems That Work While You Sleep",
        objective: "Master financial intelligence, create multiple income streams, and build wealth multiplication systems",
        weeks: [
            {
                week: 5,
                theme: "Financial Foundation: The Money Mindset",
                focus: "Understanding money, breaking money blocks, mastering financial basics",
                lessons: [
                    {
                        day: 21,
                        title: "Money Is a Tool, Not the Goal",
                        content: "1 Timothy 6:10 - Love of money is evil, but money itself is neutral. How to use money for good.",
                        activity: "Define your 'Money Mission': What will you do with wealth once you have it?",
                        assignment: "Calculate your 'Freedom Number': Monthly income needed to quit your job",
                        btssImpact: "money",
                        appConnection: null
                    },
                    {
                        day: 22,
                        title: "The 4 Income Streams Model",
                        content: "Earned (job), Profit (business), Passive (assets), Portfolio (investments). Billionaires have all 4.",
                        activity: "Income Stream Audit: Which streams do you have? Which are you building?",
                        assignment: "Commit to building 1 new income stream in next 60 days",
                        btssImpact: "money",
                        appConnection: {
                            app: "Z2B Platform",
                            how: "Z2B gives you 6 income streams: ISP, QPB, TSC, TPB, TLI, CEO. Understand each one. Pick your primary focus."
                        }
                    },
                    {
                        day: 23,
                        title: "Value Creation: The Wealth Formula",
                        content: "Wealth = Value × Scale. You don't get rich by working harder. You get rich by creating more value.",
                        activity: "Value Inventory: List 10 ways you currently create value for others",
                        assignment: "Identify 3 ways to 10x your value creation (not just work 10x harder)",
                        btssImpact: "money",
                        appConnection: null
                    },
                    {
                        day: 24,
                        title: "Pricing Your Worth",
                        content: "Stop undercharging. Charge based on value delivered, not time spent. Premium pricing psychology.",
                        activity: "Raise your prices exercise: What if you charged 2x? Who would still buy? (Probably most people.)",
                        assignment: "Increase your rates/prices by at least 25% on your next offer",
                        btssImpact: "money",
                        appConnection: null
                    },
                    {
                        day: 25,
                        title: "Financial Intelligence: Reading the Numbers",
                        content: "Income statement, balance sheet, cash flow. The 3 financial statements billionaires watch.",
                        activity: "Personal Financial Statement: Calculate your net worth (assets - liabilities)",
                        assignment: "Set net worth goal for 1 year from now. Write the number down.",
                        btssImpact: "money",
                        appConnection: null
                    }
                ],
                weekend: {
                    reflection: "How has your relationship with money shifted? Are you seeing new opportunities?",
                    application: "Take 1 action that increases your income this week (raise prices, ask for raise, make an offer)",
                    btssCheck: "Money Moves BTSS check. Starting to see improvement?"
                }
            },
            {
                week: 6,
                theme: "Marketing & Sales: The Money-Printing Skills",
                focus: "Master the art of attracting customers and closing deals",
                lessons: [
                    {
                        day: 26,
                        title: "Marketing 101: Attention = Currency",
                        content: "In 2025, whoever captures attention captures wealth. How to get eyeballs on your offer.",
                        activity: "Create your Unique Value Proposition (UVP): What makes you different in 1 sentence?",
                        assignment: "Post your UVP on social media. Get feedback from 10 people.",
                        btssImpact: "money",
                        appConnection: {
                            app: "BENOWN",
                            how: "Use BENOWN AI to generate viral marketing content. Turn your UVP into attention-grabbing posts, reels, and ads."
                        }
                    },
                    {
                        day: 27,
                        title: "Content That Converts",
                        content: "Educational content builds trust. Trust converts to sales. The content-to-cash pipeline.",
                        activity: "Create 1 piece of valuable content teaching something you know. Video, post, or audio.",
                        assignment: "Post it and track engagement. Aim for 100+ views.",
                        btssImpact: "money",
                        appConnection: {
                            app: "BENOWN",
                            how: "BENOWN helps you create consistent content. Generate 7 days of content in 7 minutes. Never run out of ideas."
                        }
                    },
                    {
                        day: 28,
                        title: "Sales Mastery: Closing Like a Pro",
                        content: "People buy with emotion, justify with logic. Master the conversation, master your income.",
                        activity: "Study 1 sales conversation (your own or someone else's). What worked? What didn't?",
                        assignment: "Make 5 sales conversations this week. Track close rate.",
                        btssImpact: "money",
                        appConnection: {
                            app: "ZYRA",
                            how: "ZYRA AI Sales Agent handles conversations 24/7. Let AI qualify leads while you focus on high-value closes."
                        }
                    },
                    {
                        day: 29,
                        title: "Overcoming Objections",
                        content: "Objections are buying signals in disguise. 'I can't afford it' means 'I don't see enough value yet.'",
                        activity: "List 5 common objections you hear. Write compelling responses to each.",
                        assignment: "Role-play handling objections with a friend. Practice until smooth.",
                        btssImpact: "money",
                        appConnection: {
                            app: "ZYRA",
                            how: "ZYRA is trained to handle objections. Study ZYRA's responses to learn objection-handling mastery."
                        }
                    },
                    {
                        day: 30,
                        title: "Building Your First Funnel",
                        content: "Marketing Funnel: Awareness → Interest → Decision → Action. Automate the customer journey.",
                        activity: "Map out a simple funnel for your offer: Free content → Lead magnet → Core offer",
                        assignment: "Build 1 piece of this funnel this week (landing page, lead magnet, or sales page)",
                        btssImpact: "money",
                        appConnection: {
                            app: "GLOWIE",
                            how: "Use GLOWIE AI App Builder to create your landing page or lead capture form in minutes. No coding needed!"
                        }
                    }
                ],
                weekend: {
                    reflection: "How many sales conversations did you have? What's your current close rate?",
                    application: "Optimize 1 part of your funnel based on this week's learning",
                    btssCheck: "Money Moves score rising? If not, identify the gap and fill it."
                }
            },
            {
                week: 7,
                theme: "Wealth Multiplication: Making Money Work For You",
                focus: "Passive income, investment mindset, money multiplication strategies",
                lessons: [
                    {
                        day: 31,
                        title: "Passive Income: The Billionaire's Secret",
                        content: "Active income has a ceiling. Passive income is infinite. Building assets that pay you forever.",
                        activity: "Passive Income Brainstorm: List 10 ways to create passive income in your niche",
                        assignment: "Choose 1 passive income idea and create a plan to build it in 90 days",
                        btssImpact: "money",
                        appConnection: {
                            app: "Marketplace",
                            how: "Create digital products and sell them on Z2B Marketplace. Build once, sell forever. Pure passive income."
                        }
                    },
                    {
                        day: 32,
                        title: "Investing 101: Growing Your Wealth",
                        content: "Proverbs 21:5 - Steady plodding brings prosperity. Compound interest is the 8th wonder of the world.",
                        activity: "Investment Education: Research 3 investment vehicles (stocks, real estate, crypto, business)",
                        assignment: "Open an investment account if you don't have one. Commit to investing 10% of income monthly.",
                        btssImpact: "money",
                        appConnection: null
                    },
                    {
                        day: 33,
                        title: "The Z2B Income System",
                        content: "How Z2B's 6 income streams work: ISP (sales profit), QPB (quick profit bonus), TSC (team sales), TPB (team profit bonus), TLI (leadership incentive), CEO (profit pool)",
                        activity: "Income Stream Calculator: Project your earnings in each stream at different team sizes",
                        assignment: "Invite 3 people to Z2B this week. Start building your income streams.",
                        btssImpact: "money",
                        appConnection: {
                            app: "Z2B Dashboard",
                            how: "Use your Z2B Dashboard to track all 6 income streams. Visualize your growing wealth daily."
                        }
                    },
                    {
                        day: 34,
                        title: "Leveraging Other People's Money (OPM)",
                        content: "Billionaires don't use their own money. They use investors, partners, and strategic debt.",
                        activity: "OPM Inventory: Who could invest in your vision? List 5 potential investors or partners.",
                        assignment: "Create a 1-page business plan to present to potential investors/partners",
                        btssImpact: "money",
                        appConnection: null
                    },
                    {
                        day: 35,
                        title: "Money Moves Mastery: You're Now a Wealth Builder",
                        content: "Celebrating your financial transformation. From money-fearful to money-masterful.",
                        activity: "Money Moves Reflection: How has your financial thinking evolved in 3 weeks?",
                        assignment: "Re-assess Money Moves BTSS score. Compare to week 5. Document your growth.",
                        btssImpact: "money",
                        appConnection: {
                            app: "ZYRO",
                            how: "Share your money transformation story on ZYRO. Inspire builders. Earn rewards for your wins."
                        }
                    }
                ],
                weekend: {
                    reflection: "PHASE 2 COMPLETE! What income streams have you activated? What's your monthly passive income target?",
                    application: "Review all your income streams. Create a 90-day income growth plan.",
                    btssCheck: "Money Moves should show major improvement. You're no longer just trading time for money!"
                }
            }
        ]
    },

    // PHASE 3: LEGACY MISSIONS (Weeks 8-10) - 21 Days
    phase3_legacy: {
        title: "⚙️ LEGACY MISSIONS: Building Systems That Scale Beyond You",
        objective: "Create automated, scalable systems that work without you and build something that outlives you",
        weeks: [
            {
                week: 8,
                theme: "Systems Thinking: From Hustle to Automation",
                focus: "Understanding systems, documenting processes, and beginning automation",
                lessons: [
                    {
                        day: 36,
                        title: "The System vs. The Hustle",
                        content: "Hustlers work IN the business. Builders work ON the business. Systems free you from the grind.",
                        activity: "Map your current workflow: What tasks do you do repeatedly? List them all.",
                        assignment: "Identify 5 tasks that could be systematized or automated",
                        btssImpact: "legacy",
                        appConnection: null
                    },
                    {
                        day: 37,
                        title: "Documentation: The Foundation of Scale",
                        content: "If it's not documented, it doesn't exist. SOPs (Standard Operating Procedures) are gold.",
                        activity: "Create 1 SOP for a repetitive task: Step-by-step process anyone could follow",
                        assignment: "Document 3 core processes in your business this week",
                        btssImpact: "legacy",
                        appConnection: {
                            app: "GLOWIE",
                            how: "Use GLOWIE to build simple process management tools. Create checklists, SOPs, and workflow apps instantly."
                        }
                    },
                    {
                        day: 38,
                        title: "The 80/20 Delegation Framework",
                        content: "Delegate 80% of tasks. Focus on 20% that only you can do. Time leverage = wealth leverage.",
                        activity: "80/20 Audit: Which 20% of your tasks create 80% of results? Circle them.",
                        assignment: "Delegate or eliminate 3 low-value tasks this week",
                        btssImpact: "legacy",
                        appConnection: null
                    },
                    {
                        day: 39,
                        title: "Automation Tools: Your Digital Workforce",
                        content: "AI, Zapier, automation software. Let technology do the repetitive work.",
                        activity: "Tool Research: Find 3 automation tools that could help your business",
                        assignment: "Implement 1 automation this week (email sequences, social scheduling, lead capture)",
                        btssImpact: "legacy",
                        appConnection: {
                            app: "ZYRA",
                            how: "ZYRA automates your entire sales process. Lead capture → Qualification → Closing. All done by AI 24/7."
                        }
                    },
                    {
                        day: 40,
                        title: "Building Your Tech Stack",
                        content: "CRM, email marketing, project management, content creation. Tools every scalable business needs.",
                        activity: "Tech Stack Audit: What tools do you use? What's missing?",
                        assignment: "Add 1 essential tool to your stack. Learn it this week.",
                        btssImpact: "legacy",
                        appConnection: {
                            app: "Z2B Ecosystem",
                            how: "Z2B gives you ZYRO, ZYRA, BENOWN, GLOWIE, Marketplace. Complete tech stack in one platform. No need for 10 tools!"
                        }
                    }
                ],
                weekend: {
                    reflection: "How many hours did you save through systems this week? What did you do with that time?",
                    application: "Build or improve 1 system that will save you 5+ hours/week",
                    btssCheck: "Legacy Missions BTSS check. Are you building systems or still hustling?"
                }
            },
            {
                week: 9,
                theme: "Team Building & Leadership",
                focus: "Building a team, leading effectively, and multiplying yourself through others",
                lessons: [
                    {
                        day: 41,
                        title: "You Can't Build a Billion-Dollar Business Alone",
                        content: "Ecclesiastes 4:9 - Two are better than one. Team = multiplication. Alone = addition.",
                        activity: "Team Vision: What roles do you need filled? List 5 key positions for your dream team.",
                        assignment: "Hire or partner with 1 person this month (VA, contractor, or team member)",
                        btssImpact: "legacy",
                        appConnection: null
                    },
                    {
                        day: 42,
                        title: "Recruiting A-Players",
                        content: "A-players attract A-players. B-players attract C-players. How to recruit the best.",
                        activity: "Create a 'Dream Team Member Profile': What qualities, skills, values do they have?",
                        assignment: "Post a job/partnership opportunity. Start recruiting.",
                        btssImpact: "legacy",
                        appConnection: null
                    },
                    {
                        day: 43,
                        title: "Leadership That Inspires",
                        content: "Management is doing things right. Leadership is doing the right things. How to lead with vision.",
                        activity: "Leadership Reflection: What kind of leader do you want to be? Write your leadership principles.",
                        assignment: "Lead by example: Take 1 bold action your team will notice and respect",
                        btssImpact: "legacy",
                        appConnection: null
                    },
                    {
                        day: 44,
                        title: "Training & Empowering Your Team",
                        content: "A leader's job is to multiply themselves. Train people to do what you do (and better).",
                        activity: "Training Plan: Create a simple onboarding process for new team members",
                        assignment: "Record a training video teaching 1 skill your team needs",
                        btssImpact: "legacy",
                        appConnection: {
                            app: "GLOWIE",
                            how: "Use GLOWIE to create a training portal/app for your team. Host videos, SOPs, and resources in one place."
                        }
                    },
                    {
                        day: 45,
                        title: "Building a Culture of Excellence",
                        content: "Culture eats strategy for breakfast. How to build a team that's aligned, motivated, and unstoppable.",
                        activity: "Define your company's core values: What do you stand for? List 3-5 values.",
                        assignment: "Communicate those values to your team. Recognize someone living them.",
                        btssImpact: "legacy",
                        appConnection: null
                    }
                ],
                weekend: {
                    reflection: "How has your team (or future team) taken shape? Are you thinking bigger?",
                    application: "Delegate 1 major responsibility to someone else. Trust and empower them.",
                    btssCheck: "Legacy Missions score check. Are you building something scalable?"
                }
            },
            {
                week: 10,
                theme: "Purpose & Impact: Building Something That Matters",
                focus: "Defining your mission, creating meaningful impact, and building a lasting legacy",
                lessons: [
                    {
                        day: 46,
                        title: "Profit + Purpose = Power",
                        content: "Money without mission is meaningless. Purpose-driven businesses attract loyal customers and team.",
                        activity: "Define Your Mission: What problem are you solving? Who are you serving? Why does it matter?",
                        assignment: "Write your mission statement in 1-2 sentences. Make it inspiring.",
                        btssImpact: "legacy",
                        appConnection: null
                    },
                    {
                        day: 47,
                        title: "Creating Impact That Lasts",
                        content: "Legacy isn't what you build - it's what outlives you. How to create generational impact.",
                        activity: "Legacy Reflection: What do you want people to say about you in 50 years?",
                        assignment: "Identify 1 way your business creates lasting positive impact. Double down on it.",
                        btssImpact: "legacy",
                        appConnection: null
                    },
                    {
                        day: 48,
                        title: "Building for Generations",
                        content: "Proverbs 13:22 - A good man leaves an inheritance for his children's children. Generational wealth thinking.",
                        activity: "Generational Plan: How will your business provide for your family for 100 years?",
                        assignment: "Set up 1 structure for generational wealth (trust, investment, business equity)",
                        btssImpact: "legacy",
                        appConnection: null
                    },
                    {
                        day: 49,
                        title: "Scaling for Maximum Impact",
                        content: "More scale = more impact. How to go from serving 10 to 10,000 to 10 million.",
                        activity: "Scaling Roadmap: Map out how you'll serve 10x more people in the next year",
                        assignment: "Identify 1 bottleneck preventing scale. Fix it this week.",
                        btssImpact: "legacy",
                        appConnection: {
                            app: "Z2B Network",
                            how: "Z2B's network effect lets you scale exponentially. Your team builds teams. 1 becomes 10 becomes 100 becomes 1000."
                        }
                    },
                    {
                        day: 50,
                        title: "Legacy Missions Mastery: You're a System Builder",
                        content: "Celebrating systems mastery. You're no longer doing everything - you've built a machine.",
                        activity: "Systems Reflection: How many hours/week have you freed up? What systems are running?",
                        assignment: "Re-assess Legacy Missions BTSS score. Compare to week 8. Celebrate progress!",
                        btssImpact: "legacy",
                        appConnection: {
                            app: "ZYRO",
                            how: "Share your systems breakthrough on ZYRO. Teach others. Earn badges for helping builders scale."
                        }
                    }
                ],
                weekend: {
                    reflection: "PHASE 3 COMPLETE! What systems are now running your business? What's your legacy mission?",
                    application: "Finalize 1 major system that will run for years. Document it completely.",
                    btssCheck: "Legacy Missions should show massive growth. You're building something that lasts!"
                }
            }
        ]
    },

    // PHASE 4: MOMENTUM MOVEMENT (Weeks 11-13) - 21 Days
    phase4_momentum: {
        title: "🌍 MOMENTUM MOVEMENT: Building Influence & Leading Movements",
        objective: "Amplify your influence, build community, create movements, and become a leader others follow",
        weeks: [
            {
                week: 11,
                theme: "Personal Branding: Becoming Known",
                focus: "Building a powerful personal brand that attracts opportunities and followers",
                lessons: [
                    {
                        day: 51,
                        title: "Your Brand = Your Reputation at Scale",
                        content: "Everyone has a personal brand. The question is: are you controlling it or ignoring it?",
                        activity: "Brand Audit: Google yourself. What comes up? What do people say about you?",
                        assignment: "Define your personal brand in 3 words. Example: 'Innovative. Authentic. Bold.'",
                        btssImpact: "movement",
                        appConnection: null
                    },
                    {
                        day: 52,
                        title: "Storytelling That Sells",
                        content: "Facts tell, stories sell. Your story is your superpower. How to craft a compelling narrative.",
                        activity: "Write your origin story: Where you were → Transformation → Where you are now",
                        assignment: "Share your story on social media. Make it vulnerable and inspiring.",
                        btssImpact: "movement",
                        appConnection: {
                            app: "BENOWN",
                            how: "Use BENOWN AI to craft compelling brand stories. Turn your journey into viral content that attracts followers."
                        }
                    },
                    {
                        day: 53,
                        title: "Content Consistency: The Key to Visibility",
                        content: "Consistency beats perfection. Showing up daily builds trust, authority, and audience.",
                        activity: "Content Calendar: Plan 30 days of content. What will you post every day?",
                        assignment: "Commit to posting 1 piece of valuable content daily for 30 days. No excuses.",
                        btssImpact: "movement",
                        appConnection: {
                            app: "BENOWN",
                            how: "BENOWN creates 30 days of content in 30 minutes. Never run out of ideas. Stay consistent effortlessly."
                        }
                    },
                    {
                        day: 54,
                        title: "Authority Positioning: Becoming the Go-To Expert",
                        content: "How to position yourself as THE authority in your niche. Expertise + visibility = authority.",
                        activity: "Authority Assets: List ways to demonstrate expertise (content, case studies, testimonials, media)",
                        assignment: "Create 1 authority asset this week (guest post, podcast interview, viral post, case study)",
                        btssImpact: "movement",
                        appConnection: null
                    },
                    {
                        day: 55,
                        title: "Social Media Strategy: Platform Domination",
                        content: "Pick 1-2 platforms. Dominate them. Then expand. Omni-presence beats omnipresence.",
                        activity: "Platform Selection: Which platform has YOUR audience? Go all-in there.",
                        assignment: "Create a 90-day social media plan. What content, how often, what goal?",
                        btssImpact: "movement",
                        appConnection: {
                            app: "BENOWN",
                            how: "BENOWN optimizes content for every platform. One idea → 10 platform-specific posts. Maximum reach, minimum effort."
                        }
                    }
                ],
                weekend: {
                    reflection: "How has your visibility grown? Are people starting to recognize your brand?",
                    application: "Double down on what's working. Analyze your best-performing content and create more like it.",
                    btssCheck: "Momentum Movement BTSS check. Is your influence growing?"
                }
            },
            {
                week: 12,
                theme: "Community Building: Creating Your Tribe",
                focus: "Building engaged communities, fostering connection, and leading with purpose",
                lessons: [
                    {
                        day: 56,
                        title: "Community = Currency",
                        content: "A loyal community is worth millions. How to build a tribe that supports and grows with you.",
                        activity: "Community Vision: What kind of community do you want to lead? What values unite them?",
                        assignment: "Start your community: Facebook group, WhatsApp group, Discord, or in-person meetups",
                        btssImpact: "movement",
                        appConnection: {
                            app: "Z2B Team",
                            how: "Your Z2B team IS your community. Nurture them. Support their growth. Together you rise."
                        }
                    },
                    {
                        day: 57,
                        title: "Engagement: Turning Followers into Fans",
                        content: "Followers consume. Fans participate. Advocates sell for you. How to create raving fans.",
                        activity: "Engagement Experiment: Ask your audience 1 question today. Respond to every comment.",
                        assignment: "Create a weekly engagement ritual (Q&A, live session, poll, challenge)",
                        btssImpact: "movement",
                        appConnection: {
                            app: "ZYRO",
                            how: "Use ZYRO gamification to engage your community. Create challenges, leaderboards, and rewards. Make it fun!"
                        }
                    },
                    {
                        day: 58,
                        title: "Value-First Leadership",
                        content: "Give 10x more than you ask. Serve before you sell. Generosity creates loyalty.",
                        activity: "Value Bomb: Create something ridiculously valuable and give it away free (guide, template, training)",
                        assignment: "Deliver that value bomb to your community. Watch the goodwill multiply.",
                        btssImpact: "movement",
                        appConnection: null
                    },
                    {
                        day: 59,
                        title: "Events & Experiences: Bringing People Together",
                        content: "Virtual or in-person, events create deep connection. How to host transformational experiences.",
                        activity: "Event Planning: Design 1 event for your community (webinar, workshop, meetup, retreat)",
                        assignment: "Schedule and promote your event. Aim for 20+ attendees.",
                        btssImpact: "movement",
                        appConnection: null
                    },
                    {
                        day: 60,
                        title: "Empowering Others: Creating Leaders Within",
                        content: "The best communities don't depend on the leader. They create new leaders. How to empower your tribe.",
                        activity: "Identify 3 rising leaders in your community. How can you elevate them?",
                        assignment: "Give someone in your community a leadership role or spotlight. Empower them publicly.",
                        btssImpact: "movement",
                        appConnection: {
                            app: "Z2B TLI",
                            how: "Z2B's Team Leadership Incentive (TLI) rewards you for developing leaders. Empower others, earn more. Win-win!"
                        }
                    }
                ],
                weekend: {
                    reflection: "How engaged is your community? Are you creating leaders or just followers?",
                    application: "Host 1 community event this week. Create connection and value.",
                    btssCheck: "Momentum Movement rising? Your influence should be undeniable by now."
                }
            },
            {
                week: 13,
                theme: "Movement Creation: From Business to Mission",
                focus: "Creating lasting movements, legacy leadership, and transforming industries",
                lessons: [
                    {
                        day: 61,
                        title: "Businesses Serve. Movements Transform.",
                        content: "Apple didn't sell computers - they sold 'Think Different.' You're not just selling - you're leading change.",
                        activity: "Movement Manifesto: What change are you leading? What do you stand for/against?",
                        assignment: "Write a 1-page manifesto for your movement. Make it bold and inspiring.",
                        btssImpact: "movement",
                        appConnection: null
                    },
                    {
                        day: 62,
                        title: "Influence Amplification: Partnering for Reach",
                        content: "Collaborate with other leaders. Joint ventures, partnerships, affiliations. 1+1=11 in influence.",
                        activity: "Partnership Map: List 10 influencers/leaders you could partner with",
                        assignment: "Reach out to 3 potential partners this week. Propose collaboration.",
                        btssImpact: "movement",
                        appConnection: {
                            app: "Z2B Network",
                            how: "Z2B is built on network effect. Partner with other builders. Co-promote. Co-create. Grow together exponentially."
                        }
                    },
                    {
                        day: 63,
                        title: "Media & PR: Getting Your Message to Millions",
                        content: "Earned media > paid ads. How to get featured in press, podcasts, and platforms.",
                        activity: "Media List: List 10 podcasts, blogs, or media outlets your audience follows",
                        assignment: "Pitch yourself to 5 of them. Share your story and value.",
                        btssImpact: "movement",
                        appConnection: null
                    },
                    {
                        day: 64,
                        title: "Viral Moments: Creating Shareable Impact",
                        content: "1 viral moment can change everything. How to create content that spreads like wildfire.",
                        activity: "Viral Ideation: Brainstorm 10 bold, controversial, or surprising ideas you could share",
                        assignment: "Execute 1 viral idea this week. Go bigger than comfortable.",
                        btssImpact: "movement",
                        appConnection: {
                            app: "BENOWN",
                            how: "BENOWN analyzes viral trends and helps you create shareable content. Tap into what's working. Ride the wave."
                        }
                    },
                    {
                        day: 65,
                        title: "The Legacy Leader: Who You've Become",
                        content: "You are no longer an employee. You're a Legacy Builder leading a movement. Celebrate the transformation.",
                        activity: "Transformation Story: Write your before/after. Who were you 65 days ago? Who are you now?",
                        assignment: "Share your 90-day journey publicly. Inspire others. Start their transformation.",
                        btssImpact: "movement",
                        appConnection: {
                            app: "ZYRO",
                            how: "Share your 90-day transformation on ZYRO. Win 'Transformation Champion' badge. Inspire the community!"
                        }
                    }
                ],
                weekend: {
                    reflection: "PHASE 4 COMPLETE! What movement are you leading? How many lives have you impacted?",
                    application: "Host a 'Movement Kickoff' event. Rally your community around your mission.",
                    btssCheck: "Momentum Movement should be at peak performance. You're now a movement leader!"
                }
            }
        ]
    },

    // WEEKS 14-15: Integration, Reflection & Mastery (Final 14 Days)
    finalPhase_integration: {
        title: "🏆 MASTERY & INTEGRATION: Cementing Your Transformation",
        objective: "Integrate all 4 Legs, solidify habits, create your personalized growth plan, and graduate as a certified Legacy Builder",
        weeks: [
            {
                week: 14,
                theme: "4 Legs Integration: Balancing Your Table",
                focus: "Ensuring all 4 Legs are strong and working together harmoniously",
                lessons: [
                    {
                        day: 66,
                        title: "The Billionaire Table Assessment",
                        content: "All 4 Legs working together. Your table's stability determines your wealth ceiling.",
                        activity: "Take comprehensive BTSS assessment. Measure all 4 Legs. Find your weakest.",
                        assignment: "Create 30-day intensive plan to strengthen weakest leg",
                        btssImpact: "all",
                        appConnection: null
                    },
                    {
                        day: 67,
                        title: "Habit Stacking: Cementing Daily Rituals",
                        content: "Success is the result of daily habits. Create rituals that keep all 4 Legs strong.",
                        activity: "Design your 'Legacy Builder Daily Routine': Morning, afternoon, evening rituals",
                        assignment: "Execute your routine for 7 days straight. Track completion.",
                        btssImpact: "all",
                        appConnection: null
                    },
                    {
                        day: 68,
                        title: "Your Personalized Growth Blueprint",
                        content: "Based on your BTSS, create a custom 1-year plan to reach billionaire-level mastery.",
                        activity: "1-Year Blueprint: Quarter-by-quarter goals for each of the 4 Legs",
                        assignment: "Break Q1 into monthly milestones. Get hyper-specific.",
                        btssImpact: "all",
                        appConnection: null
                    },
                    {
                        day: 69,
                        title: "Accountability Systems: Staying on Track",
                        content: "Create structures that keep you accountable when motivation fades.",
                        activity: "Accountability Setup: Coach, mastermind, tracking system, public commitment",
                        assignment: "Lock in 1 accountability structure starting next week",
                        btssImpact: "all",
                        appConnection: {
                            app: "ZYRO",
                            how: "Use ZYRO's streak system and leaderboards for daily accountability. Compete with other builders. Stay consistent."
                        }
                    },
                    {
                        day: 70,
                        title: "The Power of Review: Weekly & Monthly Rituals",
                        content: "What gets measured gets managed. Weekly reviews keep you aligned and improving.",
                        activity: "Create Weekly Review Template: Wins, lessons, next week's focus, BTSS check",
                        assignment: "Schedule recurring weekly review every Sunday. Non-negotiable.",
                        btssImpact: "all",
                        appConnection: null
                    }
                ],
                weekend: {
                    reflection: "Are all 4 Legs now strong? Is your table balanced?",
                    application: "Do a complete 90-day review. How far have you come?",
                    btssCheck: "Final BTSS assessment. All 4 Legs should show dramatic improvement from Day 1!"
                }
            },
            {
                week: 15,
                theme: "Graduation & Next Level: The Journey Continues",
                focus: "Celebrating transformation, receiving certification, and planning the next evolution",
                lessons: [
                    {
                        day: 71,
                        title: "Celebrating Your Transformation",
                        content: "You did it. 90 days of showing up, learning, and becoming. Acknowledge your growth.",
                        activity: "Transformation Inventory: List 50 ways you've changed in 90 days (mindset, money, systems, influence)",
                        assignment: "Celebrate BIG. Reward yourself. You've earned it.",
                        btssImpact: "all",
                        appConnection: null
                    },
                    {
                        day: 72,
                        title: "Teaching What You've Learned",
                        content: "The best way to cement learning is to teach it. You're now qualified to guide others.",
                        activity: "Create 1 training: Teach the biggest lesson from your 90-day journey",
                        assignment: "Deliver that training to at least 5 people. Help them start their journey.",
                        btssImpact: "all",
                        appConnection: {
                            app: "BENOWN + GLOWIE",
                            how: "Use BENOWN to create course content. Use GLOWIE to build a simple training platform. Package your knowledge!"
                        }
                    },
                    {
                        day: 73,
                        title: "Legacy Builder Certification",
                        content: "You've completed the program. You're now a certified Legacy Builder. Wear the badge with pride.",
                        activity: "Final BTSS Assessment: Official certification score. Must be 70%+ on all 4 Legs to certify.",
                        assignment: "Claim your Legacy Builder Certificate. Share it publicly. Inspire others to start.",
                        btssImpact: "all",
                        appConnection: {
                            app: "Z2B Achievements",
                            how: "Unlock 'Legacy Builder Graduate' achievement on your Z2B profile. Display it proudly!"
                        }
                    },
                    {
                        day: 74,
                        title: "Your Next 90 Days: Leveling Up",
                        content: "This isn't the end. It's the beginning. Now you build on this foundation.",
                        activity: "Next 90-Day Vision: What's the next level? 10x your current results.",
                        assignment: "Create your Next 90-Day Plan. Start Day 1 tomorrow.",
                        btssImpact: "all",
                        appConnection: null
                    },
                    {
                        day: 75,
                        title: "Paying It Forward: Building Other Builders",
                        content: "Now you become the coach. Help others transform. Your legacy multiplies through others.",
                        activity: "Invite 5 people to start their 90-day journey with Coach Manlaw",
                        assignment: "Mentor 1 person through their transformation. Be their Coach Manlaw.",
                        btssImpact: "all",
                        appConnection: {
                            app: "Z2B TLI",
                            how: "As you build and develop other Legacy Builders, you earn Team Leadership Incentives. Your impact becomes your income!"
                        }
                    }
                ],
                weekend: {
                    reflection: "PROGRAM COMPLETE! 🎉 You're a certified Legacy Builder. Who have you become?",
                    application: "Host a graduation celebration. Invite your community. Share your story. Inspire action.",
                    btssCheck: "Final overall BTSS score. Target: 75%+ (mastery level). You've built a billion-dollar table!"
                }
            }
        ]
    },

    // BTSS Tracking & Progress System
    btssTracking: {
        assessmentFrequency: "Weekly (every 7 days) + Major milestones",
        scoringSystem: {
            mindset: {
                beginner: "0-40% - Employee mindset still dominant",
                intermediate: "41-70% - Shifting to entrepreneur thinking",
                advanced: "71-85% - Strong billionaire mindset",
                mastery: "86-100% - Unshakeable Legacy Builder identity"
            },
            money: {
                beginner: "0-40% - Trading time for money, single income stream",
                intermediate: "41-70% - Building multiple streams, learning financial intelligence",
                advanced: "71-85% - Passive income flowing, wealth multiplication active",
                mastery: "86-100% - Money systems working automatically, wealth mastery"
            },
            legacy: {
                beginner: "0-40% - Doing everything yourself, no systems",
                intermediate: "41-70% - Some processes documented, beginning delegation",
                advanced: "71-85% - Automated systems running, team in place",
                mastery: "86-100% - Business runs without you, scalable machine built"
            },
            movement: {
                beginner: "0-40% - Unknown, no audience, no influence",
                intermediate: "41-70% - Growing audience, building brand, some influence",
                advanced: "71-85% - Strong community, recognized authority, movement forming",
                mastery: "86-100% - Leading powerful movement, massive influence, legacy impact"
            }
        },
        progressMilestones: [
            { day: 1, milestone: "Baseline BTSS - Know where you start" },
            { day: 20, milestone: "Phase 1 Check - Mindset shifting?" },
            { day: 35, milestone: "Phase 2 Check - Money flowing?" },
            { day: 50, milestone: "Phase 3 Check - Systems building?" },
            { day: 65, milestone: "Phase 4 Check - Influence growing?" },
            { day: 75, milestone: "Final Assessment - Certification score" }
        ],
        weeklyReflections: [
            "What was your biggest win this week?",
            "What was your biggest challenge?",
            "What did you learn about yourself?",
            "Which leg improved most?",
            "Which leg needs more focus next week?",
            "What action will you take tomorrow to move forward?"
        ]
    },

    // App Integration Throughout Program
    appIntegrationMap: {
        ZYRO: {
            usage: "Gamification, challenges, community engagement, sharing wins, accountability",
            recommendedDays: [5, 8, 13, 20, 35, 50, 57, 65, 69, 75]
        },
        ZYRA: {
            usage: "Automated sales, lead qualification, income generation, objection handling practice",
            recommendedDays: [28, 29, 33, 39, 44]
        },
        BENOWN: {
            usage: "Content creation, marketing, brand building, viral content, storytelling",
            recommendedDays: [9, 26, 27, 52, 53, 55, 64, 72]
        },
        GLOWIE: {
            usage: "Building apps, landing pages, process tools, training platforms, systems",
            recommendedDays: [30, 37, 40, 44, 72]
        },
        Marketplace: {
            usage: "Selling digital products, passive income, course creation, monetization",
            recommendedDays: [31, 33, 72]
        },
        "Z2B Dashboard": {
            usage: "Tracking income streams, team growth, earnings, overall progress",
            recommendedDays: "Daily review recommended"
        }
    },

    // Coaching Prompts for Coach Manlaw AI
    coachingPrompts: {
        dailyGreeting: "Good morning, Legacy Builder! Today is Day {day} of your transformation. Ready to strengthen {focusLeg}?",
        progressCheck: "How are you progressing on {currentLesson}? Have you completed today's activity?",
        encouragement: "You're {percentComplete}% through the program. Your {strongestLeg} is crushing it at {score}%!",
        challenge: "Your weakest leg is {weakestLeg} at {score}%. Let's turn that weakness into your superpower. Here's what to focus on...",
        milestone: "Congratulations! You've reached Day {day}. {milestone}. How do you feel about your progress?",
        btssReminder: "It's time for your weekly BTSS assessment. Let's measure your growth and adjust strategy.",
        appSuggestion: "Based on your progress, I recommend using {app} to {benefit}. Want to try it?",
        reflection: "Let's reflect: {reflectionQuestion}",
        celebration: "🎉 Amazing! You completed {achievement}. That's what Legacy Builders do!",
        accountability: "You committed to {task}. Did you complete it? Remember, your table is only as strong as your word."
    }
};

// Export for use in Coach Manlaw
if (typeof window !== 'undefined') {
    window.MANLAW_CURRICULUM = MANLAW_CURRICULUM;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MANLAW_CURRICULUM;
}
