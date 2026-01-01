<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';
require_once '../includes/auth.php';

class Marketplace {
    private $db;
    private $member_id;

    // Platform fee configuration
    const PLATFORM_FEE_PERCENT = 5.0;

    // MLM commission structure
    const COMMISSION_LEVELS = [
        1 => 10.0,  // Level 1: 10%
        2 => 7.0,   // Level 2: 7%
        3 => 5.0,   // Level 3: 5%
        'bonus' => 3.0  // Bonus pool: 3%
    ];

    public function __construct($database) {
        $this->db = $database;
        $this->member_id = $_SESSION['member_id'] ?? null;
    }

    public function createProduct($data) {
        if (!$this->member_id) {
            return ['error' => 'Authentication required'];
        }

        try {
            // Calculate intelligent pricing
            $pricing = $this->calculateIntelligentPricing(
                $data['member_profit'],
                $data['product_type']
            );

            // Prepare product data
            $sql = "INSERT INTO marketplace_products
                    (seller_id, category_id, product_type, name, description, features,
                     member_profit, mlm_commission_pool, platform_fee, retail_price,
                     stock_quantity, delivery_method, delivery_time, images, video_url, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval')";

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                $this->member_id,
                $data['category_id'],
                $data['product_type'],
                $data['name'],
                $data['description'],
                json_encode($data['features'] ?? []),
                $pricing['member_profit'],
                $pricing['mlm_commission'],
                $pricing['platform_fee'],
                $pricing['retail_price'],
                $data['stock_quantity'] ?? null,
                $data['delivery_method'] ?? null,
                $data['delivery_time'] ?? null,
                json_encode($data['images'] ?? []),
                $data['video_url'] ?? null
            ]);

            if ($result) {
                $productId = $this->db->lastInsertId();

                // Log activity
                $this->logActivity('product_created', "Created product: {$data['name']}");

                // Notify admin for approval
                $this->notifyAdminForApproval($productId);

                return [
                    'success' => true,
                    'product_id' => $productId,
                    'pricing' => $pricing,
                    'message' => 'Product created and pending approval'
                ];
            }

            return ['error' => 'Failed to create product'];

        } catch (Exception $e) {
            return ['error' => 'Database error: ' . $e->getMessage()];
        }
    }

    public function calculateIntelligentPricing($memberProfit, $productType) {
        // Get pricing algorithm for product type
        $sql = "SELECT * FROM pricing_algorithms WHERE product_type = ? AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$productType]);
        $algorithm = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$algorithm) {
            // Use default algorithm
            $algorithm = [
                'base_platform_fee_percent' => 5.0,
                'min_mlm_commission_percent' => 25.0,
                'level1_percent' => 10.0,
                'level2_percent' => 7.0,
                'level3_percent' => 5.0,
                'bonus_pool_percent' => 3.0
            ];
        }

        // Calculate MLM commission pool
        $mlmCommissionPercent = $algorithm['level1_percent'] +
                                $algorithm['level2_percent'] +
                                $algorithm['level3_percent'] +
                                $algorithm['bonus_pool_percent'];

        // Calculate base price (member profit + estimated commissions)
        $basePrice = $memberProfit / (1 - ($mlmCommissionPercent / 100) - ($algorithm['base_platform_fee_percent'] / 100));

        // Calculate actual amounts
        $mlmCommission = $basePrice * ($mlmCommissionPercent / 100);
        $platformFee = $basePrice * ($algorithm['base_platform_fee_percent'] / 100);
        $retailPrice = $memberProfit + $mlmCommission + $platformFee;

        // Round to nearest 0.50
        $retailPrice = round($retailPrice * 2) / 2;

        return [
            'member_profit' => $memberProfit,
            'mlm_commission' => round($mlmCommission, 2),
            'platform_fee' => round($platformFee, 2),
            'retail_price' => $retailPrice,
            'breakdown' => [
                'member_profit_percent' => round(($memberProfit / $retailPrice) * 100, 2),
                'mlm_commission_percent' => round(($mlmCommission / $retailPrice) * 100, 2),
                'platform_fee_percent' => round(($platformFee / $retailPrice) * 100, 2)
            ]
        ];
    }

    public function processOrder($productId, $quantity = 1, $shippingAddress = null) {
        if (!$this->member_id) {
            return ['error' => 'Authentication required'];
        }

        try {
            $this->db->beginTransaction();

            // Get product details
            $product = $this->getProduct($productId);
            if (!$product) {
                throw new Exception('Product not found');
            }

            if ($product['status'] !== 'active') {
                throw new Exception('Product not available');
            }

            // Check stock if physical product
            if ($product['product_type'] === 'physical' && $product['stock_quantity'] < $quantity) {
                throw new Exception('Insufficient stock');
            }

            // Generate order number
            $orderNumber = 'ORD' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

            // Calculate amounts
            $unitPrice = $product['retail_price'];
            $totalAmount = $unitPrice * $quantity;
            $memberProfit = $product['member_profit'] * $quantity;
            $mlmCommission = $product['mlm_commission_pool'] * $quantity;
            $platformFee = $product['platform_fee'] * $quantity;

            // Create order
            $sql = "INSERT INTO marketplace_orders
                    (order_number, buyer_id, product_id, seller_id, quantity,
                     unit_price, total_amount, member_profit, mlm_commission,
                     platform_fee, status, shipping_address)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $orderNumber,
                $this->member_id,
                $productId,
                $product['seller_id'],
                $quantity,
                $unitPrice,
                $totalAmount,
                $memberProfit,
                $mlmCommission,
                $platformFee,
                json_encode($shippingAddress)
            ]);

            $orderId = $this->db->lastInsertId();

            // Update stock for physical products
            if ($product['product_type'] === 'physical') {
                $sql = "UPDATE marketplace_products
                        SET stock_quantity = stock_quantity - ?
                        WHERE id = ?";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([$quantity, $productId]);
            }

            $this->db->commit();

            return [
                'success' => true,
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount,
                'message' => 'Order created successfully'
            ];

        } catch (Exception $e) {
            $this->db->rollBack();
            return ['error' => $e->getMessage()];
        }
    }

    public function confirmPayment($orderId, $paymentReference) {
        try {
            $this->db->beginTransaction();

            // Update order status
            $sql = "UPDATE marketplace_orders
                    SET status = 'paid',
                        payment_reference = ?,
                        paid_date = NOW()
                    WHERE id = ?";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$paymentReference, $orderId]);

            // Get order details
            $sql = "SELECT * FROM marketplace_orders WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$orderId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            // Distribute commissions
            $this->distributeCommissions($order);

            // Notify seller
            $this->notifySeller($order);

            $this->db->commit();

            return [
                'success' => true,
                'message' => 'Payment confirmed and commissions distributed'
            ];

        } catch (Exception $e) {
            $this->db->rollBack();
            return ['error' => $e->getMessage()];
        }
    }

    private function distributeCommissions($order) {
        // Get buyer's upline for MLM commission distribution
        $upline = $this->getUpline($order['buyer_id'], 3);

        $totalCommission = $order['mlm_commission'];
        $remainingCommission = $totalCommission;

        // Distribute to upline levels
        foreach ($upline as $level => $sponsor) {
            if (!$sponsor) continue;

            $percentage = self::COMMISSION_LEVELS[$level] ?? 0;
            $amount = ($totalCommission * $percentage) / 100;

            if ($amount > 0) {
                $this->createCommission($order['id'], $sponsor['id'], "level{$level}", $amount, $percentage);
                $remainingCommission -= $amount;
            }
        }

        // Add remaining to bonus pool
        if ($remainingCommission > 0) {
            $this->distributeBonusPool($order['id'], $remainingCommission);
        }

        // Credit seller's profit
        $this->creditSellerProfit($order);

        // Credit platform fee
        $this->creditPlatformFee($order);
    }

    private function getUpline($memberId, $levels = 3) {
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

    private function createCommission($orderId, $recipientId, $type, $amount, $percentage) {
        $sql = "INSERT INTO marketplace_commissions
                (order_id, recipient_id, commission_type, amount, percentage, status)
                VALUES (?, ?, ?, ?, ?, 'approved')";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId, $recipientId, $type, $amount, $percentage]);

        // Add to member's transaction history
        $sql = "INSERT INTO transactions
                (member_id, transaction_type, amount, description, reference_id, status)
                VALUES (?, 'marketplace', ?, ?, ?, 'completed')";

        $description = "Marketplace commission - " . ucfirst($type);
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$recipientId, $amount, $description, $orderId]);
    }

    private function distributeBonusPool($orderId, $amount) {
        // Get top performers for bonus distribution
        $sql = "SELECT m.id, COUNT(o.id) as sales_count
                FROM members m
                JOIN marketplace_orders o ON m.id = o.seller_id
                WHERE o.status IN ('completed', 'delivered')
                  AND o.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY m.id
                ORDER BY sales_count DESC
                LIMIT 10";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $topPerformers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($topPerformers) > 0) {
            $bonusPerPerson = $amount / count($topPerformers);

            foreach ($topPerformers as $performer) {
                $this->createCommission($orderId, $performer['id'], 'bonus', $bonusPerPerson, 0);
            }
        }
    }

    private function creditSellerProfit($order) {
        $sql = "INSERT INTO transactions
                (member_id, transaction_type, amount, description, reference_id, status)
                VALUES (?, 'marketplace', ?, ?, ?, 'completed')";

        $description = "Product sale profit - Order #{$order['order_number']}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$order['seller_id'], $order['member_profit'], $description, $order['id']]);
    }

    private function creditPlatformFee($order) {
        // Platform fees go to system account
        $sql = "INSERT INTO transactions
                (member_id, transaction_type, amount, description, reference_id, status)
                VALUES (1, 'marketplace', ?, ?, ?, 'completed')";

        $description = "Platform fee - Order #{$order['order_number']}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$order['platform_fee'], $description, $order['id']]);
    }

    public function getProduct($productId) {
        $sql = "SELECT p.*, c.name as category_name, m.first_name, m.last_name
                FROM marketplace_products p
                JOIN product_categories c ON p.category_id = c.id
                JOIN members m ON p.seller_id = m.id
                WHERE p.id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$productId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function searchProducts($filters = []) {
        $sql = "SELECT p.*, c.name as category_name, m.first_name, m.last_name,
                       COALESCE(AVG(r.rating), 0) as avg_rating,
                       COUNT(DISTINCT r.id) as review_count
                FROM marketplace_products p
                JOIN product_categories c ON p.category_id = c.id
                JOIN members m ON p.seller_id = m.id
                LEFT JOIN product_reviews r ON p.id = r.product_id
                WHERE p.status = 'active'";

        $params = [];

        if (!empty($filters['category'])) {
            $sql .= " AND p.category_id = ?";
            $params[] = $filters['category'];
        }

        if (!empty($filters['type'])) {
            $sql .= " AND p.product_type = ?";
            $params[] = $filters['type'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['min_price'])) {
            $sql .= " AND p.retail_price >= ?";
            $params[] = $filters['min_price'];
        }

        if (!empty($filters['max_price'])) {
            $sql .= " AND p.retail_price <= ?";
            $params[] = $filters['max_price'];
        }

        $sql .= " GROUP BY p.id";

        // Sorting
        $sortBy = $filters['sort'] ?? 'newest';
        switch ($sortBy) {
            case 'price_low':
                $sql .= " ORDER BY p.retail_price ASC";
                break;
            case 'price_high':
                $sql .= " ORDER BY p.retail_price DESC";
                break;
            case 'rating':
                $sql .= " ORDER BY avg_rating DESC";
                break;
            case 'popular':
                $sql .= " ORDER BY p.views DESC";
                break;
            default:
                $sql .= " ORDER BY p.created_at DESC";
        }

        // Pagination
        $page = max(1, intval($filters['page'] ?? 1));
        $limit = min(100, max(10, intval($filters['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $sql .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM marketplace_products WHERE status = 'active'";
        $stmt = $this->db->prepare($countSql);
        $stmt->execute();
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        return [
            'products' => $products,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ];
    }

    public function getSellerDashboard() {
        if (!$this->member_id) {
            return ['error' => 'Authentication required'];
        }

        // Get seller's products
        $sql = "SELECT
                    COUNT(*) as total_products,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_products,
                    SUM(views) as total_views
                FROM marketplace_products
                WHERE seller_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id]);
        $productStats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get sales statistics
        $sql = "SELECT
                    COUNT(*) as total_orders,
                    SUM(quantity) as units_sold,
                    SUM(member_profit) as total_profit,
                    SUM(total_amount) as total_revenue
                FROM marketplace_orders
                WHERE seller_id = ? AND status IN ('completed', 'delivered')";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id]);
        $salesStats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get recent orders
        $sql = "SELECT o.*, p.name as product_name, m.first_name as buyer_name
                FROM marketplace_orders o
                JOIN marketplace_products p ON o.product_id = p.id
                JOIN members m ON o.buyer_id = m.id
                WHERE o.seller_id = ?
                ORDER BY o.order_date DESC
                LIMIT 10";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id]);
        $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get product performance
        $sql = "SELECT
                    p.id, p.name, p.views,
                    COUNT(DISTINCT o.id) as orders,
                    COALESCE(SUM(o.quantity), 0) as units_sold,
                    COALESCE(SUM(o.member_profit), 0) as profit,
                    COALESCE(AVG(r.rating), 0) as avg_rating
                FROM marketplace_products p
                LEFT JOIN marketplace_orders o ON p.id = o.product_id AND o.status IN ('completed', 'delivered')
                LEFT JOIN product_reviews r ON p.id = r.product_id
                WHERE p.seller_id = ?
                GROUP BY p.id
                ORDER BY profit DESC
                LIMIT 5";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id]);
        $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'product_stats' => $productStats,
            'sales_stats' => $salesStats,
            'recent_orders' => $recentOrders,
            'top_products' => $topProducts
        ];
    }

    private function notifyAdminForApproval($productId) {
        // Implementation would send notification to admin
        // For now, just log it
        $this->logActivity('admin_notification', "New product pending approval: ID $productId");
    }

    private function notifySeller($order) {
        $sql = "INSERT INTO notifications
                (member_id, type, title, message, action_url)
                VALUES (?, ?, ?, ?, ?)";

        $title = "New Order Received!";
        $message = "You have received a new order #{$order['order_number']}";
        $actionUrl = "/seller/orders/{$order['id']}";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$order['seller_id'], 'order', $title, $message, $actionUrl]);
    }

    private function logActivity($action, $description) {
        $sql = "INSERT INTO activity_logs (user_id, user_type, action, description, ip_address)
                VALUES (?, 'member', ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id, $action, $description, $_SERVER['REMOTE_ADDR'] ?? null]);
    }
}

// Handle API requests
$marketplace = new Marketplace($db);
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'product':
                $productId = $_GET['id'] ?? 0;
                echo json_encode($marketplace->getProduct($productId));
                break;
            case 'search':
                echo json_encode($marketplace->searchProducts($_GET));
                break;
            case 'dashboard':
                echo json_encode($marketplace->getSellerDashboard());
                break;
            case 'pricing':
                $memberProfit = $_GET['profit'] ?? 100;
                $productType = $_GET['type'] ?? 'digital';
                echo json_encode($marketplace->calculateIntelligentPricing($memberProfit, $productType));
                break;
            default:
                echo json_encode(['error' => 'Invalid action']);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        switch ($action) {
            case 'create':
                echo json_encode($marketplace->createProduct($input));
                break;
            case 'order':
                $productId = $input['product_id'] ?? 0;
                $quantity = $input['quantity'] ?? 1;
                $shipping = $input['shipping_address'] ?? null;
                echo json_encode($marketplace->processOrder($productId, $quantity, $shipping));
                break;
            case 'confirm-payment':
                $orderId = $input['order_id'] ?? 0;
                $reference = $input['payment_reference'] ?? '';
                echo json_encode($marketplace->confirmPayment($orderId, $reference));
                break;
            default:
                echo json_encode(['error' => 'Invalid action']);
        }
        break;

    default:
        echo json_encode(['error' => 'Method not allowed']);
}