# MAVULA WhatsApp Webhook Configuration Guide

This guide will walk you through configuring WhatsApp webhooks for MAVULA's duplex (two-way) messaging system.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Twilio WhatsApp Webhook Setup](#twilio-whatsapp-webhook-setup)
4. [Ultramsg WhatsApp Webhook Setup](#ultramsg-whatsapp-webhook-setup)
5. [Testing Your Webhooks](#testing-your-webhooks)
6. [Troubleshooting](#troubleshooting)

---

## Overview

MAVULA uses webhooks to receive incoming WhatsApp messages from prospects. When a prospect replies to your automated messages, the WhatsApp provider (Twilio or Ultramsg) sends a webhook to your server, which triggers MAVULA's AI to analyze the message and schedule an appropriate response.

**Webhook Endpoints:**
- Twilio incoming messages: `https://your-domain.com/api/mavula/webhooks/whatsapp/twilio`
- Twilio status updates: `https://your-domain.com/api/mavula/webhooks/whatsapp/status`
- Ultramsg incoming messages: `https://your-domain.com/api/mavula/webhooks/whatsapp/ultramsg`

---

## Prerequisites

Before configuring webhooks, ensure:

1. **Server is deployed and publicly accessible**
   - Your Railway deployment URL (e.g., `https://z2b-production-xxxx.up.railway.app`)
   - OR your custom domain (e.g., `https://z2blegacybuilders.co.za`)

2. **Environment variables are set** (in `.env` or Railway dashboard):
   ```bash
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

   ULTRAMSG_INSTANCE_ID=instance12345
   ULTRAMSG_TOKEN=your_ultramsg_token_here
   ```

3. **Server is running**
   - Test health endpoint: `https://your-domain.com/api/mavula/webhooks/health`
   - Should return JSON with webhook endpoints

---

## Twilio WhatsApp Webhook Setup

### Step 1: Access Twilio Console

1. Go to [https://console.twilio.com](https://console.twilio.com)
2. Log in with your Twilio credentials
3. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**

### Step 2: Configure Sandbox (For Testing)

If you're using Twilio Sandbox for testing:

1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Scroll down to **Sandbox Configuration**
3. Under **"WHEN A MESSAGE COMES IN"**, enter your webhook URL:
   ```
   https://your-domain.com/api/mavula/webhooks/whatsapp/twilio
   ```
4. Set HTTP method to **POST**
5. Click **Save**

### Step 3: Configure Production WhatsApp Number

If you have a production Twilio WhatsApp number:

1. Go to **Messaging** → **Senders** → **WhatsApp senders**
2. Click on your WhatsApp sender (e.g., `+1 415 523 8886`)
3. Scroll to **Messaging**
4. Under **"WHEN A MESSAGE COMES IN"**, enter:
   ```
   https://your-domain.com/api/mavula/webhooks/whatsapp/twilio
   ```
5. Set HTTP method to **POST**
6. (Optional) Under **"WHEN STATUS CHANGES"**, enter:
   ```
   https://your-domain.com/api/mavula/webhooks/whatsapp/status
   ```
7. Click **Save**

### Step 4: Verify Webhook

1. Send a test message to your Twilio WhatsApp number
2. Check your server logs for:
   ```
   Received Twilio webhook: { From: "whatsapp:+27...", Body: "..." }
   Twilio webhook processed: { success: true, ... }
   ```
3. If you see these logs, webhooks are working correctly

---

## Ultramsg WhatsApp Webhook Setup

### Step 1: Access Ultramsg Dashboard

1. Go to [https://ultramsg.com/](https://ultramsg.com/)
2. Log in with your credentials
3. Click on **Instance** in the top navigation

### Step 2: Select Your Instance

1. Click on the instance you want to configure (e.g., `instance12345`)
2. Navigate to **Settings** tab

### Step 3: Configure Webhook

1. Scroll down to **Webhook Settings**
2. Enable **Webhook**
3. In the **Webhook URL** field, enter:
   ```
   https://your-domain.com/api/mavula/webhooks/whatsapp/ultramsg
   ```
4. Select **Events to send**:
   - ✅ **Message received**
   - ✅ **Message sent**
   - ✅ **Message delivered**
   - ✅ **Message read**
5. Click **Save Settings**

### Step 4: Verify Webhook

1. Send a test message to your WhatsApp instance number
2. Check your server logs for:
   ```
   Received Ultramsg webhook: { from: "27...", body: "..." }
   Ultramsg webhook processed: { success: true, ... }
   ```
3. If you see these logs, webhooks are working correctly

---

## Testing Your Webhooks

### Manual Testing

#### Test Twilio Webhook:

```bash
curl -X POST https://your-domain.com/api/mavula/webhooks/whatsapp/twilio \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+27821234567" \
  -d "To=whatsapp:+14155238886" \
  -d "Body=Test message" \
  -d "MessageSid=SM1234567890abcdef"
```

**Expected response:**
```xml
<?xml version="1.0" encoding="UTF-8"?><Response></Response>
```

#### Test Ultramsg Webhook:

```bash
curl -X POST https://your-domain.com/api/mavula/webhooks/whatsapp/ultramsg \
  -H "Content-Type: application/json" \
  -d '{
    "id": "msg_12345",
    "from": "27821234567@c.us",
    "body": "Test message",
    "type": "chat",
    "time": 1234567890
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Webhook received"
}
```

### Health Check Test:

```bash
curl https://your-domain.com/api/mavula/webhooks/health
```

**Expected response:**
```json
{
  "success": true,
  "service": "MAVULA Webhooks",
  "endpoints": {
    "twilio": "/api/mavula/webhooks/whatsapp/twilio",
    "ultramsg": "/api/mavula/webhooks/whatsapp/ultramsg",
    "status": "/api/mavula/webhooks/whatsapp/status"
  },
  "timestamp": "2025-12-08T..."
}
```

### End-to-End Testing

1. **Add a test prospect** in MAVULA dashboard
2. **Send an AI-generated message** to the prospect
3. **Reply to the message** from the prospect's WhatsApp
4. **Check MAVULA conversation view** - The reply should appear
5. **Check automation jobs** - An auto-response job should be created
6. **Wait for AI response** - AI should generate and send a response within 30 seconds

---

## Troubleshooting

### Webhook Not Receiving Messages

**Problem:** Messages sent to WhatsApp number don't trigger webhooks

**Solutions:**

1. **Check webhook URL is correct:**
   - Must be publicly accessible (not localhost)
   - Must use HTTPS (not HTTP)
   - Must include full path: `/api/mavula/webhooks/whatsapp/twilio`

2. **Verify server is running:**
   ```bash
   curl https://your-domain.com/api/mavula/webhooks/health
   ```
   - Should return 200 OK with JSON

3. **Check Twilio/Ultramsg logs:**
   - Twilio: Console → Monitor → Logs → Errors
   - Ultramsg: Dashboard → Logs
   - Look for webhook delivery failures

4. **Check firewall/security:**
   - Ensure Railway/server allows incoming POST requests
   - Check if IP whitelisting is blocking Twilio/Ultramsg

### Webhook Receives but Doesn't Process

**Problem:** Webhook endpoint receives data but doesn't create conversation records

**Solutions:**

1. **Check server logs:**
   ```bash
   railway logs --tail
   ```
   - Look for error messages in webhook processing

2. **Verify prospect exists:**
   - The phone number in the webhook must match a prospect in MavulaProspect collection
   - Phone numbers must be in international format (+27...)

3. **Check MongoDB connection:**
   - Ensure `MONGODB_URI` is set correctly
   - Test database connectivity

4. **Verify WhatsApp service configuration:**
   - Check `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` are set
   - Check `ULTRAMSG_INSTANCE_ID`, `ULTRAMSG_TOKEN` are set

### Auto-Response Not Sending

**Problem:** Incoming messages are received but AI doesn't respond

**Solutions:**

1. **Check user settings:**
   - Ensure `autoResponseEnabled` is `true` in MavulaUserSettings
   - Ensure `automationEnabled` is `true`

2. **Check prospect settings:**
   - Ensure prospect's `automationEnabled` is `true`
   - Ensure prospect has NOT opted out (`hasOptedOut` is `false`)

3. **Check automation jobs:**
   - Query `MavulaAutomationJob` collection for `RESPONSE_REQUIRED` jobs
   - Check job status (should be `PENDING` and scheduled for 30 seconds from now)

4. **Check AI fuel credits:**
   - User must have fuel credits remaining
   - Check `User.fuelCredits` field

5. **Check rate limits:**
   - User must be under 50 messages/day limit
   - Check with: `GET /api/mavula/whatsapp/rate-limit`

### Invalid Phone Number Format

**Problem:** Webhook receives messages but can't find prospect

**Solutions:**

1. **Check phone number formatting:**
   - Twilio format: `whatsapp:+27821234567`
   - Ultramsg format: `27821234567@c.us`
   - Database format: `+27821234567`

2. **Verify formatPhoneNumber() is working:**
   - Should convert `0821234567` → `+27821234567`
   - Should convert `27821234567` → `+27821234567`
   - Should strip non-numeric characters

3. **Check prospect database:**
   ```javascript
   db.mavula_prospects.find({ phone: /27821234567/ })
   ```
   - Ensure phone numbers are stored consistently

---

## Security Considerations

### Validate Webhook Signatures (Recommended for Production)

For production deployments, validate webhook signatures to ensure requests are authentic:

#### Twilio Signature Validation:

```javascript
const twilio = require('twilio');

router.post('/whatsapp/twilio', (req, res) => {
    const signature = req.headers['x-twilio-signature'];
    const url = `https://your-domain.com${req.originalUrl}`;

    const isValid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        signature,
        url,
        req.body
    );

    if (!isValid) {
        return res.status(403).send('Invalid signature');
    }

    // Process webhook...
});
```

#### Ultramsg Token Validation:

```javascript
router.post('/whatsapp/ultramsg', (req, res) => {
    const { token } = req.body;

    if (token !== process.env.ULTRAMSG_TOKEN) {
        return res.status(403).json({ error: 'Invalid token' });
    }

    // Process webhook...
});
```

---

## Webhook Flow Diagram

```
┌─────────────┐
│  Prospect   │
│  sends      │
│  WhatsApp   │
│  message    │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Twilio/Ultramsg │
│  receives        │
│  message         │
└──────┬───────────┘
       │
       │ HTTP POST
       ▼
┌──────────────────────────────────────────┐
│  /api/mavula/webhooks/whatsapp/twilio    │
│  OR                                       │
│  /api/mavula/webhooks/whatsapp/ultramsg  │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  MavulaWhatsAppService       │
│  .handleIncomingMessage()    │
└──────┬───────────────────────┘
       │
       ├─→ Find prospect by phone
       ├─→ Check for opt-out keywords
       ├─→ Record message in conversation
       ├─→ Analyze sentiment (AI)
       ├─→ Update prospect engagement metrics
       │
       ▼
┌──────────────────────────────┐
│  Create MavulaAutomationJob  │
│  Type: RESPONSE_REQUIRED     │
│  Priority: 8 (high)          │
│  Scheduled: +30 seconds      │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Automation Engine           │
│  (processes job queue)       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  MavulaAIService             │
│  .generateResponse()         │
│  (Claude AI analyzes and     │
│   generates response)        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  MavulaWhatsAppService       │
│  .sendAIMessage()            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Twilio/Ultramsg API         │
│  Sends WhatsApp message      │
└──────┬───────────────────────┘
       │
       ▼
┌─────────────┐
│  Prospect   │
│  receives   │
│  AI reply   │
└─────────────┘
```

---

## Next Steps

After configuring webhooks:

1. **Phase 4: Automation Engine** - Create job queue processor to handle scheduled responses
2. **Phase 5: Content Management** - Enable PDF/URL uploads for AI training
3. **Phase 6: Social Media Integration** - Import prospects from Facebook/Instagram/TikTok
4. **Phase 7: Frontend Dashboard** - Build user interface for managing conversations

---

## Support

If you encounter issues not covered in this guide:

1. Check server logs: `railway logs --tail` (or your hosting provider's log viewer)
2. Test webhook endpoint manually with curl commands above
3. Verify all environment variables are set correctly
4. Review MAVULA implementation plan for architecture details

---

**Last Updated:** December 2025
**Version:** 1.0.0
**Part of:** MAVULA - Marketing Automation Via Unified Learning AI
