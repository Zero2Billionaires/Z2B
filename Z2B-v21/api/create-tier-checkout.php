<?php
/**
 * Z2B Legacy Builders - Yoco Checkout Creation for Tier Purchases
 * Creates a Yoco checkout session for tier purchases from landing page
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../config/app.php';

class TierCheckout {
    private $secretKey;
    private $apiUrl = 'https://payments.yoco.com/api/checkouts';

    public function __construct() {
        // Load Yoco configuration
        if (file_exists('../config/yoco.php')) {
            require_once '../config/yoco.php';
            $this->secretKey = YOCO_SECRET_KEY ?? '';
        } else {
            // Use test key
            $this->secretKey = 'sk_test_960bfde0VBrLlpK098e4ffeb53e1';
        }
    }

    /**
     * Create a Yoco checkout session for tier purchase
     */
    public function createCheckout($tierCode, $referralCode = null) {
        global $TIER_CONFIG;

        try {
            // Validate tier
            if (!isset($TIER_CONFIG[$tierCode])) {
                throw new Exception('Invalid tier selected');
            }

            $tier = $TIER_CONFIG[$tierCode];
            $amountInCents = $tier['price'] * 100; // Convert to cents

            // Generate unique reference
            $reference = 'TIER-' . $tierCode . '-' . uniqid();

            // Prepare checkout payload
            // Determine base path (for XAMPP or production)
            $basePath = strpos($_SERVER['REQUEST_URI'], '/Z2B-v21/') !== false ? '/Z2B-v21' : '';

            $payload = [
                'amount' => $amountInCents,
                'currency' => 'ZAR',
                'successUrl' => $this->getBaseUrl() . $basePath . '/payment-success.php?ref=' . $reference . '&tier=' . $tierCode,
                'cancelUrl' => $this->getBaseUrl() . $basePath . '/app/landing-page.html#tiers',
                'failureUrl' => $this->getBaseUrl() . $basePath . '/payment-failed.php?ref=' . $reference,
                'metadata' => [
                    'tier_code' => $tierCode,
                    'tier_name' => $tier['name'],
                    'reference' => $reference,
                    'referral_code' => $referralCode
                ]
            ];

            // Make API request to Yoco
            $ch = curl_init($this->apiUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $this->secretKey,
                    'Content-Type: application/json'
                ],
                CURLOPT_POSTFIELDS => json_encode($payload)
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                throw new Exception('API request failed: ' . $error);
            }

            $responseData = json_decode($response, true);

            if ($httpCode >= 200 && $httpCode < 300 && isset($responseData['redirectUrl'])) {
                // Store checkout details for verification
                $this->storeCheckoutSession($reference, $tierCode, $referralCode, $responseData['id']);

                return [
                    'success' => true,
                    'redirectUrl' => $responseData['redirectUrl'],
                    'checkoutId' => $responseData['id'],
                    'reference' => $reference
                ];
            } else {
                $errorMessage = $responseData['message'] ?? 'Checkout creation failed';
                throw new Exception($errorMessage);
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Store checkout session for later verification
     */
    private function storeCheckoutSession($reference, $tierCode, $referralCode, $checkoutId) {
        global $db;

        try {
            $sql = "INSERT INTO payment_sessions
                    (reference, tier_code, referral_code, checkout_id, status, created_at)
                    VALUES (?, ?, ?, ?, 'pending', NOW())";

            $stmt = $db->prepare($sql);
            $stmt->execute([$reference, $tierCode, $referralCode, $checkoutId]);
        } catch (Exception $e) {
            // Log error but don't fail the checkout
            error_log("Failed to store checkout session: " . $e->getMessage());
        }
    }

    /**
     * Get base URL for callbacks
     */
    private function getBaseUrl() {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $protocol . '://' . $host;
    }
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $tierCode = $input['tier_code'] ?? '';
    $referralCode = $input['referral_code'] ?? null;

    if (empty($tierCode)) {
        echo json_encode(['success' => false, 'error' => 'Tier code is required']);
        exit;
    }

    $checkout = new TierCheckout();
    $result = $checkout->createCheckout($tierCode, $referralCode);

    echo json_encode($result);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
