# FAM Spillover System - Complete Guide

## Overview
The FAM Spillover System automatically redistributes team members from expired FAM accounts to qualified paid builders, encouraging upgrades while rewarding active builders.

---

## How It Works

### For FAM Members (Free Affiliates)
1. **90-Day Countdown Begins**: Upon registration, FAM members get a 90-day deadline to upgrade
2. **Build Your Team**: Can recruit and build a team during the 90 days
3. **Upgrade to Keep Team**: Must upgrade to a paid tier to keep their team permanently
4. **Team Loss Warning**: If deadline passes without upgrade, their team gets redistributed

### For Paid Builders
1. **Qualification**: Must generate 2+ personal sales to qualify for spillovers
2. **First-Come-First-Serve**: Qualified builders receive spillovers in order of qualification
3. **Automatic Distribution**: System distributes expired FAM teams daily at 2 AM
4. **Round-Robin Allocation**: Team members distributed evenly among qualified builders

---

## Key Business Rules

### FAM Member Rules
- ✅ **90-Day Grace Period** from registration date
- ✅ **Countdown Visible** in member dashboard
- ⚠️ **Warning at 14 Days** remaining
- ❌ **Team Redistribution** after deadline passes
- 💰 **Upgrade Anytime** to lock in team permanently

### Builder Qualification Rules
- Must have **2+ personal sales** (not just referrals)
- Must be on **paid tier** (not FAM)
- Account must be **ACTIVE** status
- Auto-qualified when personal sales hits 2

### Distribution Rules
- **First-Come-First-Serve**: Based on when builder qualified (2+ sales)
- **Round-Robin**: Each team member goes to next qualified builder
- **Space Check**: Only placed if builder has room (max 12 in phased matrix)
- **ISP Credit**: Team member's original sponsor still gets ISP for their upgrade

---

## API Endpoints

### 1. Get FAM Countdown Data
```http
GET /api/spillover/fam-countdown?userId={optional}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "referralCode": "Z2BXXX",
      "registeredDate": "2024-10-01T00:00:00.000Z",
      "deadline": "2024-12-30T00:00:00.000Z",
      "daysRemaining": 45,
      "isPastDeadline": false,
      "isWarningZone": false,
      "teamCount": 5,
      "status": "ACTIVE",
      "warningMessage": "✓ 45 days remaining"
    }
  ],
  "summary": {
    "total": 150,
    "expired": 12,
    "warning": 8,
    "active": 130
  }
}
```

**Status Values:**
- `ACTIVE`: More than 14 days remaining
- `WARNING`: 14 days or less remaining
- `EXPIRED`: Past deadline

---

### 2. Get Qualified Builders
```http
GET /api/spillover/qualified-builders
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Builder",
      "email": "jane@example.com",
      "referralCode": "Z2BYYY",
      "tier": "GOLD",
      "personalSales": 5,
      "qualifiedForSpillovers": true,
      "receivedSpillovers": 3,
      "currentTeamSize": 8,
      "availableSlots": 4
    }
  ],
  "totalQualified": 47
}
```

---

### 3. Process Spillover Distribution (Manual Trigger)
```http
POST /api/spillover/process-spillovers
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully distributed 15 team members from 3 expired FAM accounts",
  "expiredFAMs": 3,
  "distributions": 15,
  "details": [
    {
      "teamMember": "Member Name",
      "fromFAM": "Expired FAM Name",
      "toBuilder": "Qualified Builder Name",
      "builderEmail": "builder@example.com"
    }
  ]
}
```

---

### 4. Get Spillover Statistics
```http
GET /api/spillover/statistics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalFAMs": 150,
    "approachingDeadline": 8,
    "expiredFAMs": 12,
    "qualifiedBuilders": 47,
    "totalSpilloversDistributed": 125
  }
}
```

---

## Automatic Scheduler

### Configuration
- **Schedule**: Runs daily at 2:00 AM server time
- **Process**: Checks for expired FAM accounts and distributes teams
- **Logging**: Full audit trail of all distributions
- **Location**: `backend/scheduler/spilloverScheduler.js`

### Scheduler Logs
```bash
🔄 Spillover Scheduler Started
📅 Will run daily at 2:00 AM to process expired FAM members
⏰ Next spillover processing in 8 hours

# When running:
🔄 ===== AUTOMATED SPILLOVER PROCESSING STARTED =====
📅 Timestamp: 2024-10-28T02:00:00.000Z
✅ Spillover processing completed successfully
📊 Expired FAM accounts: 3
📦 Distributions made: 15

📋 Distribution Details:
  1. Member A (from FAM X) → Builder 1
  2. Member B (from FAM X) → Builder 2
  ...
===== AUTOMATED SPILLOVER PROCESSING COMPLETED =====
```

---

## Frontend Implementation

### 1. FAM Member Dashboard - Countdown Warning

Add this to the member dashboard (visible only to FAM members):

```javascript
// Fetch countdown data
async function loadFAMCountdown() {
    const response = await fetch(`${API_URL}/spillover/fam-countdown?userId=${currentUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success && data.data.length > 0) {
        const countdown = data.data[0];
        displayCountdownWarning(countdown);
    }
}

function displayCountdownWarning(countdown) {
    const warningDiv = document.getElementById('famCountdownWarning');

    let bgColor, borderColor, icon;
    if (countdown.isPastDeadline) {
        bgColor = '#ffebee';
        borderColor = '#f44336';
        icon = '⚠️';
    } else if (countdown.isWarningZone) {
        bgColor = '#fff3cd';
        borderColor = '#ffc107';
        icon = '⏰';
    } else {
        bgColor = '#e8f5e9';
        borderColor = '#4caf50';
        icon = '✓';
    }

    warningDiv.innerHTML = `
        <div style="background: ${bgColor}; padding: 1.5rem; border-radius: 8px; border-left: 4px solid ${borderColor}; margin-bottom: 1rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: #333;">
                ${icon} FAM Membership Status
            </h4>
            <p style="margin: 0.5rem 0; font-size: 1.1rem; font-weight: bold;">
                ${countdown.warningMessage}
            </p>
            ${countdown.teamCount > 0 ? `
                <p style="margin: 0.5rem 0; color: #666;">
                    You have <strong>${countdown.teamCount} team members</strong>.
                    ${countdown.isPastDeadline
                        ? 'Your team has been redistributed to active builders.'
                        : 'Upgrade now to keep them permanently!'}
                </p>
            ` : ''}
            ${!countdown.isPastDeadline ? `
                <button onclick="window.location.href='tiers.html'"
                        style="padding: 0.8rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 0.8rem;">
                    <i class="fas fa-arrow-up"></i> Upgrade Now
                </button>
            ` : ''}
        </div>
    `;
}
```

---

### 2. Admin Panel - Spillover Management

Add this section to the admin panel:

```html
<!-- Spillover Statistics Card -->
<div class="stat-card">
    <h3><i class="fas fa-share-alt"></i> FAM Spillover System</h3>
    <div id="spilloverStats">Loading...</div>
    <button onclick="loadSpilloverData()" class="btn-primary">
        <i class="fas fa-sync"></i> Refresh Data
    </button>
    <button onclick="manualSpilloverTrigger()" class="btn-warning">
        <i class="fas fa-play"></i> Manual Trigger
    </button>
</div>
```

```javascript
async function loadSpilloverData() {
    const response = await fetch(`${API_URL}/spillover/statistics`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();

    if (data.success) {
        document.getElementById('spilloverStats').innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0;">
                <div class="mini-stat">
                    <div class="stat-value">${data.statistics.totalFAMs}</div>
                    <div class="stat-label">Total FAMs</div>
                </div>
                <div class="mini-stat warning">
                    <div class="stat-value">${data.statistics.approachingDeadline}</div>
                    <div class="stat-label">Expiring Soon</div>
                </div>
                <div class="mini-stat error">
                    <div class="stat-value">${data.statistics.expiredFAMs}</div>
                    <div class="stat-label">Expired FAMs</div>
                </div>
                <div class="mini-stat success">
                    <div class="stat-value">${data.statistics.qualifiedBuilders}</div>
                    <div class="stat-label">Qualified Builders</div>
                </div>
            </div>
            <div style="text-align: center; padding: 0.8rem; background: #e3f2fd; border-radius: 8px; margin-top: 1rem;">
                <strong>${data.statistics.totalSpilloversDistributed}</strong> team members redistributed to date
            </div>
        `;
    }
}

async function manualSpilloverTrigger() {
    if (!confirm('Manually trigger spillover distribution? This will process all expired FAM accounts immediately.')) {
        return;
    }

    const response = await fetch(`${API_URL}/spillover/process-spillovers`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    if (result.success) {
        alert(`✅ ${result.message}\n\nExpired FAMs: ${result.expiredFAMs}\nDistributions: ${result.distributions}`);
        loadSpilloverData(); // Refresh stats
    } else {
        alert(`❌ ${result.message}`);
    }
}
```

---

## Testing the System

### 1. Test FAM Registration
```javascript
// Create test FAM member
POST /api/users
{
  "name": "Test FAM User",
  "email": "test.fam@example.com",
  "phone": "+27123456789",
  "tier": "FAM",
  "password": "Test@123"
}

// Check their countdown
GET /api/spillover/fam-countdown?userId={userId}
```

### 2. Test Builder Qualification
```javascript
// Create builder
POST /api/users
{
  "name": "Test Builder",
  "email": "builder@example.com",
  "tier": "BRONZE",
  "personalSales": 2  // Qualifies immediately
}

// Verify qualification
GET /api/spillover/qualified-builders
```

### 3. Test Manual Spillover
```javascript
// Manually expire a FAM (for testing)
// Update famUpgradeDeadline to yesterday in MongoDB

// Trigger spillover
POST /api/spillover/process-spillovers
```

---

## Monitoring & Maintenance

### Daily Checks
1. Review spillover scheduler logs
2. Check spillover statistics
3. Monitor qualified builders count
4. Verify FAM members approaching deadline

### Weekly Tasks
1. Analyze spillover distribution patterns
2. Check for any stuck/failed distributions
3. Review builder qualification rates
4. Monitor FAM upgrade conversion rates

### Monthly Reports
- Total FAM registrations
- FAM upgrade conversion rate
- Spillovers distributed
- Top builders receiving spillovers
- Average team size before spillover

---

## Troubleshooting

### Issue: Scheduler Not Running
```bash
# Check server logs
✅ Look for: "🔄 Spillover Scheduler Started"
❌ If missing: Check spilloverScheduler.js import in server.js
```

### Issue: No Qualified Builders
```bash
# Query database
db.users.find({ personalSales: { $gte: 2 }, tier: { $ne: 'FAM' } })

# Solution: Builders need 2+ personal sales to qualify
```

### Issue: Distributions Not Happening
```bash
# Check expired FAMs
GET /api/spillover/fam-countdown

# Manual trigger
POST /api/spillover/process-spillovers

# Check scheduler logs for errors
```

---

## Security Considerations

1. **Authorization**: All spillover endpoints require authentication
2. **Manual Trigger**: Restricted to admin only
3. **Audit Trail**: All distributions logged with full details
4. **Data Integrity**: Transactions ensure atomic operations
5. **Email Notifications**: Send alerts to affected members (future enhancement)

---

## Future Enhancements

- [ ] Email notifications to FAM members at 30/14/7 days
- [ ] Email notifications to builders receiving spillovers
- [ ] SMS notifications for urgent warnings
- [ ] Builder preference settings for spillover reception
- [ ] Spillover history and detailed reports
- [ ] Advanced distribution algorithms (geographic, performance-based)

---

Generated by Claude Code
