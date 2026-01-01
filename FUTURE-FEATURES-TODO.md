# Z2B Legacy Builders - Future Features TODO

## 🔮 Features to Add When Members Login is Built

### 1. Interactive Framework Tools (MEMBERS ONLY)

Once login/authentication system is implemented, add these interactive tools to the **Members Dashboard**:

#### 📊 4 Legs Assessment Tool
- Interactive quiz to assess strength in each leg:
  - Mindset (10 questions)
  - Systems (10 questions)
  - Relationships (10 questions)
  - Legacy (10 questions)
- Visual radar chart showing scores
- Personalized recommendations based on weakest leg
- Track progress over time
- Coach Manlaw AI integration for personalized advice

#### 🚀 7-Stage Journey Tracker
- Interactive progress map showing current stage
- Visual timeline with milestones
- Stage-by-stage checklist
- Achievement badges for completing stages
- Estimated completion dates
- Integration with milestone system
- Coach Manlaw guidance for current stage

#### 📈 TEEE System Calculator
- Measure progress in each pillar:
  - Transformation (mindset shifts tracked)
  - Education (skills & knowledge gained)
  - Empowerment (actions taken)
  - Enrichment (income & wealth created)
- Visual dashboard with graphs
- Monthly/quarterly reports
- Goal setting and tracking
- AI-powered insights from Coach Manlaw

### 2. Members Dashboard Structure

```
Members Area (Login Required)
├── My Dashboard
├── Framework Tools ⭐ NEW
│   ├── 4 Legs Assessment
│   ├── 7-Stage Journey Tracker
│   └── TEEE System Calculator
├── My Milestones
├── My Apps
├── My TLI
└── Coach Manlaw Chat
```

### 3. Implementation Notes

**Navigation:**
- Public (no login): Home, About, Milestones, Ecosystem, Tiers, TLI
- Members (logged in): All public + Framework Tools, My Dashboard, My Profile

**Access Control:**
- Framework Tools menu only appears when logged in
- Redirect to login page if trying to access without authentication
- Save progress in user account database

**Integration:**
- Connect with existing milestone system
- Pull data from VisionBoard and SkillsAssessment
- Integrate with Coach Manlaw AI
- Track TLI progress
- Sync with membership tier

### 4. Technical Requirements

**Frontend:**
- Login/Register components
- Protected routes (React Router)
- User context/state management
- Dashboard layout components

**Backend:**
- User authentication API (already exists on Railway/PHP)
- Framework assessment APIs
- Progress tracking endpoints
- Data persistence

**Database Schema:**
- User profiles
- Framework assessment scores
- Journey stage tracking
- TEEE metrics
- Historical data for progress charts

---

## 📝 Current Status

- ✅ Framework menu REMOVED from public navigation
- ✅ About section contains static Framework content (4 Legs, 7 Stages, TEEE)
- ⏳ Interactive Framework tools - TO BE BUILT for members area
- ⏳ Login/Authentication system - NEEDED FIRST

---

## 🎯 Implementation Priority

1. **Phase 1** (Current): Public website with static content ✅
2. **Phase 2**: Build login/authentication system
3. **Phase 3**: Create members dashboard
4. **Phase 4**: Add interactive Framework tools
5. **Phase 5**: Integrate Coach Manlaw AI fully

---

**Note:** Do NOT add Framework menu back to public navigation.
Interactive tools are MEMBERS ONLY features!
