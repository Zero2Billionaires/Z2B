-- Z2B Legacy Builders Platform - Complete Database Schema v21
-- Created: 2025-09-29
-- Database: z2b_legacy

CREATE DATABASE IF NOT EXISTS z2b_legacy;
USE z2b_legacy;

-- =============================================
-- CORE USER & MEMBERSHIP TABLES
-- =============================================

-- Members table with enhanced fields
CREATE TABLE members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    whatsapp_number VARCHAR(20),
    telegram_handle VARCHAR(50),
    tier_id INT DEFAULT 1,
    sponsor_id INT,
    referral_code VARCHAR(20) UNIQUE,
    position_in_matrix VARCHAR(50),
    matrix_level INT DEFAULT 1,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_founder_member BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(255),
    bio TEXT,
    country VARCHAR(50),
    city VARCHAR(50),
    INDEX idx_sponsor (sponsor_id),
    INDEX idx_tier (tier_id),
    INDEX idx_referral_code (referral_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Membership tiers
CREATE TABLE tiers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    monthly_cost DECIMAL(10,2) NOT NULL,
    benefits TEXT,
    commission_percentage DECIMAL(5,2),
    max_matrix_levels INT DEFAULT 3,
    color_code VARCHAR(7),
    icon_class VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- MLM & COMMISSION STRUCTURE
-- =============================================

-- Referrals and Matrix structure
CREATE TABLE referrals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sponsor_id INT NOT NULL,
    member_id INT NOT NULL,
    level INT DEFAULT 1,
    position_in_tree VARCHAR(20),
    date_referred TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    placement_type ENUM('forced', 'spillover', 'manual') DEFAULT 'forced',
    FOREIGN KEY (sponsor_id) REFERENCES members(id),
    FOREIGN KEY (member_id) REFERENCES members(id),
    UNIQUE KEY unique_member (member_id),
    INDEX idx_sponsor_level (sponsor_id, level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transaction and commission tracking
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    transaction_type ENUM('ISP', 'TSC', 'QPB', 'TPB', 'TLI', 'marketplace', 'refuel') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id INT,
    status ENUM('pending', 'completed', 'failed', 'reversed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    payment_method VARCHAR(50),
    FOREIGN KEY (member_id) REFERENCES members(id),
    INDEX idx_member_type (member_id, transaction_type),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payout requests and history
CREATE TABLE payouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('bank', 'yoco', 'paypal', 'crypto') DEFAULT 'bank',
    account_details TEXT,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    transaction_reference VARCHAR(100),
    admin_notes TEXT,
    FOREIGN KEY (member_id) REFERENCES members(id),
    INDEX idx_member_status (member_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- COACH MANLAW SYSTEM TABLES
-- =============================================

-- Coach Manlaw coaching progress tracking
CREATE TABLE ai_coaching_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    program_day INT DEFAULT 1,
    current_phase ENUM('foundation', 'transformation', 'mastery', 'legacy') DEFAULT 'foundation',
    mindset_score INT DEFAULT 0,
    money_score INT DEFAULT 0,
    marketing_score INT DEFAULT 0,
    management_score INT DEFAULT 0,
    overall_progress DECIMAL(5,2) DEFAULT 0,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    engagement_score INT DEFAULT 0,
    modules_completed INT DEFAULT 0,
    achievements TEXT,
    FOREIGN KEY (member_id) REFERENCES members(id),
    UNIQUE KEY unique_member_progress (member_id),
    INDEX idx_phase (current_phase)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AI personality responses configuration
CREATE TABLE ai_personality_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    personality_type ENUM('harvey', 'covey', 'golden', 'hormozi', 'hybrid') NOT NULL,
    context_category VARCHAR(50) NOT NULL,
    response_template TEXT NOT NULL,
    emotional_tone VARCHAR(50),
    humor_level INT DEFAULT 0,
    empathy_level INT DEFAULT 5,
    spirituality_level INT DEFAULT 0,
    analytical_level INT DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_personality_context (personality_type, context_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AI conversation history
CREATE TABLE ai_conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    message_type ENUM('user', 'ai') NOT NULL,
    message TEXT NOT NULL,
    personality_used VARCHAR(50),
    module_context VARCHAR(50),
    sentiment_score DECIMAL(3,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(50),
    FOREIGN KEY (member_id) REFERENCES members(id),
    INDEX idx_member_session (member_id, session_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Module progress tracking
CREATE TABLE modules_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    module_category ENUM('mindset', 'money', 'marketing', 'management') NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    status ENUM('locked', 'available', 'in_progress', 'completed') DEFAULT 'locked',
    score INT DEFAULT 0,
    attempts INT DEFAULT 0,
    time_spent INT DEFAULT 0,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (member_id) REFERENCES members(id),
    UNIQUE KEY unique_member_module (member_id, module_name),
    INDEX idx_category_status (module_category, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- MARKETPLACE SYSTEM TABLES
-- =============================================

-- Product categories
CREATE TABLE product_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('digital', 'physical', 'service') NOT NULL,
    description TEXT,
    parent_id INT NULL,
    icon_class VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id),
    INDEX idx_type (type),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Marketplace products
CREATE TABLE marketplace_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    category_id INT NOT NULL,
    product_type ENUM('digital', 'physical', 'service') NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    features TEXT,
    member_profit DECIMAL(10,2) NOT NULL,
    mlm_commission_pool DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    retail_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT NULL,
    delivery_method VARCHAR(100),
    delivery_time VARCHAR(50),
    images TEXT,
    video_url VARCHAR(255),
    status ENUM('draft', 'pending_approval', 'active', 'paused', 'discontinued') DEFAULT 'draft',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    FOREIGN KEY (seller_id) REFERENCES members(id),
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    INDEX idx_seller_status (seller_id, status),
    INDEX idx_category (category_id),
    INDEX idx_type (product_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Marketplace orders
CREATE TABLE marketplace_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id INT NOT NULL,
    product_id INT NOT NULL,
    seller_id INT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    member_profit DECIMAL(10,2) NOT NULL,
    mlm_commission DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    shipping_address TEXT,
    tracking_number VARCHAR(100),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_date TIMESTAMP NULL,
    shipped_date TIMESTAMP NULL,
    delivered_date TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (buyer_id) REFERENCES members(id),
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id),
    FOREIGN KEY (seller_id) REFERENCES members(id),
    INDEX idx_order_number (order_number),
    INDEX idx_buyer (buyer_id),
    INDEX idx_seller (seller_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Marketplace commission distribution
CREATE TABLE marketplace_commissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    recipient_id INT NOT NULL,
    commission_type ENUM('direct_sale', 'level1', 'level2', 'level3', 'bonus') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2),
    status ENUM('pending', 'approved', 'paid', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES marketplace_orders(id),
    FOREIGN KEY (recipient_id) REFERENCES members(id),
    INDEX idx_order (order_id),
    INDEX idx_recipient_status (recipient_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product reviews
CREATE TABLE product_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    review TEXT,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id),
    FOREIGN KEY (reviewer_id) REFERENCES members(id),
    FOREIGN KEY (order_id) REFERENCES marketplace_orders(id),
    UNIQUE KEY unique_order_review (order_id),
    INDEX idx_product_rating (product_id, rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pricing algorithms configuration
CREATE TABLE pricing_algorithms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_type ENUM('digital', 'physical', 'service') NOT NULL,
    base_platform_fee_percent DECIMAL(5,2) DEFAULT 5.00,
    min_mlm_commission_percent DECIMAL(5,2) DEFAULT 20.00,
    max_mlm_commission_percent DECIMAL(5,2) DEFAULT 50.00,
    level1_percent DECIMAL(5,2) DEFAULT 10.00,
    level2_percent DECIMAL(5,2) DEFAULT 7.00,
    level3_percent DECIMAL(5,2) DEFAULT 5.00,
    bonus_pool_percent DECIMAL(5,2) DEFAULT 3.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product_type (product_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- VIDEO CREATOR & RECRUITING TABLES
-- =============================================

-- Video credits management
CREATE TABLE video_credits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    credits_available INT DEFAULT 0,
    credits_used INT DEFAULT 0,
    last_purchase_date TIMESTAMP NULL,
    last_usage_date TIMESTAMP NULL,
    FOREIGN KEY (member_id) REFERENCES members(id),
    UNIQUE KEY unique_member_credits (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Video generation history
CREATE TABLE video_generations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    template_type VARCHAR(50),
    platform VARCHAR(50),
    video_url VARCHAR(255),
    credits_used INT DEFAULT 1,
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    metadata TEXT,
    FOREIGN KEY (member_id) REFERENCES members(id),
    INDEX idx_member_date (member_id, generation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recruiting funnel leads
CREATE TABLE recruiting_leads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    referrer_id INT,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    source VARCHAR(50),
    funnel_stage ENUM('visitor', 'lead', 'prospect', 'customer', 'partner') DEFAULT 'visitor',
    interest_level INT DEFAULT 5,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    conversion_date TIMESTAMP NULL,
    notes TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES members(id),
    INDEX idx_referrer_stage (referrer_id, funnel_stage),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- ADMIN & SYSTEM TABLES
-- =============================================

-- Admin users
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('super_admin', 'admin', 'moderator', 'support') DEFAULT 'admin',
    permissions TEXT,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- System settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Activity logs
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    user_type ENUM('member', 'admin') NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id, user_type),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Monthly refuel subscriptions
CREATE TABLE monthly_refuel (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    tier_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    billing_date DATE NOT NULL,
    status ENUM('active', 'pending', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    next_billing_date DATE,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (tier_id) REFERENCES tiers(id),
    INDEX idx_member_status (member_id, status),
    INDEX idx_billing_date (billing_date),
    INDEX idx_next_billing (next_billing_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (member_id) REFERENCES members(id),
    INDEX idx_member_unread (member_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- INSERT INITIAL DATA
-- =============================================

-- Insert membership tiers
INSERT INTO tiers (name, monthly_cost, benefits, commission_percentage, color_code, icon_class) VALUES
('FAM - Free Affiliate Marketer', 0.00, 'FREE Registration + Unique Builder ID & Link + Sell All Apps + 20% ISP Commission Only + No PV + No AI Fuel + No TSC + No TLI + No AI Apps Access + Zero to Billions Starts Here', 20.00, '#4CAF50', 'fa-seedling'),
('Bronze Legacy Builder', 480.00, 'Coach Manlaw + Marketplace + 100 PV + 100 AI Fuel + 25% ISP + 3 Gen TSC + No TLI + Basic Training + Community Support', 25.00, '#CD7F32', 'fa-bronze'),
('Copper Legacy Builder', 980.00, 'Coach Manlaw + Glowie + Marketplace + 200 PV + 200 AI Fuel + 28% ISP + 5 Gen TSC + No TLI + Advanced Training', 28.00, '#B87333', 'fa-copper'),
('Silver Legacy Builder', 1480.00, 'All 4 AI Apps + Marketplace + 300 PV + 300 AI Fuel + 30% ISP + 7 Gen TSC + 7 TLI (Mama I Made It) + Advanced Training + Priority Support', 30.00, '#C0C0C0', 'fa-silver'),
('Gold Legacy Builder', 2980.00, 'All 4 AI Apps + Marketplace + 600 PV + 600 AI Fuel + 35% ISP + 9 Gen TSC + 8 TLI + Video Creator Tools + Quarterly Profit Pool + Sales Funnel + Team Tools + VIP Support', 35.00, '#FFD700', 'fa-gold'),
('Platinum Legacy Builder', 4980.00, 'All 4 AI Apps + Marketplace + 1000 PV + 1000 AI Fuel + 40% ISP + 10 Gen TSC + All 10 TLI + Video Creator Tools + Quarterly Profit Pool + Done-For-You Campaigns + Personal Coach + Executive Support', 40.00, '#E5E4E2', 'fa-platinum'),
('Diamond White Label', 11980.00, 'White Label Rights + Full Rebranding + Set Own Pricing + Separate Entity + All 4 AI Apps + Video Creator Tools + Unlimited AI Fuel + Dual Income (Keep Z2B Legacy Earnings) + 7.5% Royalties on White Label Sales Only + Board Approval Required + Business Plan Required + 6mo Gold or 4mo Platinum Required', 0.00, '#B9F2FF', 'fa-diamond');

-- Insert AI personality response templates
INSERT INTO ai_personality_responses (personality_type, context_category, response_template, humor_level, empathy_level, spirituality_level, analytical_level) VALUES
('hybrid', 'welcome', 'Hey there, future mogul! Welcome to your transformation journey! Remember, success is a process, not an event.', 7, 8, 5, 6),
('hybrid', 'motivation', 'Listen, I get it - this feels overwhelming. But you know what? Every billionaire started exactly where you are. The difference? They kept going when others quit.', 8, 9, 6, 7),
('hybrid', 'business_strategy', 'Alright, let''s break this down analytically. Your market has three key problems, and we''re going to solve them systematically...', 3, 5, 2, 10),
('hybrid', 'mindset', 'Your mind is like a garden - what you plant is what grows. Let''s plant some million-dollar seeds today!', 6, 8, 8, 5);

-- Insert pricing algorithm defaults
INSERT INTO pricing_algorithms (product_type, base_platform_fee_percent, min_mlm_commission_percent, max_mlm_commission_percent) VALUES
('digital', 5.00, 30.00, 50.00),
('physical', 5.00, 20.00, 40.00),
('service', 5.00, 25.00, 45.00);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('platform_name', 'Z2B Legacy Builders', 'text', 'Platform display name', true),
('currency', 'ZAR', 'text', 'Default currency', true),
('commission_payout_minimum', '500', 'number', 'Minimum amount for payout requests', true),
('max_referral_levels', '10', 'number', 'Maximum levels in referral tree', false),
('founder_member_limit', '100', 'number', 'Maximum founder members allowed', false),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false);

-- Create admin user
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@z2blegacy.co.za', '$2y$10$YourHashedPasswordHere', 'System Administrator', 'super_admin');

-- Create indexes for performance
CREATE INDEX idx_member_login ON members(email, password_hash);
CREATE INDEX idx_transaction_date ON transactions(created_at, status);
CREATE INDEX idx_matrix_position ON referrals(sponsor_id, level, position_in_tree);
CREATE INDEX idx_product_search ON marketplace_products(name, status, product_type);
CREATE INDEX idx_order_tracking ON marketplace_orders(order_number, status, buyer_id);

-- Create views for reporting
CREATE VIEW member_commission_summary AS
SELECT
    m.id,
    m.first_name,
    m.last_name,
    m.tier_id,
    COUNT(DISTINCT r.member_id) as direct_referrals,
    COALESCE(SUM(t.amount), 0) as total_earnings,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'marketplace' THEN t.amount ELSE 0 END), 0) as marketplace_earnings
FROM members m
LEFT JOIN referrals r ON m.id = r.sponsor_id
LEFT JOIN transactions t ON m.id = t.member_id AND t.status = 'completed'
GROUP BY m.id;

CREATE VIEW product_performance AS
SELECT
    p.id,
    p.name,
    p.seller_id,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.quantity), 0) as units_sold,
    COALESCE(SUM(o.total_amount), 0) as revenue,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as review_count
FROM marketplace_products p
LEFT JOIN marketplace_orders o ON p.id = o.product_id AND o.status IN ('completed', 'delivered')
LEFT JOIN product_reviews r ON p.id = r.product_id
WHERE p.status = 'active'
GROUP BY p.id;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON z2b_legacy.* TO 'z2b_user'@'localhost' IDENTIFIED BY 'YourSecurePassword';
-- FLUSH PRIVILEGES;