# Z2B Request Limiting System - Implementation Guide

## Overview

This guide explains how to implement the tiered request limiting system in your Z2B platform. The system includes:

- ✅ Tiered daily request limits (FAM, Bronze, Copper, Silver, Gold, Platinum)
- ✅ Rollover accumulation (unused requests roll over, max 3x monthly limit)
- ✅ 95% warning threshold notifications
- ✅ Tier-based feature unlocking
- ✅ Admin monitoring dashboard
- ✅ Automatic daily/monthly resets

---

## Tier Structure

| Tier | Daily Limit | Monthly Limit | Max Rollover | Features |
|------|------------|---------------|--------------|----------|
| **FAM** (Family) | 3 | 90 | 270 | Basic access |
| **BLB** (Bronze) | 25 | 750 | 2,250 | Standard support |
| **CLB** (Copper) | 60 | 1,800 | 5,400 | Advanced analytics, Extended memory (30) |
| **SLB** (Silver) | 120 | 3,600 | 10,800 | Goal tracking, Priority support, Memory (50) |
| **GLB** (Gold) | 250 | 7,500 | 22,500 | Export features, Premium support, Memory (100) |
| **PLB** (Platinum) | 500 | 15,000 | 45,000 | All features, Premium support, Memory (200) |

---

## Installation Steps

### Step 1: Database Setup

Run the SQL migration to create the required tables:

```bash
mysql -u your_user -p z2b_legacy < database/migrations/create_request_limits_tables.sql
```

This creates:
- `tier_request_limits` - Tier definitions
- `member_request_balance` - Member usage tracking
- `request_usage_logs` - Detailed request logs
- Views and stored procedures

**Verify installation:**
```sql
SHOW TABLES LIKE '%request%';
SELECT * FROM tier_request_limits;
```

### Step 2: Setup Cron Jobs

Add these cron jobs to handle automatic resets:

**Daily reset (at midnight):**
```bash
0 0 * * * php /path/to/z2b/scripts/reset_daily_limits.php
```

**Monthly reset (1st of each month):**
```bash
0 0 1 * * php /path/to/z2b/scripts/reset_monthly_limits.php
```

**Create the cron scripts:**

`scripts/reset_daily_limits.php`:
```php
<?php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $db->query("CALL reset_daily_limits()");
    echo "Daily limits reset successfully\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
```

`scripts/reset_monthly_limits.php`:
```php
<?php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $db->query("CALL reset_monthly_limits()");
    echo "Monthly limits reset successfully\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
```

### Step 3: Initialize Existing Members

Run this script to initialize request balances for all existing members:

```php
<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/RateLimiter.php';

$database = new Database();
$db = $database->getConnection();

// Get all active members
$stmt = $db->query("SELECT id FROM members WHERE is_active = 1");
$members = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($members as $member) {
    try {
        $limiter = new RateLimiter($db, $member['id']);
        echo "Initialized member ID: {$member['id']}\n";
    } catch (Exception $e) {
        echo "Error initializing member {$member['id']}: " . $e->getMessage() . "\n";
    }
}

echo "Initialization complete!\n";
```

---

## Integration into API Endpoints

### Basic Integration Pattern

Add this to **every API endpoint** that should be rate-limited:

```php
<?php
// At the top of your API file
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/Auth.php';
require_once __DIR__ . '/rate-limit-middleware.php';

// Start timer for response time tracking
$start_time = microtime(true);

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Check authentication
$auth = new Auth($db);
if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$member_id = $_SESSION['member_id'];

// CHECK RATE LIMIT - This will exit with 429 if limit exceeded
$limit_check = checkRateLimit($db, $member_id, 'your-endpoint', 'request-type');
$limiter = $limit_check['limiter'];

// Your API logic here...
try {
    // Process request
    $result = processYourRequest();

    // Record successful request
    recordRateLimitedRequest(
        $limiter,
        'your-endpoint',
        'request-type',
        $_SERVER['REQUEST_METHOD'],
        'success',
        200,
        $start_time
    );

    // Return response
    http_response_code(200);
    echo json_encode(['success' => true, 'data' => $result]);

} catch (Exception $e) {
    // Record failed request
    recordRateLimitedRequest(
        $limiter,
        'your-endpoint',
        'request-type',
        $_SERVER['REQUEST_METHOD'],
        'error',
        500,
        $start_time
    );

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
```

### Example: Update AI Coach Endpoint

**Before (`api/ai-coach.php`):**
```php
<?php
require_once __DIR__ . '/../config/database.php';
$database = new Database();
$db = $database->getConnection();

// Process AI request
$response = processAIRequest($data);
echo json_encode($response);
```

**After (with rate limiting):**
```php
<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/Auth.php';
require_once __DIR__ . '/rate-limit-middleware.php';

$start_time = microtime(true);
$database = new Database();
$db = $database->getConnection();

$auth = new Auth($db);
if (!$auth->isLoggedIn()) {
    http_response_code(401);
    exit(json_encode(['error' => 'Unauthorized']));
}

// Rate limit check
$limit_check = checkRateLimit($db, $_SESSION['member_id'], 'ai-coach', 'ai_interaction');
$limiter = $limit_check['limiter'];

// Check if user has advanced features (if needed)
if (!hasFeature($db, $_SESSION['member_id'], 'advanced_analytics')) {
    // Restrict to basic features
}

try {
    $response = processAIRequest($data);
    recordRateLimitedRequest($limiter, 'ai-coach', 'ai_interaction', 'POST', 'success', 200, $start_time);
    echo json_encode($response);
} catch (Exception $e) {
    recordRateLimitedRequest($limiter, 'ai-coach', 'ai_interaction', 'POST', 'error', 500, $start_time);
    echo json_encode(['error' => $e->getMessage()]);
}
```

---

## Frontend Integration

### Add Warning Container to HTML

Add this to your main app pages (index.html, dashboard.html, etc.):

```html
<!DOCTYPE html>
<html>
<head>
    <title>Z2B App</title>
    <script src="/js/request-limiter.js"></script>
</head>
<body>
    <!-- Warning container -->
    <div id="request-limit-warning"></div>

    <!-- Usage widget container (optional) -->
    <div id="usage-widget"></div>

    <!-- Your app content -->
    <div id="app">...</div>

    <script>
        // Initialize request limiter
        const limiter = new RequestLimiter({
            checkInterval: 60000, // Check every minute
            showWarnings: true
        });

        // Create usage widget
        limiter.fetchUsageData().then(() => {
            limiter.createUsageWidget('usage-widget');
        });

        // Listen for usage updates
        window.addEventListener('usageDataUpdated', (event) => {
            console.log('Usage updated:', event.detail);

            // Update UI based on usage
            if (event.detail.warning) {
                console.warn('Warning:', event.detail.warning.message);
            }
        });
    </script>
</body>
</html>
```

### Check Before Making API Calls

```javascript
// Before making an API call
async function makeAPICall(endpoint, data) {
    // Check if user can make request
    if (!window.requestLimiter.canMakeRequest()) {
        alert('You have reached your daily request limit. Please upgrade or wait until tomorrow.');
        return;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // Check rate limit headers
        const remaining = response.headers.get('X-RateLimit-Remaining');
        console.log(`Requests remaining: ${remaining}`);

        if (response.status === 429) {
            alert('Rate limit exceeded! Please upgrade your tier or try again tomorrow.');
            return;
        }

        return await response.json();

    } catch (error) {
        console.error('API call failed:', error);
    }
}
```

---

## Feature-Based Access Control

### Restrict Features by Tier

```php
<?php
// Check if user has access to advanced analytics
if (!hasFeature($db, $member_id, 'advanced_analytics')) {
    echo json_encode([
        'success' => false,
        'error' => 'FEATURE_LOCKED',
        'message' => 'Advanced analytics is only available for Copper tier and above',
        'upgrade_url' => '/marketplace/subscriptions'
    ]);
    exit;
}

// Check conversation memory limit
$features = getTierFeatures($db, $member_id);
$memory_limit = $features['extended_memory']; // 10, 20, 30, 50, 100, or 200

// Limit conversation history based on tier
$conversation = array_slice($conversation_history, -$memory_limit);
```

### Frontend Feature Checks

```javascript
// Check if feature is available
async function showAnalytics() {
    await window.requestLimiter.fetchUsageData();

    if (!window.requestLimiter.hasFeature('advanced_analytics')) {
        showUpgradePrompt('Advanced analytics requires Copper tier or higher');
        return;
    }

    // Show analytics
    displayAdvancedAnalytics();
}
```

---

## Admin Dashboard Access

Navigate to: `https://yourdomain.com/admin/api-usage-dashboard.php`

**Features:**
- Real-time usage stats by tier
- Members near/at limit
- Recent API requests
- Response time tracking
- Rollover monitoring
- Auto-refresh every 30 seconds

**Access Control:**
Ensure only admins can access:

```php
// At top of admin/api-usage-dashboard.php
if (!$auth->isLoggedIn() || $_SESSION['user_type'] !== 'admin') {
    header('Location: /login.php');
    exit;
}
```

---

## Testing

### Test Rate Limiting

```php
<?php
// test-rate-limit.php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/Auth.php';
require_once __DIR__ . '/includes/RateLimiter.php';

$database = new Database();
$db = $database->getConnection();

$member_id = 1; // Test member ID

$limiter = new RateLimiter($db, $member_id);

// Make 10 test requests
for ($i = 1; $i <= 10; $i++) {
    $check = $limiter->checkLimit('test', 'test');

    if ($check['allowed']) {
        $limiter->recordRequest('test', 'test', 'GET', 'success', 200, rand(50, 200));
        echo "Request $i: ALLOWED - {$check['data']['today']['available']} remaining\n";

        if ($check['warning']) {
            echo "  WARNING: {$check['warning']['message']}\n";
        }
    } else {
        echo "Request $i: BLOCKED - {$check['message']}\n";
        break;
    }
}

// Display usage
print_r($limiter->getUsageData());
```

### Test Rollover Logic

```php
<?php
// Simulate end of day with unused requests
$limiter = new RateLimiter($db, $member_id);

echo "Before reset:\n";
$before = $limiter->getUsageData();
echo "Available: {$before['today']['available']}\n";
echo "Rollover: {$before['rollover']['current']}\n";

// Manually trigger daily reset
$db->query("UPDATE member_request_balance SET last_daily_reset = DATE_SUB(CURDATE(), INTERVAL 1 DAY) WHERE member_id = $member_id");

// Create new limiter to trigger reset
$limiter = new RateLimiter($db, $member_id);

echo "\nAfter reset:\n";
$after = $limiter->getUsageData();
echo "Available: {$after['today']['available']}\n";
echo "Rollover: {$after['rollover']['current']}\n";
```

---

## Monitoring & Maintenance

### Check System Health

```sql
-- Check for members with unusual usage
SELECT
    m.username,
    mrb.requests_used_today,
    mrb.requests_available,
    trl.daily_limit
FROM member_request_balance mrb
JOIN members m ON mrb.member_id = m.id
JOIN tier_request_limits trl ON mrb.tier_code = trl.tier_code
WHERE mrb.requests_used_today > trl.daily_limit * 1.5
ORDER BY mrb.requests_used_today DESC;

-- Check rollover accumulation
SELECT
    tier_code,
    AVG(rollover_balance) as avg_rollover,
    MAX(rollover_balance) as max_rollover,
    COUNT(*) as member_count
FROM member_request_balance
GROUP BY tier_code;

-- Check failed requests
SELECT
    DATE(created_at) as date,
    status,
    COUNT(*) as count
FROM request_usage_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at), status
ORDER BY date DESC, status;
```

### Performance Optimization

Add indexes if queries are slow:

```sql
CREATE INDEX idx_logs_performance ON request_usage_logs(member_id, created_at, status);
CREATE INDEX idx_balance_lookup ON member_request_balance(member_id, last_daily_reset);
```

---

## Troubleshooting

### Issue: Rate limits not resetting

**Check cron jobs are running:**
```bash
crontab -l
grep -i cron /var/log/syslog
```

**Manual reset:**
```sql
CALL reset_daily_limits();
CALL reset_monthly_limits();
```

### Issue: Members showing 0 requests available

**Check initialization:**
```sql
SELECT * FROM member_request_balance WHERE member_id = X;
```

**Reinitialize:**
```php
$limiter = new RateLimiter($db, $member_id); // Auto-initializes if missing
```

### Issue: Warnings not showing

**Check frontend setup:**
```html
<div id="request-limit-warning"></div>
<script src="/js/request-limiter.js"></script>
```

**Check console:**
```javascript
window.requestLimiter.logUsageStats();
```

---

## Upgrade Path

When member upgrades their tier:

```php
<?php
// After successful tier upgrade
$old_tier = 'BLB';
$new_tier = 'SLB';

// Update member tier
$stmt = $db->prepare("UPDATE members SET tier_id = (SELECT id FROM tiers WHERE tier_code = ?) WHERE id = ?");
$stmt->execute([$new_tier, $member_id]);

// Reinitialize balance with new limits
$db->query("CALL initialize_member_balance($member_id, '$new_tier')");

// Log the upgrade
error_log("Member $member_id upgraded from $old_tier to $new_tier");
```

---

## API Response Headers

All rate-limited endpoints return these headers:

```
X-RateLimit-Limit: 120           (Daily limit for user's tier)
X-RateLimit-Remaining: 87        (Requests remaining today)
X-RateLimit-Reset: 1738195200    (Unix timestamp of next reset)
X-RateLimit-Tier: SLB            (User's current tier)
X-RateLimit-Rollover: 45         (Rollover balance)
```

---

## Security Considerations

1. **IP-based rate limiting**: Consider adding per-IP limits to prevent abuse
2. **Bot detection**: Monitor `user_agent` in `request_usage_logs`
3. **Anomaly detection**: Alert on unusual usage patterns
4. **CSRF protection**: Already implemented in Auth.php
5. **SQL injection**: All queries use prepared statements

---

## Summary

You now have a complete tiered request limiting system with:

✅ Database schema with rollover tracking
✅ PHP middleware for rate limiting
✅ Frontend warning notifications
✅ Admin monitoring dashboard
✅ Automatic resets via cron
✅ Feature-based access control
✅ Comprehensive logging

**Next Steps:**
1. Run database migration
2. Setup cron jobs
3. Initialize existing members
4. Integrate into API endpoints
5. Add frontend components
6. Test thoroughly
7. Monitor via admin dashboard

For questions or issues, check the troubleshooting section or review the code comments.
