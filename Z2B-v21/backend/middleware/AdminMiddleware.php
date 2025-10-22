<?php
/**
 * Admin Authentication Middleware for Z2B Legacy Builders API
 * Ensures only admins can access admin routes
 */

require_once __DIR__ . '/AuthMiddleware.php';

class AdminMiddleware extends AuthMiddleware {

    /**
     * Validate admin access
     */
    public function validateAdminAuth() {
        // First validate regular auth
        if (!$this->validateAuth()) {
            return false;
        }

        $currentUser = $this->getCurrentUser();

        // Check if user is admin
        if (!isset($currentUser['userType']) || $currentUser['userType'] !== 'admin') {
            $this->sendForbidden('Admin access required');
            return false;
        }

        return true;
    }

    /**
     * Send forbidden response
     */
    private function sendForbidden($message) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit;
    }
}
