<?php
/**
 * Example: Rate-Limited Coach Manlaw Endpoint
 *
 * This is an example showing how to integrate rate limiting
 * into the Coach Manlaw AI endpoint
 *
 * @package Z2B
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/Auth.php';
require_once __DIR__ . '/../api/rate-limit-middleware.php';

// Start timer for response time tracking
$start_time = microtime(true);

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
            'message' => 'You must be logged in to use Coach Manlaw'
        ]);
        exit;
    }

    $member_id = $_SESSION['member_id'];

    // ========================================
    // RATE LIMIT CHECK
    // ========================================
    $limit_check = checkRateLimit($db, $member_id, 'coach-manlaw', 'ai_coaching');
    $limiter = $limit_check['limiter'];

    // Get tier features to determine conversation memory
    $features = getTierFeatures($db, $member_id);
    $memory_limit = $features['extended_memory']; // 10, 20, 30, 50, 100, or 200

    // Get request data
    $input = json_decode(file_get_contents('php://input'), true);
    $user_message = $input['message'] ?? '';
    $conversation_history = $input['history'] ?? [];

    if (empty($user_message)) {
        recordRateLimitedRequest($limiter, 'coach-manlaw', 'ai_coaching', 'POST', 'error', 400, $start_time);

        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'BAD_REQUEST',
            'message' => 'Message is required'
        ]);
        exit;
    }

    // ========================================
    // TIER-BASED MEMORY LIMITING
    // ========================================
    // Limit conversation history based on tier
    if (count($conversation_history) > $memory_limit) {
        $conversation_history = array_slice($conversation_history, -$memory_limit);
    }

    // ========================================
    // PROCESS AI REQUEST
    // ========================================

    // Prepare conversation for Claude API
    $claude_messages = [];
    foreach ($conversation_history as $msg) {
        $claude_messages[] = [
            'role' => $msg['role'],
            'content' => $msg['content']
        ];
    }

    // Add current user message
    $claude_messages[] = [
        'role' => 'user',
        'content' => $user_message
    ];

    // Call Claude API (via proxy or direct)
    $claude_response = callClaudeAPI($claude_messages, $features);

    // ========================================
    // RECORD SUCCESSFUL REQUEST
    // ========================================
    recordRateLimitedRequest(
        $limiter,
        'coach-manlaw',
        'ai_coaching',
        'POST',
        'success',
        200,
        $start_time
    );

    // Get updated usage data
    $usage_data = getUsageData($db, $member_id);

    // Return response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'response' => $claude_response,
            'conversation_id' => uniqid('conv_'),
            'timestamp' => time()
        ],
        'usage' => [
            'requests_remaining' => $usage_data['today']['available'],
            'tier' => $usage_data['tier']['name'],
            'memory_limit' => $memory_limit,
            'history_truncated' => count($conversation_history) > $memory_limit
        ]
    ]);

} catch (Exception $e) {
    // Record failed request
    if (isset($limiter)) {
        recordRateLimitedRequest(
            $limiter,
            'coach-manlaw',
            'ai_coaching',
            'POST',
            'error',
            500,
            $start_time
        );
    }

    error_log("Coach Manlaw Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'SERVER_ERROR',
        'message' => 'Failed to process your request',
        'debug' => $e->getMessage()
    ]);
}

/**
 * Call Claude API with tier-based features
 */
function callClaudeAPI($messages, $features) {
    $api_key = getenv('ANTHROPIC_API_KEY');

    $payload = [
        'model' => 'claude-3-5-sonnet-20241022',
        'max_tokens' => 8096,
        'messages' => $messages,
        'system' => getCoachSystemPrompt($features),
        'temperature' => 0.7
    ];

    // If advanced analytics enabled, use higher quality model
    if ($features['advanced_analytics']) {
        $payload['model'] = 'claude-3-5-sonnet-20241022';
    }

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $api_key,
        'anthropic-version: 2023-06-01'
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code !== 200) {
        throw new Exception("Claude API error: HTTP $http_code - $response");
    }

    $data = json_decode($response, true);
    return $data['content'][0]['text'] ?? 'Error processing response';
}

/**
 * Get Coach Manlaw system prompt based on features
 */
function getCoachSystemPrompt($features) {
    $base_prompt = "You are Coach Manlaw, a motivational AI coach specializing in business and personal development.";

    // Add advanced features based on tier
    if ($features['goal_tracking']) {
        $base_prompt .= " Track and reference the user's goals throughout conversations.";
    }

    if ($features['advanced_analytics']) {
        $base_prompt .= " Provide detailed analytics and insights on the user's progress.";
    }

    return $base_prompt;
}
