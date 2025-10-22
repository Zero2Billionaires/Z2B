<?php
/**
 * OpenAI API Proxy
 *
 * Secure backend proxy for OpenAI API calls
 * Keeps API key hidden from frontend
 *
 * @package Z2B
 * @version 1.0.0
 */

header('Content-Type: application/json');

// CORS Configuration - Restrict to your domain only
$allowed_origins = ['https://z2blegacybuilders.co.za', 'https://www.z2blegacybuilders.co.za'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} elseif (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    // Allow localhost for development only
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/Auth.php';
require_once __DIR__ . '/rate-limit-middleware.php';

$start_time = microtime(true);

try {
    // Load environment variables
    $env_file = __DIR__ . '/../.env';
    if (file_exists($env_file)) {
        $env_lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($env_lines as $line) {
            if (strpos(trim($line), '#') === 0) continue; // Skip comments
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }

    // Get OpenAI API key from environment
    $api_key = $_ENV['OPENAI_API_KEY'] ?? null;

    if (!$api_key || strpos($api_key, 'your_') !== false) {
        http_response_code(500);
        echo json_encode([
            'error' => 'OpenAI API key not configured',
            'message' => 'Please configure OPENAI_API_KEY in .env file'
        ]);
        exit;
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Check authentication
    $auth = new Auth($db);
    if (!$auth->isLoggedIn()) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Unauthorized',
            'message' => 'You must be logged in to use this service'
        ]);
        exit;
    }

    $member_id = $_SESSION['member_id'];

    // Rate limit check
    $limit_check = checkRateLimit($db, $member_id, 'openai-proxy', 'ai_generation');
    $limiter = $limit_check['limiter'];

    // Get request data
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid request',
            'message' => 'Request body must be valid JSON'
        ]);
        exit;
    }

    // Validate required fields
    if (!isset($input['messages']) || !is_array($input['messages'])) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid request',
            'message' => 'messages array is required'
        ]);
        exit;
    }

    // Prepare OpenAI request
    $openai_request = [
        'model' => $input['model'] ?? 'gpt-4',
        'messages' => $input['messages'],
        'max_tokens' => $input['max_tokens'] ?? 1000,
        'temperature' => $input['temperature'] ?? 0.7
    ];

    // Optional parameters
    if (isset($input['top_p'])) $openai_request['top_p'] = $input['top_p'];
    if (isset($input['frequency_penalty'])) $openai_request['frequency_penalty'] = $input['frequency_penalty'];
    if (isset($input['presence_penalty'])) $openai_request['presence_penalty'] = $input['presence_penalty'];
    if (isset($input['stop'])) $openai_request['stop'] = $input['stop'];

    // Call OpenAI API
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($openai_request));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $api_key
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        throw new Exception("OpenAI API request failed: $curl_error");
    }

    if ($http_code !== 200) {
        $error_data = json_decode($response, true);
        throw new Exception($error_data['error']['message'] ?? "OpenAI API error: HTTP $http_code");
    }

    $data = json_decode($response, true);

    if (!$data) {
        throw new Exception("Failed to parse OpenAI response");
    }

    // Record successful request
    recordRateLimitedRequest(
        $limiter,
        'openai-proxy',
        'ai_generation',
        'POST',
        'success',
        200,
        $start_time
    );

    // Return response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $data,
        'usage' => [
            'requests_remaining' => $limiter->getUsageData()['today']['available'] ?? null
        ]
    ]);

} catch (Exception $e) {
    // Record failed request
    if (isset($limiter)) {
        recordRateLimitedRequest(
            $limiter,
            'openai-proxy',
            'ai_generation',
            'POST',
            'error',
            500,
            $start_time
        );
    }

    error_log("OpenAI Proxy Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'API request failed',
        'message' => $e->getMessage()
    ]);
}
