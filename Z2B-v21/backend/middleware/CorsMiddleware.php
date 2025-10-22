<?php
/**
 * CORS Middleware for Z2B Legacy Builders API
 * Handles Cross-Origin Resource Sharing
 */

class CorsMiddleware {
    private $allowedOrigins;

    public function __construct() {
        $origins = $_ENV['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:5173';
        $this->allowedOrigins = array_map('trim', explode(',', $origins));
    }

    /**
     * Handle CORS headers
     */
    public function handle() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Check if origin is allowed
        if (in_array($origin, $this->allowedOrigins) || in_array('*', $this->allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
        }

        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 3600");

        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit(0);
        }

        return true;
    }
}
