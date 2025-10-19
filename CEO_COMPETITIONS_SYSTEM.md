# CEO Competitions System

## Overview
The CEO Competitions system allows the Z2B CEO to create, manage, and publish quarterly competitions to incentivize members and drive business growth.

## System Components

### 1. Database Model (`server/models/CEOCompetition.js`)
The competition model includes:
- **Basic Information**: Title, description, quarter, year, dates
- **Target Configuration**: Type, value, and description of goals
- **Eligibility**: Minimum tier requirements
- **Prizes**: First, second, third place, and additional prizes
- **Participants**: Auto-enrollment and progress tracking
- **Winners**: Final results and payment status

### 2. API Routes (`server/routes/ceoCompetitionRoutes.js`)
Available endpoints:

#### Public/Member Endpoints:
- `GET /api/ceo-competitions` - Get all competitions (with filters)
- `GET /api/ceo-competitions/:id` - Get single competition details
- `GET /api/ceo-competitions/:id/leaderboard` - Get competition leaderboard
- `GET /api/ceo-competitions/member/:memberId` - Get member's competitions

#### Admin/CEO Endpoints:
- `POST /api/ceo-competitions` - Create new competition
- `PUT /api/ceo-competitions/:id` - Update competition
- `POST /api/ceo-competitions/:id/publish` - Publish competition
- `POST /api/ceo-competitions/:id/activate` - Activate competition
- `POST /api/ceo-competitions/:id/finalize` - Finalize and select winners
- `POST /api/ceo-competitions/:id/update-progress` - Update participant progress
- `PUT /api/ceo-competitions/:id/winners/:position/payment` - Update payment status
- `DELETE /api/ceo-competitions/:id` - Delete draft competition

### 3. Admin Interface (`Z2B-v21/admin/ceo-competitions.html`)
Full-featured CEO dashboard for competition management:

**Features:**
- **Statistics Dashboard**: Total competitions, active count, prize pools, participants
- **Tabs**: View all, drafts, active, and completed competitions
- **Create/Edit**: Comprehensive form for competition setup
- **Publish**: One-click publishing to make competitions visible to members
- **Finalize**: Automatic winner selection based on leaderboard
- **Delete**: Remove draft competitions

**Competition Creation Form:**
- Title and description
- Quarter and year selection
- Start and end dates
- Target type (sales, recruits, team PV, personal PV, team growth, custom)
- Target value and description
- Eligibility (minimum tier requirement)
- Prize structure (1st, 2nd, 3rd place with amounts, types, and descriptions)

### 4. Member Interface (`Z2B-v21/app/competitions.html`)
Member-facing page to view and participate in competitions:

**Features:**
- **Active Competitions**: Shows live competitions with countdown timers
- **Upcoming Competitions**: Published but not yet started
- **Past Competitions**: Completed competitions with winners
- **Personal Progress**: Track individual performance with progress bars
- **Leaderboards**: Live rankings showing top performers
- **Auto-Enrollment**: Members can join competitions with one click

**Display Elements:**
- Competition details (title, description, dates)
- Prize information with visual hierarchy (gold/silver/bronze)
- Real-time countdown timers
- Progress tracking with percentage completion
- Top 5 leaderboard with rankings
- Winner announcements for completed competitions

### 5. Competition Tracking (`Z2B-v21/includes/MLMCalculator.php`)
Automatic progress tracking methods:

**Functions:**
- `updateCompetitionProgress()` - Updates member progress when transactions occur
- `isEligibleForCompetition()` - Checks tier and activity requirements
- `calculateCompetitionProgress()` - Calculates progress based on target type

**Target Types Supported:**
- **sales**: Total sales amount (ISP transactions)
- **recruits**: Number of new recruits during period
- **team_pv**: Total team PV (ISP + TSC + QPB)
- **personal_pv**: Personal PV only
- **team_growth**: Team growth percentage
- **custom**: Custom metrics

## Competition Lifecycle

### 1. Draft Stage
- CEO creates competition
- Can edit all details
- Not visible to members
- Can be deleted

### 2. Published Stage
- CEO publishes competition
- Visible to all eligible members
- Start date is in the future
- Cannot be deleted

### 3. Active Stage
- Competition start date has arrived
- Members can participate
- Progress is tracked automatically
- Leaderboard updates in real-time
- Cannot be edited

### 4. Completed Stage
- End date reached
- CEO finalizes competition
- Winners selected automatically
- Prizes awarded
- Results visible to all

## How to Use (CEO Instructions)

### Creating a Competition:

1. **Navigate** to `/admin/ceo-competitions.html`
2. **Click** "Create Competition" button
3. **Fill in** competition details:
   - Enter a compelling title (e.g., "Q1 2026 Sales Championship")
   - Write a motivating description
   - Select quarter and year
   - Set start and end dates
   - Choose target type (what members will compete on)
   - Set target value (goal to reach)
   - Choose minimum tier (or "All Members")
   - Configure prizes for 1st, 2nd, and 3rd place

4. **Save** as draft - Competition is created but not visible
5. **Review** competition details
6. **Publish** when ready - Competition becomes visible to members
7. **Monitor** - Track participation and leaderboard during competition
8. **Finalize** - Select winners and award prizes when competition ends

### Managing Active Competitions:

- View real-time leaderboards
- Monitor participant counts
- Track prize pool totals
- Update payment status for winners
- View detailed analytics

### Best Practices:

1. **Plan Ahead**: Create competitions at the start of each quarter
2. **Clear Goals**: Make target descriptions specific and achievable
3. **Motivating Prizes**: Set prize amounts that drive participation
4. **Fair Competition**: Set appropriate tier requirements
5. **Timely Finalization**: Award prizes promptly after competition ends

## Member Experience

### Viewing Competitions:

1. **Navigate** to `/app/competitions.html`
2. **Browse** active, upcoming, and past competitions
3. **View** prize information and competition rules
4. **Check** personal progress and ranking
5. **Track** countdown timers for active competitions

### Participating:

- Members are **automatically enrolled** when they meet eligibility criteria
- Progress is **tracked automatically** based on sales and activities
- **Real-time updates** to leaderboard positions
- **Visual progress bars** show achievement percentage
- **Notifications** for ranking changes (future feature)

## Prize Types

The system supports various prize types:

1. **Cash**: Direct cash rewards
2. **Car**: Vehicle incentives
3. **Trip/Holiday**: Travel rewards
4. **Bonus**: Performance bonuses
5. **Product**: Physical products
6. **Custom**: Any other prize type

## Technical Details

### Auto-Enrollment
Members are automatically enrolled in competitions when:
- They meet the minimum tier requirement
- Competition is active or published
- They perform qualifying activities

### Progress Calculation
Progress is calculated based on target type:
- Updated after each qualifying transaction
- Cached for performance
- Leaderboard sorted by progress value

### Winner Selection
When CEO finalizes competition:
1. Participants sorted by progress (highest first)
2. Only participants meeting target value qualify
3. Top 3 assigned prizes automatically
4. Payment status set to "pending"
5. Notifications sent (future feature)

## Database Schema

### CEOCompetition Model:
```javascript
{
  title: String,
  description: String,
  quarter: String (Q1-Q4),
  year: Number,
  startDate: Date,
  endDate: Date,
  status: String (draft/published/active/completed),
  targetType: String (sales/recruits/team_pv/personal_pv/team_growth/custom),
  targetValue: Number,
  targetDescription: String,
  eligibility: {
    minTier: String,
    allMembers: Boolean
  },
  prizes: {
    first: { amount, type, description },
    second: { amount, type, description },
    third: { amount, type, description }
  },
  totalPrizePool: Number,
  participants: [{
    memberId, memberName, membershipNumber, tier,
    joinedAt, currentProgress, lastUpdated
  }],
  winners: [{
    position, memberId, memberName, membershipNumber,
    finalScore, prizeAmount, prizeType, prizeDescription,
    awardedAt, paymentStatus
  }],
  publishedAt: Date,
  completedAt: Date
}
```

## Access Control

### CEO/Admin Access:
- Full CRUD operations on competitions
- Publish and finalize competitions
- Update winner payment status
- View all analytics

### Member Access:
- View published and active competitions
- View own participation and progress
- View leaderboards
- Join competitions (auto-enrollment)

## Future Enhancements

1. **Email Notifications**: Notify members of new competitions and results
2. **Push Notifications**: Real-time alerts for ranking changes
3. **Team Competitions**: Allow team-based competitions
4. **Multi-Prize Tiers**: Support more than 3 prize positions
5. **Custom Metrics**: Advanced custom competition types
6. **Analytics Dashboard**: Detailed competition performance analytics
7. **Social Sharing**: Share achievements on social media
8. **Gamification**: Badges and achievements for participation

## Files Modified/Created

### Created:
1. `server/models/CEOCompetition.js` - Competition database model
2. `server/routes/ceoCompetitionRoutes.js` - API routes
3. `Z2B-v21/admin/ceo-competitions.html` - CEO admin interface
4. `Z2B-v21/app/competitions.html` - Member interface
5. `CEO_COMPETITIONS_SYSTEM.md` - This documentation

### Modified:
1. `server/server.js` - Added competition routes
2. `Z2B-v21/includes/MLMCalculator.php` - Added competition tracking methods

## Support

For questions or issues with the CEO Competitions system:
- Contact: support@z2blegacybuilders.co.za
- Documentation: https://z2blegacybuilders.co.za/docs/competitions
- Admin Guide: `/admin/ceo-competitions.html`

---

**Built with ❤️ for Z2B Legacy Builders**
*Empowering members to achieve greatness through faith, business, and competition*
