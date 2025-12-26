<?php
/**
 * Z2B Tier Payment Checkout Endpoint
 * Creates Yoco checkout session for tier purchases
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

// Validate input - accept both 'tier' and 'tier_code' for backward compatibility
$tierCode = isset($data['tier']) ? $data['tier'] : (isset($data['tier_code']) ? $data['tier_code'] : null);

if (!$tierCode) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tier code is required']);
    exit;
}

// Get additional fields
$referralCode = isset($data['referral_code']) ? $data['referral_code'] : null;
$isUpgrade = isset($data['isUpgrade']) ? $data['isUpgrade'] : false;
$userId = isset($data['userId']) ? $data['userId'] : null;
$userEmail = isset($data['email']) ? $data['email'] : null;
$userName = isset($data['name']) ? $data['name'] : null;
$userPhone = isset($data['phone']) ? $data['phone'] : null;
$fromTier = isset($data['fromTier']) ? $data['fromTier'] : null;
$toTier = isset($data['toTier']) ? $data['toTier'] : null;

// Tier configurations (Beta pricing - 50% off)
$tiers = [
    'FAM' => ['name' => 'FAM - Free Affiliate', 'price' => 0, 'pv' => 0],
    'BLB' => ['name' => 'Bronze Legacy Builder', 'price' => 480, 'pv' => 24],
    'CLB' => ['name' => 'Copper Legacy Builder', 'price' => 990, 'pv' => 50],
    'SLB' => ['name' => 'Silver Legacy Builder', 'price' => 1490, 'pv' => 74],
    'GLB' => ['name' => 'Gold Legacy Builder', 'price' => 2490, 'pv' => 149],
    'PLB' => ['name' => 'Platinum Legacy Builder', 'price' => 3490, 'pv' => 249]
];

// Check if tier exists
if (!isset($tiers[$tierCode])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid tier code']);
    exit;
}

$tier = $tiers[$tierCode];
$amountInCents = $tier['price'] * 100; // Convert to cents

// Generate unique reference
$reference = 'TIER-' . $tierCode . '-' . time() . '-' . substr(md5(rand()), 0, 7);

// Get base URL
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$baseUrl = $protocol . '://' . $host;

// Yoco API configuration
$yocoSecretKey = 'sk_test_960bfde0VBrLlpK098e4ffeb53e1'; // Replace with live key for production
$yocoApiUrl = 'https://payments.yoco.com/api/checkouts';

// Prepare metadata
$metadata = [
    'tier_code' => $tierCode,
    'tier_name' => $tier['name'],
    'reference' => $reference,
    'referral_code' => $referralCode ?: '',
    'is_upgrade' => $isUpgrade ? 'true' : 'false'
];

// Add upgrade-specific metadata
if ($isUpgrade) {
    $metadata['user_id'] = $userId;
    $metadata['user_email'] = $userEmail;
    $metadata['user_name'] = $userName;
    $metadata['user_phone'] = $userPhone;
    $metadata['from_tier'] = $fromTier;
    $metadata['to_tier'] = $toTier;
}

// Prepare checkout payload
$payload = [
    'amount' => $amountInCents,
    'currency' => 'ZAR',
    'successUrl' => $baseUrl . '/payment-success-register.html?ref=' . $reference . '&tier=' . $tierCode . ($isUpgrade ? '&upgrade=true' : ''),
    'cancelUrl' => $baseUrl . '/tiers.html',
    'failureUrl' => $baseUrl . '/payment-failed.html?ref=' . $reference,
    'metadata' => $metadata
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

// Return success response
echo json_encode([
    'success' => true,
    'redirectUrl' => $yocoResponse['redirectUrl'],
    'checkoutId' => $yocoResponse['id'],
    'reference' => $reference
]);
