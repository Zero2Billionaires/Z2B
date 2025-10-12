# MANLAW Implementation Checklist

## Phase 1: Foundation (Week 1)

### Day 1-2: Project Setup
- [ ] Create `/src/apps/manlaw` folder structure
- [ ] Create `/backend/routes/manlaw.routes.js`
- [ ] Create `/backend/controllers/manlaw.controller.js`
- [ ] Create `/backend/models/` for Manlaw entities
- [ ] Set up environment variables for Claude API
- [ ] Install required dependencies:
  - [ ] `@anthropic-ai/sdk` (Claude)
  - [ ] Database ORM (if not already installed)

### Day 3-4: Database Setup
- [ ] Create `manlaw_profiles` table
- [ ] Create `manlaw_lesson_progress` table
- [ ] Create `manlaw_chat_messages` table
- [ ] Create `manlaw_checkins` table
- [ ] Create `manlaw_goals` table
- [ ] Set up relationships with main `users` table
- [ ] Create migration files
- [ ] Run migrations
- [ ] Test database connections

### Day 5-7: Core Services
- [ ] Create `services/aiCoach.ts`
  - [ ] Claude API connection
  - [ ] Prompt management
  - [ ] Context building
  - [ ] Response parsing
- [ ] Create `services/contextManager.ts`
  - [ ] User context retrieval
  - [ ] BTSS score calculation
  - [ ] Tools activity tracking
  - [ ] Conversation history
- [ ] Create `services/btssCalculator.ts`
  - [ ] Score calculation logic
  - [ ] Stability factor calculation
  - [ ] Progress tracking
- [ ] Test all services independently

---

## Phase 2: Backend API (Week 2)

### API Routes Setup
- [ ] `POST /api/manlaw/chat` - Send message to AI coach
- [ ] `GET /api/manlaw/chat/history` - Get conversation history
- [ ] `GET /api/manlaw/profile` - Get Manlaw profile
- [ ] `PUT /api/manlaw/profile` - Update profile
- [ ] `GET /api/manlaw/btss` - Get BTSS scores
- [ ] `POST /api/manlaw/checkin` - Submit check-in
- [ ] `GET /api/manlaw/lessons` - Get lesson library
- [ ] `GET /api/manlaw/lessons/:id` - Get specific lesson
- [ ] `POST /api/manlaw/lessons/:id/complete` - Mark lesson complete
- [ ] `GET /api/manlaw/goals` - Get goals
- [ ] `POST /api/manlaw/goals` - Create goal
- [ ] `PUT /api/manlaw/goals/:id` - Update goal
- [ ] `DELETE /api/manlaw/goals/:id` - Delete goal

### Controllers Implementation
- [ ] `chatController.js` - Handle AI conversations
- [ ] `profileController.js` - Manage user Manlaw profile
- [ ] `lessonController.js` - Lesson delivery & tracking
- [ ] `checkinController.js` - Check-in logic
- [ ] `goalController.js` - Goal management

### Middleware
- [ ] Authentication check (use existing)
- [ ] Rate limiting for AI calls
- [ ] Error handling
- [ ] Request logging

### Testing
- [ ] Test all endpoints with Postman/Insomnia
- [ ] Verify authentication works
- [ ] Test error handling
- [ ] Load test AI chat endpoint

---

## Phase 3: Frontend - Chat Interface (Week 3)

### Components
- [ ] `ManlawChat.tsx` - Main chat screen
  - [ ] Message list
  - [ ] Input field
  - [ ] Send button
  - [ ] Typing indicator
  - [ ] Scroll to bottom
  - [ ] Message timestamps
- [ ] `ChatMessage.tsx` - Individual message component
  - [ ] User message style
  - [ ] AI message style
  - [ ] Scripture highlighting
  - [ ] Markdown rendering
- [ ] `QuickActions.tsx` - Suggested action buttons
- [ ] `ScriptureCard.tsx` - Highlighted Bible verses

### Hooks
- [ ] `useManlawChat.ts`
  - [ ] Send message function
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Message history
  - [ ] Context management
- [ ] `useChatHistory.ts` - Fetch past conversations
- [ ] `useTypingIndicator.ts` - Show AI "thinking"

### Services (Frontend)
- [ ] `manlawAPI.ts` - API calls to backend
  - [ ] `sendMessage()`
  - [ ] `getChatHistory()`
  - [ ] `getProfile()`
  - [ ] etc.

### Testing
- [ ] Test message sending
- [ ] Test message receiving
- [ ] Test conversation history loading
- [ ] Test error states
- [ ] Test offline handling

---

## Phase 4: Dashboard & BTSS (Week 4)

### Dashboard Components
- [ ] `Dashboard.tsx` - Main dashboard screen
  - [ ] Four Legs visualization
  - [ ] BTSS score display
  - [ ] Daily mission card
  - [ ] Quick stats
  - [ ] Navigation to other sections
- [ ] `FourLegsTable.tsx` - Visual table representation
  - [ ] 4 pillars with scores
  - [ ] Color coding (red/yellow/green)
  - [ ] Tap to view leg details
  - [ ] Animation on load
- [ ] `BTSSScoreCard.tsx` - Score display component
  - [ ] Overall BTSS
  - [ ] Individual leg scores
  - [ ] Stability factor
  - [ ] Progress indicator
- [ ] `ProgressChart.tsx` - Graph showing progress over time
- [ ] `DailyMission.tsx` - Today's assignment

### Hooks
- [ ] `useBTSS.ts`
  - [ ] Fetch BTSS scores
  - [ ] Calculate stability
  - [ ] Track progress
  - [ ] Update scores
- [ ] `useDashboard.ts` - Dashboard data aggregation

### BTSS Calculation Logic
- [ ] Calculate Leg 1 score (Mindset Mystery)
- [ ] Calculate Leg 2 score (Money Moves)
- [ ] Calculate Leg 3 score (Legacy Mission)
- [ ] Calculate Leg 4 score (Movement Momentum)
- [ ] Calculate overall BTSS
- [ ] Calculate stability factor
- [ ] Determine weakest leg
- [ ] Determine current stage (beginner/intermediate/advanced/master)

### Testing
- [ ] Test BTSS calculation accuracy
- [ ] Test dashboard data loading
- [ ] Test Four Legs visualization
- [ ] Test score updates

---

## Phase 5: Lessons System (Week 5-6)

### Lesson Data
- [ ] Create JSON files for all 120+ lessons
  - [ ] Leg 1: 30 lessons (Mindset Mystery)
  - [ ] Leg 2: 40 lessons (Money Moves & Systems)
  - [ ] Leg 3: 30 lessons (Legacy Mission)
  - [ ] Leg 4: 30 lessons (Movement Momentum)
- [ ] Format lessons in IMPACT Method structure

### Lesson Components
- [ ] `LessonLibrary.tsx` - Browse all lessons
  - [ ] Filter by leg
  - [ ] Search functionality
  - [ ] Progress indicators
  - [ ] Recommended next lesson
- [ ] `LessonDetail.tsx` - View single lesson
  - [ ] IMPACT Method sections
  - [ ] Challenge assignment
  - [ ] Reflection prompts
  - [ ] Mark as complete
- [ ] `LessonCard.tsx` - Lesson preview card
- [ ] `ChallengeCard.tsx` - Challenge assignment display

### Hooks
- [ ] `useLessons.ts`
  - [ ] Fetch lesson library
  - [ ] Track progress
  - [ ] Mark complete
  - [ ] Submit challenge
  - [ ] Get next recommended lesson

### Lesson Tracking
- [ ] Track lesson starts
- [ ] Track lesson completions
- [ ] Track challenge completions
- [ ] Update BTSS scores based on progress
- [ ] Generate certificates for leg completion

### Testing
- [ ] Test lesson loading
- [ ] Test progress tracking
- [ ] Test completion flow
- [ ] Test BTSS updates after completion

---

## Phase 6: Check-In System (Week 7)

### Check-In Components
- [ ] `DailyCheckIn.tsx` - Morning momentum check
  - [ ] Energy level slider (1-10)
  - [ ] Alignment score (1-10)
  - [ ] Obstacles text input
  - [ ] Wins celebration
  - [ ] Submit button
- [ ] `WeeklyReview.tsx` - Weekly progress review
- [ ] `MonthlyReflection.tsx` - Deep monthly check-in
- [ ] `CheckInHistory.tsx` - View past check-ins

### Hooks
- [ ] `useCheckIn.ts`
  - [ ] Submit check-in
  - [ ] Get check-in history
  - [ ] Calculate streaks
  - [ ] Trigger notifications

### Check-In Logic
- [ ] Daily check-in (morning)
- [ ] Weekly review (Sunday evening)
- [ ] Monthly reflection (end of month)
- [ ] Triggered check-ins (when user is stuck/silent)
- [ ] Streak tracking (consecutive days)

### Notifications
- [ ] Morning check-in reminder
- [ ] Weekly review reminder
- [ ] Celebrate streaks (7, 30, 90, 365 days)
- [ ] Triggered when user hasn't checked in

### Testing
- [ ] Test check-in submission
- [ ] Test history retrieval
- [ ] Test streak calculation
- [ ] Test notification triggers

---

## Phase 7: Onboarding Flow (Week 8)

### Onboarding Screens
- [ ] `Welcome.tsx` - Welcome message & philosophy
- [ ] `Assessment.tsx` - Spiritual & discovery questions
- [ ] `BTSSBaseline.tsx` - Initial BTSS calculation
- [ ] `VisionCasting.tsx` - 5-year vision exercise
- [ ] `FirstLesson.tsx` - Assign first lesson
- [ ] `CommunityIntro.tsx` - Introduce community

### Onboarding Logic
- [ ] Step-by-step wizard
- [ ] Progress indicator
- [ ] Skip/back navigation
- [ ] Data persistence
- [ ] Calculate initial BTSS scores
- [ ] Assign first lesson based on weakest leg
- [ ] Create user Manlaw profile

### Testing
- [ ] Test full onboarding flow
- [ ] Test data persistence
- [ ] Test BTSS calculation
- [ ] Test lesson assignment

---

## Phase 8: Goals & Vision (Week 9)

### Goal Components
- [ ] `GoalsList.tsx` - View all goals
- [ ] `GoalDetail.tsx` - View single goal
- [ ] `CreateGoal.tsx` - Create new goal
- [ ] `EditGoal.tsx` - Edit existing goal
- [ ] `VisionBoard.tsx` - Visual vision board
- [ ] `MissionStatement.tsx` - Mission statement editor

### Hooks
- [ ] `useGoals.ts`
  - [ ] Fetch goals
  - [ ] Create goal
  - [ ] Update goal
  - [ ] Delete goal
  - [ ] Track progress

### Goal Types
- [ ] 90-day goals
- [ ] 1-year goals
- [ ] 5-year goals
- [ ] Category tags (by leg)
- [ ] Status tracking (active/completed/abandoned)

### Testing
- [ ] Test CRUD operations
- [ ] Test goal tracking
- [ ] Test vision board

---

## Phase 9: Integration & Polish (Week 10-11)

### Tools Integration
- [ ] Connect Social Media App activity to Manlaw
- [ ] Connect Sales App activity to Manlaw
- [ ] Connect App Builder activity to Manlaw
- [ ] Unified progress dashboard showing all apps
- [ ] Cross-app insights in AI coaching

### Context Enhancement
- [ ] Pull tools usage data into AI context
- [ ] Pull community activity into AI context
- [ ] Pull main app profile data into AI context
- [ ] Enhanced personalization

### Navigation
- [ ] Add Manlaw tab to main navigation
- [ ] Deep linking from notifications
- [ ] Back navigation consistency
- [ ] Tab state persistence

### Notifications
- [ ] Daily check-in reminders
- [ ] Lesson completion celebrations
- [ ] BTSS milestone achievements
- [ ] Community replies
- [ ] Goal deadline reminders

### Polish
- [ ] Loading states everywhere
- [ ] Error states with retry
- [ ] Offline handling
- [ ] Smooth animations
- [ ] Accessibility (a11y)
- [ ] Dark mode support (if applicable)

### Testing
- [ ] Full end-to-end testing
- [ ] Cross-app integration testing
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing

---

## Phase 10: Launch Prep (Week 12)

### Documentation
- [ ] User guide / Help section
- [ ] FAQ
- [ ] Video tutorials
- [ ] API documentation (internal)

### Analytics
- [ ] Track user engagement
- [ ] Track lesson completion rates
- [ ] Track BTSS improvements
- [ ] Track AI conversation metrics
- [ ] Track retention rates

### Admin Tools
- [ ] Dashboard to view all user BTSS scores
- [ ] Lesson analytics
- [ ] AI conversation monitoring
- [ ] User support tools

### Beta Testing
- [ ] Select 10-20 beta users
- [ ] Gather feedback
- [ ] Iterate on bugs
- [ ] Refine AI prompts based on conversations

### Launch
- [ ] Soft launch to existing users
- [ ] Monitor performance
- [ ] Quick bug fixes
- [ ] Gather testimonials
- [ ] Full public launch

---

## Ongoing Maintenance

### Weekly
- [ ] Monitor AI conversation quality
- [ ] Check for errors/bugs
- [ ] Review user feedback
- [ ] Update lessons as needed

### Monthly
- [ ] Analyze usage metrics
- [ ] Refine AI prompts
- [ ] Add new lessons
- [ ] Feature improvements

### Quarterly
- [ ] Major feature additions
- [ ] Performance optimization
- [ ] Security audits
- [ ] User surveys

---

## Success Metrics to Track

- Daily Active Users (DAU)
- Lesson Completion Rate
- Average BTSS Score Improvement
- AI Conversation Engagement
- Tools App Activation Rate
- Community Participation
- User Retention (30/60/90 day)
- Member Transformation Stories
- Revenue Impact (if applicable)

---

**Last Updated**: [DATE]
**Status**: [Current Phase]