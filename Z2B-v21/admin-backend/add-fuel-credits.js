const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function addFuelCredits() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');

        // Update user with Platinum fuel credits
        const user = await User.findOneAndUpdate(
            { referralCode: 'Z2BGL32LLL1' },
            { $set: { fuelCredits: 5000 } },
            { new: true }
        );

        if (user) {
            console.log('✅ SUCCESS! Updated fuel credits for:', user.firstName, user.lastName);
            console.log('   Tier:', user.tier);
            console.log('   Fuel Credits:', user.fuelCredits);
            console.log('   Email:', user.email);
        } else {
            console.log('❌ User not found with referral code: Z2BGL32LLL1');
        }

        await mongoose.disconnect();
        console.log('Disconnected from database');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addFuelCredits();
