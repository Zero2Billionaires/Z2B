# MAVULA Automation Testing Guide

This guide provides step-by-step instructions for testing the complete MAVULA automation flow from prospect addition to AI-powered WhatsApp conversation.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Test Flow](#quick-test-flow)
3. [Detailed Testing Steps](#detailed-testing-steps)
4. [Manual Job Triggering](#manual-job-triggering)
5. [Testing Individual Components](#testing-individual-components)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before testing, ensure:

1. **Server is running:**
   ```bash
   cd C:/Users/Manana/Z2B/Z2B-v21/admin-backend
   npm start
   ```

2. **Environment variables are set:**
   - `MONGODB_URI` - MongoDB connection
   - `ANTHROPIC_API_KEY` - Claude API
   - `OPENAI_API_KEY` - OpenAI GPT-4 API
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
   - `ULTRAMSG_INSTANCE_ID`, `ULTRAMSG_TOKEN`

3. **Database is connected:**
   - Check server logs for: `✅ MongoDB connected successfully`

4. **Cron scheduler is running:**
   - Check server logs for: `[MAVULA SCHEDULER] ✓ All cron jobs initialized successfully`

5. **You have a test user account:**
   - Login to Z2B admin at `/admin.html`
   - Note your user ID (check browser console or JWT token)

---

## Quick Test Flow

This is the fastest way to test the complete automation:

### Step 1: Add a Test Prospect via API

```bash
# Replace YOUR_JWT_TOKEN with your actual token from localStorage
# Replace YOUR_USER_ID with your user ID

curl -X POST http://localhost:5000/api/mavula/prospects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prospectName": "Test Prospect",
    "phone": "0821234567",
    "email": "test@example.com",
    "source": "MANUAL",
    "tags": ["test"],
    "notes": "Automation test prospect"
  }'
```

### Step 2: Enable Automation

```bash
curl -X POST http://localhost:5000/api/mavula/automation/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 3: Manually Trigger Daily Job Scheduling

```bash
# In Node.js console or create a test script:
node -e "
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');
MavulaAutomationEngine.scheduleDailyJobs('YOUR_USER_ID')
  .then(result => console.log('Jobs scheduled:', result))
  .catch(err => console.error('Error:', err));
"
```

### Step 4: Check Scheduled Jobs

```bash
# Query MongoDB to see scheduled jobs
mongosh YOUR_MONGODB_URI --eval "
  db.mavula_automation_jobs.find({
    userId: ObjectId('YOUR_USER_ID'),
    status: 'PENDING'
  }).pretty()
"
```

### Step 5: Manually Trigger Job Processing

```bash
node -e "
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');
MavulaAutomationEngine.processJobQueue()
  .then(result => console.log('Jobs processed:', result))
  .catch(err => console.error('Error:', err));
"
```

### Step 6: Verify Message Sent

Check:
1. **Server logs** - Should show AI message generation and WhatsApp sending
2. **WhatsApp** - Test prospect should receive AI-generated ice breaker
3. **Database** - Conversation record should be created

---

## Detailed Testing Steps

### Test 1: Prospect Creation and Conversation Initialization

**Objective:** Verify prospects are created correctly with conversation records.

```bash
# 1. Create prospect
curl -X POST http://localhost:5000/api/mavula/prospects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prospectName": "Jane Doe",
    "phone": "+27821234567",
    "email": "jane@example.com"
  }'

# 2. Verify prospect created
curl http://localhost:5000/api/mavula/prospects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: JSON array with prospect, leadScore: 30, conversationStage: "INITIAL_CONTACT"

# 3. Check conversation was created
# Query MongoDB:
db.mavula_conversations.find({ userId: ObjectId('YOUR_USER_ID') }).pretty()

# Expected: Conversation record with empty messages array
```

### Test 2: AI Message Generation

**Objective:** Verify AI generates appropriate messages for different stages.

```bash
# Test opener generation
curl -X POST http://localhost:5000/api/mavula/ai/generate-opener \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prospectId": "PROSPECT_ID_HERE"
  }'

# Expected:
# {
#   "success": true,
#   "message": "Hi Jane! 👋 I noticed you're interested in...",
#   "tokensUsed": 150,
#   "generationTime": 1.2
# }

# Test follow-up generation
curl -X POST http://localhost:5000/api/mavula/ai/generate-follow-up \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prospectId": "PROSPECT_ID_HERE"
  }'

# Test closing message
curl -X POST http://localhost:5000/api/mavula/ai/generate-close \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prospectId": "PROSPECT_ID_HERE"
  }'
```

### Test 3: WhatsApp Sending (Dry Run)

**Objective:** Verify WhatsApp service can send messages.

**Important:** This will send an actual WhatsApp message!

```bash
# First, check rate limit
curl http://localhost:5000/api/mavula/whatsapp/rate-limit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: { limit: 50, used: 0, remaining: 50, ... }

# Send test message (THIS SENDS REAL WHATSAPP!)
node -e "
const MavulaWhatsAppService = require('./services/MavulaWhatsAppService');
MavulaWhatsAppService.sendAIMessage(
  'PROSPECT_ID_HERE',
  'This is a test message from MAVULA AI.',
  'YOUR_USER_ID'
).then(result => console.log('Message sent:', result))
 .catch(err => console.error('Error:', err));
"
```

### Test 4: Automation Job Scheduling

**Objective:** Verify automation engine schedules jobs correctly.

```bash
# 1. Schedule daily jobs
node -e "
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');
MavulaAutomationEngine.scheduleDailyJobs('YOUR_USER_ID')
  .then(result => {
    console.log('Jobs scheduled:', result.jobsScheduled);
    console.log('Prospects evaluated:', result.prospectsEvaluated);
  });
"

# 2. Check database for jobs
db.mavula_automation_jobs.find({
  userId: ObjectId('YOUR_USER_ID'),
  status: 'PENDING'
}).sort({ scheduledFor: 1 }).pretty()

# Expected: Array of jobs with different types (INITIAL_OUTREACH, FOLLOW_UP, etc.)

# 3. Check job details
db.mavula_automation_jobs.findOne({ status: 'PENDING' })

# Expected fields:
# - jobType: "INITIAL_OUTREACH"
# - scheduledFor: Date in the future
# - priority: 1-10
# - contextData: { prospectName, conversationStage, ... }
```

### Test 5: Job Queue Processing

**Objective:** Verify jobs are executed and messages are sent.

```bash
# 1. Create a job scheduled for immediate execution
db.mavula_automation_jobs.insertOne({
  userId: ObjectId('YOUR_USER_ID'),
  prospectId: ObjectId('YOUR_PROSPECT_ID'),
  jobType: 'INITIAL_OUTREACH',
  scheduledFor: new Date(),
  status: 'PENDING',
  priority: 7,
  maxRetries: 3,
  retryCount: 0,
  contextData: {},
  executionLogs: [],
  createdAt: new Date(),
  updatedAt: new Date()
})

# 2. Process job queue
node -e "
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');
MavulaAutomationEngine.processJobQueue()
  .then(result => {
    console.log('Processed:', result.processed);
    console.log('Completed:', result.completed);
    console.log('Failed:', result.failed);
  });
"

# 3. Check job status changed to COMPLETED
db.mavula_automation_jobs.find({
  userId: ObjectId('YOUR_USER_ID')
}).sort({ completedAt: -1 }).limit(5).pretty()

# Expected: Job status changed to "COMPLETED", result field populated
```

### Test 6: Incoming Message Handling

**Objective:** Verify webhooks process incoming messages correctly.

```bash
# Simulate Twilio webhook
curl -X POST http://localhost:5000/api/mavula/webhooks/whatsapp/twilio \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+27821234567" \
  -d "To=whatsapp:+14155238886" \
  -d "Body=Hi, I'm interested in learning more!" \
  -d "MessageSid=SM1234567890abcdef"

# Expected: Empty TwiML response
# Check database: Message should be recorded in conversation

db.mavula_conversations.findOne({
  userId: ObjectId('YOUR_USER_ID')
})

# Expected: messages array should have new entry with role: "PROSPECT"

# Check automation jobs: Should have created RESPONSE_REQUIRED job
db.mavula_automation_jobs.find({
  jobType: 'RESPONSE_REQUIRED',
  status: 'PENDING'
}).pretty()
```

### Test 7: Opt-Out Handling

**Objective:** Verify prospects can opt out with STOP keyword.

```bash
# 1. Send opt-out message
curl -X POST http://localhost:5000/api/mavula/webhooks/whatsapp/twilio \
  -d "From=whatsapp:+27821234567" \
  -d "Body=STOP" \
  -d "MessageSid=SM_OPTOUT_TEST"

# 2. Check prospect status
db.mavula_prospects.findOne({ phone: '+27821234567' })

# Expected:
# - hasOptedOut: true
# - optedOutDate: Date
# - automationEnabled: false

# 3. Check pending jobs were cancelled
db.mavula_automation_jobs.find({
  prospectId: ObjectId('PROSPECT_ID'),
  status: 'CANCELLED'
}).pretty()
```

### Test 8: Lead Scoring

**Objective:** Verify AI calculates lead scores correctly.

```bash
# 1. Add some conversation history
db.mavula_conversations.updateOne(
  { prospectId: ObjectId('PROSPECT_ID') },
  { $push: { messages: {
    role: 'PROSPECT',
    content: 'How much does it cost to join?',
    timestamp: new Date()
  }}}
)

# 2. Recalculate lead score
node -e "
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');
MavulaAutomationEngine.recalculateLeadScore('PROSPECT_ID')
  .then(result => {
    console.log('Previous score:', result.previousScore);
    console.log('New score:', result.newScore);
    console.log('Temperature:', result.temperature);
  });
"

# Expected: Score should increase (asking about price = buying signal)
```

### Test 9: Daily Activity Tracking

**Objective:** Verify daily achievements are tracked.

```bash
# 1. Get today's activity
curl http://localhost:5000/api/mavula/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected:
# {
#   "todayActivity": {
#     "targets": { prospectsTarget: 10, conversionsTarget: 1 },
#     "achievements": { prospectsAdded: 3, messagesSent: 5, ... },
#     "progress": { ... }
#   }
# }

# 2. Manually update achievement
node -e "
const MavulaDailyActivity = require('./models/MavulaDailyActivity');
MavulaDailyActivity.getTodayActivity('YOUR_USER_ID')
  .then(activity => {
    return activity.updateAchievements({
      prospectsAdded: 1,
      messagesSent: 1
    });
  })
  .then(() => console.log('Achievement updated'));
"

# 3. Verify update
db.mavula_daily_activities.findOne({
  userId: ObjectId('YOUR_USER_ID'),
  date: ISODate('2025-12-08')
}).pretty()
```

### Test 10: Cron Scheduler

**Objective:** Verify cron jobs are running.

```bash
# 1. Check server logs after starting
# Should see:
# [MAVULA SCHEDULER] ✓ All cron jobs initialized successfully
# [MAVULA SCHEDULER] Active schedules: ...

# 2. Wait 15 minutes (or change cron to */1 for testing)
# Should see:
# [MAVULA SCHEDULER] Running job queue processor...
# [MAVULA SCHEDULER] Job queue processing result: { processed: X, ... }

# 3. Manually trigger a cron function
node -e "
const cron = require('node-cron');
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');

// Simulate hourly check
console.log('Testing hourly follow-up check...');
MavulaAutomationEngine.scheduleDailyJobs('YOUR_USER_ID')
  .then(result => console.log('Result:', result));
"
```

---

## Manual Job Triggering

For testing without waiting for cron schedules:

### Trigger Job Queue Processing

```javascript
// Run in Node.js console or test script
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');

MavulaAutomationEngine.processJobQueue()
  .then(result => console.log('Result:', result))
  .catch(err => console.error('Error:', err));
```

### Schedule Jobs for a User

```javascript
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');

MavulaAutomationEngine.scheduleDailyJobs('675f80e1fb47c6e25b0dd11e')
  .then(result => console.log('Jobs scheduled:', result))
  .catch(err => console.error('Error:', err));
```

### Detect Dormant Prospects

```javascript
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');

MavulaAutomationEngine.detectDormantProspects('YOUR_USER_ID')
  .then(result => console.log('Dormant prospects:', result))
  .catch(err => console.error('Error:', err));
```

### Calculate Weekly Projection

```javascript
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');

MavulaAutomationEngine.calculateWeeklyProjection('YOUR_USER_ID')
  .then(result => console.log('Projection:', result))
  .catch(err => console.error('Error:', err));
```

---

## Testing Individual Components

### Test MavulaAIService

```javascript
const MavulaAIService = require('./services/MavulaAIService');

// Test opener generation
MavulaAIService.generateOpener('PROSPECT_ID', 'USER_ID')
  .then(result => console.log('Opener:', result.message));

// Test sentiment analysis
MavulaAIService.analyzeSentiment('This sounds great! When can I start?')
  .then(result => console.log('Sentiment:', result.sentiment));

// Test lead scoring
MavulaAIService.calculateLeadScore('PROSPECT_ID', conversationHistory)
  .then(result => console.log('Score:', result.score));
```

### Test MavulaWhatsAppService

```javascript
const MavulaWhatsAppService = require('./services/MavulaWhatsAppService');

// Check rate limit
MavulaWhatsAppService.checkRateLimit('USER_ID')
  .then(canSend => console.log('Can send:', canSend));

// Get rate limit status
MavulaWhatsAppService.getRateLimitStatus('USER_ID')
  .then(status => console.log('Rate limit:', status));

// Format phone number
const formatted = MavulaWhatsAppService.formatPhoneNumber('0821234567');
console.log('Formatted:', formatted); // Expected: +27821234567
```

---

## Troubleshooting

### Jobs Not Being Scheduled

**Problem:** `scheduleDailyJobs()` returns 0 jobs scheduled.

**Solutions:**
1. Check user settings: `db.mavula_user_settings.findOne({ userId: ObjectId('YOUR_USER_ID') })`
   - Ensure `automationEnabled: true`
2. Check prospects exist: `db.mavula_prospects.count({ userId: ObjectId('YOUR_USER_ID') })`
3. Check prospects have automation enabled: `db.mavula_prospects.find({ automationEnabled: true })`

### Jobs Not Being Processed

**Problem:** Jobs remain in PENDING status.

**Solutions:**
1. Check cron scheduler is running (check server logs)
2. Manually trigger: `MavulaAutomationEngine.processJobQueue()`
3. Check job `scheduledFor` is in the past
4. Check server is not already processing (only one instance processes at a time)

### AI Messages Not Sending

**Problem:** Jobs complete but no WhatsApp message sent.

**Solutions:**
1. Check fuel credits: `db.users.findOne({ _id: ObjectId('USER_ID') }, { fuelCredits: 1 })`
2. Check Twilio/Ultramsg credentials in `.env`
3. Check rate limit: `MavulaWhatsAppService.getRateLimitStatus('USER_ID')`
4. Check prospect has not opted out: `db.mavula_prospects.findOne({ _id: ObjectId('PROSPECT_ID') }, { hasOptedOut: 1 })`

### Incoming Messages Not Triggering Auto-Response

**Problem:** Webhook receives message but no auto-response job created.

**Solutions:**
1. Check user settings: `autoResponseEnabled: true`
2. Check prospect automation: `automationEnabled: true`
3. Check server logs for webhook processing errors
4. Verify conversation record exists for prospect

---

## Complete End-to-End Test Script

Save as `test-automation.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const MavulaProspect = require('./models/MavulaProspect');
const MavulaUserSettings = require('./models/MavulaUserSettings');
const MavulaAutomationEngine = require('./services/MavulaAutomationEngine');

async function runTest() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const userId = 'YOUR_USER_ID'; // Replace with actual user ID

        // 1. Enable automation
        let settings = await MavulaUserSettings.findOne({ userId });
        if (!settings) {
            settings = await MavulaUserSettings.initializeForUser(userId);
        }
        settings.automationEnabled = true;
        await settings.save();
        console.log('✓ Automation enabled');

        // 2. Create test prospect
        const prospect = new MavulaProspect({
            userId,
            prospectName: 'Test Automation User',
            phone: '+27821234567',
            email: 'test@automation.com',
            source: 'MANUAL',
            automationEnabled: true,
            consentGiven: true
        });
        await prospect.save();
        console.log('✓ Test prospect created:', prospect._id);

        // 3. Schedule jobs
        const scheduleResult = await MavulaAutomationEngine.scheduleDailyJobs(userId);
        console.log('✓ Jobs scheduled:', scheduleResult);

        // 4. Process job queue
        const processResult = await MavulaAutomationEngine.processJobQueue();
        console.log('✓ Jobs processed:', processResult);

        // 5. Check results
        const updatedProspect = await MavulaProspect.findById(prospect._id);
        console.log('✓ Prospect last contact:', updatedProspect.lastContactDate);
        console.log('✓ Messages sent:', updatedProspect.totalMessagesSent);

        console.log('\n✅ Automation test complete!');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Test failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

runTest();
```

Run with: `node test-automation.js`

---

**Last Updated:** December 2025
**Version:** 1.0.0
**Part of:** MAVULA - Marketing Automation Via Unified Learning AI
