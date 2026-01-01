# 🚀 ZYRA Setup Guide
## AI Sales Agent for Zero2Billionaires

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [OpenAI Setup](#openai-setup)
4. [Facebook Integration](#facebook-integration)
5. [TikTok Integration](#tiktok-integration)
6. [ManyChat Setup](#manychat-setup)
7. [Configuration](#configuration)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before you begin, make sure you have:

- [ ] A Firebase account (free tier works)
- [ ] An OpenAI API account ($5-20/month recommended)
- [ ] Facebook Business Page
- [ ] TikTok Business Account
- [ ] ManyChat account (optional, for advanced automation)
- [ ] Basic understanding of web hosting

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it: **Z2B-ZYRA** (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Firestore Database

1. In your Firebase project, click **"Firestore Database"**
2. Click **"Create database"**
3. Start in **Production mode**
4. Choose your location (e.g., `us-central1` or closest to you)
5. Click **"Enable"**

### Step 3: Set Up Security Rules

In Firestore, go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users only
    match /leads/{leadId} {
      allow read, write: if request.auth != null;
    }

    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /benown_sync/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 4: Get Your Firebase Config

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"**
4. Click the **web icon** `</>`
5. Register app: **ZYRA**
6. Copy the `firebaseConfig` object

### Step 5: Add Config to ZYRA

Open `zyra-config.js` and replace:

```javascript
FIREBASE: {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef",
    databaseURL: "https://your-project.firebaseio.com"
}
```

---

## 🤖 OpenAI Setup

### Step 1: Create OpenAI Account

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **"Create new secret key"**
5. Name it: **ZYRA-AI**
6. Copy the key immediately (you won't see it again!)

### Step 2: Add Credits

1. Go to **Billing** section
2. Add payment method
3. Set usage limit (recommended: $20/month to start)

### Step 3: Add API Key to ZYRA

In `zyra-config.js`:

```javascript
OPENAI: {
    apiKey: "sk-proj-YOUR_ACTUAL_KEY_HERE",
    model: "gpt-4",  // or "gpt-3.5-turbo" for cheaper option
    maxTokens: 500,
    temperature: 0.7
}
```

---

## 📘 Facebook Integration

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps" → "Create App"**
3. Select **"Business"** type
4. Name: **ZYRA Lead Capture**
5. Add your email

### Step 2: Add Messenger Product

1. In your app dashboard, click **"Add Product"**
2. Find **"Messenger"** and click **"Set Up"**
3. Under **"Access Tokens"**, generate token for your page
4. Copy the **Page Access Token**

### Step 3: Set Up Webhook (Phase 1)

1. In Messenger Settings, scroll to **"Webhooks"**
2. Click **"Add Callback URL"**
3. Enter:
   - **Callback URL**: `https://your-domain.com/webhooks/facebook`
   - **Verify Token**: Create a random string (e.g., `ZYRA_FB_2024_SECRET`)
4. Subscribe to: `messages`, `messaging_postbacks`

### Step 4: Add Config to ZYRA

```javascript
LEAD_SOURCES: {
    FACEBOOK: {
        enabled: true,
        pageId: "YOUR_PAGE_ID",
        accessToken: "YOUR_PAGE_ACCESS_TOKEN",
        webhookSecret: "ZYRA_FB_2024_SECRET"
    }
}
```

---

## 🎵 TikTok Integration

### Step 1: TikTok Business Account

1. Create [TikTok For Business](https://www.tiktok.com/business/) account
2. Go to **"TikTok Ads Manager"**
3. Navigate to **"Tools" → "Events"**

### Step 2: Create Lead Generation Form

1. In Ads Manager, create **Lead Generation** campaign
2. Design your lead form with:
   - Name
   - Email
   - Phone (optional)
   - Custom question: "What's your biggest goal right now?"

### Step 3: Access TikTok API (Advanced)

1. Apply for [TikTok Marketing API](https://developers.tiktok.com/)
2. Once approved, get **Access Token**
3. Add to config:

```javascript
TIKTOK: {
    enabled: true,
    accountId: "YOUR_TIKTOK_ACCOUNT_ID",
    accessToken: "YOUR_TIKTOK_ACCESS_TOKEN"
}
```

---

## 💬 ManyChat Setup (Optional)

### Step 1: Connect ManyChat

1. Go to [ManyChat](https://manychat.com/)
2. Sign up and connect your Facebook Page
3. Go to **Settings → API**
4. Generate API key

### Step 2: Create Automation Flow

1. In ManyChat, create new **Flow**
2. Name: **ZYRA Qualification**
3. Set trigger: **New message**
4. Add steps:
   - Welcome message
   - Ask qualifying question
   - Tag user based on response
   - Send to ZYRA webhook

### Step 3: Add to Config

```javascript
MANYCHAT: {
    apiKey: "YOUR_MANYCHAT_API_KEY",
    baseUrl: "https://api.manychat.com/fb"
}
```

---

## ⚙️ Configuration

### Enable/Disable Phases

In `zyra-config.js`, control which phases are active:

```javascript
PHASES: {
    PHASE_1: {
        name: 'Social Lead Capture',
        status: 'ACTIVE',  // ← Change to 'INACTIVE' to disable
    },
    PHASE_2: {
        name: 'AI Chat Funnel',
        status: 'ACTIVE',  // ← AI conversations
    },
    PHASE_3: {
        name: 'Smart Closing System',
        status: 'INACTIVE',  // ← Keep INACTIVE until ready
    }
}
```

### Customize AI Personality

Edit the personality to match your brand:

```javascript
AI_PERSONALITY: {
    tone: 'friendly, confident, relatable mentor',
    style: 'short, simple, human-style messages',
    emoji_usage: true,  // ← Set to false for professional tone
    formality: 'casual',  // ← or 'professional'
}
```

---

## 🚀 Deployment

### Option 1: Firebase Hosting (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Initialize:
   ```bash
   cd Z2B-v21/app
   firebase init hosting
   ```

4. Deploy:
   ```bash
   firebase deploy
   ```

5. Your ZYRA will be live at: `https://your-project.firebaseapp.com/zyra.html`

### Option 2: Traditional Web Hosting

1. Upload all files to your web server:
   - `zyra.html`
   - `zyra-config.js`
   - `zyra-firebase.js`
   - `zyra-ai.js`

2. Make sure HTTPS is enabled

3. Update URLs in config

---

## 🧪 Testing

### Test Lead Capture

1. Open ZYRA dashboard: `your-domain.com/zyra.html`
2. Click **"Add Lead"**
3. Fill in test data
4. Check Firebase Console → Firestore → `leads` collection
5. Verify lead appears in dashboard

### Test AI Conversation (Simulation Mode)

1. With no OpenAI API key, ZYRA uses simulated responses
2. Add a lead
3. Click **"Conversations"** tab
4. Simulate chat by testing different messages:
   - "I'm interested"
   - "How much does it cost?"
   - "Is this a scam?"

### Test with Real OpenAI

1. Add your OpenAI API key to config
2. Send a test message
3. Check Firebase → `leads` → `conversations` array
4. Monitor OpenAI dashboard for API usage

---

## 🔧 Troubleshooting

### Issue: "Firebase not initialized"

**Solution:**
1. Verify Firebase config is correct in `zyra-config.js`
2. Check browser console for errors
3. Make sure Firebase scripts are loaded before ZYRA scripts

Add to `zyra.html` before closing `</body>`:

```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- ZYRA Scripts -->
<script src="zyra-config.js"></script>
<script src="zyra-firebase.js"></script>
<script src="zyra-ai.js"></script>
```

### Issue: "OpenAI API errors"

**Solution:**
1. Check API key is correct
2. Verify you have credits in OpenAI account
3. Check rate limits (max 60 requests/min for free tier)
4. Use `gpt-3.5-turbo` instead of `gpt-4` to save costs

### Issue: "Leads not appearing in dashboard"

**Solution:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify Firebase rules allow read access
4. Clear browser cache and reload

### Issue: "Facebook webhook not working"

**Solution:**
1. Verify webhook URL is publicly accessible (HTTPS required)
2. Check verify token matches in Facebook and your server
3. Test webhook with Facebook's **"Test webhook"** button
4. Check server logs for incoming requests

---

## 📊 Phase 3 Setup (Payment Processing)

**⚠️ DO NOT activate Phase 3 until Phases 1 & 2 are working perfectly!**

When ready:

### Stripe Setup

1. Go to [Stripe](https://stripe.com/)
2. Create account
3. Get **Publishable Key** and **Secret Key**
4. Add to config:

```javascript
PAYMENT: {
    provider: 'stripe',
    publishableKey: 'pk_live_...',
    secretKey: 'sk_live_...'  // Store securely on backend!
}
```

5. Set `PHASE_3.status` to `'ACTIVE'`

---

## 🎯 Success Metrics

Once ZYRA is live, track:

- ✅ **Lead Capture Rate**: 50+ leads/week (from Facebook/TikTok)
- ✅ **AI Response Rate**: 100% (automated)
- ✅ **Engagement Score**: Average 15+ points per lead
- ✅ **Conversion Rate**: 5-10% (cold leads to sales)
- ✅ **Benown Sync**: Data updates every hour

---

## 📞 Support

**Issues?** Contact:
- Z2B Support: support@zero2billionaires.com
- GitHub Issues: [Z2B Repository]
- Documentation: [Z2B Docs]

---

## 🎉 You're Ready!

ZYRA is now configured and ready to close deals 24/7!

**Next Steps:**
1. ✅ Monitor first 10 leads closely
2. ✅ Adjust AI personality based on responses
3. ✅ Optimize conversation flow
4. ✅ Scale up ad spend once profitable

**Welcome to automated sales! 🚀**
