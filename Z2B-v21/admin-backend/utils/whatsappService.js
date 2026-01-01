const axios = require('axios');

/**
 * WhatsApp Notification Service
 * Supports both Twilio (primary) and Ultramsg (fallback/free)
 * Automatic failover between services
 */

// Format phone number to international format
const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 27 (South Africa)
    if (cleaned.startsWith('0')) {
        cleaned = '27' + cleaned.substring(1);
    }

    // If doesn't start with country code, add 27
    if (!cleaned.startsWith('27') && !cleaned.startsWith('+')) {
        cleaned = '27' + cleaned;
    }

    // Remove + if present and return with +
    cleaned = cleaned.replace('+', '');
    return '+' + cleaned;
};

// Send WhatsApp message via Twilio
const sendViaTwilio = async (to, message) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886

        if (!accountSid || !authToken || !fromNumber) {
            console.log('⚠️  Twilio not configured. Skipping Twilio.');
            return { success: false, error: 'Twilio not configured' };
        }

        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const response = await axios.post(url,
            new URLSearchParams({
                From: fromNumber,
                To: `whatsapp:${to}`,
                Body: message
            }),
            {
                auth: {
                    username: accountSid,
                    password: authToken
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('✅ WhatsApp sent via Twilio:', response.data.sid);
        return { success: true, provider: 'Twilio', messageId: response.data.sid };

    } catch (error) {
        console.error('❌ Twilio error:', error.response?.data || error.message);
        return { success: false, error: error.message, provider: 'Twilio' };
    }
};

// Send WhatsApp message via Ultramsg (Free tier: 100 messages/day)
const sendViaUltramsg = async (to, message) => {
    try {
        const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
        const token = process.env.ULTRAMSG_TOKEN;

        if (!instanceId || !token) {
            console.log('⚠️  Ultramsg not configured. Skipping Ultramsg.');
            return { success: false, error: 'Ultramsg not configured' };
        }

        // Remove + from phone number for Ultramsg
        const cleanedPhone = to.replace('+', '');

        const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

        const response = await axios.post(url, {
            token: token,
            to: cleanedPhone,
            body: message
        });

        console.log('✅ WhatsApp sent via Ultramsg:', response.data.id);
        return { success: true, provider: 'Ultramsg', messageId: response.data.id };

    } catch (error) {
        console.error('❌ Ultramsg error:', error.response?.data || error.message);
        return { success: false, error: error.message, provider: 'Ultramsg' };
    }
};

// Main function: Send WhatsApp with automatic fallback
const sendWhatsAppMessage = async (phoneNumber, message) => {
    try {
        // Format phone number
        const formattedPhone = formatPhoneNumber(phoneNumber);

        console.log(`📱 Sending WhatsApp to ${formattedPhone}`);

        // Try Twilio first (primary, professional)
        const twilioResult = await sendViaTwilio(formattedPhone, message);
        if (twilioResult.success) {
            return twilioResult;
        }

        console.log('🔄 Twilio failed, trying Ultramsg fallback...');

        // Fallback to Ultramsg (free tier)
        const ultramsgResult = await sendViaUltramsg(formattedPhone, message);
        if (ultramsgResult.success) {
            return ultramsgResult;
        }

        console.error('❌ All WhatsApp providers failed');
        return {
            success: false,
            error: 'All WhatsApp providers failed',
            twilioError: twilioResult.error,
            ultramsgError: ultramsgResult.error
        };

    } catch (error) {
        console.error('❌ WhatsApp service error:', error);
        return { success: false, error: error.message };
    }
};

// ============================================================================
// MESSAGE TEMPLATES
// ============================================================================

// Registration Welcome Message
const sendRegistrationConfirmation = async (user) => {
    const message = `🎉 *Welcome to Z2B Legacy Builders!*

Hello ${user.firstName}! 👋

Your account has been created successfully!

*Account Details:*
📧 Email: ${user.email}
🎫 Member ID: ${user.referralCode}
💎 Tier: ${user.tier}
🔥 Fuel Credits: ${user.fuelCredits}

*Your Referral Link:*
https://z2blegacybuilders.co.za/tiers.html?ref=${user.referralCode}

Share your link to build your team and earn commissions!

*Next Steps:*
1. Login to your dashboard
2. Complete your profile
3. Explore the 7 income streams
4. Share your referral link

Login here: https://z2blegacybuilders.co.za/login.html

Questions? Reply to this message!

Let's build wealth together! 🚀
_Z2B Legacy Builders_`;

    return await sendWhatsAppMessage(user.phone, message);
};

// Password Reset Notification
const sendPasswordResetNotification = async (user, resetUrl) => {
    const message = `🔒 *Password Reset Request*

Hello ${user.firstName},

We received a request to reset your Z2B password.

*Reset your password here:*
${resetUrl}

⏰ This link expires in 1 hour.

*If you didn't request this:*
Ignore this message. Your password will remain unchanged.

Need help? Visit: https://z2blegacybuilders.co.za

Stay secure! 🛡️
_Z2B Legacy Builders_`;

    return await sendWhatsAppMessage(user.phone, message);
};

// Payment Confirmation
const sendPaymentConfirmation = async (user, paymentDetails) => {
    const message = `✅ *Payment Confirmed!*

Hello ${user.firstName}! 🎉

Your payment has been received and processed.

*Payment Details:*
💰 Amount: R${paymentDetails.amount}
🎫 Tier: ${paymentDetails.tier}
📅 Date: ${new Date().toLocaleDateString('en-ZA')}
🔖 Reference: ${paymentDetails.reference}

*Your account is now ACTIVE!*

✓ Access to all ${paymentDetails.tier} features
✓ ${user.fuelCredits} AI Fuel Credits added
✓ Earning commissions enabled

Login: https://z2blegacybuilders.co.za/dashboard.html

Start building your wealth! 💎
_Z2B Legacy Builders_`;

    return await sendWhatsAppMessage(user.phone, message);
};

// Team Referral Success Alert
const sendReferralAlert = async (sponsor, newMember) => {
    const message = `🎊 *New Team Member Alert!*

Congratulations ${sponsor.firstName}! 🎉

Someone just joined your team using your referral link!

*New Member:*
👤 ${newMember.firstName} ${newMember.lastName}
💎 Tier: ${newMember.tier}
📅 Joined: ${new Date().toLocaleDateString('en-ZA')}

*Your Team Stats:*
👥 Direct Referrals: ${sponsor.directReferrals + 1}
🌳 Total Team: ${sponsor.totalTeamSize + 1}

View your team: https://z2blegacybuilders.co.za/team.html

Keep sharing! 🚀
_Z2B Legacy Builders_`;

    return await sendWhatsAppMessage(sponsor.phone, message);
};

// Low Fuel Credits Warning
const sendLowFuelCreditsAlert = async (user) => {
    const message = `⚠️ *Low Fuel Credits Alert*

Hello ${user.firstName},

Your AI Fuel Credits are running low!

*Current Balance:* ${user.fuelCredits} credits

To continue using our AI tools, refuel your credits now:
https://z2blegacybuilders.co.za/ai-refuel.html

💡 *Tip:* Higher tiers get more monthly credits!

Questions? We're here to help!
_Z2B Legacy Builders_`;

    return await sendWhatsAppMessage(user.phone, message);
};

// Fuel Credits Refilled (FAM Tier Weekly)
const sendFuelCreditsRefilled = async (user, creditsAdded) => {
    const message = `🔥 *Fuel Credits Refilled!*

Hello ${user.firstName}! ⛽

Your weekly fuel credits have been added!

*Credits Added:* +${creditsAdded}
*New Balance:* ${user.fuelCredits} credits

Continue exploring our AI tools!
https://z2blegacybuilders.co.za/dashboard.html

Enjoy! 🚀
_Z2B Legacy Builders_`;

    return await sendWhatsAppMessage(user.phone, message);
};

// Tier Upgrade Confirmation
const sendTierUpgradeConfirmation = async (user, oldTier, newTier) => {
    const message = `🎊 *Tier Upgrade Successful!*

Congratulations ${user.firstName}! 🎉

You've been upgraded!

*Upgrade Details:*
📈 From: ${oldTier}
📈 To: ${newTier}
✨ New Fuel Credits: ${user.fuelCredits}

*New Benefits Unlocked:*
✓ Higher commission rates
✓ More fuel credits
✓ Advanced features
✓ Priority support

Explore your new benefits:
https://z2blegacybuilders.co.za/dashboard.html

Welcome to ${newTier}! 💎
_Z2B Legacy Builders_`;

    return await sendWhatsAppMessage(user.phone, message);
};

// Commission Earned Alert
const sendCommissionAlert = async (user, commissionDetails) => {
    const message = `💰 *Commission Earned!*

Great news ${user.firstName}! 🎉

You've earned a commission!

*Commission Details:*
💵 Amount: R${commissionDetails.amount}
📊 Type: ${commissionDetails.type}
👤 From: ${commissionDetails.fromMember}
📅 Date: ${new Date().toLocaleDateString('en-ZA')}

*Your Earnings:*
💰 Total Earnings: R${user.totalEarnings}
💳 Withdrawable: R${user.withdrawableBalance}

View earnings: https://z2blegacybuilders.co.za/income.html

Keep building! 🚀
_Z2B Legacy Builders_`;

    return await sendWhatsAppMessage(user.phone, message);
};

// Account Status Update (Suspension/Reactivation)
const sendAccountStatusUpdate = async (user, status, reason = '') => {
    const statusMessages = {
        ACTIVE: `✅ *Account Reactivated!*

Hello ${user.firstName}! 🎉

Your Z2B account has been reactivated!

You can now:
✓ Login to your dashboard
✓ Access all features
✓ Earn commissions
✓ Use AI tools

Login: https://z2blegacybuilders.co.za/login.html

Welcome back! 🚀`,

        SUSPENDED: `⚠️ *Account Suspended*

Hello ${user.firstName},

Your Z2B account has been temporarily suspended.

${reason ? `Reason: ${reason}` : ''}

To resolve this, please contact support:
📧 support@z2blegacybuilders.co.za

We're here to help! 💬`,

        PENDING: `⏳ *Account Pending Verification*

Hello ${user.firstName},

Your Z2B account is pending verification.

${reason ? `Note: ${reason}` : ''}

We'll notify you once verified!

Questions? Contact us:
📧 support@z2blegacybuilders.co.za`
    };

    const message = statusMessages[status] || `Account status updated to: ${status}`;
    return await sendWhatsAppMessage(user.phone, message + '\n\n_Z2B Legacy Builders_');
};

module.exports = {
    sendWhatsAppMessage,
    sendRegistrationConfirmation,
    sendPasswordResetNotification,
    sendPaymentConfirmation,
    sendReferralAlert,
    sendLowFuelCreditsAlert,
    sendFuelCreditsRefilled,
    sendTierUpgradeConfirmation,
    sendCommissionAlert,
    sendAccountStatusUpdate,
    formatPhoneNumber
};
