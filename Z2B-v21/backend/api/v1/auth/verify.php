<?php
/**
 * Verify Token Endpoint
 * Validates JWT token and returns user info
 */

require_once __DIR__ . '/../../../includes/JWTHandler.php';

$jwt = new JWTHandler();
$token = $jwt->getTokenFromHeader();

if (!$token) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'No token provided'
    ]);
    exit;
}

$payload = $jwt->validateToken($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid or expired token'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'data' => [
        'valid' => true,
        'user' => [
            'id' => $payload['userId'],
            'username' => $payload['username'] ?? null,
            'email' => $payload['email'] ?? null,
            'firstName' => $payload['firstName'] ?? null,
            'lastName' => $payload['lastName'] ?? null,
            'tierId' => $payload['tierId'] ?? null
        ]
    ]
]);
