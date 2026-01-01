<?php
/**
 * Z2B Legacy Builders - Backend API Entry Point
 * Main router for all API requests
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load environment variables
$env_file = __DIR__ . '/.env';
if (file_exists($env_file)) {
    $env_lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// Set timezone
date_default_timezone_set('Africa/Johannesburg');

// Set JSON response header
header('Content-Type: application/json');

// Load middleware
require_once __DIR__ . '/middleware/CorsMiddleware.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/middleware/AdminMiddleware.php';
require_once __DIR__ . '/middleware/RateLimitMiddleware.php';

// Apply CORS
$cors = new CorsMiddleware();
$cors->handle();

// Get request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string and get path
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove base path if exists
$basePath = '/backend';
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}

// Remove /api/v1 prefix
$apiPrefix = '/api/v1';
if (strpos($path, $apiPrefix) === 0) {
    $path = substr($path, strlen($apiPrefix));
}

// Clean up path
$path = trim($path, '/');

// Split path into segments
$segments = explode('/', $path);

// Rate limiting
$rateLimiter = new RateLimitMiddleware();
$rateLimiter->check();

// Authentication middleware
$authMiddleware = new AuthMiddleware();

// Check if route requires authentication
if ($authMiddleware->requiresAuth($path)) {
    $authMiddleware->validateAuth();
}

// Route to appropriate controller
try {
    $resource = $segments[0] ?? '';

    switch ($resource) {
        case 'auth':
            require_once __DIR__ . '/api/v1/auth/router.php';
            break;

        case 'members':
            require_once __DIR__ . '/api/v1/members/router.php';
            break;

        case 'commissions':
            require_once __DIR__ . '/api/v1/commissions/router.php';
            break;

        case 'marketplace':
            require_once __DIR__ . '/api/v1/marketplace/router.php';
            break;

        case 'coach':
            require_once __DIR__ . '/api/v1/coach/router.php';
            break;

        case 'tiers':
            require_once __DIR__ . '/api/v1/tiers/router.php';
            break;

        case 'admin':
            $adminMiddleware = new AdminMiddleware();
            $adminMiddleware->validateAdminAuth();
            require_once __DIR__ . '/api/v1/admin/router.php';
            break;

        case 'apps':
            require_once __DIR__ . '/api/v1/apps/router.php';
            break;

        case '':
            // API root - return API info
            echo json_encode([
                'success' => true,
                'message' => 'Z2B Legacy Builders API',
                'version' => '1.0.0',
                'endpoints' => [
                    '/api/v1/auth' => 'Authentication',
                    '/api/v1/members' => 'Member management',
                    '/api/v1/commissions' => 'Commission tracking',
                    '/api/v1/marketplace' => 'Marketplace',
                    '/api/v1/coach' => 'AI Coach',
                    '/api/v1/tiers' => 'Membership tiers',
                    '/api/v1/admin' => 'Admin panel',
                    '/api/v1/apps' => 'Integrated apps'
                ]
            ]);
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Endpoint not found',
                'path' => $path
            ]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => $_ENV['DEBUG_MODE'] === 'true' ? $e->getMessage() : 'An error occurred'
    ]);
}
