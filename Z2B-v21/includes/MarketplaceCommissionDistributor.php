<?php
/**
 * Marketplace Commission Distributor
 *
 * Handles automated commission distribution for marketplace sales
 * Integrates with existing Z2B MLM calculator to distribute:
 * - Seller Payout (member's desired income)
 * - ISP (Individual Sales Profit)
 * - QPB (Quick Pathfinder Bonus)
 * - TSC (Team Sales Commission - 10 generations)
 * - TPB (Team Performance Bonus)
 * - TLI (Team Leadership Incentive)
 * - CEO Awards
 * - Platform Fee (Z2B's cut)
 *
 * @version 2.0
 * @date January 2026
 */

require_once 'MLMCalculator.php';

class MarketplaceCommissionDistributor {
    private $db;
    private $mlmCalculator;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
        $this->mlmCalculator = new MLMCalculator($dbConnection);
    }

    /**
     * Main entry point: Distribute commissions for a completed order
     *
     * @param int $orderId Order ID
     * @return array Distribution results
     */
    public function distributeOrderCommissions($orderId) {
        // Get order details
        $order = $this->getOrder($orderId);
        if (!$order) {
            throw new Exception("Order not found: $orderId");
        }

        if ($order['order_status'] !== 'completed') {
            throw new Exception("Order must be completed before distributing commissions");
        }

        $results = [
            'order_id' => $orderId,
            'order_number' => $order['order_number'],
            'total_distributed' => 0,
            'distributions' => []
        ];

        // Get all order items
        $items = $this->getOrderItems($orderId);

        foreach ($items as $item) {
            $itemResults = $this->distributeItemCommissions($order, $item);
            $results['distributions'][] = $itemResults;
            $results['total_distributed'] += $itemResults['total_distributed'];
        }

        // Mark order as commissions distributed
        $this->markOrderCommissionsDistributed($orderId, $results['total_distributed']);

        return $results;
    }

    /**
     * Distribute commissions for a single order item
     *
     * @param array $order Order data
     * @param array $item Order item data
     * @return array Distribution breakdown
     */
    private function distributeItemCommissions($order, $item) {
        $buyerId = $order['buyer_id'];
        $productId = $item['product_id'];
        $quantity = $item['quantity'];

        // Pricing breakdown (per unit)
        $memberDesiredIncome = $item['member_desired_income'];
        $mlmCommissionPool = $item['mlm_commission_pool'];
        $platformFee = $item['platform_fee'];
        $unitPrice = $item['unit_price'];

        // Total amounts
        $totalMemberIncome = $memberDesiredIncome * $quantity;
        $totalMLMPool = $mlmCommissionPool * $quantity;
        $totalPlatformFee = $platformFee * $quantity;

        $results = [
            'item_id' => $item['id'],
            'product_name' => $item['product_name'],
            'quantity' => $quantity,
            'total_distributed' => 0,
            'commissions' => []
        ];

        // 1. PAY THE SELLER (Member's Desired Income)
        if ($item['seller_type'] === 'member') {
            $sellerPayout = $this->paySellerIncome(
                $order['id'],
                $item['id'],
                $item['seller_id'],
                $totalMemberIncome,
                $item['product_name']
            );
            $results['commissions'][] = $sellerPayout;
            $results['total_distributed'] += $sellerPayout['amount'];
        }

        // 2. DISTRIBUTE MLM COMMISSIONS (from the MLM Commission Pool)
        // Get buyer's sponsor/upline for commission eligibility
        $buyer = $this->getMember($buyerId);

        if ($buyer && $buyer['sponsor_id']) {
            // Calculate ISP for buyer's sponsor
            $ispCommission = $this->distributeISP(
                $order['id'],
                $item['id'],
                $buyer['sponsor_id'],
                $totalMLMPool, // Base for ISP calculation
                $item['product_name']
            );
            if ($ispCommission) {
                $results['commissions'][] = $ispCommission;
                $results['total_distributed'] += $ispCommission['amount'];
            }

            // Calculate QPB (if buyer is among first 3 personally invited)
            $qpbCommission = $this->distributeQPB(
                $order['id'],
                $item['id'],
                $buyer['sponsor_id'],
                $buyerId,
                $totalMLMPool,
                $item['product_name']
            );
            if ($qpbCommission) {
                $results['commissions'][] = $qpbCommission;
                $results['total_distributed'] += $qpbCommission['amount'];
            }

            // Calculate TSC (10 generations up from buyer's sponsor)
            $tscCommissions = $this->distributeTSC(
                $order['id'],
                $item['id'],
                $buyer['sponsor_id'],
                $totalMLMPool,
                $item['product_name']
            );
            foreach ($tscCommissions as $comm) {
                $results['commissions'][] = $comm;
                $results['total_distributed'] += $comm['amount'];
            }
        }

        // 3. COLLECT PLATFORM FEE (Z2B's earnings)
        $platformFeeCollection = $this->collectPlatformFee(
            $order['id'],
            $item['id'],
            $totalPlatformFee,
            $item['product_name']
        );
        $results['commissions'][] = $platformFeeCollection;

        // 4. Update order item with distribution details
        $this->updateOrderItemDistribution(
            $item['id'],
            $totalMemberIncome,
            $results['total_distributed'],
            $totalPlatformFee
        );

        return $results;
    }

    /**
     * Pay seller their desired income
     */
    private function paySellerIncome($orderId, $orderItemId, $sellerId, $amount, $productName) {
        $seller = $this->getMember($sellerId);

        $commissionId = $this->recordCommission([
            'order_id' => $orderId,
            'order_item_id' => $orderItemId,
            'recipient_id' => $sellerId,
            'recipient_name' => $seller['first_name'] . ' ' . $seller['last_name'],
            'commission_type' => 'SELLER_PAYOUT',
            'generation' => 0,
            'percentage' => 0,
            'amount' => $amount,
            'product_id' => null,
            'product_name' => $productName,
            'calculation_note' => 'Seller earnings from product sale'
        ]);

        // Add to member's wallet
        $this->creditMemberWallet($sellerId, $amount, 'SELLER_PAYOUT', "Sale: $productName");

        return [
            'id' => $commissionId,
            'type' => 'SELLER_PAYOUT',
            'recipient_id' => $sellerId,
            'recipient_name' => $seller['first_name'] . ' ' . $seller['last_name'],
            'amount' => $amount
        ];
    }

    /**
     * Distribute ISP (Individual Sales Profit) to buyer's sponsor
     */
    private function distributeISP($orderId, $orderItemId, $sponsorId, $saleAmount, $productName) {
        $sponsor = $this->getMember($sponsorId);
        if (!$sponsor) return null;

        // Use existing MLM calculator
        $ispData = $this->mlmCalculator->calculateISP($sponsor['tier_id'], $saleAmount);

        if ($ispData['amount'] <= 0) return null;

        $commissionId = $this->recordCommission([
            'order_id' => $orderId,
            'order_item_id' => $orderItemId,
            'recipient_id' => $sponsorId,
            'recipient_name' => $sponsor['first_name'] . ' ' . $sponsor['last_name'],
            'commission_type' => 'ISP',
            'generation' => 0,
            'percentage' => $ispData['percentage'],
            'amount' => $ispData['amount'],
            'product_id' => null,
            'product_name' => $productName,
            'calculation_note' => "ISP {$ispData['percentage']}% on marketplace sale"
        ]);

        $this->creditMemberWallet($sponsorId, $ispData['amount'], 'ISP', "Marketplace Sale: $productName");

        return [
            'id' => $commissionId,
            'type' => 'ISP',
            'recipient_id' => $sponsorId,
            'recipient_name' => $sponsor['first_name'] . ' ' . $sponsor['last_name'],
            'amount' => $ispData['amount'],
            'percentage' => $ispData['percentage']
        ];
    }

    /**
     * Distribute QPB (Quick Pathfinder Bonus)
     */
    private function distributeQPB($orderId, $orderItemId, $sponsorId, $buyerId, $saleAmount, $productName) {
        $sponsor = $this->getMember($sponsorId);
        if (!$sponsor) return null;

        // Check if buyer is among first 3 personally invited
        $referralPosition = $this->getReferralPosition($sponsorId, $buyerId);

        $qpbData = $this->mlmCalculator->calculateQPB($referralPosition, $saleAmount);

        if ($qpbData['amount'] <= 0) return null;

        $commissionId = $this->recordCommission([
            'order_id' => $orderId,
            'order_item_id' => $orderItemId,
            'recipient_id' => $sponsorId,
            'recipient_name' => $sponsor['first_name'] . ' ' . $sponsor['last_name'],
            'commission_type' => 'QPB',
            'generation' => 0,
            'percentage' => $qpbData['percentage'],
            'amount' => $qpbData['amount'],
            'product_id' => null,
            'product_name' => $productName,
            'calculation_note' => "QPB {$qpbData['percentage']}% (Referral #{$referralPosition})"
        ]);

        $this->creditMemberWallet($sponsorId, $qpbData['amount'], 'QPB', "Marketplace Sale: $productName");

        return [
            'id' => $commissionId,
            'type' => 'QPB',
            'recipient_id' => $sponsorId,
            'recipient_name' => $sponsor['first_name'] . ' ' . $sponsor['last_name'],
            'amount' => $qpbData['amount'],
            'percentage' => $qpbData['percentage']
        ];
    }

    /**
     * Distribute TSC (Team Sales Commission) - 10 generations
     */
    private function distributeTSC($orderId, $orderItemId, $sponsorId, $saleAmount, $productName) {
        $commissions = [];

        // Get upline chain (10 generations)
        $uplineChain = $this->getUplineChain($sponsorId, 10);

        if (empty($uplineChain)) return $commissions;

        // Use existing MLM calculator for TSC
        $tscData = $this->mlmCalculator->calculateTSC($uplineChain, $saleAmount);

        foreach ($tscData as $comm) {
            $member = $this->getMember($comm['member_id']);

            $commissionId = $this->recordCommission([
                'order_id' => $orderId,
                'order_item_id' => $orderItemId,
                'recipient_id' => $comm['member_id'],
                'recipient_name' => $member['first_name'] . ' ' . $member['last_name'],
                'commission_type' => 'TSC',
                'generation' => $comm['generation'],
                'percentage' => $comm['percentage'],
                'amount' => $comm['amount'],
                'product_id' => null,
                'product_name' => $productName,
                'calculation_note' => "TSC Gen {$comm['generation']} - {$comm['percentage']}%"
            ]);

            $this->creditMemberWallet(
                $comm['member_id'],
                $comm['amount'],
                'TSC',
                "Gen {$comm['generation']} - Marketplace: $productName"
            );

            $commissions[] = [
                'id' => $commissionId,
                'type' => 'TSC',
                'generation' => $comm['generation'],
                'recipient_id' => $comm['member_id'],
                'recipient_name' => $member['first_name'] . ' ' . $member['last_name'],
                'amount' => $comm['amount'],
                'percentage' => $comm['percentage']
            ];
        }

        return $commissions;
    }

    /**
     * Collect platform fee (Z2B's earnings)
     */
    private function collectPlatformFee($orderId, $orderItemId, $amount, $productName) {
        // Record as commission to "admin" or system account
        $commissionId = $this->recordCommission([
            'order_id' => $orderId,
            'order_item_id' => $orderItemId,
            'recipient_id' => 1, // Admin/System account
            'recipient_name' => 'Z2B Platform',
            'commission_type' => 'PLATFORM_FEE',
            'generation' => 0,
            'percentage' => 7.5,
            'amount' => $amount,
            'product_id' => null,
            'product_name' => $productName,
            'calculation_note' => '7.5% platform fee for marketplace transaction'
        ]);

        return [
            'id' => $commissionId,
            'type' => 'PLATFORM_FEE',
            'recipient_id' => 1,
            'recipient_name' => 'Z2B Platform',
            'amount' => $amount
        ];
    }

    /**
     * Record commission in database
     */
    private function recordCommission($data) {
        $sql = "INSERT INTO marketplace_commissions (
                    order_id, order_item_id, recipient_id, recipient_name,
                    commission_type, generation, percentage, amount,
                    product_id, product_name, calculation_note, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['order_id'],
            $data['order_item_id'],
            $data['recipient_id'],
            $data['recipient_name'],
            $data['commission_type'],
            $data['generation'],
            $data['percentage'],
            $data['amount'],
            $data['product_id'],
            $data['product_name'],
            $data['calculation_note']
        ]);

        return $this->db->lastInsertId();
    }

    /**
     * Credit member's wallet
     */
    private function creditMemberWallet($memberId, $amount, $type, $description) {
        $sql = "INSERT INTO transactions (
                    member_id, transaction_type, amount, description,
                    status, created_at
                ) VALUES (?, ?, ?, ?, 'completed', NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$memberId, $type, $amount, $description]);

        // Update member balance
        $sql = "UPDATE members SET wallet_balance = wallet_balance + ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$amount, $memberId]);
    }

    /**
     * Update order item with distribution details
     */
    private function updateOrderItemDistribution($itemId, $sellerPayout, $commissionsDistributed, $platformFee) {
        $sql = "UPDATE marketplace_order_items
                SET seller_payout = ?,
                    commissions_distributed = ?,
                    platform_fee_collected = ?,
                    fulfillment_status = 'fulfilled',
                    fulfilled_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$sellerPayout, $commissionsDistributed, $platformFee, $itemId]);
    }

    /**
     * Mark order as commissions distributed
     */
    private function markOrderCommissionsDistributed($orderId, $totalDistributed) {
        $sql = "UPDATE marketplace_orders
                SET total_mlm_commissions = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$totalDistributed, $orderId]);
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    private function getOrder($orderId) {
        $sql = "SELECT * FROM marketplace_orders WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getOrderItems($orderId) {
        $sql = "SELECT * FROM marketplace_order_items WHERE order_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getMember($memberId) {
        $sql = "SELECT * FROM members WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$memberId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getUplineChain($memberId, $generations = 10) {
        $chain = [];
        $currentId = $memberId;

        for ($i = 0; $i < $generations; $i++) {
            $sql = "SELECT id, sponsor_id, tier_id, first_name, last_name
                    FROM members WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$currentId]);
            $member = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$member || !$member['sponsor_id']) {
                break;
            }

            $chain[] = $member;
            $currentId = $member['sponsor_id'];
        }

        return $chain;
    }

    private function getReferralPosition($sponsorId, $memberId) {
        $sql = "SELECT COUNT(*) + 1 as position
                FROM members
                WHERE sponsor_id = ?
                AND id < ?
                AND created_at <= (SELECT created_at FROM members WHERE id = ?)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$sponsorId, $memberId, $memberId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['position'] ?? 999;
    }

    /**
     * Get commission summary for a member
     */
    public function getMemberMarketplaceEarnings($memberId, $startDate = null, $endDate = null) {
        $sql = "SELECT
                    commission_type,
                    COUNT(*) as count,
                    SUM(amount) as total_earned
                FROM marketplace_commissions
                WHERE recipient_id = ?
                AND status = 'paid'";

        $params = [$memberId];

        if ($startDate) {
            $sql .= " AND created_at >= ?";
            $params[] = $startDate;
        }

        if ($endDate) {
            $sql .= " AND created_at <= ?";
            $params[] = $endDate;
        }

        $sql .= " GROUP BY commission_type";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get seller's product sales and earnings
     */
    public function getSellerProductEarnings($sellerId, $productId = null) {
        $sql = "SELECT
                    oi.product_name,
                    COUNT(DISTINCT oi.order_id) as total_orders,
                    SUM(oi.quantity) as total_units_sold,
                    SUM(oi.seller_payout) as total_earned,
                    SUM(oi.commissions_distributed) as total_commissions_generated
                FROM marketplace_order_items oi
                INNER JOIN marketplace_orders o ON oi.order_id = o.id
                WHERE oi.seller_id = ?
                AND oi.seller_type = 'member'
                AND o.order_status = 'completed'";

        $params = [$sellerId];

        if ($productId) {
            $sql .= " AND oi.product_id = ?";
            $params[] = $productId;
        }

        $sql .= " GROUP BY oi.product_id, oi.product_name";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

// ========================================
// USAGE EXAMPLE
// ========================================

/*
// After an order is marked as 'completed' and payment is confirmed:

$db = new PDO("mysql:host=localhost;dbname=z2b", "username", "password");
$distributor = new MarketplaceCommissionDistributor($db);

try {
    $results = $distributor->distributeOrderCommissions(12345);

    echo "Order #" . $results['order_number'] . " commissions distributed\n";
    echo "Total distributed: R" . number_format($results['total_distributed'], 2) . "\n";

    foreach ($results['distributions'] as $item) {
        echo "\nProduct: " . $item['product_name'] . "\n";
        foreach ($item['commissions'] as $comm) {
            echo "  {$comm['type']}: R{$comm['amount']} to {$comm['recipient_name']}\n";
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
*/
?>
