<?php
/**
 * Z2B Legacy Builders - Yoco Webhook Handler
 * Receives payment confirmation from Yoco and triggers auto-registration
 */

// Log all webhook requests for debugging
error_log("Yoco webhook received: " . date('Y-m-d H:i:s'));

require_once '../config/database.php';
require_once '../includes/EmailService.php';

class YocoWebhookHandler {
    private $db;
    private $emailService;
    private $webhookSecret;

    public function __construct($database) {
        $this->db = $database;
        $this->emailService = new EmailService();

        // Load webhook secret from config
        if (file_exists('../config/yoco.php')) {
            require_once '../config/yoco.php';
            $this->webhookSecret = YOCO_WEBHOOK_SECRET ?? '';
        }
    }

    /**
     * Process webhook event from Yoco
     */
    public function processWebhook($payload, $signature = null) {
        try {
            // Verify webhook signature (if secret is configured)
            if ($this->webhookSecret && $signature) {
                if (!$this->verifySignature($payload, $signature)) {
                    throw new Exception('Invalid webhook signature');
                }
            }

            $event = json_decode($payload, true);

            if (!$event) {
                throw new Exception('Invalid JSON payload');
            }

            error_log("Webhook event type: " . ($event['type'] ?? 'unknown'));

            // Handle different event types
            switch ($event['type'] ?? '') {
                case 'checkout.succeeded':
                case 'checkout.completed':
                case 'payment.succeeded':
                    return $this->handlePaymentSuccess($event);

                case 'checkout.failed':
                case 'payment.failed':
                    return $this->handlePaymentFailed($event);

                default:
                    error_log("Unhandled webhook event type: " . ($event['type'] ?? 'none'));
                    return ['success' => true, 'message' => 'Event type not handled'];
            }

        } catch (Exception $e) {
            error_log("Webhook error: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Handle successful payment
     */
    private function handlePaymentSuccess($event) {
        $checkoutId = $event['data']['id'] ?? $event['checkoutId'] ?? null;
        $metadata = $event['data']['metadata'] ?? [];

        if (!$checkoutId) {
            throw new Exception('No checkout ID in webhook');
        }

        error_log("Processing successful payment for checkout: $checkoutId");

        // Find payment session by checkout_id
        $sql = "SELECT * FROM payment_sessions WHERE checkout_id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$checkoutId]);
        $payment = $stmt->fetch();

        if (!$payment) {
            // Try to find by reference in metadata
            if (isset($metadata['reference'])) {
                $sql = "SELECT * FROM payment_sessions WHERE reference = ? LIMIT 1";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([$metadata['reference']]);
                $payment = $stmt->fetch();
            }
        }

        if (!$payment) {
            error_log("Payment session not found for checkout: $checkoutId");
            throw new Exception('Payment session not found');
        }

        // Update payment status
        $updateSql = "UPDATE payment_sessions SET status = 'completed' WHERE id = ?";
        $updateStmt = $this->db->prepare($updateSql);
        $updateStmt->execute([$payment['id']]);

        error_log("Payment status updated to completed for: " . $payment['reference']);

        return [
            'success' => true,
            'message' => 'Payment confirmed',
            'reference' => $payment['reference']
        ];
    }

    /**
     * Handle failed payment
     */
    private function handlePaymentFailed($event) {
        $checkoutId = $event['data']['id'] ?? $event['checkoutId'] ?? null;

        if ($checkoutId) {
            $sql = "UPDATE payment_sessions SET status = 'failed' WHERE checkout_id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$checkoutId]);

            error_log("Payment marked as failed for checkout: $checkoutId");
        }

        return [
            'success' => true,
            'message' => 'Payment failure recorded'
        ];
    }

    /**
     * Verify webhook signature
     */
    private function verifySignature($payload, $signature) {
        $expectedSignature = hash_hmac('sha256', $payload, $this->webhookSecret);
        return hash_equals($expectedSignature, $signature);
    }
}

// Process incoming webhook
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = file_get_contents('php://input');
    $signature = $_SERVER['HTTP_X_YOCO_SIGNATURE'] ?? null;

    error_log("Webhook payload: " . substr($payload, 0, 200) . "...");

    $handler = new YocoWebhookHandler($db);
    $result = $handler->processWebhook($payload, $signature);

    // Always return 200 to Yoco so they stop retrying
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode($result);
} else {
    // For GET requests, show webhook info
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'This endpoint only accepts POST requests from Yoco webhooks',
        'webhook_url' => 'https://z2blegacybuilders.co.za/api/yoco-webhook.php'
    ]);
}
