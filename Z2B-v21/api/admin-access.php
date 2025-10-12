<?php
/**
 * Z2B Legacy Builders - Admin Access Enabler
 * This endpoint is triggered by the hidden admin login mechanism
 */

session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($data['action'] === 'enable') {
        $_SESSION['admin_access_attempt'] = true;
        echo json_encode(['success' => true, 'message' => 'Admin access enabled']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}