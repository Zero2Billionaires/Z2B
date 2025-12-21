require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkSponsor() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const sponsorCode = 'Z2BVOV05W32';
        const sponsor = await User.findOne({ referralCode: sponsorCode });

        if (sponsor) {
            console.log('\n✅ Sponsor Found!');
            console.log('Name:', sponsor.firstName, sponsor.lastName);
            console.log('Email:', sponsor.email);
            console.log('Referral Code:', sponsor.referralCode);
            console.log('Tier:', sponsor.tier);
            console.log('Account Status:', sponsor.accountStatus);
        } else {
            console.log('\n❌ Sponsor NOT found with code:', sponsorCode);

            // Check all users to see what referral codes exist
            const allUsers = await User.find({}, 'firstName lastName email referralCode tier');
            console.log('\n📋 All registered users:');
            allUsers.forEach(user => {
                console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
                console.log(`  Referral Code: ${user.referralCode || 'NOT SET'}`);
                console.log(`  Tier: ${user.tier}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSponsor();
