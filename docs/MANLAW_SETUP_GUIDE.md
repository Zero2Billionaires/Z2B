# Coach ManLaw API - Setup & Quick Start Guide

Complete guide to setting up and running the Coach ManLaw AI Coaching API.

---

## What is Coach ManLaw?

Coach ManLaw is an AI-powered coaching system built into the Zero to Billionaires platform. It provides:

- **Personalized AI Coaching** using Claude or OpenAI
- **Scripture-Based Guidance** integrated into every conversation
- **BTSS Assessment System** (Billionaire Table Support System)
- **Four Legs Framework** coaching methodology
- **Action Tracking & Progress Monitoring**
- **Lesson Library** with IMPACT framework content

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **MongoDB** running (local or cloud)
- **Claude API Key** (optional, for real AI) from https://console.anthropic.com
- **Git** for version control

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Zero2Billionaires/Z2B.git
cd Z2B/server
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- express
- mongoose
- cors
- dotenv
- node-fetch
- jsonwebtoken
- bcryptjs
- express-rate-limit
- helmet
- express-validator

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
# Required
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/z2b

# For Real AI Coaching (Optional - works in placeholder mode without these)
ENABLE_REAL_TIME_AI=true
AI_PROVIDER=claude
CLAUDE_API_KEY=your_claude_api_key_here

# Authentication
JWT_SECRET=your-super-secret-jwt-key
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# macOS/Linux
sudo systemctl start mongod

# or using brew
brew services start mongodb-community
```

**Docker MongoDB:**
```bash
docker run -d -p 27017:27017 --name z2b-mongo mongo:latest
```

**MongoDB Atlas (Cloud):**
Use your connection string in `MONGODB_URI`

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Zero to Billionaires (Z2B) API Server                 ║
║                                                           ║
║   Environment: development                                ║
║   Port: 5000                                             ║
║   AI Provider: claude                                    ║
║   Real-Time AI: Enabled                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Testing the API

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "uptime": 42.5
}
```

### 2. API Test Endpoint

```bash
curl http://localhost:5000/api/test
```

Response:
```json
{
  "message": "Z2B API is running!",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "mongodb": "connected",
    "ai": "enabled"
  }
}
```

---

## Quick Start: Your First Coaching Session

### Step 1: Create a Coach User

```bash
curl -X POST http://localhost:5000/api/coach/user \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "memberId": "member123",
    "currentStage": "Beginner",
    "currentFocusLeg": "Mindset Mystery"
  }'
```

Save the `_id` from the response - this is your `userId`.

### Step 2: Submit BTSS Assessment

```bash
curl -X POST http://localhost:5000/api/btss/assess \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your_user_id_here",
    "mindsetMysteryScore": 45,
    "moneyMovesScore": 35,
    "legacyMissionScore": 50,
    "movementMomentumScore": 60,
    "assessmentType": "self"
  }'
```

The system will identify your weakest leg and update your focus area.

### Step 3: Start a Check-In Session

```bash
curl -X POST http://localhost:5000/api/coach/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your_user_id_here",
    "sessionType": "daily"
  }'
```

Save the `sessionId` from the response.

### Step 4: Chat with Coach ManLaw

```bash
curl -X POST http://localhost:5000/api/coach/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your_session_id_here",
    "userId": "your_user_id_here",
    "message": "I want to build my first million, but I feel stuck. Where do I start?"
  }'
```

You'll receive an AI-powered coaching response with scripture and actionable advice!

---

## Development Modes

### Placeholder Mode (No AI API Key Required)

Set in `.env`:
```env
ENABLE_REAL_TIME_AI=false
```

The system uses intelligent placeholder responses that simulate coaching conversations. Perfect for:
- Development without API costs
- Testing workflows
- Offline development

### Real AI Mode (Requires API Key)

Set in `.env`:
```env
ENABLE_REAL_TIME_AI=true
AI_PROVIDER=claude
CLAUDE_API_KEY=your_key_here
```

The system makes real API calls to Claude for natural, contextual coaching conversations.

---

## File Structure

```
server/
├── server.js                    # Main server file
├── config/
│   ├── db.js                   # MongoDB connection
│   └── aiConfig.js             # AI provider configuration
├── models/
│   ├── CoachUser.js            # Coach user schema
│   ├── CoachingSession.js      # Session tracking
│   ├── BTSSScore.js            # BTSS assessments
│   ├── Lesson.js               # Lesson library
│   └── UserProgress.js         # Action items & progress
├── routes/
│   ├── coachRoutes.js          # Coaching endpoints
│   ├── btssRoutes.js           # BTSS assessment endpoints
│   └── lessonRoutes.js         # Lesson library endpoints
├── services/
│   ├── aiCoachEngine.js        # Core coaching logic
│   └── claudeAPI.js            # AI API integration
├── middleware/
│   ├── errorHandler.js         # Error handling
│   └── validateRequest.js      # Request validation
└── .env.example                # Environment template
```

---

## The Four Legs Framework

Coach ManLaw uses the **Four Legs of a Billionaire Table** methodology:

### 1. Mindset Mystery 🧠
> "Rich in thought before rich in bank balance"

Focus areas:
- Identity in Christ
- Belief systems
- Vision clarity
- Spiritual alignment

### 2. Money Moves 💰
> "Don't work for money—make it work for you"

Focus areas:
- Income generation
- Investment strategy
- Asset protection
- Systems automation

### 3. Legacy Mission 🏛️
> "Build something that outlives your labor"

Focus areas:
- System design
- Purpose alignment
- Generational wealth
- Impact measurement

### 4. Movement Momentum 🚀
> "When mission becomes movement, influence becomes infinite"

Focus areas:
- Community building
- Emotional intelligence
- Networking
- Visibility

---

## BTSS Scoring System

### How It Works

Users assess each of the Four Legs on a scale of 0-100:

```
Overall BTSS = (Mindset + Money + Legacy + Movement) / 4
```

### Table Stability Phases

Based on the **weakest leg** score:

| Weakest Leg Score | Phase | Meaning |
|-------------------|-------|---------|
| 76-100 | Mastery | All legs strong, table stable |
| 51-75 | Strength | Growing stability |
| 26-50 | Growth | Building foundation |
| 0-25 | Foundation | Just starting |

The **weakest leg** becomes the user's **primary focus area**.

---

## Scripture Integration

Coach ManLaw integrates Scripture naturally into coaching conversations:

**Example:**
```
Proverbs 13:11: "Whoever gathers money little by little makes it grow."

Application: Build wealth systematically, not through schemes.
```

Scripture is included:
- At the start of check-in sessions
- Every 5 messages in conversations
- Based on the user's current focus leg

---

## Common Tasks

### Create a New Lesson

```bash
curl -X POST http://localhost:5000/api/lessons \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "L042",
    "lessonTitle": "The Power of Compound Interest",
    "legCategory": 2,
    "targetStage": "Intermediate",
    "difficulty": "moderate",
    "estimatedDuration": 20,
    "shortDescription": "Learn how to make your money multiply exponentially",
    "actionSteps": [
      {
        "description": "Calculate your compound interest potential",
        "linkedLeg": "Money Moves"
      }
    ]
  }'
```

### Record a Win

```bash
curl -X POST http://localhost:5000/api/coach/win \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your_user_id",
    "description": "Closed my first $10k deal!",
    "linkedLeg": "Money Moves",
    "significance": "large"
  }'
```

### Get User Stats

```bash
curl http://localhost:5000/api/coach/stats/your_user_id
```

---

## Troubleshooting

### Error: "MongoDB connection failed"

**Solution:**
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Test connection: `mongo` or `mongosh`

### Error: "Claude API key not configured"

**Solution:**
1. Get API key from https://console.anthropic.com
2. Add to `.env`: `CLAUDE_API_KEY=your_key`
3. Set `ENABLE_REAL_TIME_AI=true`

OR use placeholder mode: `ENABLE_REAL_TIME_AI=false`

### Server won't start

**Solution:**
```bash
# Check if port is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Restart server
npm run dev
```

---

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLAUDE_API_KEY=your_production_api_key
ENABLE_REAL_TIME_AI=true
JWT_SECRET=strong-256-bit-secret
```

### Security Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Use HTTPS only
- [ ] Enable rate limiting
- [ ] Configure CORS for your domain only
- [ ] Set up MongoDB authentication
- [ ] Use environment variables (never commit secrets)
- [ ] Enable Helmet security headers
- [ ] Set up monitoring and logging

---

## API Documentation

Full API reference available at: [API_MANLAW.md](./API_MANLAW.md)

---

## Support & Community

- **Issues**: https://github.com/Zero2Billionaires/Z2B/issues
- **Email**: dev@zero2billionaires.com
- **Docs**: https://docs.zero2billionaires.com

---

## Philosophy

> "I am a Legacy Builder, You are a Legacy Builder, and Together we are Builders of Legacies."

Coach ManLaw is built on the foundation that **faith and business are inseparable**, and that true wealth is measured by the **legacy you leave**, not just the money you make.

---

**Ready to build your legacy? Let's go! 🚀**
