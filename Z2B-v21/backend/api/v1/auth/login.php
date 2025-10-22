<?php
/**
 * Login Endpoint
 * Authenticates user and returns JWT token
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/JWTHandler.php';

if ($requestMethod !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Get request body
    $input = json_decode(file_get_contents('php://input'), true);

    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Username and password are required'
        ]);
        exit;
    }

    // Find user
    $stmt = $db->prepare("
        SELECT id, username, email, password_hash, first_name, last_name, tier_id, is_active
        FROM members
        WHERE (username = ? OR email = ?) AND is_active = 1
    ");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid credentials'
        ]);
        exit;
    }

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid credentials'
        ]);
        exit;
    }

    // Generate JWT tokens
    $jwt = new JWTHandler();
    $token = $jwt->generateToken($user['id'], 'member', [
        'username' => $user['username'],
        'email' => $user['email'],
        'firstName' => $user['first_name'],
        'lastName' => $user['last_name'],
        'tierId' => $user['tier_id']
    ]);
    $refreshToken = $jwt->generateRefreshToken($user['id'], 'member');

    // Update last login
    $updateStmt = $db->prepare("UPDATE members SET last_login = NOW() WHERE id = ?");
    $updateStmt->execute([$user['id']]);

    // Log activity
    try {
        $logStmt = $db->prepare("
            INSERT INTO activity_logs (user_id, user_type, action, ip_address, user_agent)
            VALUES (?, 'member', 'login', ?, ?)
        ");
        $logStmt->execute([
            $user['id'],
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    } catch (Exception $e) {
        // Log error but don't fail login
        error_log("Failed to log activity: " . $e->getMessage());
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'token' => $token,
            'refreshToken' => $refreshToken,
            'expiresIn' => $jwt->getExpiry(),
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'tierId' => $user['tier_id']
            ]
        ]
    ]);

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred during login'
    ]);
}
