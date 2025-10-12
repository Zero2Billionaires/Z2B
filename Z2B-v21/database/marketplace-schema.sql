-- =====================================================
-- Z2B UNIVERSAL MARKETPLACE DATABASE SCHEMA
-- =====================================================
-- Version: 2.0
-- Date: January 2026
-- Purpose: Support member-created & admin products
--          (Digital, Physical, Services)
-- =====================================================

-- =====================================================
-- PRODUCT CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- FontAwesome icon class
    parent_id INT DEFAULT NULL, -- For subcategories
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES marketplace_categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- PRODUCTS (Universal for all types)
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_products (
    id INT PRIMARY KEY AUTO_INCREMENT,

    -- Product Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    long_description LONGTEXT,

    -- Product Type
    product_type ENUM('digital', 'physical', 'service') NOT NULL,
    category_id INT NOT NULL,

    -- Seller Info
    seller_type ENUM('admin', 'member') NOT NULL, -- Admin (Z2B) or Member
    seller_id INT NOT NULL, -- If member: member_id, if admin: admin_user_id
    seller_name VARCHAR(255), -- Display name

    -- Pricing (Member's Desired Income)
    member_desired_income DECIMAL(10,2) NOT NULL, -- What member wants to earn
    mlm_commission_pool DECIMAL(10,2) NOT NULL,   -- Auto-calculated (100% markup)
    platform_fee DECIMAL(10,2) NOT NULL,          -- Auto-calculated (7.5%)
    final_retail_price DECIMAL(10,2) NOT NULL,    -- Total selling price

    -- Pricing formula: final_retail_price = member_desired_income + mlm_commission_pool + platform_fee
    -- Example: R100 + R100 + R15 = R215

    -- Commission Settings
    commission_eligible TINYINT(1) DEFAULT 1, -- Can trigger MLM commissions
    isp_percentage DECIMAL(5,2) DEFAULT 25.00, -- Individual Sales Profit %

    -- Product Media
    image_url VARCHAR(500),
    gallery_images JSON, -- Array of image URLs
    video_url VARCHAR(500),

    -- Product Details
    sku VARCHAR(100) UNIQUE,
    stock_quantity INT DEFAULT 0, -- For physical products
    unlimited_stock TINYINT(1) DEFAULT 0, -- For digital/services

    -- Status
    status ENUM('draft', 'pending_review', 'active', 'inactive', 'rejected') DEFAULT 'draft',
    rejection_reason TEXT,
    featured TINYINT(1) DEFAULT 0,

    -- Metadata
    tags JSON, -- Search tags
    meta_title VARCHAR(255),
    meta_description TEXT,

    -- Stats
    views_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,

    FOREIGN KEY (category_id) REFERENCES marketplace_categories(id) ON DELETE RESTRICT,
    INDEX idx_seller (seller_type, seller_id),
    INDEX idx_status (status),
    INDEX idx_type (product_type),
    INDEX idx_featured (featured),
    INDEX idx_price (final_retail_price),
    FULLTEXT INDEX idx_search (name, description, tags)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- DIGITAL PRODUCT FILES
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_digital_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL, -- Server file path
    file_type VARCHAR(50), -- pdf, zip, mp4, etc.
    file_size BIGINT, -- bytes
    download_url VARCHAR(500), -- Secure download link
    version VARCHAR(50) DEFAULT '1.0',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- PHYSICAL PRODUCT SHIPPING
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_shipping_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    shipping_method VARCHAR(100), -- Standard, Express, Overnight
    shipping_cost DECIMAL(10,2) NOT NULL,
    estimated_days INT, -- Delivery time
    countries JSON, -- Array of supported country codes
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- SERVICE CONFIGURATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    service_type ENUM('one_time', 'recurring', 'hourly', 'session') NOT NULL,
    duration_minutes INT, -- For hourly/session services
    booking_required TINYINT(1) DEFAULT 0,
    calendar_integration VARCHAR(100), -- google, outlook, etc.
    availability_schedule JSON, -- Days/hours available
    advance_booking_days INT DEFAULT 1, -- How many days in advance to book
    max_bookings_per_day INT DEFAULT 10,
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- ORDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Z2B-20260111-0001

    -- Buyer Info
    buyer_id INT NOT NULL, -- member_id
    buyer_email VARCHAR(255),
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(50),

    -- Order Totals
    subtotal DECIMAL(10,2) NOT NULL, -- Sum of items
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Commission Breakdown (for transparency)
    total_member_income DECIMAL(10,2), -- What sellers earn
    total_mlm_commissions DECIMAL(10,2), -- Distributed to upline
    total_platform_fees DECIMAL(10,2), -- Z2B's cut

    -- Payment
    payment_method VARCHAR(50), -- card, eft, payfast, paypal
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    paid_at TIMESTAMP NULL,

    -- Order Status
    order_status ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',

    -- Shipping (for physical products)
    shipping_address JSON, -- Full address object
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(255),
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,

    -- Notes
    buyer_notes TEXT,
    admin_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (buyer_id) REFERENCES members(id) ON DELETE RESTRICT,
    INDEX idx_buyer (buyer_id),
    INDEX idx_order_number (order_number),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_status (order_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- ORDER ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,

    -- Product Snapshot (in case product details change later)
    product_name VARCHAR(255),
    product_type ENUM('digital', 'physical', 'service'),

    -- Seller Info
    seller_type ENUM('admin', 'member'),
    seller_id INT,
    seller_name VARCHAR(255),

    -- Pricing Breakdown
    quantity INT DEFAULT 1,
    member_desired_income DECIMAL(10,2), -- Per unit
    mlm_commission_pool DECIMAL(10,2),   -- Per unit
    platform_fee DECIMAL(10,2),          -- Per unit
    unit_price DECIMAL(10,2),            -- Final price per unit
    line_total DECIMAL(10,2),            -- unit_price × quantity

    -- Commission Distribution (will be filled after processing)
    seller_payout DECIMAL(10,2), -- What seller receives (member_desired_income × quantity)
    commissions_distributed DECIMAL(10,2), -- Total distributed to upline
    platform_fee_collected DECIMAL(10,2), -- Z2B's earnings

    -- Digital Product Access
    download_link VARCHAR(500), -- For digital products
    license_key VARCHAR(255), -- For software
    download_expires_at TIMESTAMP NULL,

    -- Service Booking
    booking_date DATE NULL, -- For services
    booking_time TIME NULL,
    booking_status ENUM('pending', 'confirmed', 'completed', 'cancelled') NULL,

    -- Status
    fulfillment_status ENUM('pending', 'fulfilled', 'cancelled') DEFAULT 'pending',
    fulfilled_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id),
    INDEX idx_seller (seller_type, seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- COMMISSION DISTRIBUTION LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_commissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    order_item_id INT NOT NULL,

    -- Recipient Info
    recipient_id INT NOT NULL, -- member_id receiving commission
    recipient_name VARCHAR(255),

    -- Commission Details
    commission_type ENUM('ISP', 'QPB', 'TSC', 'TPB', 'TLI', 'CEO', 'SELLER_PAYOUT') NOT NULL,
    generation INT DEFAULT 0, -- For TSC (1-10), 0 for others
    percentage DECIMAL(5,2), -- Commission percentage applied
    amount DECIMAL(10,2) NOT NULL, -- Commission earned

    -- Source Product
    product_id INT,
    product_name VARCHAR(255),

    -- Status
    status ENUM('pending', 'paid', 'held', 'cancelled') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,

    -- Notes
    calculation_note TEXT, -- How this was calculated

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES marketplace_order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES members(id) ON DELETE RESTRICT,
    INDEX idx_recipient (recipient_id),
    INDEX idx_type (commission_type),
    INDEX idx_order (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- PRODUCT REVIEWS
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    buyer_id INT NOT NULL,
    order_id INT NOT NULL, -- Must have purchased to review

    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_title VARCHAR(255),
    review_text TEXT,

    -- Media
    images JSON, -- Array of review image URLs

    -- Status
    is_verified TINYINT(1) DEFAULT 1, -- Verified purchase
    is_approved TINYINT(1) DEFAULT 0, -- Admin approval

    -- Seller Response
    seller_response TEXT,
    seller_responded_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES marketplace_products(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (product_id, buyer_id, order_id),
    INDEX idx_product (product_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- MEMBER SELLER PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_seller_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT UNIQUE NOT NULL,

    -- Business Info
    business_name VARCHAR(255),
    business_description TEXT,
    business_logo VARCHAR(500),

    -- Contact
    business_email VARCHAR(255),
    business_phone VARCHAR(50),
    business_website VARCHAR(255),

    -- Banking (for payouts)
    bank_name VARCHAR(100),
    account_holder VARCHAR(255),
    account_number VARCHAR(100),
    branch_code VARCHAR(50),

    -- Stats
    total_products INT DEFAULT 0,
    total_sales INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,

    -- Status
    is_verified TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    verified_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_active (is_active),
    INDEX idx_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- SAMPLE DATA - CATEGORIES
-- =====================================================
INSERT INTO marketplace_categories (name, slug, description, icon) VALUES
('Digital Products', 'digital-products', 'Software, apps, courses, ebooks', 'fa-laptop-code'),
('Physical Products', 'physical-products', 'Tangible goods requiring shipping', 'fa-box'),
('Services', 'services', 'Consulting, coaching, freelance work', 'fa-handshake'),
('Software & Apps', 'software-apps', 'Applications and software tools', 'fa-rocket'),
('Courses & Training', 'courses-training', 'Educational content and training', 'fa-graduation-cap'),
('Marketing Tools', 'marketing-tools', 'Marketing and sales resources', 'fa-chart-line'),
('Business Services', 'business-services', 'Professional business services', 'fa-briefcase'),
('Health & Wellness', 'health-wellness', 'Health products and services', 'fa-heart'),
('Fashion & Apparel', 'fashion-apparel', 'Clothing and accessories', 'fa-tshirt'),
('Home & Living', 'home-living', 'Home goods and decor', 'fa-home');

-- =====================================================
-- SAMPLE DATA - Add Zyroniq as Admin Product
-- =====================================================
INSERT INTO marketplace_products (
    name,
    slug,
    description,
    long_description,
    product_type,
    category_id,
    seller_type,
    seller_id,
    seller_name,
    member_desired_income,
    mlm_commission_pool,
    platform_fee,
    final_retail_price,
    commission_eligible,
    image_url,
    sku,
    unlimited_stock,
    status,
    featured,
    tags
) VALUES (
    'Zyroniq - Pay Intelligence Engine',
    'zyroniq-pay-intelligence-engine',
    'Complete white-label MLM platform with 6 income calculators, 10-generation tracking, TLI system, and futuristic UI.',
    'Deploy your branded network marketing platform in days! Includes unlimited members, full customization, priority support, and lifetime updates.',
    'digital',
    4, -- Software & Apps
    'admin',
    1,
    'Z2B Legacy Builders',
    10000.00, -- Z2B wants to earn R10,000
    10000.00, -- R10,000 for MLM commissions
    1500.00,  -- 7.5% of R20,000 = R1,500
    21500.00, -- Total: R21,500/month
    1,
    '../marketplace/products/zyroniq/assets/logo.png',
    'Z2B-ZYRONIQ-001',
    1,
    'active',
    1,
    '["MLM", "Network Marketing", "White-Label", "Commission Calculator", "Enterprise Software"]'
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_products_search ON marketplace_products(status, product_type, featured);
CREATE INDEX idx_orders_buyer_date ON marketplace_orders(buyer_id, created_at);
CREATE INDEX idx_commissions_recipient_date ON marketplace_commissions(recipient_id, created_at);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Top Selling Products
CREATE OR REPLACE VIEW vw_top_products AS
SELECT
    p.id,
    p.name,
    p.seller_name,
    p.product_type,
    p.sales_count,
    p.final_retail_price,
    (p.sales_count * p.final_retail_price) as total_revenue,
    p.rating_average
FROM marketplace_products p
WHERE p.status = 'active'
ORDER BY p.sales_count DESC;

-- Member Seller Performance
CREATE OR REPLACE VIEW vw_seller_performance AS
SELECT
    m.id as member_id,
    CONCAT(m.first_name, ' ', m.last_name) as seller_name,
    COUNT(DISTINCT p.id) as products_count,
    SUM(p.sales_count) as total_sales,
    SUM(p.sales_count * p.member_desired_income) as total_earnings,
    AVG(p.rating_average) as avg_rating
FROM members m
LEFT JOIN marketplace_products p ON p.seller_id = m.id AND p.seller_type = 'member'
WHERE p.status = 'active'
GROUP BY m.id;

-- Commission Distribution Summary
CREATE OR REPLACE VIEW vw_commission_summary AS
SELECT
    recipient_id,
    recipient_name,
    commission_type,
    COUNT(*) as commission_count,
    SUM(amount) as total_earned,
    AVG(amount) as avg_commission
FROM marketplace_commissions
WHERE status = 'paid'
GROUP BY recipient_id, commission_type;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER $$

-- Calculate Final Retail Price
CREATE PROCEDURE sp_calculate_retail_price(
    IN p_member_desired_income DECIMAL(10,2),
    OUT p_mlm_commission_pool DECIMAL(10,2),
    OUT p_platform_fee DECIMAL(10,2),
    OUT p_final_retail_price DECIMAL(10,2)
)
BEGIN
    -- MLM Commission Pool = 100% of member's desired income
    SET p_mlm_commission_pool = p_member_desired_income;

    -- Platform Fee = 7.5% of (member income + commission pool)
    SET p_platform_fee = (p_member_desired_income + p_mlm_commission_pool) * 0.075;

    -- Final Retail Price = Sum of all components
    SET p_final_retail_price = p_member_desired_income + p_mlm_commission_pool + p_platform_fee;
END$$

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER $$

-- Update product stats after order
CREATE TRIGGER trg_update_product_stats_after_sale
AFTER INSERT ON marketplace_order_items
FOR EACH ROW
BEGIN
    UPDATE marketplace_products
    SET sales_count = sales_count + NEW.quantity
    WHERE id = NEW.product_id;
END$$

-- Update seller profile stats
CREATE TRIGGER trg_update_seller_stats
AFTER UPDATE ON marketplace_orders
FOR EACH ROW
BEGIN
    IF NEW.order_status = 'completed' AND OLD.order_status != 'completed' THEN
        UPDATE marketplace_seller_profiles sp
        SET
            total_sales = total_sales + 1,
            total_revenue = total_revenue + NEW.total_amount
        WHERE sp.member_id IN (
            SELECT DISTINCT seller_id
            FROM marketplace_order_items
            WHERE order_id = NEW.id AND seller_type = 'member'
        );
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
