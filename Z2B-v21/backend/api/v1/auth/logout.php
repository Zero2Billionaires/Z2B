<?php
/**
 * Logout Endpoint
 * Logs out user (client should discard token)
 */

if ($requestMethod !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// In a stateless JWT system, logout is handled client-side
// But we can log the activity
try {
    if (isset($GLOBALS['currentUser'])) {
        require_once __DIR__ . '/../../../config/database.php';

        $logStmt = $db->prepare("
            INSERT INTO activity_logs (user_id, user_type, action, ip_address, user_agent)
            VALUES (?, 'member', 'logout', ?, ?)
        ");
        $logStmt->execute([
            $GLOBALS['currentUser']['userId'],
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    }
} catch (Exception $e) {
    error_log("Failed to log logout: " . $e->getMessage());
}

echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
