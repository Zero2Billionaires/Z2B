import VideoTemplate from '../models/VideoTemplate.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const templateSeeds = [
    // MARKETING TEMPLATES
    {
        name: 'Product Launch Announcement',
        description: 'Perfect for announcing new products or services with excitement and energy',
        category: 'marketing',
        videoType: 'marketing',
        defaults: {
            voiceId: 'en-US-AriaNeural',
            voiceGender: 'female',
            voiceStyle: 'cheerful',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Hi! I'm thrilled to announce something incredible: {{productName}}!

{{productDescription}}

What makes {{productName}} special? {{uniqueValue}}

{{callToAction}}

Don't miss out on this opportunity! {{closingMessage}}
        `.trim(),
        placeholders: [
            {
                key: 'productName',
                label: 'Product Name',
                description: 'The name of your product or service',
                required: true,
                maxLength: 100,
                placeholder: 'e.g., SuperApp Pro',
                defaultValue: 'Our New Product'
            },
            {
                key: 'productDescription',
                label: 'Product Description',
                description: 'Brief description of what your product does',
                required: true,
                maxLength: 500,
                placeholder: 'e.g., The ultimate productivity tool for teams',
                defaultValue: 'An amazing product that solves your problems'
            },
            {
                key: 'uniqueValue',
                label: 'Unique Value',
                description: 'What makes your product special',
                required: true,
                maxLength: 300,
                placeholder: 'e.g., It saves you 10 hours per week',
                defaultValue: 'It delivers exceptional results'
            },
            {
                key: 'callToAction',
                label: 'Call to Action',
                description: 'What you want viewers to do',
                required: true,
                maxLength: 200,
                placeholder: 'e.g., Visit our website to learn more',
                defaultValue: 'Get started today'
            },
            {
                key: 'closingMessage',
                label: 'Closing Message',
                description: 'Final motivational message',
                required: false,
                maxLength: 150,
                placeholder: 'e.g., Join thousands of satisfied customers',
                defaultValue: 'We can\'t wait to see you succeed!'
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketing',
            sampleScript: 'Hi! I\'m thrilled to announce something incredible: SuperApp Pro! The ultimate productivity tool...'
        },
        tags: ['product-launch', 'announcement', 'marketing', 'promotion'],
        featured: true,
        order: 1,
        isActive: true
    },

    {
        name: 'Social Media Promotion',
        description: 'Quick, energetic videos perfect for Instagram, TikTok, or Facebook',
        category: 'social-media',
        videoType: 'marketing',
        defaults: {
            voiceId: 'en-US-JaneNeural',
            voiceGender: 'female',
            voiceStyle: 'energetic',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Hey everyone! Quick announcement: {{announcement}}

Why should you care? {{reason}}

{{engagement}}

Drop a comment and let me know what you think! {{hashtags}}
        `.trim(),
        placeholders: [
            {
                key: 'announcement',
                label: 'Announcement',
                description: 'Your main message',
                required: true,
                maxLength: 300,
                placeholder: 'e.g., We just hit 10,000 followers!'
            },
            {
                key: 'reason',
                label: 'Why It Matters',
                description: 'Why your audience should care',
                required: true,
                maxLength: 300,
                placeholder: 'e.g., This means exclusive content for you!'
            },
            {
                key: 'engagement',
                label: 'Engagement Ask',
                description: 'What you want viewers to do',
                required: true,
                maxLength: 200,
                placeholder: 'e.g., Follow for daily tips'
            },
            {
                key: 'hashtags',
                label: 'Hashtags',
                description: 'Relevant hashtags (optional)',
                required: false,
                maxLength: 100,
                placeholder: 'e.g., #Entrepreneur #Success',
                defaultValue: ''
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Social'
        },
        tags: ['social-media', 'short-form', 'instagram', 'tiktok', 'engagement'],
        featured: true,
        order: 2,
        isActive: true
    },

    // TUTORIAL TEMPLATES
    {
        name: 'How-To Tutorial',
        description: 'Step-by-step instructional video template',
        category: 'tutorial',
        videoType: 'tutorial',
        defaults: {
            voiceId: 'en-US-JennyNeural',
            voiceGender: 'female',
            voiceStyle: 'friendly',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Hi! Today I'm going to show you how to {{taskName}}.

This is perfect for {{audience}}.

Here's what we'll cover:

Step 1: {{step1}}

Step 2: {{step2}}

Step 3: {{step3}}

{{additionalSteps}}

{{conclusion}}

Thanks for watching! If you found this helpful, {{callToAction}}
        `.trim(),
        placeholders: [
            {
                key: 'taskName',
                label: 'Task Name',
                description: 'What are you teaching?',
                required: true,
                maxLength: 150,
                placeholder: 'e.g., create a professional website in 10 minutes'
            },
            {
                key: 'audience',
                label: 'Target Audience',
                description: 'Who is this for?',
                required: true,
                maxLength: 200,
                placeholder: 'e.g., beginners with no coding experience'
            },
            {
                key: 'step1',
                label: 'Step 1',
                required: true,
                maxLength: 500,
                placeholder: 'First step description'
            },
            {
                key: 'step2',
                label: 'Step 2',
                required: true,
                maxLength: 500,
                placeholder: 'Second step description'
            },
            {
                key: 'step3',
                label: 'Step 3',
                required: true,
                maxLength: 500,
                placeholder: 'Third step description'
            },
            {
                key: 'additionalSteps',
                label: 'Additional Steps',
                description: 'Any additional steps (optional)',
                required: false,
                maxLength: 1000,
                placeholder: 'Step 4, Step 5, etc.',
                defaultValue: ''
            },
            {
                key: 'conclusion',
                label: 'Conclusion',
                description: 'Wrap-up message',
                required: false,
                maxLength: 300,
                placeholder: 'Summary or key takeaway',
                defaultValue: 'And that\'s it! You now know how to complete this task.'
            },
            {
                key: 'callToAction',
                label: 'Call to Action',
                required: false,
                maxLength: 150,
                placeholder: 'e.g., subscribe for more tutorials',
                defaultValue: 'let me know in the comments!'
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tutorial'
        },
        tags: ['tutorial', 'how-to', 'educational', 'step-by-step'],
        featured: true,
        order: 3,
        isActive: true
    },

    // TESTIMONIAL TEMPLATES
    {
        name: 'Customer Testimonial',
        description: 'Share authentic customer success stories',
        category: 'testimonial',
        videoType: 'testimonial',
        defaults: {
            voiceId: 'en-US-GuyNeural',
            voiceGender: 'male',
            voiceStyle: 'professional',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Hi, I'm {{customerName}} and I want to share my experience with {{productName}}.

Before using {{productName}}, {{problemBefore}}

After implementing {{productName}}, {{resultAfter}}

The results? {{specificResults}}

{{recommendation}}

If you're considering {{productName}}, {{finalThought}}
        `.trim(),
        placeholders: [
            {
                key: 'customerName',
                label: 'Customer Name',
                required: true,
                maxLength: 100,
                placeholder: 'e.g., John Smith'
            },
            {
                key: 'productName',
                label: 'Product/Service Name',
                required: true,
                maxLength: 100,
                placeholder: 'e.g., WebBuilder Pro'
            },
            {
                key: 'problemBefore',
                label: 'Problem Before',
                description: 'What challenge did they face?',
                required: true,
                maxLength: 500,
                placeholder: 'e.g., I struggled to create websites that looked professional'
            },
            {
                key: 'resultAfter',
                label: 'Result After',
                description: 'What changed after using the product?',
                required: true,
                maxLength: 500,
                placeholder: 'e.g., I was able to launch a beautiful site in just one day'
            },
            {
                key: 'specificResults',
                label: 'Specific Results',
                description: 'Measurable outcomes',
                required: true,
                maxLength: 400,
                placeholder: 'e.g., My conversion rate increased by 45%'
            },
            {
                key: 'recommendation',
                label: 'Recommendation',
                required: true,
                maxLength: 300,
                placeholder: 'e.g., I highly recommend this to any entrepreneur'
            },
            {
                key: 'finalThought',
                label: 'Final Thought',
                required: false,
                maxLength: 200,
                placeholder: 'Closing advice or encouragement',
                defaultValue: 'I wholeheartedly recommend giving it a try.'
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Testimonial'
        },
        tags: ['testimonial', 'review', 'customer-story', 'social-proof'],
        featured: true,
        order: 4,
        isActive: true
    },

    // PRESENTATION TEMPLATES
    {
        name: 'Business Pitch',
        description: 'Professional pitch for investors or clients',
        category: 'presentation',
        videoType: 'presentation',
        defaults: {
            voiceId: 'en-GB-SoniaNeural',
            voiceGender: 'female',
            voiceStyle: 'professional',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Good day. I'm here to present {{companyName}}.

{{problemStatement}}

Our solution: {{solution}}

Why us? {{competitiveAdvantage}}

Market opportunity: {{marketSize}}

{{traction}}

{{ask}}

Together, we can {{vision}}. Thank you.
        `.trim(),
        placeholders: [
            {
                key: 'companyName',
                label: 'Company Name',
                required: true,
                maxLength: 100,
                placeholder: 'e.g., TechVision Inc.'
            },
            {
                key: 'problemStatement',
                label: 'Problem Statement',
                description: 'What problem are you solving?',
                required: true,
                maxLength: 500,
                placeholder: 'e.g., Small businesses waste $50B annually on inefficient processes'
            },
            {
                key: 'solution',
                label: 'Your Solution',
                required: true,
                maxLength: 500,
                placeholder: 'e.g., An AI-powered platform that automates workflows'
            },
            {
                key: 'competitiveAdvantage',
                label: 'Competitive Advantage',
                description: 'What makes you different?',
                required: true,
                maxLength: 400,
                placeholder: 'e.g., We\'re 10x faster than competitors at 1/3 the cost'
            },
            {
                key: 'marketSize',
                label: 'Market Opportunity',
                required: true,
                maxLength: 300,
                placeholder: 'e.g., $500M TAM growing at 30% annually'
            },
            {
                key: 'traction',
                label: 'Traction',
                description: 'Current progress (optional)',
                required: false,
                maxLength: 300,
                placeholder: 'e.g., 1,000 customers, $2M ARR',
                defaultValue: ''
            },
            {
                key: 'ask',
                label: 'The Ask',
                description: 'What are you requesting?',
                required: true,
                maxLength: 200,
                placeholder: 'e.g., We\'re raising $2M to expand our team'
            },
            {
                key: 'vision',
                label: 'Vision',
                description: 'Future impact',
                required: true,
                maxLength: 200,
                placeholder: 'e.g., revolutionize how businesses operate'
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Business'
        },
        tags: ['pitch', 'business', 'presentation', 'investor'],
        featured: true,
        order: 5,
        isActive: true
    },

    // COACHING TEMPLATES
    {
        name: 'Motivational Message',
        description: 'Inspire and motivate your audience',
        category: 'coaching',
        videoType: 'coaching',
        defaults: {
            voiceId: 'en-US-GuyNeural',
            voiceGender: 'male',
            voiceStyle: 'enthusiastic',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Hey there, {{audienceName}}!

Today I want to talk about {{topic}}.

{{mainMessage}}

Remember: {{keyPrinciple}}

Here's what I want you to do: {{actionItem}}

{{encouragement}}

You've got this! Now go out there and {{finalChallenge}}!
        `.trim(),
        placeholders: [
            {
                key: 'audienceName',
                label: 'Audience Name',
                required: false,
                maxLength: 50,
                placeholder: 'e.g., Champions',
                defaultValue: 'friends'
            },
            {
                key: 'topic',
                label: 'Topic',
                required: true,
                maxLength: 150,
                placeholder: 'e.g., overcoming fear of failure'
            },
            {
                key: 'mainMessage',
                label: 'Main Message',
                description: 'Your core teaching',
                required: true,
                maxLength: 1000,
                placeholder: 'The main point you want to convey'
            },
            {
                key: 'keyPrinciple',
                label: 'Key Principle',
                description: 'A memorable principle or quote',
                required: true,
                maxLength: 300,
                placeholder: 'e.g., Success is not final, failure is not fatal'
            },
            {
                key: 'actionItem',
                label: 'Action Item',
                description: 'Specific action to take',
                required: true,
                maxLength: 400,
                placeholder: 'e.g., Write down one fear and one action to face it'
            },
            {
                key: 'encouragement',
                label: 'Encouragement',
                description: 'Motivational closing',
                required: false,
                maxLength: 400,
                placeholder: 'Inspiring words to end with',
                defaultValue: 'I believe in you and your potential!'
            },
            {
                key: 'finalChallenge',
                label: 'Final Challenge',
                required: true,
                maxLength: 150,
                placeholder: 'e.g., make today count'
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coach'
        },
        tags: ['coaching', 'motivation', 'inspiration', 'personal-development'],
        featured: true,
        order: 6,
        isActive: true
    },

    // PRODUCT DEMO TEMPLATES
    {
        name: 'Software Demo',
        description: 'Showcase your software features and benefits',
        category: 'product-demo',
        videoType: 'presentation',
        defaults: {
            voiceId: 'en-US-JennyNeural',
            voiceGender: 'female',
            voiceStyle: 'friendly',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Welcome! Let me show you {{softwareName}}.

{{softwareName}} is designed to {{mainPurpose}}.

Key features:

Feature 1: {{feature1}}

Feature 2: {{feature2}}

Feature 3: {{feature3}}

{{benefitsSummary}}

Ready to try it? {{gettingStarted}}

{{closingOffer}}
        `.trim(),
        placeholders: [
            {
                key: 'softwareName',
                label: 'Software Name',
                required: true,
                maxLength: 100,
                placeholder: 'e.g., DataFlow Pro'
            },
            {
                key: 'mainPurpose',
                label: 'Main Purpose',
                required: true,
                maxLength: 300,
                placeholder: 'e.g., streamline your data analysis workflow'
            },
            {
                key: 'feature1',
                label: 'Feature 1',
                required: true,
                maxLength: 400,
                placeholder: 'First key feature and benefit'
            },
            {
                key: 'feature2',
                label: 'Feature 2',
                required: true,
                maxLength: 400,
                placeholder: 'Second key feature and benefit'
            },
            {
                key: 'feature3',
                label: 'Feature 3',
                required: true,
                maxLength: 400,
                placeholder: 'Third key feature and benefit'
            },
            {
                key: 'benefitsSummary',
                label: 'Benefits Summary',
                description: 'Overall benefits recap',
                required: true,
                maxLength: 400,
                placeholder: 'e.g., Save 10 hours per week and increase accuracy by 50%'
            },
            {
                key: 'gettingStarted',
                label: 'Getting Started',
                description: 'How to begin using it',
                required: true,
                maxLength: 300,
                placeholder: 'e.g., Sign up for a free trial at our website'
            },
            {
                key: 'closingOffer',
                label: 'Closing Offer',
                description: 'Special offer or final CTA',
                required: false,
                maxLength: 200,
                placeholder: 'e.g., Use code DEMO50 for 50% off',
                defaultValue: 'Get started today!'
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
        },
        tags: ['product-demo', 'software', 'features', 'walkthrough'],
        featured: false,
        order: 7,
        isActive: true
    },

    // EDUCATIONAL TEMPLATES
    {
        name: 'Explainer Video',
        description: 'Explain complex concepts in simple terms',
        category: 'educational',
        videoType: 'tutorial',
        defaults: {
            voiceId: 'en-US-JennyNeural',
            voiceGender: 'female',
            voiceStyle: 'friendly',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Hi! Ever wondered about {{topic}}? Let me explain.

In simple terms: {{simpleExplanation}}

Why does this matter? {{importance}}

Here's how it works: {{mechanism}}

{{realWorldExample}}

{{keyTakeaway}}

Now you understand {{topic}}! {{nextSteps}}
        `.trim(),
        placeholders: [
            {
                key: 'topic',
                label: 'Topic',
                required: true,
                maxLength: 150,
                placeholder: 'e.g., blockchain technology'
            },
            {
                key: 'simpleExplanation',
                label: 'Simple Explanation',
                description: 'Explain like I\'m 5',
                required: true,
                maxLength: 500,
                placeholder: 'Basic definition in simple language'
            },
            {
                key: 'importance',
                label: 'Why It Matters',
                required: true,
                maxLength: 400,
                placeholder: 'Why should people care about this?'
            },
            {
                key: 'mechanism',
                label: 'How It Works',
                description: 'Technical explanation',
                required: true,
                maxLength: 800,
                placeholder: 'Deeper dive into the mechanics'
            },
            {
                key: 'realWorldExample',
                label: 'Real-World Example',
                description: 'Practical application',
                required: false,
                maxLength: 500,
                placeholder: 'e.g., This is used in...',
                defaultValue: ''
            },
            {
                key: 'keyTakeaway',
                label: 'Key Takeaway',
                description: 'Most important point',
                required: true,
                maxLength: 300,
                placeholder: 'The one thing to remember'
            },
            {
                key: 'nextSteps',
                label: 'Next Steps',
                description: 'What to do with this knowledge',
                required: false,
                maxLength: 200,
                placeholder: 'e.g., Try it yourself or learn more about...',
                defaultValue: 'Feel free to explore further!'
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Explain'
        },
        tags: ['educational', 'explainer', 'learning', 'concepts'],
        featured: false,
        order: 8,
        isActive: true
    },

    // SIMPLE GREETING
    {
        name: 'Quick Greeting',
        description: 'Simple hello message for any occasion',
        category: 'other',
        videoType: 'other',
        defaults: {
            voiceId: 'en-US-JennyNeural',
            voiceGender: 'female',
            voiceStyle: 'friendly',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Hi {{recipientName}}!

{{message}}

{{closing}}
        `.trim(),
        placeholders: [
            {
                key: 'recipientName',
                label: 'Recipient Name',
                required: false,
                maxLength: 100,
                placeholder: 'e.g., Sarah',
                defaultValue: 'there'
            },
            {
                key: 'message',
                label: 'Your Message',
                required: true,
                maxLength: 1000,
                placeholder: 'What do you want to say?'
            },
            {
                key: 'closing',
                label: 'Closing',
                required: false,
                maxLength: 200,
                placeholder: 'e.g., Have a great day!',
                defaultValue: 'Take care!'
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Greeting'
        },
        tags: ['greeting', 'simple', 'hello', 'message'],
        featured: false,
        order: 10,
        isActive: true
    },

    // ANNOUNCEMENT TEMPLATE
    {
        name: 'Company Announcement',
        description: 'Professional company updates and news',
        category: 'presentation',
        videoType: 'presentation',
        defaults: {
            voiceId: 'en-GB-SoniaNeural',
            voiceGender: 'female',
            voiceStyle: 'professional',
            resolution: 'HD',
            background: '#1a1a2e'
        },
        scriptTemplate: `
Hello everyone. I have an important announcement regarding {{announcementTopic}}.

{{announcementDetails}}

What this means: {{impact}}

{{nextSteps}}

{{timeline}}

Thank you for your attention. {{additionalInfo}}
        `.trim(),
        placeholders: [
            {
                key: 'announcementTopic',
                label: 'Announcement Topic',
                required: true,
                maxLength: 150,
                placeholder: 'e.g., our new office location'
            },
            {
                key: 'announcementDetails',
                label: 'Details',
                description: 'Full announcement details',
                required: true,
                maxLength: 1000,
                placeholder: 'The main content of your announcement'
            },
            {
                key: 'impact',
                label: 'Impact',
                description: 'How this affects stakeholders',
                required: true,
                maxLength: 500,
                placeholder: 'What this means for the team/company'
            },
            {
                key: 'nextSteps',
                label: 'Next Steps',
                required: true,
                maxLength: 400,
                placeholder: 'What happens next?'
            },
            {
                key: 'timeline',
                label: 'Timeline',
                description: 'When things will happen',
                required: false,
                maxLength: 300,
                placeholder: 'e.g., Changes take effect on...',
                defaultValue: ''
            },
            {
                key: 'additionalInfo',
                label: 'Additional Information',
                description: 'Contact info or resources',
                required: false,
                maxLength: 200,
                placeholder: 'e.g., Contact HR for questions',
                defaultValue: 'Please reach out if you have any questions.'
            }
        ],
        example: {
            sourceImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Announce'
        },
        tags: ['announcement', 'company', 'corporate', 'professional'],
        featured: false,
        order: 9,
        isActive: true
    }
];

// Seed function
async function seedVideoTemplates() {
    try {
        console.log('🌱 Seeding video templates...');

        // Clear existing templates (optional - comment out to preserve existing)
        // await VideoTemplate.deleteMany({});
        // console.log('  ✅ Cleared existing templates');

        // Insert new templates
        for (const templateData of templateSeeds) {
            // Check if template already exists
            const existing = await VideoTemplate.findOne({ name: templateData.name });

            if (existing) {
                console.log(`  ⏭️  Skipping "${templateData.name}" (already exists)`);
                continue;
            }

            const template = new VideoTemplate(templateData);
            await template.save();
            console.log(`  ✅ Created template: "${templateData.name}"`);
        }

        console.log(`\n✅ Template seeding complete! Created ${templateSeeds.length} templates.`);

        // Print summary
        const totalTemplates = await VideoTemplate.countDocuments({ isActive: true });
        const featuredCount = await VideoTemplate.countDocuments({ isActive: true, featured: true });

        console.log('\n📊 Template Summary:');
        console.log(`   Total Templates: ${totalTemplates}`);
        console.log(`   Featured: ${featuredCount}`);

        const categories = await VideoTemplate.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('\n📁 Templates by Category:');
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count}`);
        });

    } catch (error) {
        console.error('❌ Error seeding templates:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    dotenv.config();

    mongoose.connect(process.env.MONGODB_URI)
        .then(async () => {
            console.log('📦 Connected to MongoDB');
            await seedVideoTemplates();
            await mongoose.connection.close();
            console.log('👋 Disconnected from MongoDB');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ MongoDB connection error:', err);
            process.exit(1);
        });
}

export { seedVideoTemplates, templateSeeds };
