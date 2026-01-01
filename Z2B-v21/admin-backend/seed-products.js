const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MarketplaceProduct = require('./models/MarketplaceProduct');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

// Products to seed
const initialProducts = [
    {
        productId: 'coach-manlaw',
        productName: 'Coach Manlaw',
        productSlug: 'coach-manlaw',
        icon: '🎓',
        color: '#9333EA',
        description: 'AI Billionaire Coach - 7 Stage Transformation Framework',
        category: 'AI_APP',
        pricing: { payAsYouGo: 499 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN', 'FREE'],
        defaultAccessType: 'PAID',
        sortOrder: 1,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'glowie',
        productName: 'GLOWIE',
        productSlug: 'glowie',
        icon: '✨',
        color: '#EC4899',
        description: 'AI App Builder - No-code app creation',
        category: 'AI_APP',
        pricing: { payAsYouGo: 799 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 2,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'benown',
        productName: 'BENOWN',
        productSlug: 'benown',
        icon: '📊',
        color: '#F59E0B',
        description: 'AI Content Creator - Business content generation',
        category: 'AI_APP',
        pricing: { payAsYouGo: 599 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 3,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'zyra',
        productName: 'ZYRA',
        productSlug: 'zyra',
        icon: '💼',
        color: '#10B981',
        description: 'AI Sales Agent - Automated sales conversations',
        category: 'AI_APP',
        pricing: { monthly: 699 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 4,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'zynth',
        productName: 'ZYNTH',
        productSlug: 'zynth',
        icon: '🎵',
        color: '#8B5CF6',
        description: 'AI Voice Cloning - Professional voice synthesis',
        category: 'AI_APP',
        pricing: { payAsYouGo: 699 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 5,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'vidzie',
        productName: 'VIDZIE',
        productSlug: 'vidzie',
        icon: '🎬',
        color: '#EF4444',
        description: 'AI Video Creator - Professional video production',
        category: 'AI_APP',
        pricing: { payAsYouGo: 899 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 6,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'captionpro',
        productName: 'CaptionPro',
        productSlug: 'captionpro',
        icon: '💬',
        color: '#3B82F6',
        description: 'AI Video Captions & Auto-Cut - Professional video editing',
        category: 'TOOL',
        pricing: { payAsYouGo: 299 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 7,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'zyro',
        productName: 'ZYRO',
        productSlug: 'zyro',
        icon: '🎯',
        color: '#06B6D4',
        description: 'Gamification Hub - Engagement and motivation tools',
        category: 'AI_APP',
        pricing: { payAsYouGo: 399 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 8,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'zynect',
        productName: 'ZYNECT',
        productSlug: 'zynect',
        icon: '🔗',
        color: '#14B8A6',
        description: 'Complete CRM - Customer relationship management',
        category: 'AI_APP',
        pricing: { payAsYouGo: 999 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 9,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'mavula',
        productName: 'MAVULA',
        productSlug: 'mavula',
        icon: '🤖',
        color: '#7C3AED',
        description: 'AI Prospecting Automation - Lead generation and outreach',
        category: 'AI_APP',
        pricing: { monthly: 497, lifetime: 2997 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 10,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'mydigitaltwin',
        productName: 'MyDigitalTwin',
        productSlug: 'mydigitaltwin',
        icon: '🎬',
        color: '#9D4EDD',
        description: 'AI Video Cloning - Clone yourself and create AI videos with your face and voice (7 templates: Roast, Hype, Birthday, Comedy, Motivational, Bible, Custom)',
        category: 'AI_APP',
        pricing: { monthly: 299, z2bMember: 254 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN', 'FREE'],
        defaultAccessType: 'PAID',
        sortOrder: 11,
        isActive: true,
        isVisible: true
    },
        productId: 'video-creator-tools',
        productName: 'Video Creator Tools',
        productSlug: 'video-creator-tools',
        icon: '🎥',
        color: '#F97316',
        description: 'Professional video templates and tools suite',
        category: 'TOOL',
        pricing: { payAsYouGo: 399 },
        accessTypes: ['PAID', 'GIFT', 'BETA', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 11,
        isActive: true,
        isVisible: true
    },
    {
        productId: 'zyronic-suite',
        productName: 'Zyronic Suite Enterprise',
        productSlug: 'zyronic-suite',
        icon: '🏢',
        color: '#0EA5E9',
        description: '8 AI Apps with white-label rights - Enterprise package',
        category: 'SUITE',
        pricing: { monthly: 19980 },
        accessTypes: ['PAID', 'GIFT', 'ADMIN'],
        defaultAccessType: 'PAID',
        sortOrder: 12,
        isActive: true,
        isVisible: true
    }
];

// Seed function
async function seedProducts() {
    try {
        console.log('🌱 Starting product seeding...\n');

        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (const productData of initialProducts) {
            const existing = await MarketplaceProduct.findOne({ productId: productData.productId });

            if (existing) {
                // Update existing product
                await MarketplaceProduct.findByIdAndUpdate(existing._id, productData);
                updated++;
                console.log(`✏️  Updated: ${productData.productName}`);
            } else {
                // Create new product
                await MarketplaceProduct.create(productData);
                created++;
                console.log(`✅ Created: ${productData.productName}`);
            }
        }

        console.log(`\n🎉 Product seeding completed!`);
        console.log(`   - Created: ${created}`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - Skipped: ${skipped}`);
        console.log(`   - Total: ${initialProducts.length}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

// Run seeder
seedProducts();
