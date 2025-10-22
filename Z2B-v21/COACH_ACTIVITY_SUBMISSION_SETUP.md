# Coach Manlaw - Activity Submission Setup & Testing Guide

**Status:** ✅ CODE COMPLETE - Database Setup Required
**Date:** October 21, 2025
**Issue Fixed:** "Failed to submit your response. Please try again."

---

## 🎯 What Was Fixed

### Problem
When users tried to submit activity responses in Coach Manlaw, they received:
```
Failed to submit your response. Please try again.
```

### Root Cause
The frontend was calling `/api/coach/activity-response` endpoint which didn't exist.

### Solution Implemented
1. ✅ Created `api/coach/activity-response.php` - Complete backend endpoint
2. ✅ Created `database/migrations/create_coach_activity_responses.sql` - Database schema
3. ✅ Created `database/run-migration.php` - Migration runner tool
4. ⏳ **PENDING:** Execute database migration (instructions below)

---

## 📋 Setup Instructions

### Step 1: Run Database Migration

**Option A: Using PHP Command Line**
```bash
cd C:/Users/Manana/Z2B/Z2B-v21
php database/run-migration.php create_coach_activity_responses.sql
```

**Option B: Using phpMyAdmin or MySQL Workbench**
1. Open phpMyAdmin or MySQL Workbench
2. Select database: `z2b_legacy`
3. Go to SQL tab
4. Copy contents of `database/migrations/create_coach_activity_responses.sql`
5. Click "Execute" or "Run"

**Option C: Using MySQL Command Line**
```bash
mysql -u root -p z2b_legacy < database/migrations/create_coach_activity_responses.sql
```

### Step 2: Verify Table Creation

Run this SQL query to confirm:
```sql
SHOW TABLES LIKE 'coach_activity_responses';
DESCRIBE coach_activity_responses;

-- Check views
SELECT * FROM coach_recent_responses LIMIT 5;
SELECT * FROM coach_member_progress LIMIT 5;
```

Expected output:
```
Table: coach_activity_responses
Columns: id, member_id, user_id, day, lesson_title, response_type, user_response, btss_impact, activity, ai_feedback, created_at, updated_at
```

### Step 3: Update Anthropic API Key (If Not Done)

The endpoint generates AI feedback using Claude. Update your `.env` file:
```ini
ANTHROPIC_API_KEY=your_actual_claude_api_key_here
```

**Note:** If you don't have a Claude API key yet, the endpoint will still work but won't generate AI feedback. It will use a default message instead.

---

## 🧪 Testing the Feature

### Test 1: Submit Activity Response (Demo User)

1. Open Coach Manlaw: `app/coach-manlaw.html`
2. Navigate to any day's curriculum (e.g., Day 1)
3. Scroll to an activity section
4. Enter response (minimum 10 characters):
   ```
   I learned that the BTSS framework helps me balance my business and personal life. This approach will help me avoid burnout.
   ```
5. Click "Submit Response"
6. **Expected Result:**
   - Success message appears
   - AI feedback displayed (or default message if no API key)
   - Response saved to database

### Test 2: Verify Database Entry

```sql
SELECT
    id,
    user_id,
    day,
    lesson_title,
    response_type,
    SUBSTRING(user_response, 1, 50) as response_preview,
    btss_impact,
    CASE WHEN ai_feedback IS NOT NULL THEN 'Yes' ELSE 'No' END as has_ai_feedback,
    created_at
FROM coach_activity_responses
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Output:**
```
+----+-----------------+-----+---------------------------+---------------+--------------------+-------------+------------------+---------------------+
| id | user_id         | day | lesson_title              | response_type | response_preview   | btss_impact | has_ai_feedback  | created_at          |
+----+-----------------+-----+---------------------------+---------------+--------------------+-------------+------------------+---------------------+
| 1  | demo_user_12345 | 1   | Introduction to BTSS      | activity      | I learned that...  | all         | Yes              | 2025-10-21 14:30:00 |
+----+-----------------+-----+---------------------------+---------------+--------------------+-------------+------------------+---------------------+
```

### Test 3: Submit Assignment Response (Logged-in User)

1. Log in as a member
2. Open Coach Manlaw
3. Navigate to an assignment section
4. Enter a longer response (50+ characters):
   ```
   My analysis shows I spend too much time on urgent but unimportant tasks.
   I will implement time-blocking to focus on strategic planning each morning
   from 6am-8am before checking emails.
   ```
5. Click "Submit Assignment"
6. **Expected Result:**
   - Success message
   - AI feedback specific to your response
   - Request counted toward daily limit (if rate limiting enabled)

### Test 4: Validation Tests

**Test A: Too Short Response**
1. Enter only 5 characters: "Hello"
2. Submit
3. **Expected:** Error message "Please write at least 10 characters in your response"

**Test B: Empty Response**
1. Leave response field blank
2. Submit
3. **Expected:** Error message "Field 'userResponse' is required"

**Test C: Rate Limiting (Authenticated Users)**
1. Submit 25+ responses rapidly (if you're Bronze tier with 25 daily limit)
2. **Expected:** Eventually receive "Daily request limit reached" message

---

## 📊 Database Schema

### Table: `coach_activity_responses`

| Column         | Type                     | Description                                    |
|----------------|--------------------------|------------------------------------------------|
| id             | INT AUTO_INCREMENT       | Primary key                                    |
| member_id      | INT NULL                 | Foreign key to members (NULL for demo users)   |
| user_id        | VARCHAR(255)             | User identifier (member ID or session ID)      |
| day            | INT                      | Curriculum day (1-30)                          |
| lesson_title   | VARCHAR(255)             | Title of the lesson                            |
| response_type  | ENUM('activity','assignment') | Type of submission                      |
| user_response  | TEXT                     | User's submitted response                      |
| btss_impact    | VARCHAR(50)              | BTSS impact area (body/time/soul/space/all)    |
| activity       | TEXT                     | Activity description/context                   |
| ai_feedback    | TEXT                     | AI-generated feedback from Claude              |
| created_at     | TIMESTAMP                | When response was submitted                    |
| updated_at     | TIMESTAMP                | Last update time                               |

### View: `coach_recent_responses`
Shows recent responses with member details (for admin dashboard).

### View: `coach_member_progress`
Tracks member progress through curriculum (days completed, submissions count).

---

## 🔧 API Endpoint Details

### Endpoint: `/api/coach/activity-response`

**Method:** POST
**Content-Type:** application/json
**Authentication:** Optional (works for both demo and logged-in users)

**Request Body:**
```json
{
  "userId": "demo_user_12345",
  "day": 1,
  "lessonTitle": "Introduction to BTSS Framework",
  "responseType": "activity",
  "userResponse": "I learned that the BTSS framework helps me balance Body, Time, Soul, and Space...",
  "btssImpact": "all",
  "activity": "Reflect on your current business practices"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Response submitted successfully!",
  "feedback": "Excellent reflection! You've identified a common challenge...",
  "response_id": 123,
  "usage": {
    "requests_remaining": 24
  }
}
```

**Error Response (400 - Too Short):**
```json
{
  "success": false,
  "error": "Response too short",
  "message": "Please write at least 10 characters in your response"
}
```

**Error Response (429 - Rate Limit):**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "You've reached your daily request limit of 25. Upgrade to increase your limit!"
}
```

---

## 🔐 Security Features

### 1. CORS Protection
- Only allows requests from `z2blegacybuilders.co.za` and `www.z2blegacybuilders.co.za`
- Allows `localhost` for development only

### 2. Input Validation
- Minimum 10 characters for responses
- All required fields checked
- Response type validated (must be 'activity' or 'assignment')

### 3. Rate Limiting (Authenticated Users Only)
- Integrated with tier-based rate limiting system
- Requests counted toward daily quota
- Usage data returned in response

### 4. API Key Security
- Anthropic API key stored in `.env` file only
- Never exposed to frontend
- Backend proxy pattern for AI calls

### 5. SQL Injection Prevention
- PDO prepared statements for all database queries
- Parameterized queries throughout

---

## 🎨 Frontend Integration

The endpoint is already integrated in `app/coach-manlaw.html`:

```javascript
async function submitActivityResponse(day, lessonTitle, responseType, userResponse, btssImpact, activity) {
    const userId = getCurrentUserId(); // Gets member_id or demo session ID

    const response = await fetch('/api/coach/activity-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId,
            day,
            lessonTitle,
            responseType,
            userResponse,
            btssImpact,
            activity
        })
    });

    const result = await response.json();

    if (result.success) {
        // Show success message and AI feedback
        showSuccessMessage(result.feedback);
    } else {
        // Show error message
        showErrorMessage(result.message);
    }
}
```

---

## 📈 Analytics & Reporting

### Query 1: Recent Activity Feed
```sql
SELECT * FROM coach_recent_responses
ORDER BY created_at DESC
LIMIT 20;
```

### Query 2: Member Progress Dashboard
```sql
SELECT
    m.first_name,
    m.last_name,
    m.tier_code,
    p.total_submissions,
    p.days_completed,
    p.highest_day_reached,
    p.activities_completed,
    p.assignments_completed,
    ROUND(p.responses_with_feedback / p.total_submissions * 100, 1) as feedback_percentage,
    p.last_submission
FROM coach_member_progress p
JOIN members m ON p.member_id = m.id
ORDER BY p.total_submissions DESC
LIMIT 10;
```

### Query 3: Engagement by Day
```sql
SELECT
    day,
    COUNT(*) as total_responses,
    COUNT(DISTINCT member_id) as unique_members,
    SUM(CASE WHEN response_type = 'activity' THEN 1 ELSE 0 END) as activities,
    SUM(CASE WHEN response_type = 'assignment' THEN 1 ELSE 0 END) as assignments,
    AVG(CHAR_LENGTH(user_response)) as avg_response_length
FROM coach_activity_responses
GROUP BY day
ORDER BY day;
```

### Query 4: AI Feedback Success Rate
```sql
SELECT
    DATE(created_at) as date,
    COUNT(*) as total_submissions,
    SUM(CASE WHEN ai_feedback IS NOT NULL THEN 1 ELSE 0 END) as with_feedback,
    ROUND(SUM(CASE WHEN ai_feedback IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) as feedback_rate
FROM coach_activity_responses
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🐛 Troubleshooting

### Issue: "Failed to submit your response"

**Solution:** Run database migration first (see Step 1 above)

### Issue: No AI feedback generated

**Possible Causes:**
1. No Anthropic API key in `.env`
2. Invalid or expired API key
3. API quota exceeded

**Check:**
```php
// In .env file
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Test API Key:**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Issue: Database connection error

**Check:**
1. Database name: `z2b_legacy`
2. Credentials in `config/database.php`
3. MySQL server running

### Issue: CORS error in browser console

**Solution:** Make sure you're accessing via:
- `https://z2blegacybuilders.co.za`, OR
- `http://localhost` (for development)

---

## ✅ Verification Checklist

- [ ] Database migration executed successfully
- [ ] Table `coach_activity_responses` exists
- [ ] Views `coach_recent_responses` and `coach_member_progress` created
- [ ] Anthropic API key added to `.env` (optional but recommended)
- [ ] Test submission as demo user - SUCCESS
- [ ] Test submission as logged-in user - SUCCESS
- [ ] Verify database entry created
- [ ] Verify AI feedback generated (if API key configured)
- [ ] Test validation (too short response)
- [ ] Test rate limiting (if enabled)

---

## 📞 Next Steps

1. **Immediate:** Run database migration
2. **Test:** Submit test responses
3. **Configure:** Add Anthropic API key for AI feedback
4. **Monitor:** Check database for submissions
5. **Analytics:** Use SQL queries to track engagement

---

**Ready to test!** 🚀

Once you've run the migration, the activity submission feature will be fully operational.
