<?php
/**
 * Authentication Router
 * Routes authentication-related requests
 */

$action = $segments[1] ?? '';

switch ($action) {
    case 'login':
        require_once __DIR__ . '/login.php';
        break;

    case 'register':
        require_once __DIR__ . '/register.php';
        break;

    case 'logout':
        require_once __DIR__ . '/logout.php';
        break;

    case 'verify':
        require_once __DIR__ . '/verify.php';
        break;

    case 'refresh':
        require_once __DIR__ . '/refresh.php';
        break;

    case 'admin-login':
        require_once __DIR__ . '/admin-login.php';
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Auth endpoint not found'
        ]);
        break;
}
