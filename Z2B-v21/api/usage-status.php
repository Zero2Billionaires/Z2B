<?php
/**
 * Z2B Usage Status API
 *
 * Returns current request usage and tier information
 *
 * @package Z2B
 * @version 1.0.0
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/Auth.php';
require_once __DIR__ . '/rate-limit-middleware.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Check authentication
    $auth = new Auth($db);
    if (!$auth->isLoggedIn()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'UNAUTHORIZED',
            'message' => 'You must be logged in to view usage status'
        ]);
        exit;
    }

    $member_id = $_SESSION['member_id'];

    // Get usage data
    $limiter = new RateLimiter($db, $member_id);
    $usage_data = $limiter->getUsageData();
    $tier_features = $limiter->getTierFeatures();

    // Get rate limit headers
    $headers = $limiter->getRateLimitHeaders();

    // Send headers
    $limiter->sendRateLimitHeaders();

    // Get warning if any
    $daily_limit = $usage_data['tier']['daily_limit'];
    $used_today = $usage_data['today']['used'];
    $usage_percent = $used_today / $daily_limit;

    $warning = null;
    if ($usage_percent >= 0.95) {
        $warning = [
            'level' => 'critical',
            'threshold' => 95,
            'message' => "You're at 95% of your daily limit! Only {$usage_data['today']['available']} requests remaining.",
            'show_upgrade' => true
        ];
    } elseif ($usage_percent >= 0.80) {
        $warning = [
            'level' => 'warning',
            'threshold' => 80,
            'message' => "You've used 80% of your daily requests. {$usage_data['today']['available']} remaining.",
            'show_upgrade' => false
        ];
    }

    // Return response
    echo json_encode([
        'success' => true,
        'data' => [
            'usage' => $usage_data,
            'features' => $tier_features,
            'warning' => $warning,
            'headers' => $headers
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'SERVER_ERROR',
        'message' => 'Failed to retrieve usage status',
        'debug' => $e->getMessage()
    ]);
}
