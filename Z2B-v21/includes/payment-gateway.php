<?php
/**
 * Z2B Legacy Builders - Payment Gateway Integration
 * Yoco Payment Processing
 * Version 21
 */

class PaymentGateway {
    private $db;
    private $secretKey;
    private $publicKey;
    private $webhookSecret;
    private $apiUrl = 'https://payments.yoco.com/api/v1/';

    public function __construct($database) {
        $this->db = $database;

        // Load Yoco configuration
        if (file_exists('../config/yoco.php')) {
            require_once '../config/yoco.php';
            $this->secretKey = YOCO_SECRET_KEY ?? '';
            $this->publicKey = YOCO_PUBLIC_KEY ?? '';
            $this->webhookSecret = YOCO_WEBHOOK_SECRET ?? '';
        } else {
            // Use test keys if config not found
            $this->secretKey = 'sk_test_960bfde0VBrLlpK098e4ffeb53e1';
            $this->publicKey = 'pk_test_ed3c54a6gOol69qa7f45';
            $this->webhookSecret = 'test_webhook_secret';
        }
    }

    /**
     * Process a one-time payment
     */
    public function processPayment($paymentData) {
        try {
            // Validate required fields
            $required = ['amount', 'email', 'name', 'description'];
            foreach ($required as $field) {
                if (empty($paymentData[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }

            // Convert amount to cents (Yoco expects cents)
            $amountInCents = intval($paymentData['amount'] * 100);

            // Create payment request
            $payload = [
                'amount' => $amountInCents,
                'currency' => 'ZAR',
                'description' => $paymentData['description'],
                'metadata' => [
                    'email' => $paymentData['email'],
                    'name' => $paymentData['name'],
                    'reference' => $paymentData['reference'] ?? uniqid('PAY'),
                    'member_id' => $paymentData['member_id'] ?? null
                ]
            ];

            // Make API request to Yoco
            $response = $this->makeApiRequest('charges', $payload, 'POST');

            if ($response && isset($response['id'])) {
                // Log successful payment
                $this->logPayment($paymentData, $response['id'], 'success');

                return [
                    'success' => true,
                    'reference' => $response['id'],
                    'amount' => $paymentData['amount'],
                    'message' => 'Payment processed successfully'
                ];
            } else {
                throw new Exception('Payment processing failed');
            }

        } catch (Exception $e) {
            // Log failed payment
            $this->logPayment($paymentData, null, 'failed', $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Process recurring subscription payment
     */
    public function processRecurringPayment($paymentData) {
        try {
            // For recurring payments, we need to first create/retrieve customer
            $customerId = $this->getOrCreateCustomer($paymentData['email'], $paymentData['name']);

            // Create subscription
            $payload = [
                'amount' => intval($paymentData['amount'] * 100),
                'currency' => 'ZAR',
                'customer' => $customerId,
                'description' => $paymentData['description'],
                'interval' => 'monthly',
                'metadata' => [
                    'reference' => $paymentData['reference'],
                    'type' => 'monthly_refuel'
                ]
            ];

            $response = $this->makeApiRequest('subscriptions', $payload, 'POST');

            if ($response && isset($response['id'])) {
                return [
                    'success' => true,
                    'reference' => $response['id'],
                    'subscription_id' => $response['id'],
                    'message' => 'Subscription created successfully'
                ];
            } else {
                throw new Exception('Subscription creation failed');
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Cancel a subscription
     */
    public function cancelSubscription($subscriptionId) {
        try {
            $response = $this->makeApiRequest("subscriptions/{$subscriptionId}/cancel", [], 'POST');

            if ($response && isset($response['status']) && $response['status'] === 'cancelled') {
                return [
                    'success' => true,
                    'message' => 'Subscription cancelled successfully'
                ];
            } else {
                throw new Exception('Failed to cancel subscription');
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Process refund
     */
    public function processRefund($chargeId, $amount = null, $reason = null) {
        try {
            $payload = [
                'charge' => $chargeId
            ];

            if ($amount !== null) {
                $payload['amount'] = intval($amount * 100);
            }

            if ($reason !== null) {
                $payload['reason'] = $reason;
            }

            $response = $this->makeApiRequest('refunds', $payload, 'POST');

            if ($response && isset($response['id'])) {
                // Log refund
                $this->logRefund($chargeId, $amount, $reason, 'success');

                return [
                    'success' => true,
                    'refund_id' => $response['id'],
                    'message' => 'Refund processed successfully'
                ];
            } else {
                throw new Exception('Refund processing failed');
            }

        } catch (Exception $e) {
            $this->logRefund($chargeId, $amount, $reason, 'failed', $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhook($payload, $signature) {
        $expectedSignature = hash_hmac('sha256', $payload, $this->webhookSecret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Process webhook event
     */
    public function processWebhook($event) {
        try {
            switch ($event['type']) {
                case 'payment.succeeded':
                    $this->handlePaymentSuccess($event['data']);
                    break;

                case 'payment.failed':
                    $this->handlePaymentFailure($event['data']);
                    break;

                case 'subscription.created':
                    $this->handleSubscriptionCreated($event['data']);
                    break;

                case 'subscription.cancelled':
                    $this->handleSubscriptionCancelled($event['data']);
                    break;

                case 'refund.succeeded':
                    $this->handleRefundSuccess($event['data']);
                    break;

                default:
                    // Log unknown event type
                    error_log("Unknown webhook event type: " . $event['type']);
            }

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Webhook processing error: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get or create customer
     */
    private function getOrCreateCustomer($email, $name) {
        // Check if customer exists
        $sql = "SELECT yoco_customer_id FROM members WHERE email = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$email]);
        $member = $stmt->fetch();

        if ($member && !empty($member['yoco_customer_id'])) {
            return $member['yoco_customer_id'];
        }

        // Create new customer
        $payload = [
            'email' => $email,
            'name' => $name
        ];

        $response = $this->makeApiRequest('customers', $payload, 'POST');

        if ($response && isset($response['id'])) {
            // Save customer ID
            $sql = "UPDATE members SET yoco_customer_id = ? WHERE email = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$response['id'], $email]);

            return $response['id'];
        }

        throw new Exception('Failed to create customer');
    }

    /**
     * Make API request to Yoco
     */
    private function makeApiRequest($endpoint, $data = [], $method = 'GET') {
        $url = $this->apiUrl . $endpoint;

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->secretKey,
            'Content-Type: application/json'
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            throw new Exception('API request failed: ' . $error);
        }

        $decodedResponse = json_decode($response, true);

        if ($httpCode >= 400) {
            $errorMessage = $decodedResponse['message'] ?? 'API request failed';
            throw new Exception($errorMessage);
        }

        return $decodedResponse;
    }

    /**
     * Log payment transaction
     */
    private function logPayment($paymentData, $reference, $status, $error = null) {
        try {
            $sql = "INSERT INTO payment_logs
                    (member_id, amount, reference, status, error_message, created_at)
                    VALUES (?, ?, ?, ?, ?, NOW())";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $paymentData['member_id'] ?? null,
                $paymentData['amount'],
                $reference,
                $status,
                $error
            ]);
        } catch (Exception $e) {
            error_log("Failed to log payment: " . $e->getMessage());
        }
    }

    /**
     * Log refund transaction
     */
    private function logRefund($chargeId, $amount, $reason, $status, $error = null) {
        try {
            $sql = "INSERT INTO refund_logs
                    (charge_id, amount, reason, status, error_message, created_at)
                    VALUES (?, ?, ?, ?, ?, NOW())";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$chargeId, $amount, $reason, $status, $error]);
        } catch (Exception $e) {
            error_log("Failed to log refund: " . $e->getMessage());
        }
    }

    /**
     * Handle successful payment webhook
     */
    private function handlePaymentSuccess($data) {
        // Update transaction status
        $sql = "UPDATE transactions
                SET status = 'completed', processed_at = NOW()
                WHERE payment_reference = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$data['id']]);

        // Send confirmation notification
        if (isset($data['metadata']['member_id'])) {
            $this->sendPaymentNotification($data['metadata']['member_id'], $data['amount'] / 100, 'success');
        }
    }

    /**
     * Handle failed payment webhook
     */
    private function handlePaymentFailure($data) {
        // Update transaction status
        $sql = "UPDATE transactions
                SET status = 'failed', processed_at = NOW()
                WHERE payment_reference = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$data['id']]);

        // Send failure notification
        if (isset($data['metadata']['member_id'])) {
            $this->sendPaymentNotification($data['metadata']['member_id'], $data['amount'] / 100, 'failed');
        }
    }

    /**
     * Handle subscription created webhook
     */
    private function handleSubscriptionCreated($data) {
        // Implementation for subscription created
        error_log("Subscription created: " . json_encode($data));
    }

    /**
     * Handle subscription cancelled webhook
     */
    private function handleSubscriptionCancelled($data) {
        // Implementation for subscription cancelled
        error_log("Subscription cancelled: " . json_encode($data));
    }

    /**
     * Handle successful refund webhook
     */
    private function handleRefundSuccess($data) {
        // Implementation for refund success
        error_log("Refund successful: " . json_encode($data));
    }

    /**
     * Send payment notification
     */
    private function sendPaymentNotification($memberId, $amount, $status) {
        $title = $status === 'success' ? 'Payment Successful' : 'Payment Failed';
        $message = $status === 'success'
            ? "Your payment of R{$amount} has been processed successfully."
            : "Your payment of R{$amount} could not be processed. Please try again.";

        $sql = "INSERT INTO notifications (member_id, type, title, message)
                VALUES (?, 'payment', ?, ?)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$memberId, $title, $message]);
    }

    /**
     * Get payment methods for member
     */
    public function getPaymentMethods($memberId) {
        // This would retrieve saved payment methods
        // For now, return default options
        return [
            ['type' => 'card', 'label' => 'Credit/Debit Card'],
            ['type' => 'eft', 'label' => 'Bank Transfer (EFT)']
        ];
    }

    /**
     * Generate payment link
     */
    public function generatePaymentLink($amount, $description, $metadata = []) {
        // This would generate a Yoco payment link
        // For demonstration, return a mock link
        return 'https://pay.yoco.com/z2b/' . uniqid();
    }
}

// Create payment logs table if not exists
$createPaymentLogsTable = "
CREATE TABLE IF NOT EXISTS payment_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT,
    amount DECIMAL(10,2),
    reference VARCHAR(100),
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_member (member_id),
    INDEX idx_reference (reference),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

$createRefundLogsTable = "
CREATE TABLE IF NOT EXISTS refund_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    charge_id VARCHAR(100),
    amount DECIMAL(10,2),
    reason TEXT,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_charge (charge_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

// Add yoco_customer_id to members table if not exists
$alterMembersTable = "
ALTER TABLE members
ADD COLUMN IF NOT EXISTS yoco_customer_id VARCHAR(100) AFTER referral_code,
ADD INDEX IF NOT EXISTS idx_yoco_customer (yoco_customer_id);
";