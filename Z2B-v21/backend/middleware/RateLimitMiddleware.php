<?php
/**
 * Rate Limiting Middleware for Z2B Legacy Builders API
 */

require_once __DIR__ . '/../includes/RateLimiter.php';

class RateLimitMiddleware {
    private $rateLimiter;
    private $limit;
    private $window;

    public function __construct() {
        $this->limit = (int)($_ENV['API_RATE_LIMIT'] ?? 100);
        $this->window = (int)($_ENV['API_RATE_WINDOW'] ?? 60);

        if (class_exists('RateLimiter')) {
            $this->rateLimiter = new RateLimiter();
        }
    }

    /**
     * Check rate limit
     */
    public function check($identifier = null) {
        // Use IP address if no identifier provided
        if (!$identifier) {
            $identifier = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        }

        if ($this->rateLimiter) {
            $allowed = $this->rateLimiter->checkLimit($identifier, $this->limit, $this->window);

            if (!$allowed) {
                $this->sendTooManyRequests();
                return false;
            }
        }

        return true;
    }

    /**
     * Send too many requests response
     */
    private function sendTooManyRequests() {
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Too many requests. Please try again later.',
            'retryAfter' => $this->window
        ]);
        exit;
    }
}
