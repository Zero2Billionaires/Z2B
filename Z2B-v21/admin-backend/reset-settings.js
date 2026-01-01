const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    return resetSettings();
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

async function resetSettings() {
    try {
        // Delete all settings documents
        const result = await mongoose.connection.db.collection('settings').deleteMany({});

        console.log('✅ Settings collection cleared!');
        console.log(`   Deleted ${result.deletedCount} document(s)`);
        console.log('');
        console.log('📋 Next time the admin panel loads, it will create new settings with:');
        console.log('   - Bronze: 2 apps (Coach Manlaw + intro app), 18% ISP, 3 generations');
        console.log('   - Copper: 4 apps (Bronze + 2 more), 22% ISP, 5 generations');
        console.log('   - Silver: 7 apps (Bronze + 5 more), 25% ISP, 7 generations');
        console.log('   - Gold: 11 apps (Bronze + 9 more), 28% ISP, 9 generations + Gold Pool');
        console.log('   - Platinum: All apps, 30% ISP, 10 generations + Platinum Pool');
        console.log('');
        console.log('🎯 You can now open the admin panel and the new settings will be applied!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting settings:', error);
        process.exit(1);
    }
}
