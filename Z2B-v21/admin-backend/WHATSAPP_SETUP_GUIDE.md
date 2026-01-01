# 📱 WhatsApp Automation Setup Guide
## Z2B Legacy Builders - Twilio + Ultramsg Integration

---

## 🎯 Overview

This guide will help you set up **dual WhatsApp automation** using:
- **Twilio** (Primary - Professional, $15 free credits)
- **Ultramsg** (Backup - 100 free messages/day)

The system automatically tries Twilio first, then falls back to Ultramsg if Twilio fails.

---

## ✨ Features Implemented

✅ **Registration Confirmation** - Instant welcome message with account details
✅ **Password Reset Notification** - Secure reset link via WhatsApp
✅ **Payment Confirmation** - Instant payment success alerts
✅ **Team Referral Alerts** - Notify sponsors of new team members
✅ **Low Fuel Credits Warning** - Alert when credits are low
✅ **Fuel Credits Refilled** - Notify FAM tier weekly credit refresh
✅ **Tier Upgrade Confirmation** - Celebrate tier upgrades
✅ **Commission Earned Alerts** - Real-time commission notifications
✅ **Account Status Updates** - Suspension/reactivation notifications

---

## 🆓 OPTION 1: Ultramsg Setup (100% FREE FOREVER)

### Step 1: Create Ultramsg Account

1. Go to: https://ultramsg.com/
2. Click **"Get Started Free"**
3. Sign up with your email (no credit card required)
4. Verify your email

### Step 2: Connect Your WhatsApp

1. After login, go to **Dashboard**
2. Click **"Connect Instance"**
3. Scan the QR code with your WhatsApp (the number you want to send FROM)
4. Wait for connection (green status)

### Step 3: Get Your API Credentials

1. On the dashboard, find:
   - **Instance ID** (e.g., `instance12345`)
   - **Token** (long string, e.g., `abc123xyz...`)

2. Save these - you'll need them!

### Step 4: Add to Railway Environment Variables

Go to Railway Dashboard → Your Project → Variables:

```env
ULTRAMSG_INSTANCE_ID=instance12345
ULTRAMSG_TOKEN=your-long-token-here
```

✅ **Done!** You now have 100 free WhatsApp messages per day!

---

## 💎 OPTION 2: Twilio Setup ($15 FREE CREDITS - Recommended for Professional Use)

### Step 1: Create Twilio Account

1. Go to: https://www.twilio.com/try-twilio
2. Sign up (you can start without credit card)
3. Verify your email and phone number
4. You'll get **$15 free trial credits** (~450 messages)

### Step 2: Enable WhatsApp Sandbox

1. In Twilio Console, go to: **Messaging → Try it out → Send a WhatsApp message**
2. You'll see a **WhatsApp Sandbox number** (e.g., `+1 415 523 8886`)
3. **Join the sandbox:**
   - Send a WhatsApp message to the Twilio number
   - Send the code shown (e.g., `join <your-code>`)
   - Wait for confirmation

### Step 3: Get Your API Credentials

1. In Twilio Console, find:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)
   - **WhatsApp Number** (e.g., `whatsapp:+14155238886`)

### Step 4: Add to Railway Environment Variables

Go to Railway Dashboard → Your Project → Variables:

```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Step 5: Test Your Setup

Use the Twilio Console "Try it out" feature to send a test message.

✅ **Done!** You now have professional WhatsApp automation!

---

## 🚀 RECOMMENDED: Setup BOTH (Best of Both Worlds)

Set up **both Twilio AND Ultramsg** for maximum reliability:

1. **Twilio** = Professional, reliable, paid (but free credits to start)
2. **Ultramsg** = Free backup when Twilio runs out

Our system automatically tries Twilio first, then falls back to Ultramsg.

### Complete Environment Variables:

```env
# Twilio (Primary - Professional)
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Ultramsg (Backup - Free 100/day)
ULTRAMSG_INSTANCE_ID=instance12345
ULTRAMSG_TOKEN=your-ultramsg-token
```

---

## 📋 Phone Number Requirements

**Important:** Users must have a phone number in their account!

The system checks for `user.phone` before sending WhatsApp messages.

### Phone Number Format (Automatic)

The system automatically handles these formats:
- `0812345678` → Converts to `+27812345678`
- `27812345678` → Converts to `+27812345678`
- `+27812345678` → Already correct ✓

---

## 🧪 Testing Your Setup

### Test 1: Registration (Quick Test)

1. Register a new user with a valid phone number
2. Check WhatsApp for welcome message
3. Check backend logs to see which provider was used

### Test 2: Password Reset

1. Go to forgot-password page
2. Enter email of user with phone number
3. Check WhatsApp for reset link

### Test 3: Check Logs

```bash
railway logs
```

Look for:
- `✅ WhatsApp sent via Twilio:` (success with Twilio)
- `✅ WhatsApp sent via Ultramsg:` (success with Ultramsg)
- `🔄 Twilio failed, trying Ultramsg fallback...` (automatic failover)
- `❌ All WhatsApp providers failed` (both failed - check config)

---

## 🔧 Troubleshooting

### Issue: WhatsApp not sending

**Check 1:** Verify environment variables are set
```bash
railway variables
```

**Check 2:** Check user has phone number
```javascript
// In MongoDB or admin panel
user.phone = "+27812345678"
```

**Check 3:** Check Twilio Sandbox is joined
- Send `join <code>` to Twilio WhatsApp number
- Each phone number must join the sandbox

**Check 4:** Check Ultramsg instance is connected
- Go to Ultramsg dashboard
- Instance status should be green "Connected"

### Issue: "Twilio not configured"

Missing Twilio environment variables. Add:
```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...
```

### Issue: "Ultramsg not configured"

Missing Ultramsg environment variables. Add:
```env
ULTRAMSG_INSTANCE_ID=...
ULTRAMSG_TOKEN=...
```

### Issue: "All WhatsApp providers failed"

Both services failed. Check:
1. Environment variables are correct
2. Twilio sandbox is joined
3. Ultramsg instance is connected
4. Phone number is valid (+27...)
5. No typos in configuration

---

## 💰 Pricing (After Free Tier)

### Twilio Pricing
- **Free:** $15 trial credits (~450 messages)
- **After free:** ~$0.005 per message
- **100 messages/day** = ~$15/month
- **1000 messages/day** = ~$150/month

### Ultramsg Pricing
- **Free:** 100 messages/day forever
- **Paid:** $20/month unlimited messages

### Recommendation
1. **Start free:** Use Ultramsg (100% free)
2. **Month-end:** Add Twilio when you have budget
3. **Production:** Use both for redundancy

---

## 📊 WhatsApp Message Templates

All message templates are in:
```
admin-backend/utils/whatsappService.js
```

You can customize messages by editing the templates in this file.

---

## 🔐 Security Best Practices

1. **Never commit** API keys to Git
2. **Use environment variables** only
3. **Rotate tokens** regularly
4. **Monitor usage** to avoid unexpected charges
5. **Validate phone numbers** before sending

---

## 📞 Support

### Twilio Support
- Dashboard: https://www.twilio.com/console
- Docs: https://www.twilio.com/docs/whatsapp
- Support: https://support.twilio.com

### Ultramsg Support
- Dashboard: https://ultramsg.com/dashboard
- Docs: https://docs.ultramsg.com/
- Support: support@ultramsg.com

---

## ✅ Quick Checklist

Before going live, ensure:

- [ ] Environment variables configured in Railway
- [ ] Twilio sandbox joined (if using Twilio)
- [ ] Ultramsg instance connected (if using Ultramsg)
- [ ] Test messages sent successfully
- [ ] Phone numbers in user database
- [ ] Backend restarted after adding variables
- [ ] Logs showing successful sends

---

## 🎉 You're Ready!

Your WhatsApp automation is now set up! Users will receive:
- ✅ Instant registration confirmations
- ✅ Password reset links
- ✅ Payment confirmations
- ✅ Team alerts
- ✅ And more!

**No monthly costs until you hit limits or choose to upgrade!**

---

*Setup guide created: November 11, 2025*
*Z2B Legacy Builders - WhatsApp Automation*
