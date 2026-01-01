<?php
/**
 * Get Tier Costs API
 * Returns all tier pricing information (beta and regular prices)
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Tier costs configuration (Beta pricing - 50% off)
$tiers = [
    'FAM' => [
        'code' => 'FAM',
        'name' => 'FAM - Free Affiliate',
        'beta_price' => 0,
        'regular_price' => 0,
        'pv' => 0,
        'commission_rate' => 20
    ],
    'BRONZE' => [
        'code' => 'BLB',
        'name' => 'Bronze Legacy Builder',
        'beta_price' => 480,
        'regular_price' => 960,
        'pv' => 24,
        'commission_rate' => 18
    ],
    'COPPER' => [
        'code' => 'CLB',
        'name' => 'Copper Legacy Builder',
        'beta_price' => 980,
        'regular_price' => 1960,
        'pv' => 50,
        'commission_rate' => 22
    ],
    'SILVER' => [
        'code' => 'SLB',
        'name' => 'Silver Legacy Builder',
        'beta_price' => 1480,
        'regular_price' => 2960,
        'pv' => 74,
        'commission_rate' => 25
    ],
    'GOLD' => [
        'code' => 'GLB',
        'name' => 'Gold Legacy Builder',
        'beta_price' => 2980,
        'regular_price' => 5960,
        'pv' => 149,
        'commission_rate' => 28
    ],
    'PLATINUM' => [
        'code' => 'PLB',
        'name' => 'Platinum Legacy Builder',
        'beta_price' => 4980,
        'regular_price' => 9960,
        'pv' => 249,
        'commission_rate' => 30
    ]
];

echo json_encode([
    'success' => true,
    'tiers' => $tiers,
    'current_pricing' => 'beta',
    'discount' => '50%',
    'note' => 'Beta pricing locked in forever for early adopters'
]);
