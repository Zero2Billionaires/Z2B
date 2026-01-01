<?php
/**
 * JWT Token Handler for Z2B Legacy Builders
 * Handles JWT token creation, validation, and refresh
 */

class JWTHandler {
    private $secret;
    private $expiry;
    private $refreshExpiry;

    public function __construct() {
        $this->secret = $_ENV['JWT_SECRET'] ?? 'default-secret-change-in-production';
        $this->expiry = (int)($_ENV['JWT_EXPIRY'] ?? 86400); // 24 hours
        $this->refreshExpiry = (int)($_ENV['REFRESH_TOKEN_EXPIRY'] ?? 604800); // 7 days
    }

    /**
     * Generate JWT token
     */
    public function generateToken($userId, $userType = 'member', $additionalClaims = []) {
        $header = $this->base64UrlEncode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));

        $issuedAt = time();
        $expiresAt = $issuedAt + $this->expiry;

        $payload = array_merge([
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'userId' => $userId,
            'userType' => $userType
        ], $additionalClaims);

        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));

        $signature = $this->base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", $this->secret, true)
        );

        return "$header.$payloadEncoded.$signature";
    }

    /**
     * Generate refresh token
     */
    public function generateRefreshToken($userId, $userType = 'member') {
        $header = $this->base64UrlEncode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));

        $issuedAt = time();
        $expiresAt = $issuedAt + $this->refreshExpiry;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'userId' => $userId,
            'userType' => $userType,
            'tokenType' => 'refresh'
        ];

        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));

        $signature = $this->base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", $this->secret, true)
        );

        return "$header.$payloadEncoded.$signature";
    }

    /**
     * Validate and decode JWT token
     */
    public function validateToken($token) {
        try {
            $parts = explode('.', $token);

            if (count($parts) !== 3) {
                return false;
            }

            list($headerEncoded, $payloadEncoded, $signatureProvided) = $parts;

            // Verify signature
            $signatureExpected = $this->base64UrlEncode(
                hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $this->secret, true)
            );

            if (!hash_equals($signatureExpected, $signatureProvided)) {
                return false;
            }

            // Decode payload
            $payload = json_decode($this->base64UrlDecode($payloadEncoded), true);

            if (!$payload) {
                return false;
            }

            // Check expiration
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return false;
            }

            return $payload;
        } catch (Exception $e) {
            error_log("JWT validation error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Extract token from Authorization header
     */
    public function getTokenFromHeader() {
        $headers = getallheaders();

        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];

            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Base64 URL encode
     */
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     */
    private function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Check if token is expired
     */
    public function isExpired($token) {
        $payload = $this->validateToken($token);

        if (!$payload) {
            return true;
        }

        return isset($payload['exp']) && $payload['exp'] < time();
    }

    /**
     * Get token expiry time
     */
    public function getExpiry() {
        return $this->expiry;
    }
}
