<?php
/**
 * Authentication Middleware for Z2B Legacy Builders API
 * Validates JWT tokens for protected routes
 */

require_once __DIR__ . '/../includes/JWTHandler.php';

class AuthMiddleware {
    private $jwt;
    private $publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/verify',
        '/tiers' // Public tier listing
    ];

    public function __construct() {
        $this->jwt = new JWTHandler();
    }

    /**
     * Check if route requires authentication
     */
    public function requiresAuth($route) {
        foreach ($this->publicRoutes as $publicRoute) {
            if (strpos($route, $publicRoute) !== false) {
                return false;
            }
        }
        return true;
    }

    /**
     * Validate authentication token
     */
    public function validateAuth() {
        $token = $this->jwt->getTokenFromHeader();

        if (!$token) {
            $this->sendUnauthorized('No token provided');
            return false;
        }

        $payload = $this->jwt->validateToken($token);

        if (!$payload) {
            $this->sendUnauthorized('Invalid or expired token');
            return false;
        }

        // Store user info in global variable for access in endpoints
        $GLOBALS['currentUser'] = $payload;

        return true;
    }

    /**
     * Get current authenticated user
     */
    public function getCurrentUser() {
        return $GLOBALS['currentUser'] ?? null;
    }

    /**
     * Send unauthorized response
     */
    private function sendUnauthorized($message) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit;
    }
}
