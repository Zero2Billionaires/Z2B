<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';
require_once '../includes/auth.php';
require_once '../includes/payment-gateway.php';

class MonthlyRefuel {
    private $db;
    private $member_id;
    private $payment;

    // Subscription configuration
    const MAX_RETRY_ATTEMPTS = 3;
    const RETRY_DELAY_DAYS = 3;
    const GRACE_PERIOD_DAYS = 7;

    public function __construct($database) {
        $this->db = $database;
        $this->member_id = $_SESSION['member_id'] ?? null;
        $this->payment = new PaymentGateway($database);
    }

    public function createSubscription($tierId) {
        if (!$this->member_id) {
            return ['error' => 'Authentication required'];
        }

        try {
            $this->db->beginTransaction();

            // Get tier details
            $tier = $this->getTierDetails($tierId);
            if (!$tier) {
                throw new Exception('Invalid tier selected');
            }

            // Check if member already has active subscription
            $existing = $this->getActiveSubscription();
            if ($existing) {
                throw new Exception('You already have an active subscription. Please cancel it first.');
            }

            // Create subscription record
            $sql = "INSERT INTO monthly_refuel
                    (member_id, tier_id, amount, billing_date, next_billing_date, status, payment_method)
                    VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'pending', 'yoco')";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$this->member_id, $tierId, $tier['monthly_cost']]);
            $subscriptionId = $this->db->lastInsertId();

            // Process initial payment
            $paymentResult = $this->processSubscriptionPayment($subscriptionId);

            if ($paymentResult['success']) {
                // Update member tier
                $this->updateMemberTier($tierId);

                // Activate subscription
                $this->activateSubscription($subscriptionId, $paymentResult['reference']);

                // Calculate and distribute commissions
                $this->distributeRefuelCommissions($subscriptionId, $tier['monthly_cost']);

                $this->db->commit();

                return [
                    'success' => true,
                    'subscription_id' => $subscriptionId,
                    'message' => 'Subscription activated successfully',
                    'next_billing_date' => date('Y-m-d', strtotime('+1 month'))
                ];
            } else {
                $this->db->rollBack();
                return ['error' => 'Payment failed: ' . $paymentResult['error']];
            }

        } catch (Exception $e) {
            $this->db->rollBack();
            return ['error' => $e->getMessage()];
        }
    }

    public function processMonthlyBilling() {
        // This method would typically be called by a cron job
        try {
            // Get all subscriptions due for billing today
            $sql = "SELECT * FROM monthly_refuel
                    WHERE next_billing_date = CURDATE()
                    AND status = 'active'
                    AND retry_count < ?";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([self::MAX_RETRY_ATTEMPTS]);
            $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $results = [
                'processed' => 0,
                'successful' => 0,
                'failed' => 0,
                'details' => []
            ];

            foreach ($subscriptions as $subscription) {
                $result = $this->processSingleBilling($subscription);
                $results['processed']++;

                if ($result['success']) {
                    $results['successful']++;
                } else {
                    $results['failed']++;
                }

                $results['details'][] = [
                    'subscription_id' => $subscription['id'],
                    'member_id' => $subscription['member_id'],
                    'result' => $result
                ];
            }

            return $results;

        } catch (Exception $e) {
            return ['error' => 'Billing process failed: ' . $e->getMessage()];
        }
    }

    private function processSingleBilling($subscription) {
        try {
            $this->db->beginTransaction();

            // Process payment
            $paymentResult = $this->processSubscriptionPayment($subscription['id']);

            if ($paymentResult['success']) {
                // Reset retry count and update next billing date
                $sql = "UPDATE monthly_refuel
                        SET next_billing_date = DATE_ADD(next_billing_date, INTERVAL 1 MONTH),
                            retry_count = 0,
                            payment_reference = ?,
                            updated_at = NOW()
                        WHERE id = ?";

                $stmt = $this->db->prepare($sql);
                $stmt->execute([$paymentResult['reference'], $subscription['id']]);

                // Distribute commissions
                $this->distributeRefuelCommissions($subscription['id'], $subscription['amount']);

                // Create transaction record
                $this->createRefuelTransaction($subscription['member_id'], $subscription['amount'], 'completed');

                $this->db->commit();

                return ['success' => true, 'message' => 'Billing successful'];

            } else {
                // Handle failed payment
                $this->handleFailedBilling($subscription);
                $this->db->commit();

                return ['success' => false, 'error' => $paymentResult['error']];
            }

        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function handleFailedBilling($subscription) {
        $retryCount = $subscription['retry_count'] + 1;

        if ($retryCount >= self::MAX_RETRY_ATTEMPTS) {
            // Suspend subscription after max retries
            $sql = "UPDATE monthly_refuel
                    SET status = 'suspended',
                        retry_count = ?,
                        updated_at = NOW()
                    WHERE id = ?";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$retryCount, $subscription['id']]);

            // Downgrade member tier
            $this->downgradeMemberTier($subscription['member_id']);

            // Send suspension notification
            $this->sendSuspensionNotification($subscription['member_id']);

        } else {
            // Schedule retry
            $sql = "UPDATE monthly_refuel
                    SET retry_count = ?,
                        next_billing_date = DATE_ADD(CURDATE(), INTERVAL ? DAY),
                        updated_at = NOW()
                    WHERE id = ?";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$retryCount, self::RETRY_DELAY_DAYS, $subscription['id']]);

            // Send retry notification
            $this->sendRetryNotification($subscription['member_id'], $retryCount);
        }
    }

    public function cancelSubscription($reason = null) {
        if (!$this->member_id) {
            return ['error' => 'Authentication required'];
        }

        try {
            $subscription = $this->getActiveSubscription();
            if (!$subscription) {
                return ['error' => 'No active subscription found'];
            }

            $sql = "UPDATE monthly_refuel
                    SET status = 'cancelled',
                        updated_at = NOW()
                    WHERE id = ? AND member_id = ?";

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([$subscription['id'], $this->member_id]);

            if ($result) {
                // Log cancellation
                $this->logCancellation($subscription['id'], $reason);

                // Send confirmation
                $this->sendCancellationConfirmation($this->member_id);

                return [
                    'success' => true,
                    'message' => 'Subscription cancelled successfully'
                ];
            }

            return ['error' => 'Failed to cancel subscription'];

        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function updateSubscription($newTierId) {
        if (!$this->member_id) {
            return ['error' => 'Authentication required'];
        }

        try {
            $this->db->beginTransaction();

            $subscription = $this->getActiveSubscription();
            if (!$subscription) {
                return ['error' => 'No active subscription found'];
            }

            $newTier = $this->getTierDetails($newTierId);
            if (!$newTier) {
                throw new Exception('Invalid tier selected');
            }

            $oldTier = $this->getTierDetails($subscription['tier_id']);

            // Calculate proration if upgrading
            $proration = 0;
            if ($newTier['monthly_cost'] > $oldTier['monthly_cost']) {
                $daysRemaining = $this->calculateDaysUntilNextBilling($subscription['next_billing_date']);
                $dailyDifference = ($newTier['monthly_cost'] - $oldTier['monthly_cost']) / 30;
                $proration = $dailyDifference * $daysRemaining;

                // Process proration payment
                if ($proration > 0) {
                    $paymentResult = $this->processProrationPayment($subscription['id'], $proration);
                    if (!$paymentResult['success']) {
                        throw new Exception('Proration payment failed');
                    }
                }
            }

            // Update subscription
            $sql = "UPDATE monthly_refuel
                    SET tier_id = ?,
                        amount = ?,
                        updated_at = NOW()
                    WHERE id = ? AND member_id = ?";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$newTierId, $newTier['monthly_cost'], $subscription['id'], $this->member_id]);

            // Update member tier
            $this->updateMemberTier($newTierId);

            $this->db->commit();

            return [
                'success' => true,
                'message' => $newTier['monthly_cost'] > $oldTier['monthly_cost'] ? 'Subscription upgraded successfully' : 'Subscription downgraded successfully',
                'proration_charged' => $proration
            ];

        } catch (Exception $e) {
            $this->db->rollBack();
            return ['error' => $e->getMessage()];
        }
    }

    public function getSubscriptionDetails() {
        if (!$this->member_id) {
            return ['error' => 'Authentication required'];
        }

        $subscription = $this->getActiveSubscription();
        if (!$subscription) {
            return ['error' => 'No active subscription found'];
        }

        // Get billing history
        $sql = "SELECT * FROM transactions
                WHERE member_id = ? AND transaction_type = 'refuel'
                ORDER BY created_at DESC
                LIMIT 12";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id]);
        $billingHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get tier details
        $tier = $this->getTierDetails($subscription['tier_id']);

        return [
            'subscription' => $subscription,
            'tier' => $tier,
            'billing_history' => $billingHistory,
            'next_billing_date' => $subscription['next_billing_date'],
            'can_cancel' => true,
            'can_upgrade' => $subscription['tier_id'] < 5,
            'can_downgrade' => $subscription['tier_id'] > 1
        ];
    }

    private function distributeRefuelCommissions($subscriptionId, $amount) {
        // Get subscription details
        $sql = "SELECT * FROM monthly_refuel WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$subscriptionId]);
        $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get member's upline for commission distribution
        $upline = $this->getMemberUpline($subscription['member_id'], 3);

        // Commission structure for monthly refuel
        $commissionRates = [
            1 => 0.10,  // Level 1: 10%
            2 => 0.07,  // Level 2: 7%
            3 => 0.05   // Level 3: 5%
        ];

        foreach ($upline as $level => $sponsor) {
            if (!$sponsor) continue;

            $commission = $amount * $commissionRates[$level];

            // Create commission transaction
            $sql = "INSERT INTO transactions
                    (member_id, transaction_type, amount, description, reference_id, status)
                    VALUES (?, 'refuel', ?, ?, ?, 'completed')";

            $description = "Monthly refuel commission - Level $level";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$sponsor['id'], $commission, $description, $subscriptionId]);
        }
    }

    private function getMemberUpline($memberId, $levels = 3) {
        $upline = [];
        $currentMemberId = $memberId;

        for ($i = 1; $i <= $levels; $i++) {
            $sql = "SELECT m.* FROM members m
                    JOIN referrals r ON m.id = r.sponsor_id
                    WHERE r.member_id = ?";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$currentMemberId]);
            $sponsor = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($sponsor) {
                $upline[$i] = $sponsor;
                $currentMemberId = $sponsor['id'];
            } else {
                break;
            }
        }

        return $upline;
    }

    private function getActiveSubscription() {
        $sql = "SELECT s.*, t.name as tier_name, t.monthly_cost
                FROM monthly_refuel s
                JOIN tiers t ON s.tier_id = t.id
                WHERE s.member_id = ? AND s.status = 'active'
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getTierDetails($tierId) {
        $sql = "SELECT * FROM tiers WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tierId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function updateMemberTier($tierId) {
        $sql = "UPDATE members SET tier_id = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tierId, $this->member_id]);
    }

    private function downgradeMemberTier($memberId) {
        // Downgrade to Bronze (tier 1) when subscription fails
        $sql = "UPDATE members SET tier_id = 1 WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$memberId]);
    }

    private function activateSubscription($subscriptionId, $paymentReference) {
        $sql = "UPDATE monthly_refuel
                SET status = 'active',
                    payment_reference = ?,
                    updated_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$paymentReference, $subscriptionId]);
    }

    private function processSubscriptionPayment($subscriptionId) {
        // Get subscription details
        $sql = "SELECT s.*, m.email, m.first_name, m.last_name
                FROM monthly_refuel s
                JOIN members m ON s.member_id = m.id
                WHERE s.id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$subscriptionId]);
        $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

        // Process payment through gateway
        return $this->payment->processRecurringPayment([
            'amount' => $subscription['amount'],
            'email' => $subscription['email'],
            'name' => $subscription['first_name'] . ' ' . $subscription['last_name'],
            'description' => 'Z2B Monthly Refuel Subscription',
            'reference' => 'SUB' . $subscriptionId . '-' . date('Ymd')
        ]);
    }

    private function processProrationPayment($subscriptionId, $amount) {
        // Get member details
        $sql = "SELECT m.* FROM members m
                JOIN monthly_refuel s ON m.id = s.member_id
                WHERE s.id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$subscriptionId]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);

        return $this->payment->processPayment([
            'amount' => $amount,
            'email' => $member['email'],
            'name' => $member['first_name'] . ' ' . $member['last_name'],
            'description' => 'Z2B Subscription Upgrade Proration',
            'reference' => 'PROR' . $subscriptionId . '-' . date('Ymd')
        ]);
    }

    private function createRefuelTransaction($memberId, $amount, $status) {
        $sql = "INSERT INTO transactions
                (member_id, transaction_type, amount, description, status)
                VALUES (?, 'refuel', ?, 'Monthly subscription payment', ?)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$memberId, $amount, $status]);
    }

    private function calculateDaysUntilNextBilling($nextBillingDate) {
        $today = new DateTime();
        $billing = new DateTime($nextBillingDate);
        $interval = $today->diff($billing);
        return $interval->days;
    }

    private function sendSuspensionNotification($memberId) {
        $sql = "INSERT INTO notifications
                (member_id, type, title, message)
                VALUES (?, 'subscription', 'Subscription Suspended',
                'Your monthly subscription has been suspended due to payment failure. Please update your payment method to reactivate.')";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$memberId]);
    }

    private function sendRetryNotification($memberId, $retryCount) {
        $sql = "INSERT INTO notifications
                (member_id, type, title, message)
                VALUES (?, 'subscription', 'Payment Retry Scheduled',
                ?)";

        $message = "Payment attempt $retryCount of " . self::MAX_RETRY_ATTEMPTS .
                  " failed. We will retry in " . self::RETRY_DELAY_DAYS . " days.";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$memberId, $message]);
    }

    private function sendCancellationConfirmation($memberId) {
        $sql = "INSERT INTO notifications
                (member_id, type, title, message)
                VALUES (?, 'subscription', 'Subscription Cancelled',
                'Your monthly subscription has been cancelled successfully. You will retain access until the end of your current billing period.')";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$memberId]);
    }

    private function logCancellation($subscriptionId, $reason) {
        $sql = "INSERT INTO activity_logs
                (user_id, user_type, action, description)
                VALUES (?, 'member', 'subscription_cancelled', ?)";

        $description = "Subscription $subscriptionId cancelled. Reason: " . ($reason ?? 'Not provided');
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id, $description]);
    }
}

// Handle API requests
$refuel = new MonthlyRefuel($db);
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'details':
                echo json_encode($refuel->getSubscriptionDetails());
                break;
            case 'tiers':
                $sql = "SELECT * FROM tiers ORDER BY monthly_cost";
                $stmt = $db->query($sql);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
                break;
            default:
                echo json_encode(['error' => 'Invalid action']);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        switch ($action) {
            case 'create':
                $tierId = $input['tier_id'] ?? 0;
                echo json_encode($refuel->createSubscription($tierId));
                break;
            case 'cancel':
                $reason = $input['reason'] ?? null;
                echo json_encode($refuel->cancelSubscription($reason));
                break;
            case 'process-billing':
                // This would typically be called by a cron job
                echo json_encode($refuel->processMonthlyBilling());
                break;
            default:
                echo json_encode(['error' => 'Invalid action']);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        if ($action === 'update') {
            $newTierId = $input['new_tier_id'] ?? 0;
            echo json_encode($refuel->updateSubscription($newTierId));
        } else {
            echo json_encode(['error' => 'Invalid action']);
        }
        break;

    default:
        echo json_encode(['error' => 'Method not allowed']);
}