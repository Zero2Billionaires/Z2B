# MANLAW AI COACH - Project Brief

## Overview
Manlaw is a Heavenly Inspired AI Coach built on the Zero2Billionaires framework, integrated within a Network Marketing Community Platform. It teaches the 4 Legs of a Billionaire Table framework to transform members from employees to entrepreneurs.

## Platform Ecosystem

```
Main App: Network Marketing Community Platform
│
├── 🏛️ MANLAW (Zero2Billionaires AI Coach) ⭐ [BUILDING]
│   └── Core coaching engine using 4 Legs Framework
│
├── 📱 Automated Social Media App
│   └── Content creation & distribution
│
├── 💼 Automated Sales App
│   └── Sales funnels & lead generation
│
└── 🚀 Instant App Builder
    └── Custom business apps for members
```

## Manlaw's Purpose

**Teaches** → Tools **Execute**

Manlaw provides the education and coaching, while the three tool apps help members implement what they learn.

## The 4 Legs Framework

### Leg 1: Mindset Mystery (Inner Foundation)
- Identity in Christ
- Biblical money beliefs
- Vision and purpose
- Mental resilience
- **30 lessons**

### Leg 2: Money Moves & Business Systems (Financial Engine)
- Biblical stewardship
- 7 income streams
- Business systems (Admin, HR, Finance, Marketing, etc.)
- Wealth building
- **40 lessons**

### Leg 3: Legacy Mission (System Builder)
- Mission discovery
- Business model design
- System building
- Scaling strategies
- **30 lessons**

### Leg 4: Movement Momentum (Legacy Multiplier)
- Emotional intelligence
- Strategic networking
- Personal branding
- Community building
- **30 lessons**

## Core Features

### 1. AI Coach Chat Interface
- Claude Sonnet 4.5 integration
- Context-aware conversations
- Biblical wisdom integration
- Personalized guidance based on BTSS scores
- Conversation history persistence

### 2. BTSS Tracking
**Billionaire Table Stability Score (0-100 per leg)**
- Tracks strength of each leg
- Identifies weakest leg for focus
- Calculates stability factor
- Shows progress over time

### 3. Dashboard
- Four Legs visual table representation
- Current BTSS scores
- Daily mission assignments
- Progress graphs
- Quick actions

### 4. Lesson Library (120+ Lessons)
- IMPACT Method delivery:
  - I: Identify the Pain/Opportunity
  - M: Model/Principle Introduction
  - P: Proof/Story
  - A: Application Steps
  - C: Challenge Assignment
  - T: Transformation Check

### 5. Daily Check-In System
- Morning momentum check
- Weekly progress review
- Monthly deep reflection
- Triggered check-ins (when stuck/silent)

### 6. Community Platform
- The Plaza (open forum)
- The Guilds (per-leg focus groups)
- Masterminds (50+ BTSS members)

### 7. Goals & Vision Tracking
- Mission statement builder
- Vision board creation
- 90-day goal setting
- Milestone celebrations

## Integration Points

### Data Flow
```
User completes Manlaw lesson
    ↓
Manlaw assigns practical challenge
    ↓
User executes using Tools apps
    ↓
Tools report activity back to Manlaw
    ↓
Manlaw celebrates wins & adjusts coaching
```

### Example Integration
1. Manlaw teaches Lesson 3.20: "Digital Marketing Essentials"
2. User learns content marketing strategy
3. Manlaw assigns: "Create 30-day content calendar"
4. User opens Social Media App
5. Social Media App says: "Manlaw sent me! Let's implement your lesson"
6. User schedules posts
7. Social Media App reports back to Manlaw
8. Manlaw celebrates: "Great work! Your Leg 4 score increased!"

## Technical Architecture

### Frontend Structure
```
src/apps/manlaw/
├── screens/
│   ├── ManlawChat.tsx
│   ├── Dashboard.tsx
│   ├── LessonLibrary.tsx
│   ├── LessonDetail.tsx
│   ├── DailyCheckIn.tsx
│   └── onboarding/
├── components/
│   ├── FourLegsTable.tsx
│   ├── BTSSScoreCard.tsx
│   ├── ChatMessage.tsx
│   └── ScriptureCard.tsx
├── services/
│   ├── aiCoach.ts
│   ├── contextManager.ts
│   └── btssCalculator.ts
├── hooks/
│   ├── useManlawChat.ts
│   ├── useBTSS.ts
│   └── useLessons.ts
└── data/
    ├── prompts/manlaw-prompt.ts
    └── lessons/[lesson-files].json
```

### Backend Structure
```
backend/routes/
├── manlaw.routes.js
backend/controllers/
├── manlaw.controller.js
backend/models/
├── ManlawProfile.js
├── ManlawLesson.js
├── ManlawChat.js
└── ManlawCheckIn.js
backend/services/
└── claude.service.js
```

### Database Schema
```sql
-- Manlaw Profile
manlaw_profiles (
  user_id,
  btss_leg1, btss_leg2, btss_leg3, btss_leg4,
  overall_btss, stability_factor,
  current_stage, mission_statement,
  vision_board_url, created_at, updated_at
)

-- Lesson Progress
manlaw_lesson_progress (
  user_id, lesson_id, status,
  completed_at, challenge_completed,
  reflection_notes
)

-- Chat History
manlaw_chat_messages (
  user_id, role, message,
  context_data, created_at
)

-- Check-ins
manlaw_checkins (
  user_id, type, energy_level,
  alignment_score, obstacles, wins, created_at
)

-- Goals
manlaw_goals (
  user_id, goal_text, category,
  timeframe, status, created_at
)
```

## AI Coaching System

### Claude Integration
- Model: Claude Sonnet 4.5 (claude-sonnet-4-20250514)
- Full Z2B prompt (see z2b-full-prompt.md)
- Context includes:
  - Current BTSS scores
  - Recent wins
  - Active goals
  - Tools usage stats
  - Spiritual assessment
  - Conversation history

### Adaptive Coaching Logic
Manlaw adjusts based on:
- User's emotional state
- Weakest leg (prioritizes)
- Stage of journey (beginner → master)
- Resistance patterns
- Spiritual maturity
- Tools utilization

## Development Phases

### Phase 1: Core (Weeks 1-4)
- [ ] Database schema
- [ ] API routes
- [ ] Claude integration
- [ ] Chat interface
- [ ] BTSS tracking
- [ ] Dashboard

### Phase 2: Content (Weeks 5-8)
- [ ] Import 120+ lessons
- [ ] Lesson delivery system
- [ ] Check-in system
- [ ] Progress tracking
- [ ] Onboarding flow

### Phase 3: Intelligence (Weeks 9-12)
- [ ] Context management
- [ ] Tools integration
- [ ] Adaptive coaching
- [ ] Community platform
- [ ] Goals & vision tools

## Success Metrics

- User engagement (daily active usage)
- BTSS score improvements
- Lesson completion rates
- Tools app activation rates
- Community participation
- Member transformation stories

## Key Differentiators

1. **Biblical Integration**: Kingdom business principles throughout
2. **Holistic Transformation**: Character + Business + Legacy
3. **AI-Powered Personalization**: Adapts to each user
4. **Tool Integration**: Teaching connects to execution
5. **Community Focus**: Network marketing optimized

## Next Steps

1. Set up project structure in VS Code
2. Configure Claude API access
3. Build chat interface
4. Implement BTSS system
5. Create lesson library
6. Design Four Legs dashboard

---

**Project Start Date**: [DATE]
**Building With**: Claude 4.5 Sonnet in VS Code
**Reference**: Full Z2B prompt (65 pages) in z2b-full-prompt.md