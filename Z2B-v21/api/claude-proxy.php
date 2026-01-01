<?php
/**
 * Claude API Proxy - Handles Coach Manlaw AI requests
 * Prevents CORS issues by proxying API calls through backend
 */

header('Content-Type: application/json');

// CORS Configuration - Restrict to your domain only (SECURITY FIX)
$allowed_origins = ['https://z2blegacybuilders.co.za', 'https://www.z2blegacybuilders.co.za'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} elseif (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    // Allow localhost for development only
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit();
}

// Load environment variables from .env file
$env_file = __DIR__ . '/../.env';
if (file_exists($env_file)) {
    $env_lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        if (strpos(trim($line), '#') === 0) continue; // Skip comments
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// SECURITY: Get API key from environment, NOT from frontend
$apiKey = $_ENV['ANTHROPIC_API_KEY'] ?? null;

if (!$apiKey || strpos($apiKey, 'your_') !== false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Anthropic API key not configured',
        'message' => 'Please configure ANTHROPIC_API_KEY in .env file'
    ]);
    exit();
}

// Get request data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit();
}

// SECURITY: API key is no longer accepted from frontend
$systemPrompt = $input['systemPrompt'] ?? '';
$userMessage = $input['userMessage'] ?? '';

if (empty($userMessage)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required field: userMessage']);
    exit();
}

// Prepare request to Claude API
$claudeUrl = 'https://api.anthropic.com/v1/messages';
$requestData = [
    'model' => 'claude-sonnet-4-20250514',
    'max_tokens' => 1024,
    'messages' => [
        [
            'role' => 'user',
            'content' => $systemPrompt . "\n\nUser: " . $userMessage
        ]
    ]
];

// Initialize cURL
$ch = curl_init($claudeUrl);

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($requestData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01'
    ],
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT => 30
]);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);

// Check for cURL errors
if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Connection error: ' . $curlError
    ]);
    exit();
}

// Return response with appropriate status code
http_response_code($httpCode);
echo $response;
?>
