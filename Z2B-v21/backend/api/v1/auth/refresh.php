<?php
/**
 * Refresh Token Endpoint
 * Issues new JWT token using refresh token
 */

require_once __DIR__ . '/../../../includes/JWTHandler.php';

if ($requestMethod !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$refreshToken = $input['refreshToken'] ?? '';

if (empty($refreshToken)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Refresh token is required'
    ]);
    exit;
}

$jwt = new JWTHandler();
$payload = $jwt->validateToken($refreshToken);

if (!$payload || !isset($payload['tokenType']) || $payload['tokenType'] !== 'refresh') {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid refresh token'
    ]);
    exit;
}

// Generate new tokens
$newToken = $jwt->generateToken($payload['userId'], $payload['userType']);
$newRefreshToken = $jwt->generateRefreshToken($payload['userId'], $payload['userType']);

echo json_encode([
    'success' => true,
    'data' => [
        'token' => $newToken,
        'refreshToken' => $newRefreshToken,
        'expiresIn' => $jwt->getExpiry()
    ]
]);
