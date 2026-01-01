<?php
/**
 * Coach Manlaw - Activity Response API
 * Handles activity and assignment submissions from curriculum
 *
 * @package Z2B
 * @version 1.0.0
 */

header('Content-Type: application/json');

// CORS Configuration - Restrict to your domain
$allowed_origins = ['https://z2blegacybuilders.co.za', 'https://www.z2blegacybuilders.co.za'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} elseif (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/Auth.php';
require_once __DIR__ . '/../rate-limit-middleware.php';

$start_time = microtime(true);

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Check authentication (optional - can work for demo users too)
    $auth = new Auth($db);
    $is_logged_in = $auth->isLoggedIn();

    // Get member ID if logged in, otherwise use demo mode
    $member_id = null;
    if ($is_logged_in) {
        $member_id = $_SESSION['member_id'];

        // Rate limit check for authenticated users only
        $limit_check = checkRateLimit($db, $member_id, 'coach-activity', 'activity_submission');
        $limiter = $limit_check['limiter'];
    }

    // Get request data
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid request',
            'message' => 'Request body must be valid JSON'
        ]);
        exit;
    }

    // Validate required fields
    $required_fields = ['userId', 'day', 'lessonTitle', 'responseType', 'userResponse'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Missing required field',
                'message' => "Field '$field' is required"
            ]);
            exit;
        }
    }

    $user_id = $input['userId'];
    $day = (int)$input['day'];
    $lesson_title = $input['lessonTitle'];
    $response_type = $input['responseType']; // 'activity' or 'assignment'
    $user_response = trim($input['userResponse']);
    $btss_impact = $input['btssImpact'] ?? 'all';
    $activity = $input['activity'] ?? '';

    // Validate minimum length
    if (strlen($user_response) < 10) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Response too short',
            'message' => 'Please write at least 10 characters in your response'
        ]);
        exit;
    }

    // Save activity response to database
    $stmt = $db->prepare("
        INSERT INTO coach_activity_responses
        (member_id, user_id, day, lesson_title, response_type, user_response, btss_impact, activity, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");

    $stmt->execute([
        $member_id,
        $user_id,
        $day,
        $lesson_title,
        $response_type,
        $user_response,
        $btss_impact,
        $activity
    ]);

    $response_id = $db->lastInsertId();

    // Generate AI feedback using Claude (optional)
    $feedback = generateAIFeedback($user_response, $lesson_title, $response_type, $btss_impact);

    // Update the response with AI feedback
    if ($feedback) {
        $stmt = $db->prepare("UPDATE coach_activity_responses SET ai_feedback = ? WHERE id = ?");
        $stmt->execute([$feedback, $response_id]);
    }

    // Record successful request (for authenticated users only)
    if ($is_logged_in && isset($limiter)) {
        recordRateLimitedRequest(
            $limiter,
            'coach-activity',
            'activity_submission',
            'POST',
            'success',
            200,
            $start_time
        );
    }

    // Return success with feedback
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Response submitted successfully!',
        'feedback' => $feedback ?: 'Great work! Your response has been recorded. Keep building your legacy!',
        'response_id' => $response_id,
        'usage' => $is_logged_in && isset($limiter) ? [
            'requests_remaining' => $limiter->getUsageData()['today']['available'] ?? null
        ] : null
    ]);

} catch (Exception $e) {
    // Record failed request (for authenticated users only)
    if ($is_logged_in && isset($limiter)) {
        recordRateLimitedRequest(
            $limiter,
            'coach-activity',
            'activity_submission',
            'POST',
            'error',
            500,
            $start_time
        );
    }

    error_log("Coach Activity Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'message' => 'Failed to process your response. Please try again.',
        'debug' => DEBUG_MODE ? $e->getMessage() : null
    ]);
}

/**
 * Generate AI feedback for user response
 *
 * @param string $user_response User's response
 * @param string $lesson_title Lesson title
 * @param string $response_type 'activity' or 'assignment'
 * @param string $btss_impact BTSS impact area
 * @return string|null AI-generated feedback
 */
function generateAIFeedback($user_response, $lesson_title, $response_type, $btss_impact) {
    // Load environment variables
    $env_file = __DIR__ . '/../../.env';
    if (file_exists($env_file)) {
        $env_lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($env_lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') === false) continue;
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }

    $api_key = $_ENV['ANTHROPIC_API_KEY'] ?? null;

    // Skip AI feedback if API key not configured
    if (!$api_key || strpos($api_key, 'your_') !== false) {
        return null;
    }

    try {
        // Build feedback prompt
        $system_prompt = "You are Coach Manlaw, a motivational business coach. Provide brief, encouraging feedback (2-3 sentences max) on the user's response to their business development activity.";

        $user_prompt = "Lesson: {$lesson_title}\n";
        $user_prompt .= "Activity Type: {$response_type}\n";
        $user_prompt .= "Focus Area: {$btss_impact}\n\n";
        $user_prompt .= "User's Response:\n{$user_response}\n\n";
        $user_prompt .= "Provide brief, specific, encouraging feedback that acknowledges their effort and gives one actionable insight.";

        // Call Claude API
        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'model' => 'claude-3-5-sonnet-20241022',
            'max_tokens' => 200,
            'messages' => [[
                'role' => 'user',
                'content' => $user_prompt
            ]],
            'system' => $system_prompt
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-api-key: ' . $api_key,
            'anthropic-version: 2023-06-01'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code === 200) {
            $data = json_decode($response, true);
            if (isset($data['content'][0]['text'])) {
                return $data['content'][0]['text'];
            }
        }

        return null;

    } catch (Exception $e) {
        error_log("AI Feedback Error: " . $e->getMessage());
        return null;
    }
}
