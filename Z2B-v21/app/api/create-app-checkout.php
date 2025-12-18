<?php
/**
 * Z2B App Payment Checkout Endpoint
 * Creates Yoco checkout session for standalone app purchases
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
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

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!isset($data['app_code'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'App code is required']);
    exit;
}

$appCode = $data['app_code'];
$userId = isset($data['user_id']) ? $data['user_id'] : null;
$userEmail = isset($data['user_email']) ? $data['user_email'] : null;

// App configurations (Pay as You Go Refuel pricing)
$apps = [
    'captionpro' => [
        'name' => 'CaptionPro - AI Video Captions & Auto-Cut',
        'price' => 299,
        'pv' => 15,
        'description' => 'AI captions in 50+ languages + Auto-cut to Reels/Shorts',
        'category' => 'Video Editing'
    ],
    'coach-manlaw' => [
        'name' => 'Coach Manlaw - AI Billionaire Coach',
        'price' => 999,
        'pv' => 50,
        'description' => '24/7 AI coaching with 90-day curriculum',
        'category' => 'Personal Development'
    ],
    'glowie' => [
        'name' => 'GLOWIE - AI App Builder',
        'price' => 799,
        'pv' => 40,
        'description' => 'No-code app building with Claude AI',
        'category' => 'Development Tools'
    ],
    'benown' => [
        'name' => 'BENOWN - AI Content Creator',
        'price' => 599,
        'pv' => 30,
        'description' => 'Generate viral content for all platforms',
        'category' => 'Marketing'
    ],
    'zyra' => [
        'name' => 'ZYRA - AI Sales Agent',
        'price' => 699,
        'pv' => 35,
        'description' => '24/7 automated sales conversations',
        'category' => 'Sales & CRM'
    ],
    'vidzie' => [
        'name' => 'VIDZIE - AI Video Creator',
        'price' => 899,
        'pv' => 45,
        'description' => 'Create talking avatar videos with D-ID',
        'category' => 'Video Creation'
    ],
    'zynth' => [
        'name' => 'ZYNTH - AI Voice Cloning',
        'price' => 699,
        'pv' => 35,
        'description' => 'Clone your voice for unlimited speech',
        'category' => 'Audio Production'
    ],
    'zyro' => [
        'name' => 'ZYRO - Gamification Hub',
        'price' => 399,
        'pv' => 20,
        'description' => 'Challenges, games, and rewards',
        'category' => 'Engagement'
    ],
    'zynect' => [
        'name' => 'ZYNECT - Complete CRM',
        'price' => 999,
        'pv' => 50,
        'description' => 'SMS, WhatsApp, Email campaigns',
        'category' => 'CRM & Marketing'
    ]
];

// Check if app exists
if (!isset($apps[$appCode])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid app code']);
    exit;
}

$app = $apps[$appCode];
$amountInCents = $app['price'] * 100; // Convert to cents

// Generate unique reference
$reference = 'APP-' . strtoupper($appCode) . '-' . time() . '-' . substr(md5(rand()), 0, 7);

// Get base URL
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$baseUrl = $protocol . '://' . $host;

// Yoco API configuration
$yocoSecretKey = 'sk_test_960bfde0VBrLlpK098e4ffeb53e1'; // Replace with live key for production
$yocoApiUrl = 'https://payments.yoco.com/api/checkouts';

// Prepare checkout payload
$payload = [
    'amount' => $amountInCents,
    'currency' => 'ZAR',
    'successUrl' => $baseUrl . '/payment-success-app.html?ref=' . $reference . '&app=' . $appCode,
    'cancelUrl' => $baseUrl . '/marketplace.html',
    'failureUrl' => $baseUrl . '/payment-failed.html?ref=' . $reference,
    'metadata' => [
        'app_code' => $appCode,
        'app_name' => $app['name'],
        'reference' => $reference,
        'user_id' => $userId ?: '',
        'user_email' => $userEmail ?: '',
        'pv_points' => $app['pv'],
        'category' => $app['category']
    ]
];

// Make request to Yoco API
$ch = curl_init($yocoApiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $yocoSecretKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Check for errors
if ($httpCode !== 201 && $httpCode !== 200) {
    http_response_code(500);
    $errorData = json_decode($response, true);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to create checkout session',
        'details' => $errorData
    ]);
    exit;
}

$yocoResponse = json_decode($response, true);

// Check if we got a redirect URL
if (!isset($yocoResponse['redirectUrl'])) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'No redirect URL received from payment gateway'
    ]);
    exit;
}

// Log the purchase attempt (optional - add to database)
// You can save this to a database for tracking

// Return success response
echo json_encode([
    'success' => true,
    'redirectUrl' => $yocoResponse['redirectUrl'],
    'checkoutId' => $yocoResponse['id'],
    'reference' => $reference,
    'app' => [
        'code' => $appCode,
        'name' => $app['name'],
        'price' => $app['price'],
        'pv' => $app['pv']
    ]
]);
