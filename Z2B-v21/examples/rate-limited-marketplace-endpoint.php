<?php
/**
 * Example: Rate-Limited Marketplace Product Creation
 *
 * Shows how to integrate rate limiting into marketplace endpoints
 * with tier-based product limits
 *
 * @package Z2B
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/Auth.php';
require_once __DIR__ . '/../api/rate-limit-middleware.php';

$start_time = microtime(true);

try {
    $database = new Database();
    $db = $database->getConnection();

    $auth = new Auth($db);
    if (!$auth->isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }

    $member_id = $_SESSION['member_id'];
    $method = $_SERVER['REQUEST_METHOD'];

    // ========================================
    // DIFFERENT RATE LIMITS FOR DIFFERENT ACTIONS
    // ========================================

    switch ($method) {
        case 'GET':
            // Viewing products - lighter limit
            $limit_check = checkRateLimit($db, $member_id, 'marketplace-view', 'marketplace_view');
            break;

        case 'POST':
            // Creating products - stricter limit
            $limit_check = checkRateLimit($db, $member_id, 'marketplace-create', 'marketplace_create');
            break;

        case 'PUT':
            // Updating products - medium limit
            $limit_check = checkRateLimit($db, $member_id, 'marketplace-update', 'marketplace_update');
            break;

        case 'DELETE':
            // Deleting products - medium limit
            $limit_check = checkRateLimit($db, $member_id, 'marketplace-delete', 'marketplace_delete');
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            exit;
    }

    $limiter = $limit_check['limiter'];

    // ========================================
    // TIER-BASED PRODUCT LIMITS
    // ========================================

    // Get tier features
    $features = getTierFeatures($db, $member_id);
    $tier_code = $_SESSION['member_data']['tier_code'] ?? 'FAM';

    // Define product limits per tier
    $product_limits = [
        'FAM' => 5,        // Free tier: 5 products
        'BLB' => 25,       // Bronze: 25 products
        'CLB' => 50,       // Copper: 50 products
        'SLB' => 100,      // Silver: 100 products
        'GLB' => 250,      // Gold: 250 products
        'PLB' => 999999    // Platinum: unlimited
    ];

    $max_products = $product_limits[$tier_code] ?? 5;

    // ========================================
    // HANDLE REQUEST BASED ON METHOD
    // ========================================

    $input = json_decode(file_get_contents('php://input'), true);
    $endpoint_name = "marketplace-" . strtolower($method);

    switch ($method) {
        case 'GET':
            // Get products
            $result = getProducts($db, $member_id, $input);
            $status = 'success';
            $response_code = 200;
            break;

        case 'POST':
            // Check product limit before creating
            $current_count = getCurrentProductCount($db, $member_id);

            if ($current_count >= $max_products) {
                recordRateLimitedRequest($limiter, $endpoint_name, 'marketplace_create', 'POST', 'error', 403, $start_time);

                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'PRODUCT_LIMIT_REACHED',
                    'message' => "You've reached the product limit for your tier ({$max_products} products)",
                    'current_count' => $current_count,
                    'max_allowed' => $max_products,
                    'upgrade_recommended' => true,
                    'next_tier' => getNextTierInfo($tier_code)
                ]);
                exit;
            }

            // Create product
            $result = createProduct($db, $member_id, $input, $features);
            $status = 'success';
            $response_code = 201;
            break;

        case 'PUT':
            // Update product
            $result = updateProduct($db, $member_id, $input, $features);
            $status = 'success';
            $response_code = 200;
            break;

        case 'DELETE':
            // Delete product
            $result = deleteProduct($db, $member_id, $input);
            $status = 'success';
            $response_code = 200;
            break;
    }

    // ========================================
    // RECORD SUCCESSFUL REQUEST
    // ========================================

    recordRateLimitedRequest(
        $limiter,
        $endpoint_name,
        'marketplace_' . strtolower($method),
        $method,
        $status,
        $response_code,
        $start_time
    );

    // Get usage data
    $usage_data = getUsageData($db, $member_id);

    // Return response
    http_response_code($response_code);
    echo json_encode([
        'success' => true,
        'data' => $result,
        'limits' => [
            'requests_remaining' => $usage_data['today']['available'],
            'products_count' => $current_count ?? getCurrentProductCount($db, $member_id),
            'products_max' => $max_products,
            'tier' => $tier_code
        ]
    ]);

} catch (Exception $e) {
    if (isset($limiter) && isset($endpoint_name)) {
        recordRateLimitedRequest($limiter, $endpoint_name, 'marketplace_error', $method ?? 'POST', 'error', 500, $start_time);
    }

    error_log("Marketplace Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'SERVER_ERROR',
        'message' => $e->getMessage()
    ]);
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function getCurrentProductCount($db, $member_id) {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM marketplace_products WHERE vendor_id = ?");
    $stmt->execute([$member_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return (int)$result['count'];
}

function createProduct($db, $member_id, $data, $features) {
    // Validate data
    $required = ['title', 'description', 'price'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Insert product
    $stmt = $db->prepare("
        INSERT INTO marketplace_products
        (vendor_id, title, description, price, category, image_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");

    $stmt->execute([
        $member_id,
        $data['title'],
        $data['description'],
        $data['price'],
        $data['category'] ?? 'general',
        $data['image_url'] ?? null
    ]);

    $product_id = $db->lastInsertId();

    // If export features enabled, auto-generate export formats
    if ($features['export_features']) {
        generateProductExports($db, $product_id);
    }

    return [
        'product_id' => $product_id,
        'title' => $data['title'],
        'export_generated' => $features['export_features']
    ];
}

function updateProduct($db, $member_id, $data, $features) {
    $product_id = $data['product_id'] ?? null;

    if (!$product_id) {
        throw new Exception("Product ID is required");
    }

    // Verify ownership
    $stmt = $db->prepare("SELECT vendor_id FROM marketplace_products WHERE id = ?");
    $stmt->execute([$product_id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product || $product['vendor_id'] != $member_id) {
        throw new Exception("Product not found or access denied");
    }

    // Update product
    $updates = [];
    $params = [];

    if (isset($data['title'])) {
        $updates[] = "title = ?";
        $params[] = $data['title'];
    }
    if (isset($data['description'])) {
        $updates[] = "description = ?";
        $params[] = $data['description'];
    }
    if (isset($data['price'])) {
        $updates[] = "price = ?";
        $params[] = $data['price'];
    }

    if (empty($updates)) {
        throw new Exception("No fields to update");
    }

    $params[] = $product_id;
    $sql = "UPDATE marketplace_products SET " . implode(', ', $updates) . " WHERE id = ?";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    return ['product_id' => $product_id, 'updated' => true];
}

function deleteProduct($db, $member_id, $data) {
    $product_id = $data['product_id'] ?? null;

    if (!$product_id) {
        throw new Exception("Product ID is required");
    }

    // Verify ownership and delete
    $stmt = $db->prepare("DELETE FROM marketplace_products WHERE id = ? AND vendor_id = ?");
    $stmt->execute([$product_id, $member_id]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Product not found or access denied");
    }

    return ['product_id' => $product_id, 'deleted' => true];
}

function getProducts($db, $member_id, $data) {
    $stmt = $db->prepare("
        SELECT * FROM marketplace_products
        WHERE vendor_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$member_id]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function generateProductExports($db, $product_id) {
    // Generate CSV, PDF, JSON exports for premium tiers
    // Implementation depends on your requirements
    return true;
}

function getNextTierInfo($current_tier) {
    $tiers = [
        'FAM' => ['code' => 'BLB', 'name' => 'Bronze', 'products' => 25],
        'BLB' => ['code' => 'CLB', 'name' => 'Copper', 'products' => 50],
        'CLB' => ['code' => 'SLB', 'name' => 'Silver', 'products' => 100],
        'SLB' => ['code' => 'GLB', 'name' => 'Gold', 'products' => 250],
        'GLB' => ['code' => 'PLB', 'name' => 'Platinum', 'products' => 'Unlimited']
    ];

    return $tiers[$current_tier] ?? null;
}
