require('dotenv').config();
const mongoose = require('mongoose');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        const users = await User.find({}).select('firstName lastName email referralCode tier accountStatus createdAt').sort({ createdAt: -1 }).limit(10);

        console.log(`📋 Total users in database: ${await User.countDocuments()}\n`);
        console.log('Recent 10 users:\n');

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Referral Code: ${user.referralCode || '❌ NOT SET'}`);
            console.log(`   Tier: ${user.tier}`);
            console.log(`   Status: ${user.accountStatus}`);
            console.log(`   Created: ${user.createdAt}\n`);
        });

        // Check for the specific code
        const checkCode = 'Z2BVOV05W32';
        const foundUser = await User.findOne({ referralCode: checkCode });
        if (foundUser) {
            console.log(`\n✅ Found user with code ${checkCode}:`, foundUser.firstName, foundUser.lastName);
        } else {
            console.log(`\n❌ No user found with referral code: ${checkCode}`);
        }

        mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listUsers();
