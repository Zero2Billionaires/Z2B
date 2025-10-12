# Coach ManLaw API Documentation

Complete API reference for the Coach ManLaw AI Coaching System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

- [Coach User Endpoints](#coach-user-endpoints)
- [Check-In Endpoints](#check-in-endpoints)
- [Chat/Conversation Endpoints](#chatconversation-endpoints)
- [Action Item Endpoints](#action-item-endpoints)
- [Wins Endpoints](#wins-endpoints)
- [BTSS Assessment Endpoints](#btss-assessment-endpoints)
- [Lesson Endpoints](#lesson-endpoints)

---

## Coach User Endpoints

### Get Coach User Profile

**GET** `/coach/user/:userId`

Get a coach user's profile information.

**Response:**
```json
{
  "_id": "user123",
  "memberId": "member456",
  "fullName": "John Doe",
  "email": "john@example.com",
  "currentStage": "Intermediate",
  "currentFocusLeg": "Money Moves",
  "totalCoachingSessions": 15,
  "checkInStreak": 7,
  "totalWins": 12,
  "totalActionsCompleted": 28,
  "lessonsCompleted": 5
}
```

### Create Coach User

**POST** `/coach/user`

Create a new coach user account.

**Request Body:**
```json
{
  "memberId": "member456",
  "fullName": "John Doe",
  "email": "john@example.com",
  "currentStage": "Beginner",
  "currentFocusLeg": "Mindset Mystery"
}
```

### Update Coach User

**PUT** `/coach/user/:userId`

Update a coach user's profile.

**Request Body:**
```json
{
  "currentFocusLeg": "Legacy Mission",
  "preferredCheckInTime": "08:00 AM",
  "notificationsEnabled": true
}
```

---

## Check-In Endpoints

### Start Check-In Session

**POST** `/coach/check-in`

Start a new daily, weekly, or monthly check-in session.

**Request Body:**
```json
{
  "userId": "user123",
  "sessionType": "daily"
}
```

**Response:**
```json
{
  "session": {
    "sessionId": "CS-1234567890-abc123",
    "userId": "user123",
    "sessionType": "daily",
    "status": "active",
    "conversationLog": [
      {
        "role": "system",
        "content": "Welcome back, John! Let's make today count.",
        "timestamp": "2025-01-15T08:00:00Z"
      }
    ]
  },
  "user": {
    "checkInStreak": 8,
    "currentStage": "Intermediate",
    "currentFocusLeg": "Money Moves"
  }
}
```

### Get Active Session

**GET** `/coach/check-in/active/:userId`

Get the user's currently active check-in session.

### Complete Check-In Session

**POST** `/coach/check-in/:sessionId/complete`

Mark a check-in session as completed.

**Request Body:**
```json
{
  "duration": 15,
  "userRating": 5,
  "userFeedback": "Great session! Feeling motivated."
}
```

---

## Chat/Conversation Endpoints

### Send Message to Coach

**POST** `/coach/chat`

Send a message to Coach ManLaw and get AI response.

**Request Body:**
```json
{
  "sessionId": "CS-1234567890-abc123",
  "userId": "user123",
  "message": "I'm struggling with my mindset today. How can I overcome limiting beliefs?"
}
```

**Response:**
```json
{
  "sessionId": "CS-1234567890-abc123",
  "response": "John, I hear you, Legacy Builder. Limiting beliefs are just thoughts that haven't been challenged yet...",
  "scripture": {
    "reference": "Proverbs 23:7",
    "verse": "For as he thinks in his heart, so is he.",
    "application": "Your thoughts shape your reality. Think like a billionaire to become one."
  },
  "requiresAction": false
}
```

### Get Conversation History

**GET** `/coach/chat/history/:userId`

Get a user's conversation history.

**Query Parameters:**
- `limit` (optional): Number of sessions to retrieve (default: 10)

---

## Action Item Endpoints

### Create Action Item

**POST** `/coach/action`

Create a new action item for a user.

**Request Body:**
```json
{
  "userId": "user123",
  "sessionId": "CS-1234567890-abc123",
  "description": "Complete money mindset lesson",
  "linkedLeg": "Money Moves",
  "priority": "high",
  "dueDate": "2025-01-20T00:00:00Z"
}
```

### Get User's Active Actions

**GET** `/coach/actions/:userId`

Get all active (pending/in-progress) actions for a user.

**Response:**
```json
[
  {
    "_id": "action123",
    "actionItem": "Complete money mindset lesson",
    "status": "pending",
    "linkedLeg": "Money Moves",
    "priority": "high",
    "dueDate": "2025-01-20T00:00:00Z"
  }
]
```

### Update Action Status

**PUT** `/coach/action/:actionId`

Update an action item's status.

**Request Body:**
```json
{
  "status": "completed",
  "outcome": "Completed the lesson and gained new insights about wealth creation",
  "impactRating": 5
}
```

### Get Overdue Actions

**GET** `/coach/actions/:userId/overdue`

Get all overdue actions for a user.

---

## Wins Endpoints

### Record a Win

**POST** `/coach/win`

Record a win/achievement for a user.

**Request Body:**
```json
{
  "sessionId": "CS-1234567890-abc123",
  "userId": "user123",
  "description": "Closed my first $10k deal!",
  "linkedLeg": "Money Moves",
  "significance": "large"
}
```

### Get User's Recent Wins

**GET** `/coach/wins/:userId`

Get a user's recent wins.

**Query Parameters:**
- `limit` (optional): Number of wins to retrieve (default: 10)

---

## BTSS Assessment Endpoints

### Submit BTSS Assessment

**POST** `/btss/assess`

Submit a new BTSS (Billionaire Table Support System) assessment.

**Request Body:**
```json
{
  "userId": "user123",
  "mindsetMysteryScore": 65,
  "moneyMovesScore": 45,
  "legacyMissionScore": 55,
  "movementMomentumScore": 70,
  "assessmentType": "monthly",
  "notes": "Making progress on mindset and movement"
}
```

**Response:**
```json
{
  "btssScore": {
    "_id": "btss123",
    "overallBTSS": 59,
    "weakestLeg": "Money Moves",
    "strongestLeg": "Movement Momentum",
    "tableStability": "Growth"
  },
  "insights": {
    "focusArea": "Focus on strengthening your Money Moves",
    "stageAdvancement": {
      "currentStage": "Intermediate",
      "message": null
    }
  }
}
```

### Get Latest BTSS Score

**GET** `/btss/:userId`

Get a user's most recent BTSS assessment.

### Get BTSS History

**GET** `/btss/history/:userId`

Get a user's BTSS assessment history.

**Query Parameters:**
- `limit` (optional): Number of assessments to retrieve (default: 12)

### Get BTSS Growth Rate

**GET** `/btss/growth/:userId`

Calculate growth rate between last two assessments.

**Response:**
```json
{
  "canCalculate": true,
  "change": 8,
  "percentChange": "15.69"
}
```

### Get BTSS Breakdown

**GET** `/btss/breakdown/:userId`

Get detailed breakdown of all four legs.

**Response:**
```json
{
  "legs": [
    {
      "name": "Mindset Mystery",
      "score": 65,
      "phase": "Growth",
      "isWeakest": false,
      "isStrongest": false
    },
    {
      "name": "Money Moves",
      "score": 45,
      "phase": "Foundation",
      "isWeakest": true,
      "isStrongest": false
    }
  ],
  "overall": {
    "btss": 59,
    "stability": "Growth",
    "assessmentDate": "2025-01-15T10:00:00Z"
  }
}
```

---

## Lesson Endpoints

### Get All Lessons

**GET** `/lessons`

Get all published lessons with optional filters.

**Query Parameters:**
- `leg` (optional): Filter by leg category (1-4)
- `stage` (optional): Filter by target stage (Beginner, Intermediate, Advanced, Master)
- `difficulty` (optional): Filter by difficulty (easy, moderate, challenging)
- `limit` (optional): Number of lessons to retrieve (default: 50)

**Response:**
```json
[
  {
    "_id": "lesson123",
    "lessonId": "L001",
    "lessonTitle": "The Billionaire Mindset Foundation",
    "lessonSlug": "billionaire-mindset-foundation",
    "legCategory": 1,
    "legCategoryName": "Mindset Mystery",
    "targetStage": "Beginner",
    "difficulty": "easy",
    "estimatedDuration": 15,
    "completionCount": 245,
    "averageRating": 4.8
  }
]
```

### Get Single Lesson

**GET** `/lessons/:lessonId`

Get a specific lesson by ID.

### Get Lesson by Slug

**GET** `/lessons/slug/:slug`

Get a specific lesson by its slug.

### Get Lessons by Leg

**GET** `/lessons/leg/:legNumber`

Get all lessons for a specific leg (1-4).

**Query Parameters:**
- `stage` (optional): Filter by target stage

### Get Recommended Lessons

**GET** `/lessons/recommended/:userId`

Get personalized lesson recommendations based on user's current stage and focus leg.

**Response:**
```json
{
  "user": {
    "stage": "Intermediate",
    "focusLeg": "Money Moves"
  },
  "lessons": [
    {
      "lessonTitle": "Creating Multiple Income Streams",
      "difficulty": "moderate",
      "estimatedDuration": 20
    }
  ]
}
```

### Complete Lesson

**POST** `/lessons/complete`

Mark a lesson as completed and create action items.

**Request Body:**
```json
{
  "userId": "user123",
  "lessonId": "lesson123",
  "rating": 5,
  "notes": "Great insights on income diversification"
}
```

**Response:**
```json
{
  "message": "Lesson completed successfully!",
  "lesson": {
    "title": "Creating Multiple Income Streams",
    "completionCount": 246,
    "averageRating": 4.8
  },
  "user": {
    "lessonsCompleted": 6
  },
  "nextRecommended": ["lesson456", "lesson789"]
}
```

### Get Completed Lessons

**GET** `/lessons/completed/:userId`

Get all lessons completed by a user.

---

## The Four Legs Framework

Coach ManLaw operates on the **Four Legs of a Billionaire Table** framework:

### 1. Mindset Mystery (Leg 1)
- Identity in Christ
- Belief systems
- Vision clarity
- Spiritual alignment

### 2. Money Moves (Leg 2)
- Income generation
- Investment strategy
- Asset protection
- Systems automation

### 3. Legacy Mission (Leg 3)
- System design
- Purpose alignment
- Generational wealth
- Impact measurement

### 4. Movement Momentum (Leg 4)
- Community building
- Emotional intelligence
- Networking
- Visibility

---

## BTSS Scoring System

### Score Ranges

| Score Range | Phase | Table Stability |
|-------------|-------|-----------------|
| 76-100 | Mastery | Mastery |
| 51-75 | Strength | Strength |
| 26-50 | Growth | Growth |
| 0-25 | Foundation | Foundation |

### Overall BTSS Calculation

```
Overall BTSS = (Mindset + Money + Legacy + Movement) / 4
```

The **weakest leg** determines the coach's primary focus area for the user.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Configuration

### Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `AI_PROVIDER` - 'claude' or 'openai'
- `ENABLE_REAL_TIME_AI` - true/false (enables real AI vs placeholder)
- `CLAUDE_API_KEY` - Your Claude API key
- `OPENAI_API_KEY` - Your OpenAI API key

---

## Development Mode

When `ENABLE_REAL_TIME_AI=false`, the API uses intelligent placeholder responses that simulate coaching conversations without making actual AI API calls. This is useful for:

- Development without API costs
- Testing workflows
- Offline development

---

## Rate Limiting

API requests are rate-limited to:
- 100 requests per 15 minutes per IP address

---

## Support

For API support or questions:
- Email: dev@zero2billionaires.com
- Documentation: https://docs.zero2billionaires.com

---

**Built with faith, powered by AI, designed for Legacy Builders** 🚀
