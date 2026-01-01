<?php
/**
 * Shipping Integration System
 *
 * Handles physical product shipping:
 * - Shipping label generation
 * - Courier integration (PostNet, Courier Guy, etc.)
 * - Tracking number management
 * - Shipping cost calculation
 * - Delivery status updates
 *
 * @version 1.0
 * @date January 2026
 */

class ShippingIntegration {
    private $db;
    private $courierAPI;
    private $config;

    public function __construct($dbConnection, $config = []) {
        $this->db = $dbConnection;
        $this->config = array_merge([
            'default_courier' => 'postn', // postnet
            'sender_name' => 'Z2B Legacy Builders',
            'sender_address' => '123 Business Park, Sandton',
            'sender_city' => 'Johannesburg',
            'sender_postal' => '2196',
            'sender_phone' => '+27 11 123 4567',
            'sender_email' => 'shipping@z2blegacybuilders.co.za'
        ], $config);
    }

    /**
     * Process shipping for physical products in order
     *
     * @param int $orderId Order ID
     * @return array Shipping details
     */
    public function processOrderShipping($orderId) {
        $order = $this->getOrder($orderId);
        if (!$order) {
            throw new Exception("Order not found: $orderId");
        }

        if ($order['payment_status'] !== 'paid') {
            throw new Exception("Order must be paid before processing shipping");
        }

        // Get physical products
        $physicalItems = $this->getPhysicalOrderItems($orderId);

        if (empty($physicalItems)) {
            return ['message' => 'No physical products in this order'];
        }

        // Calculate shipping details
        $shippingDetails = $this->calculateShipping($order, $physicalItems);

        // Create shipment
        $shipmentId = $this->createShipment($order, $physicalItems, $shippingDetails);

        // Generate shipping label
        $labelData = $this->generateShippingLabel($shipmentId);

        // Book courier
        $courierBooking = $this->bookCourier($shipmentId, $shippingDetails);

        // Update order with tracking
        $this->updateOrderShipping(
            $orderId,
            $courierBooking['tracking_number'],
            $courierBooking['courier_name'],
            $labelData['label_url']
        );

        // Send shipping confirmation email
        $this->sendShippingConfirmationEmail($order, $courierBooking);

        return [
            'shipment_id' => $shipmentId,
            'tracking_number' => $courierBooking['tracking_number'],
            'courier' => $courierBooking['courier_name'],
            'estimated_delivery' => $courierBooking['estimated_delivery'],
            'label_url' => $labelData['label_url']
        ];
    }

    /**
     * Calculate shipping costs and details
     */
    private function calculateShipping($order, $items) {
        $shippingAddress = json_decode($order['shipping_address'], true);

        // Calculate total weight and dimensions
        $totalWeight = 0;
        $totalVolume = 0;

        foreach ($items as $item) {
            $product = $this->getProduct($item['product_id']);
            $totalWeight += ($product['weight'] ?? 1) * $item['quantity'];
        }

        // Get shipping options for destination
        $destination = $shippingAddress['city'] ?? 'Unknown';
        $postalCode = $shippingAddress['postal'] ?? '';

        // Determine shipping method (standard, express, etc.)
        $shippingMethod = $order['shipping_method'] ?? 'standard';

        // Calculate cost based on weight and distance
        $baseCost = 50; // Base shipping cost
        $weightCost = $totalWeight * 10; // R10 per kg
        $totalCost = $baseCost + $weightCost;

        // Distance multiplier (simplified)
        if ($this->isRemoteArea($postalCode)) {
            $totalCost *= 1.5;
        }

        // Express shipping
        if ($shippingMethod === 'express') {
            $totalCost *= 2;
            $estimatedDays = 1;
        } else {
            $estimatedDays = 3-5;
        }

        return [
            'cost' => $totalCost,
            'weight' => $totalWeight,
            'method' => $shippingMethod,
            'estimated_days' => $estimatedDays,
            'destination' => $destination,
            'postal_code' => $postalCode
        ];
    }

    /**
     * Create shipment record
     */
    private function createShipment($order, $items, $shippingDetails) {
        $shippingAddress = json_decode($order['shipping_address'], true);

        $sql = "INSERT INTO shipments (
                    order_id,
                    recipient_name,
                    recipient_phone,
                    recipient_email,
                    shipping_address,
                    shipping_city,
                    shipping_postal,
                    shipping_country,
                    total_weight,
                    shipping_method,
                    shipping_cost,
                    estimated_delivery_days,
                    status,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $order['id'],
            $order['buyer_name'],
            $order['buyer_phone'],
            $order['buyer_email'],
            $shippingAddress['address'] ?? '',
            $shippingAddress['city'] ?? '',
            $shippingAddress['postal'] ?? '',
            $shippingAddress['country'] ?? 'ZA',
            $shippingDetails['weight'],
            $shippingDetails['method'],
            $shippingDetails['cost'],
            $shippingDetails['estimated_days']
        ]);

        return $this->db->lastInsertId();
    }

    /**
     * Generate shipping label PDF
     */
    private function generateShippingLabel($shipmentId) {
        $shipment = $this->getShipment($shipmentId);

        // In production: Use TCPDF or similar library to generate PDF
        // For now, generate a simple text label

        $labelContent = $this->buildLabelContent($shipment);
        $labelFilename = "shipping_label_{$shipmentId}.pdf";
        $labelPath = sys_get_temp_dir() . '/' . $labelFilename;

        // Save label (simplified - use proper PDF library in production)
        file_put_contents($labelPath, $labelContent);

        // Store label URL
        $labelUrl = "/labels/" . $labelFilename;

        $sql = "UPDATE shipments
                SET shipping_label_url = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$labelUrl, $shipmentId]);

        return [
            'label_path' => $labelPath,
            'label_url' => $labelUrl,
            'label_filename' => $labelFilename
        ];
    }

    /**
     * Build shipping label content
     */
    private function buildLabelContent($shipment) {
        $order = $this->getOrder($shipment['order_id']);

        $label = "
        ========================================
        Z2B LEGACY BUILDERS - SHIPPING LABEL
        ========================================

        ORDER: {$order['order_number']}
        SHIPMENT ID: {$shipment['id']}
        DATE: " . date('Y-m-d H:i:s') . "

        FROM:
        {$this->config['sender_name']}
        {$this->config['sender_address']}
        {$this->config['sender_city']}, {$this->config['sender_postal']}
        Tel: {$this->config['sender_phone']}

        TO:
        {$shipment['recipient_name']}
        {$shipment['shipping_address']}
        {$shipment['shipping_city']}, {$shipment['shipping_postal']}
        {$shipment['shipping_country']}
        Tel: {$shipment['recipient_phone']}

        WEIGHT: {$shipment['total_weight']} kg
        METHOD: " . strtoupper($shipment['shipping_method']) . "
        TRACKING: {$shipment['tracking_number']}

        ========================================
        ";

        return $label;
    }

    /**
     * Book courier pickup/delivery
     */
    private function bookCourier($shipmentId, $shippingDetails) {
        $shipment = $this->getShipment($shipmentId);

        // Generate tracking number
        $trackingNumber = $this->generateTrackingNumber();

        // In production: Make API call to courier service
        // For demo purposes, simulate booking

        $courierName = $this->getCourierName($this->config['default_courier']);
        $estimatedDelivery = date('Y-m-d', strtotime("+{$shippingDetails['estimated_days']} days"));

        // Update shipment with courier details
        $sql = "UPDATE shipments
                SET tracking_number = ?,
                    courier_name = ?,
                    estimated_delivery_date = ?,
                    status = 'booked',
                    booked_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $trackingNumber,
            $courierName,
            $estimatedDelivery,
            $shipmentId
        ]);

        // Log courier booking
        $this->logShipmentEvent($shipmentId, 'booked', "Courier booked: {$courierName}");

        return [
            'tracking_number' => $trackingNumber,
            'courier_name' => $courierName,
            'estimated_delivery' => $estimatedDelivery,
            'booking_reference' => 'BK-' . $shipmentId
        ];
    }

    /**
     * Generate tracking number
     */
    private function generateTrackingNumber() {
        return 'Z2B' . date('Ymd') . strtoupper(substr(md5(uniqid()), 0, 8));
    }

    /**
     * Track shipment status
     */
    public function trackShipment($trackingNumber) {
        $sql = "SELECT s.*, o.order_number
                FROM shipments s
                INNER JOIN marketplace_orders o ON s.order_id = o.id
                WHERE s.tracking_number = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$trackingNumber]);
        $shipment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$shipment) {
            return [
                'found' => false,
                'message' => 'Tracking number not found'
            ];
        }

        // Get tracking events
        $events = $this->getShipmentEvents($shipment['id']);

        // In production: Query courier API for real-time updates
        // For demo: Return stored data

        return [
            'found' => true,
            'tracking_number' => $trackingNumber,
            'order_number' => $shipment['order_number'],
            'status' => $shipment['status'],
            'courier' => $shipment['courier_name'],
            'estimated_delivery' => $shipment['estimated_delivery_date'],
            'recipient' => $shipment['recipient_name'],
            'destination' => $shipment['shipping_city'],
            'events' => $events
        ];
    }

    /**
     * Update shipment status
     */
    public function updateShipmentStatus($trackingNumber, $status, $notes = '') {
        $validStatuses = ['pending', 'booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];

        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status: $status");
        }

        $sql = "UPDATE shipments
                SET status = ?,
                    updated_at = NOW()
                WHERE tracking_number = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$status, $trackingNumber]);

        // Get shipment ID
        $shipment = $this->getShipmentByTracking($trackingNumber);
        if ($shipment) {
            $this->logShipmentEvent($shipment['id'], $status, $notes);

            // If delivered, mark order as complete
            if ($status === 'delivered') {
                $this->markOrderDelivered($shipment['order_id']);
            }
        }

        return ['success' => true, 'status' => $status];
    }

    /**
     * Update order with shipping info
     */
    private function updateOrderShipping($orderId, $trackingNumber, $courierName, $labelUrl) {
        $sql = "UPDATE marketplace_orders
                SET tracking_number = ?,
                    shipping_method = ?,
                    order_status = 'processing',
                    shipped_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$trackingNumber, $courierName, $orderId]);
    }

    /**
     * Mark order as delivered
     */
    private function markOrderDelivered($orderId) {
        $sql = "UPDATE marketplace_orders
                SET order_status = 'completed',
                    delivered_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId]);

        // Trigger commission distribution if not already done
        // (Will be handled by MarketplaceCommissionDistributor)
    }

    /**
     * Send shipping confirmation email
     */
    private function sendShippingConfirmationEmail($order, $courierBooking) {
        $to = $order['buyer_email'];
        $subject = "Your Order Has Shipped! - #{$order['order_number']}";

        $body = "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <h2 style='color: #6C63FF;'>📦 Your Order is On The Way!</h2>
            <p>Hi {$order['buyer_name']},</p>
            <p>Great news! Your order has been shipped.</p>

            <div style='background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;'>
                <h3>Tracking Information</h3>
                <p><strong>Tracking Number:</strong> {$courierBooking['tracking_number']}</p>
                <p><strong>Courier:</strong> {$courierBooking['courier_name']}</p>
                <p><strong>Estimated Delivery:</strong> {$courierBooking['estimated_delivery']}</p>
            </div>

            <p><a href='https://z2b.co.za/track?number={$courierBooking['tracking_number']}'
                  style='background: #6C63FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;'>
                Track Your Shipment
            </a></p>

            <p>Thank you for shopping with Z2B!</p>
        </body>
        </html>
        ";

        // Send email (use proper email service in production)
        // mail($to, $subject, $body, $headers);

        return true;
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

    private function getPhysicalOrderItems($orderId) {
        $sql = "SELECT oi.*
                FROM marketplace_order_items oi
                INNER JOIN marketplace_products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                AND p.product_type = 'physical'";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getProduct($productId) {
        $sql = "SELECT * FROM marketplace_products WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$productId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getShipment($shipmentId) {
        $sql = "SELECT * FROM shipments WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$shipmentId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getShipmentByTracking($trackingNumber) {
        $sql = "SELECT * FROM shipments WHERE tracking_number = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$trackingNumber]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getShipmentEvents($shipmentId) {
        $sql = "SELECT * FROM shipment_events
                WHERE shipment_id = ?
                ORDER BY created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$shipmentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function logShipmentEvent($shipmentId, $status, $notes) {
        $sql = "INSERT INTO shipment_events (
                    shipment_id, status, notes, created_at
                ) VALUES (?, ?, ?, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$shipmentId, $status, $notes]);
    }

    private function isRemoteArea($postalCode) {
        // Simplified remote area detection
        // In production: Use proper postal code database
        $remoteAreas = ['6000', '8000', '9000']; // Example remote postal codes
        return in_array($postalCode, $remoteAreas);
    }

    private function getCourierName($code) {
        $couriers = [
            'postnet' => 'PostNet',
            'courierguy' => 'The Courier Guy',
            'dawn_wing' => 'Dawn Wing',
            'fastway' => 'Fastway Couriers',
            'aramex' => 'Aramex'
        ];

        return $couriers[$code] ?? 'Standard Courier';
    }
}

// ========================================
// ADDITIONAL REQUIRED DATABASE TABLES
// ========================================

/*
CREATE TABLE IF NOT EXISTS shipments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50),
    recipient_email VARCHAR(255),
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100),
    shipping_postal VARCHAR(20),
    shipping_country VARCHAR(3) DEFAULT 'ZA',
    total_weight DECIMAL(10,2),
    shipping_method VARCHAR(50),
    shipping_cost DECIMAL(10,2),
    tracking_number VARCHAR(100) UNIQUE,
    courier_name VARCHAR(100),
    shipping_label_url VARCHAR(500),
    estimated_delivery_days INT,
    estimated_delivery_date DATE,
    status ENUM('pending', 'booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed') DEFAULT 'pending',
    booked_at TIMESTAMP NULL,
    picked_up_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    INDEX idx_tracking (tracking_number),
    INDEX idx_order (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS shipment_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shipment_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    INDEX idx_shipment (shipment_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/

?>
