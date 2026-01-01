<?php
/**
 * Z2B Rate Limiting Middleware
 *
 * Include this file at the top of all API endpoints to enforce rate limiting
 *
 * Usage:
 * require_once __DIR__ . '/rate-limit-middleware.php';
 * $limit_check = checkRateLimit($db, $member_id, 'endpoint_name', 'request_type');
 *
 * @package Z2B
 * @version 1.0.0
 */

require_once __DIR__ . '/../includes/RateLimiter.php';

/**
 * Check rate limit and return response
 *
 * @param PDO $db Database connection
 * @param int $member_id Member ID
 * @param string $endpoint Endpoint being accessed
 * @param string $request_type Type of request
 * @return array Rate limit check result
 */
function checkRateLimit($db, $member_id, $endpoint = 'api', $request_type = 'general') {
    try {
        // Initialize rate limiter
        $limiter = new RateLimiter($db, $member_id);

        // Check if request is allowed
        $check = $limiter->checkLimit($endpoint, $request_type);

        // Send rate limit headers
        $limiter->sendRateLimitHeaders();

        // If not allowed, send 429 response
        if (!$check['allowed']) {
            http_response_code(429);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'RATE_LIMIT_EXCEEDED',
                'message' => $check['message'],
                'data' => $check['data'],
                'upgrade_recommended' => $check['upgrade_recommended'] ?? null
            ]);
            exit;
        }

        return [
            'limiter' => $limiter,
            'check' => $check
        ];

    } catch (Exception $e) {
        // Log error but don't block request
        error_log("Rate Limiter Error: " . $e->getMessage());
        return [
            'limiter' => null,
            'check' => ['allowed' => true, 'message' => 'Rate limiter bypassed due to error']
        ];
    }
}

/**
 * Record request after processing
 *
 * @param RateLimiter $limiter Rate limiter instance
 * @param string $endpoint Endpoint accessed
 * @param string $request_type Request type
 * @param string $http_method HTTP method
 * @param string $status Status (success, error, rate_limited)
 * @param int $response_code HTTP response code
 * @param int $start_time Request start time (microtime)
 */
function recordRateLimitedRequest($limiter, $endpoint, $request_type, $http_method = 'POST',
                                   $status = 'success', $response_code = 200, $start_time = null) {
    if (!$limiter) return;

    try {
        // Calculate response time
        $response_time = 0;
        if ($start_time) {
            $response_time = round((microtime(true) - $start_time) * 1000); // Convert to ms
        }

        $limiter->recordRequest($endpoint, $request_type, $http_method, $status, $response_code, $response_time);
    } catch (Exception $e) {
        error_log("Rate Limiter Record Error: " . $e->getMessage());
    }
}

/**
 * Get tier features for current user
 *
 * @param PDO $db Database connection
 * @param int $member_id Member ID
 * @return array Tier features
 */
function getTierFeatures($db, $member_id) {
    try {
        $limiter = new RateLimiter($db, $member_id);
        return $limiter->getTierFeatures();
    } catch (Exception $e) {
        error_log("Get Tier Features Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Check if user has specific feature
 *
 * @param PDO $db Database connection
 * @param int $member_id Member ID
 * @param string $feature Feature name
 * @return bool Has feature
 */
function hasFeature($db, $member_id, $feature) {
    try {
        $limiter = new RateLimiter($db, $member_id);
        return $limiter->hasFeature($feature);
    } catch (Exception $e) {
        error_log("Has Feature Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get usage data for current user
 *
 * @param PDO $db Database connection
 * @param int $member_id Member ID
 * @return array Usage data
 */
function getUsageData($db, $member_id) {
    try {
        $limiter = new RateLimiter($db, $member_id);
        return $limiter->getUsageData();
    } catch (Exception $e) {
        error_log("Get Usage Data Error: " . $e->getMessage());
        return [];
    }
}
