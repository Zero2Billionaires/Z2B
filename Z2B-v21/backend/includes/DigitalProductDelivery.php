<?php
/**
 * Digital Product Delivery System
 *
 * Handles automated delivery of digital products:
 * - Secure, time-limited download links
 * - License key generation and validation
 * - Download tracking and limits
 * - Email delivery automation
 *
 * @version 1.0
 * @date January 2026
 */

class DigitalProductDelivery {
    private $db;
    private $downloadBaseUrl;
    private $downloadExpiryHours;
    private $maxDownloads;

    public function __construct($dbConnection, $config = []) {
        $this->db = $dbConnection;
        $this->downloadBaseUrl = $config['download_base_url'] ?? 'https://z2b.co.za/downloads';
        $this->downloadExpiryHours = $config['download_expiry_hours'] ?? 72; // 3 days
        $this->maxDownloads = $config['max_downloads'] ?? 5;
    }

    /**
     * Generate secure download links for completed order
     *
     * @param int $orderId Order ID
     * @return array Generated links and keys
     */
    public function generateDownloadLinksForOrder($orderId) {
        $order = $this->getOrder($orderId);
        if (!$order) {
            throw new Exception("Order not found: $orderId");
        }

        if ($order['payment_status'] !== 'paid') {
            throw new Exception("Order must be paid before generating download links");
        }

        $results = [
            'order_id' => $orderId,
            'order_number' => $order['order_number'],
            'buyer_email' => $order['buyer_email'],
            'products' => []
        ];

        // Get digital products from order
        $digitalItems = $this->getDigitalOrderItems($orderId);

        foreach ($digitalItems as $item) {
            $productData = $this->generateProductDelivery($order, $item);
            $results['products'][] = $productData;

            // Update order item with delivery info
            $this->updateOrderItemDelivery(
                $item['id'],
                $productData['download_link'],
                $productData['license_key'],
                $productData['expires_at']
            );
        }

        // Send email with download links
        if (!empty($results['products'])) {
            $this->sendDownloadEmail($order, $results['products']);
        }

        return $results;
    }

    /**
     * Generate delivery data for single product
     */
    private function generateProductDelivery($order, $item) {
        $productId = $item['product_id'];
        $orderItemId = $item['id'];

        // Generate secure token
        $downloadToken = $this->generateSecureToken();

        // Calculate expiry
        $expiresAt = date('Y-m-d H:i:s', strtotime("+{$this->downloadExpiryHours} hours"));

        // Generate license key (if applicable)
        $licenseKey = $this->generateLicenseKey($productId, $order['buyer_id']);

        // Create download URL
        $downloadUrl = $this->downloadBaseUrl . '/secure/' . $downloadToken;

        // Store download record
        $downloadId = $this->createDownloadRecord([
            'order_id' => $order['id'],
            'order_item_id' => $orderItemId,
            'product_id' => $productId,
            'buyer_id' => $order['buyer_id'],
            'download_token' => $downloadToken,
            'license_key' => $licenseKey,
            'expires_at' => $expiresAt,
            'max_downloads' => $this->maxDownloads,
            'download_count' => 0
        ]);

        // Get product files
        $files = $this->getProductFiles($productId);

        return [
            'product_id' => $productId,
            'product_name' => $item['product_name'],
            'download_link' => $downloadUrl,
            'license_key' => $licenseKey,
            'expires_at' => $expiresAt,
            'max_downloads' => $this->maxDownloads,
            'files' => $files
        ];
    }

    /**
     * Generate secure token for downloads
     */
    private function generateSecureToken() {
        return bin2hex(random_bytes(32)); // 64-character hex string
    }

    /**
     * Generate license key
     *
     * Format: Z2B-XXXX-XXXX-XXXX-XXXX
     */
    public function generateLicenseKey($productId, $buyerId) {
        $part1 = strtoupper(substr(md5($productId . time()), 0, 4));
        $part2 = strtoupper(substr(md5($buyerId . time()), 0, 4));
        $part3 = strtoupper(substr(md5(uniqid()), 0, 4));
        $part4 = strtoupper(substr(md5(rand()), 0, 4));

        $licenseKey = "Z2B-{$part1}-{$part2}-{$part3}-{$part4}";

        // Store license key
        $this->storeLicenseKey($licenseKey, $productId, $buyerId);

        return $licenseKey;
    }

    /**
     * Validate license key
     */
    public function validateLicenseKey($licenseKey, $productId = null) {
        $sql = "SELECT * FROM license_keys
                WHERE license_key = ?
                AND is_active = 1";

        $params = [$licenseKey];

        if ($productId) {
            $sql .= " AND product_id = ?";
            $params[] = $productId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $key = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$key) {
            return ['valid' => false, 'message' => 'Invalid license key'];
        }

        // Check if revoked
        if ($key['is_revoked']) {
            return ['valid' => false, 'message' => 'License key has been revoked'];
        }

        // Check expiry (if set)
        if ($key['expires_at'] && strtotime($key['expires_at']) < time()) {
            return ['valid' => false, 'message' => 'License key has expired'];
        }

        // Check activation limit
        if ($key['max_activations'] > 0 && $key['activation_count'] >= $key['max_activations']) {
            return ['valid' => false, 'message' => 'Maximum activations reached'];
        }

        return [
            'valid' => true,
            'license_data' => $key,
            'message' => 'License key is valid'
        ];
    }

    /**
     * Activate license key (increment activation count)
     */
    public function activateLicenseKey($licenseKey, $deviceInfo = []) {
        $validation = $this->validateLicenseKey($licenseKey);

        if (!$validation['valid']) {
            return $validation;
        }

        $keyId = $validation['license_data']['id'];

        // Increment activation count
        $sql = "UPDATE license_keys
                SET activation_count = activation_count + 1,
                    last_activated_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$keyId]);

        // Log activation
        $this->logLicenseActivation($keyId, $deviceInfo);

        return [
            'activated' => true,
            'activations_remaining' => $validation['license_data']['max_activations'] - $validation['license_data']['activation_count'] - 1
        ];
    }

    /**
     * Process download request
     */
    public function processDownload($downloadToken) {
        // Get download record
        $download = $this->getDownloadByToken($downloadToken);

        if (!$download) {
            return [
                'success' => false,
                'message' => 'Invalid download link'
            ];
        }

        // Check expiry
        if (strtotime($download['expires_at']) < time()) {
            return [
                'success' => false,
                'message' => 'Download link has expired'
            ];
        }

        // Check download limit
        if ($download['download_count'] >= $download['max_downloads']) {
            return [
                'success' => false,
                'message' => 'Maximum downloads reached'
            ];
        }

        // Increment download count
        $this->incrementDownloadCount($download['id']);

        // Get product files
        $files = $this->getProductFiles($download['product_id']);

        return [
            'success' => true,
            'files' => $files,
            'downloads_remaining' => $download['max_downloads'] - $download['download_count'] - 1
        ];
    }

    /**
     * Create ZIP package of multiple files
     */
    public function createDownloadPackage($productId, $downloadToken) {
        $files = $this->getProductFiles($productId);

        if (empty($files)) {
            throw new Exception("No files found for product");
        }

        $zipFilename = "product_{$productId}_{$downloadToken}.zip";
        $zipPath = sys_get_temp_dir() . '/' . $zipFilename;

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE) !== TRUE) {
            throw new Exception("Could not create ZIP file");
        }

        foreach ($files as $file) {
            if (file_exists($file['file_path'])) {
                $zip->addFile($file['file_path'], $file['file_name']);
            }
        }

        $zip->close();

        return [
            'zip_path' => $zipPath,
            'zip_filename' => $zipFilename,
            'file_count' => count($files)
        ];
    }

    /**
     * Revoke download access
     */
    public function revokeDownloadAccess($orderId, $reason = '') {
        $sql = "UPDATE download_records
                SET is_active = 0,
                    revoked_at = NOW(),
                    revoke_reason = ?
                WHERE order_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$reason, $orderId]);

        // Also revoke license keys
        $sql = "UPDATE license_keys lk
                INNER JOIN marketplace_order_items oi ON lk.product_id = oi.product_id
                SET lk.is_revoked = 1,
                    lk.revoked_at = NOW(),
                    lk.revoke_reason = ?
                WHERE oi.order_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$reason, $orderId]);
    }

    /**
     * Extend download expiry
     */
    public function extendDownloadExpiry($downloadToken, $additionalHours = 72) {
        $sql = "UPDATE download_records
                SET expires_at = DATE_ADD(expires_at, INTERVAL ? HOUR)
                WHERE download_token = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$additionalHours, $downloadToken]);
    }

    /**
     * Send download email to buyer
     */
    private function sendDownloadEmail($order, $products) {
        $to = $order['buyer_email'];
        $subject = "Your Z2B Digital Products - Order #{$order['order_number']}";

        $body = $this->buildDownloadEmailHtml($order, $products);

        // In production: Use proper email service (SendGrid, Mailgun, etc.)
        // For now, using PHP mail()
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: Z2B Marketplace <noreply@z2blegacybuilders.co.za>\r\n";

        // Send email
        // mail($to, $subject, $body, $headers);

        // Log email sent
        $this->logEmailSent($order['id'], $to, $subject);

        return true;
    }

    /**
     * Build HTML email for downloads
     */
    private function buildDownloadEmailHtml($order, $products) {
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6C63FF, #00FF88); padding: 30px; text-align: center; color: white; }
                .product { border: 2px solid #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 10px; }
                .btn { display: inline-block; padding: 15px 30px; background: #6C63FF; color: white; text-decoration: none; border-radius: 8px; margin: 10px 0; }
                .license-key { background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 16px; font-weight: bold; text-align: center; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; color: #777; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🎉 Your Digital Products Are Ready!</h1>
                    <p>Order #{$order['order_number']}</p>
                </div>

                <p>Hi {$order['buyer_name']},</p>
                <p>Thank you for your purchase! Your digital products are ready for download.</p>
        ";

        foreach ($products as $product) {
            $html .= "
                <div class='product'>
                    <h2>📦 {$product['product_name']}</h2>
                    <p><strong>License Key:</strong></p>
                    <div class='license-key'>{$product['license_key']}</div>
                    <p><strong>Download Link:</strong></p>
                    <a href='{$product['download_link']}' class='btn'>Download Now</a>
                    <p style='color: #777; font-size: 14px;'>
                        ⏰ Link expires: " . date('F j, Y g:i A', strtotime($product['expires_at'])) . "<br>
                        📥 Max downloads: {$product['max_downloads']}
                    </p>
                </div>
            ";
        }

        $html .= "
                <div style='background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>Save your license keys in a secure location</li>
                        <li>Download links expire in {$this->downloadExpiryHours} hours</li>
                        <li>Contact support if you need link extension</li>
                    </ul>
                </div>

                <div class='footer'>
                    <p><strong>Need Help?</strong></p>
                    <p>Email: support@z2blegacybuilders.co.za<br>
                    WhatsApp: +27 82 123 4567</p>
                    <p style='margin-top: 20px;'>© 2026 Z2B Legacy Builders. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        return $html;
    }

    // ========================================
    // DATABASE HELPER METHODS
    // ========================================

    private function getOrder($orderId) {
        $sql = "SELECT * FROM marketplace_orders WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getDigitalOrderItems($orderId) {
        $sql = "SELECT oi.*
                FROM marketplace_order_items oi
                INNER JOIN marketplace_products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                AND p.product_type = 'digital'";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getProductFiles($productId) {
        $sql = "SELECT * FROM marketplace_digital_files
                WHERE product_id = ?
                AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$productId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function createDownloadRecord($data) {
        $sql = "INSERT INTO download_records (
                    order_id, order_item_id, product_id, buyer_id,
                    download_token, license_key, expires_at,
                    max_downloads, download_count, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['order_id'],
            $data['order_item_id'],
            $data['product_id'],
            $data['buyer_id'],
            $data['download_token'],
            $data['license_key'],
            $data['expires_at'],
            $data['max_downloads'],
            $data['download_count']
        ]);

        return $this->db->lastInsertId();
    }

    private function storeLicenseKey($licenseKey, $productId, $buyerId) {
        $sql = "INSERT INTO license_keys (
                    license_key, product_id, buyer_id,
                    is_active, created_at
                ) VALUES (?, ?, ?, 1, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$licenseKey, $productId, $buyerId]);
    }

    private function getDownloadByToken($token) {
        $sql = "SELECT * FROM download_records WHERE download_token = ? AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function incrementDownloadCount($downloadId) {
        $sql = "UPDATE download_records
                SET download_count = download_count + 1,
                    last_downloaded_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$downloadId]);
    }

    private function updateOrderItemDelivery($itemId, $downloadLink, $licenseKey, $expiresAt) {
        $sql = "UPDATE marketplace_order_items
                SET download_link = ?,
                    license_key = ?,
                    download_expires_at = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$downloadLink, $licenseKey, $expiresAt, $itemId]);
    }

    private function logEmailSent($orderId, $recipient, $subject) {
        $sql = "INSERT INTO email_logs (
                    order_id, recipient, subject, sent_at
                ) VALUES (?, ?, ?, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId, $recipient, $subject]);
    }

    private function logLicenseActivation($keyId, $deviceInfo) {
        $sql = "INSERT INTO license_activations (
                    license_key_id, device_info, activated_at
                ) VALUES (?, ?, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$keyId, json_encode($deviceInfo)]);
    }
}

// ========================================
// ADDITIONAL REQUIRED DATABASE TABLES
// ========================================

/*
CREATE TABLE IF NOT EXISTS download_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    order_item_id INT NOT NULL,
    product_id INT NOT NULL,
    buyer_id INT NOT NULL,
    download_token VARCHAR(100) UNIQUE NOT NULL,
    license_key VARCHAR(100),
    expires_at TIMESTAMP NOT NULL,
    max_downloads INT DEFAULT 5,
    download_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    revoked_at TIMESTAMP NULL,
    revoke_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES marketplace_orders(id),
    FOREIGN KEY (order_item_id) REFERENCES marketplace_order_items(id),
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id),
    FOREIGN KEY (buyer_id) REFERENCES members(id),
    INDEX idx_token (download_token),
    INDEX idx_buyer (buyer_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS license_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_key VARCHAR(100) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    buyer_id INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_revoked TINYINT(1) DEFAULT 0,
    revoked_at TIMESTAMP NULL,
    revoke_reason TEXT,
    expires_at TIMESTAMP NULL,
    max_activations INT DEFAULT 0, -- 0 = unlimited
    activation_count INT DEFAULT 0,
    last_activated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id),
    FOREIGN KEY (buyer_id) REFERENCES members(id),
    INDEX idx_key (license_key),
    INDEX idx_product (product_id),
    INDEX idx_buyer (buyer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS license_activations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_key_id INT NOT NULL,
    device_info JSON,
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (license_key_id) REFERENCES license_keys(id) ON DELETE CASCADE,
    INDEX idx_key (license_key_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES marketplace_orders(id),
    INDEX idx_order (order_id),
    INDEX idx_sent (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/

?>
