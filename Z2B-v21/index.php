<?php
require_once 'config/app.php';
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Z2B Legacy Builders - Transform Employees into Entrepreneurs</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <style>
        :root {
            --primary-gold: #FFD700;
            --primary-blue: #1E3A8A;
            --secondary-blue: #2563EB;
            --dark-bg: #0F172A;
            --card-bg: #1E293B;
            --text-primary: #F1F5F9;
            --text-secondary: #94A3B8;
            --success: #10B981;
            --warning: #F59E0B;
            --danger: #EF4444;
            --bronze: #CD7F32;
            --copper: #B87333;
            --silver: #C0C0C0;
            --gold: #FFD700;
            --platinum: #E5E4E2;
            --diamond: #B9F2FF;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: var(--dark-bg);
            color: var(--text-primary);
            overflow-x: hidden;
        }

        /* Hero Section */
        .hero {
            min-height: 100vh;
            background: linear-gradient(135deg, var(--dark-bg) 0%, var(--primary-blue) 100%);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="none" stroke="rgba(255,215,0,0.1)" stroke-width="1"/></svg>');
            background-size: 100px 100px;
            animation: float 20s linear infinite;
        }

        @keyframes float {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-100px, -100px); }
        }

        .hero-content {
            position: relative;
            z-index: 2;
            text-align: center;
            max-width: 1200px;
            padding: 0 20px;
        }

        .hero h1 {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: bold;
            margin-bottom: 20px;
            background: linear-gradient(135deg, var(--primary-gold), var(--warning));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.2); }
        }

        .hero .subtitle {
            font-size: 1.5rem;
            color: var(--text-secondary);
            margin-bottom: 30px;
        }

        .cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 30px;
        }

        .btn-gold {
            background: linear-gradient(135deg, var(--primary-gold), var(--warning));
            color: var(--dark-bg);
            padding: 15px 40px;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .btn-gold:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
        }

        .btn-outline-gold {
            background: transparent;
            color: var(--primary-gold);
            padding: 15px 40px;
            border: 2px solid var(--primary-gold);
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .btn-outline-gold:hover {
            background: var(--primary-gold);
            color: var(--dark-bg);
            transform: translateY(-3px);
        }

        /* Platform Architecture Section */
        .architecture-section {
            padding: 80px 0;
            background: var(--dark-bg);
        }

        .section-title {
            text-align: center;
            font-size: 2.5rem;
            color: var(--primary-gold);
            margin-bottom: 50px;
            position: relative;
        }

        .section-title::after {
            content: '';
            width: 100px;
            height: 3px;
            background: var(--primary-gold);
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
        }

        /* Tier Cards */
        .tier-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin-top: 50px;
        }

        .tier-card {
            background: var(--card-bg);
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .tier-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: var(--tier-color);
        }

        .tier-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
        }

        .tier-card.bronze::before { background: var(--bronze); }
        .tier-card.copper::before { background: var(--copper); }
        .tier-card.silver::before { background: var(--silver); }
        .tier-card.gold::before { background: var(--gold); }
        .tier-card.platinum::before { background: var(--platinum); }
        .tier-card.diamond::before { background: var(--diamond); }

        .tier-name {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 15px;
            color: var(--primary-gold);
        }

        .tier-price {
            font-size: 2rem;
            color: var(--text-primary);
            margin-bottom: 20px;
        }

        .tier-features {
            list-style: none;
            padding: 0;
        }

        .tier-features li {
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 215, 0, 0.1);
            color: var(--text-secondary);
        }

        .tier-features li:last-child {
            border-bottom: none;
        }

        /* Income Streams */
        .income-streams {
            background: linear-gradient(135deg, var(--card-bg), var(--dark-bg));
            padding: 60px 0;
        }

        .stream-card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }

        .stream-card:hover {
            transform: translateX(10px);
            border-color: var(--primary-gold);
        }

        .stream-card h4 {
            color: var(--primary-gold);
            margin-bottom: 10px;
        }

        /* Coach Manlaw Section */
        .ai-coach {
            padding: 80px 0;
            background: var(--dark-bg);
            position: relative;
        }

        .personality-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }

        .personality-card {
            background: var(--card-bg);
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
        }

        .personality-percentage {
            font-size: 2rem;
            color: var(--primary-gold);
            font-weight: bold;
        }

        /* Footer */
        footer {
            background: var(--dark-bg);
            padding: 40px 0 20px;
            border-top: 1px solid rgba(255, 215, 0, 0.1);
            text-align: center;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .footer-links a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer-links a:hover {
            color: var(--primary-gold);
        }

        /* Hidden Admin Login - In Copyright */
        .copyright {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-top: 20px;
        }

        .admin-trigger {
            color: inherit;
            text-decoration: none;
            cursor: default;
        }

        .admin-trigger:hover {
            color: inherit;
        }

        /* Modal Styles */
        .modal-content {
            background: var(--card-bg);
            border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .modal-header {
            border-bottom: 1px solid rgba(255, 215, 0, 0.1);
        }

        .modal-footer {
            border-top: 1px solid rgba(255, 215, 0, 0.1);
        }

        .form-control {
            background: var(--dark-bg);
            border: 1px solid rgba(255, 215, 0, 0.2);
            color: var(--text-primary);
        }

        .form-control:focus {
            background: var(--dark-bg);
            border-color: var(--primary-gold);
            color: var(--text-primary);
            box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.25);
        }

        /* Stats Counter */
        .stats-section {
            padding: 60px 0;
            background: var(--card-bg);
        }

        .stat-card {
            text-align: center;
            padding: 20px;
        }

        .stat-number {
            font-size: 3rem;
            color: var(--primary-gold);
            font-weight: bold;
        }

        .stat-label {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2rem;
            }

            .hero .subtitle {
                font-size: 1.2rem;
            }

            .cta-buttons {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px);">
        <div class="container">
            <a class="navbar-brand" href="#" style="color: var(--primary-gold); font-weight: bold; font-size: 1.5rem;">
                <i class="fas fa-crown"></i> Z2B Legacy Builders
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#architecture">Platform</a></li>
                    <li class="nav-item"><a class="nav-link" href="#income">Income Streams</a></li>
                    <li class="nav-item"><a class="nav-link" href="#ai-coach">Coach Manlaw</a></li>
                    <li class="nav-item"><a class="nav-link" href="#marketplace">Marketplace</a></li>
                    <li class="nav-item"><a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a></li>
                    <li class="nav-item"><a class="nav-link btn btn-gold ms-2" href="#" data-bs-toggle="modal" data-bs-target="#registerModal">Join Now</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1 data-aos="fade-up">Transform Employees into Entrepreneurs</h1>
            <p class="subtitle" data-aos="fade-up" data-aos-delay="100">
                Join the Revolutionary MLM Platform with AI-Powered Business Coaching
            </p>
            <p class="lead" data-aos="fade-up" data-aos-delay="200" style="color: var(--text-secondary); margin-bottom: 30px;">
                First MLM with hybrid AI business coach • Intelligent marketplace pricing •
                Monthly AI credits system • 6 proven income streams • 4M's transformation framework
            </p>
            <div class="cta-buttons" data-aos="fade-up" data-aos-delay="300">
                <a href="#" class="btn-gold" data-bs-toggle="modal" data-bs-target="#registerModal">
                    Start Your Legacy Today
                </a>
                <a href="#architecture" class="btn-outline-gold">
                    Explore Platform
                </a>
            </div>

            <!-- Stats -->
            <div class="row mt-5" data-aos="fade-up" data-aos-delay="400">
                <div class="col-md-3 col-6">
                    <div class="stat-card">
                        <div class="stat-number">6</div>
                        <div class="stat-label">Income Streams</div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="stat-card">
                        <div class="stat-number">50%</div>
                        <div class="stat-label">Max Commission</div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="stat-card">
                        <div class="stat-number">1000+</div>
                        <div class="stat-label">AI Credits/Month</div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="stat-card">
                        <div class="stat-number">R5M</div>
                        <div class="stat-label">Top TLI Reward</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Platform Architecture Section -->
    <section id="architecture" class="architecture-section">
        <div class="container">
            <h2 class="section-title" data-aos="fade-up">MLM Tier System</h2>

            <div class="tier-grid">
                <!-- Bronze Tier -->
                <div class="tier-card bronze" data-aos="fade-up" data-aos-delay="100">
                    <div class="tier-name">Bronze Legacy Builder</div>
                    <div class="tier-price">R480/month</div>
                    <ul class="tier-features">
                        <li>100 PV Points</li>
                        <li>25% ISP Commission</li>
                        <li>3 Generation TSC</li>
                        <li>2 Members for TPB</li>
                        <li>50 AI Credits</li>
                    </ul>
                </div>

                <!-- Copper Tier -->
                <div class="tier-card copper" data-aos="fade-up" data-aos-delay="150">
                    <div class="tier-name">Copper Legacy Builder</div>
                    <div class="tier-price">R980/month</div>
                    <ul class="tier-features">
                        <li>200 PV Points</li>
                        <li>28% ISP Commission</li>
                        <li>5 Generation TSC</li>
                        <li>3 Members for TPB</li>
                        <li>75 AI Credits</li>
                    </ul>
                </div>

                <!-- Silver Tier -->
                <div class="tier-card silver" data-aos="fade-up" data-aos-delay="200">
                    <div class="tier-name">Silver Legacy Builder</div>
                    <div class="tier-price">R1,480/month</div>
                    <ul class="tier-features">
                        <li>300 PV Points</li>
                        <li>30% ISP Commission</li>
                        <li>7 Generation TSC</li>
                        <li>4 Members for TPB</li>
                        <li>100 AI Credits</li>
                    </ul>
                </div>

                <!-- Gold Tier -->
                <div class="tier-card gold" data-aos="fade-up" data-aos-delay="250">
                    <div class="tier-name">Gold Legacy Builder</div>
                    <div class="tier-price">R2,980/month</div>
                    <ul class="tier-features">
                        <li>600 PV Points</li>
                        <li>35% ISP Commission</li>
                        <li>9 Generation TSC</li>
                        <li>6 Members for TPB</li>
                        <li>200 AI Credits</li>
                    </ul>
                </div>

                <!-- Platinum Tier -->
                <div class="tier-card platinum" data-aos="fade-up" data-aos-delay="300">
                    <div class="tier-name">Platinum Legacy Builder</div>
                    <div class="tier-price">R4,980/month</div>
                    <ul class="tier-features">
                        <li>1000 PV Points</li>
                        <li>40% ISP Commission</li>
                        <li>12 Generation TSC</li>
                        <li>8 Members for TPB</li>
                        <li>500 AI Credits</li>
                    </ul>
                </div>

                <!-- Diamond Tier -->
                <div class="tier-card diamond" data-aos="fade-up" data-aos-delay="350">
                    <div class="tier-name">Diamond Legacy Builder</div>
                    <div class="tier-price">R5,980/month</div>
                    <ul class="tier-features">
                        <li>1200 PV Points</li>
                        <li>50% ISP Commission</li>
                        <li>15 Generation TSC</li>
                        <li>9 Members for TPB</li>
                        <li>1000 AI Credits</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- 6 Income Streams Section -->
    <section id="income" class="income-streams">
        <div class="container">
            <h2 class="section-title" data-aos="fade-up">6 Revolutionary Income Streams</h2>

            <div class="row">
                <div class="col-lg-6" data-aos="fade-right">
                    <div class="stream-card">
                        <h4><i class="fas fa-user-tie"></i> ISP - Individual Sales Profit</h4>
                        <p>Earn 25% to 50% commission based on your tier level when you personally recruit new members.</p>
                    </div>

                    <div class="stream-card">
                        <h4><i class="fas fa-rocket"></i> QPB - Quick Pathfinder Bonus</h4>
                        <p>Get 7.5% bonus on your first 3 recruits, then 10% on subsequent sets. Fast-track your earnings!</p>
                    </div>

                    <div class="stream-card">
                        <h4><i class="fas fa-sitemap"></i> TSC - Team Sales Commission</h4>
                        <p>Earn from 9 generations deep: 10%, 5%, 3%, 2%, 1%, 1%, 1%, 1%, 1%. Build a legacy team!</p>
                    </div>
                </div>

                <div class="col-lg-6" data-aos="fade-left">
                    <div class="stream-card">
                        <h4><i class="fas fa-trophy"></i> TPB - Team Performance Bonus</h4>
                        <p>Qualify with 2+ active builders monthly. Reward consistent team building efforts.</p>
                    </div>

                    <div class="stream-card">
                        <h4><i class="fas fa-crown"></i> TLI - Team Leadership Incentive</h4>
                        <p>Share in the 7.5% quarterly pool. 10 recognition levels from R2,500 to R5,000,000!</p>
                    </div>

                    <div class="stream-card">
                        <h4><i class="fas fa-award"></i> CEO Awards & Competitions</h4>
                        <p>Participate in special competitions with additional prizes and recognition opportunities.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Coach Manlaw Section -->
    <section id="ai-coach" class="ai-coach">
        <div class="container">
            <h2 class="section-title" data-aos="fade-up">Meet Coach Manlaw - Your AI Business Coach</h2>
            <p class="text-center mb-5" data-aos="fade-up" data-aos-delay="100">
                The world's first MLM platform with a hybrid AI personality coach
            </p>

            <div class="personality-grid">
                <div class="personality-card" data-aos="zoom-in" data-aos-delay="100">
                    <div class="personality-percentage">10%</div>
                    <h5 style="color: var(--primary-gold);">Humor</h5>
                    <p>Engaging & motivational</p>
                </div>

                <div class="personality-card" data-aos="zoom-in" data-aos-delay="200">
                    <div class="personality-percentage">20%</div>
                    <h5 style="color: var(--primary-gold);">Emotional Intelligence</h5>
                    <p>People-centered guidance</p>
                </div>

                <div class="personality-card" data-aos="zoom-in" data-aos-delay="300">
                    <div class="personality-percentage">35%</div>
                    <h5 style="color: var(--primary-gold);">Leadership & Faith</h5>
                    <p>Biblical wealth principles</p>
                </div>

                <div class="personality-card" data-aos="zoom-in" data-aos-delay="400">
                    <div class="personality-percentage">35%</div>
                    <h5 style="color: var(--primary-gold);">Business Strategy</h5>
                    <p>Results-focused tactics</p>
                </div>
            </div>

            <!-- 4M's Framework -->
            <div class="row mt-5">
                <div class="col-lg-12">
                    <h3 class="text-center mb-4" style="color: var(--primary-gold);">The 4M's Transformation Framework</h3>
                </div>
                <div class="col-lg-3 col-md-6" data-aos="flip-left" data-aos-delay="100">
                    <div class="stream-card text-center">
                        <i class="fas fa-brain fa-3x mb-3" style="color: var(--primary-gold);"></i>
                        <h5>Mindset</h5>
                        <p>Spiritual, psychological, and physical foundation for success</p>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6" data-aos="flip-left" data-aos-delay="200">
                    <div class="stream-card text-center">
                        <i class="fas fa-dollar-sign fa-3x mb-3" style="color: var(--primary-gold);"></i>
                        <h5>Money Moves</h5>
                        <p>Financial literacy, value chains, AI automation</p>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6" data-aos="flip-left" data-aos-delay="300">
                    <div class="stream-card text-center">
                        <i class="fas fa-chart-line fa-3x mb-3" style="color: var(--primary-gold);"></i>
                        <h5>Momentum</h5>
                        <p>Business systems, networking, F.O.C.U.S consistency</p>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6" data-aos="flip-left" data-aos-delay="400">
                    <div class="stream-card text-center">
                        <i class="fas fa-flag-checkered fa-3x mb-3" style="color: var(--primary-gold);"></i>
                        <h5>Missions</h5>
                        <p>Business strategy, scaling, legacy building</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Marketplace Section -->
    <section id="marketplace" class="architecture-section">
        <div class="container">
            <h2 class="section-title" data-aos="fade-up">Intelligent Marketplace</h2>
            <p class="text-center mb-5" data-aos="fade-up" data-aos-delay="100">
                Revolutionary pricing algorithm that ensures everyone wins
            </p>

            <div class="row">
                <div class="col-lg-6" data-aos="fade-right">
                    <div class="stream-card">
                        <h4 style="color: var(--primary-gold);">How It Works</h4>
                        <p class="mb-3">Our intelligent pricing algorithm automatically calculates the perfect price:</p>
                        <ul style="list-style: none; padding: 0;">
                            <li class="mb-2"><i class="fas fa-check" style="color: var(--success);"></i> Member sets desired profit</li>
                            <li class="mb-2"><i class="fas fa-check" style="color: var(--success);"></i> System adds MLM commissions</li>
                            <li class="mb-2"><i class="fas fa-check" style="color: var(--success);"></i> Platform adds 5% service fee</li>
                            <li><i class="fas fa-check" style="color: var(--success);"></i> Final price ensures all parties benefit</li>
                        </ul>
                    </div>
                </div>

                <div class="col-lg-6" data-aos="fade-left">
                    <div class="stream-card" style="background: rgba(255, 215, 0, 0.05);">
                        <h4 style="color: var(--primary-gold);">Example Pricing</h4>
                        <div class="mb-3">
                            <strong>Member wants:</strong> R100 profit<br>
                            <strong>MLM commissions:</strong> R50 (network)<br>
                            <strong>Z2B fee (5%):</strong> R7.50<br>
                            <strong style="color: var(--primary-gold); font-size: 1.2rem;">Final Price: R157.50</strong>
                        </div>
                        <div style="border-top: 1px solid rgba(255, 215, 0, 0.2); padding-top: 15px;">
                            <small>Distribution:</small><br>
                            <small>• Member: R100 (63.5%)</small><br>
                            <small>• Network: R50 (31.7%)</small><br>
                            <small>• Platform: R7.50 (4.8%)</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-center mt-5">
                <h4 style="color: var(--primary-gold);">Product Categories</h4>
                <div class="row mt-4">
                    <div class="col-md-4" data-aos="zoom-in" data-aos-delay="100">
                        <div class="personality-card">
                            <i class="fas fa-laptop-code fa-3x mb-3" style="color: var(--primary-gold);"></i>
                            <h5>Digital Products</h5>
                            <p>Courses, ebooks, software, templates</p>
                        </div>
                    </div>
                    <div class="col-md-4" data-aos="zoom-in" data-aos-delay="200">
                        <div class="personality-card">
                            <i class="fas fa-box fa-3x mb-3" style="color: var(--primary-gold);"></i>
                            <h5>Physical Products</h5>
                            <p>Manufactured goods, crafts, health products</p>
                        </div>
                    </div>
                    <div class="col-md-4" data-aos="zoom-in" data-aos-delay="300">
                        <div class="personality-card">
                            <i class="fas fa-handshake fa-3x mb-3" style="color: var(--primary-gold);"></i>
                            <h5>Services</h5>
                            <p>Consulting, coaching, professional services</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Monthly Refuel Section -->
    <section class="stats-section">
        <div class="container">
            <h2 class="section-title" data-aos="fade-up">Monthly AI Credits System</h2>
            <p class="text-center mb-5" data-aos="fade-up" data-aos-delay="100">
                Stay active and unlock the full power of our platform
            </p>

            <div class="row">
                <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
                    <div class="personality-card">
                        <i class="fas fa-sync-alt fa-3x mb-3" style="color: var(--primary-gold);"></i>
                        <h5>Monthly Refuel</h5>
                        <p>Required to maintain active status</p>
                    </div>
                </div>

                <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
                    <div class="personality-card">
                        <i class="fas fa-coins fa-3x mb-3" style="color: var(--primary-gold);"></i>
                        <h5>Earn Commissions</h5>
                        <p>Active status required for team earnings</p>
                    </div>
                </div>

                <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
                    <div class="personality-card">
                        <i class="fas fa-robot fa-3x mb-3" style="color: var(--primary-gold);"></i>
                        <h5>AI Features</h5>
                        <p>Coach, video creator, recruiting funnel</p>
                    </div>
                </div>

                <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="400">
                    <div class="personality-card">
                        <i class="fas fa-users fa-3x mb-3" style="color: var(--primary-gold);"></i>
                        <h5>TPB Qualification</h5>
                        <p>2+ active builders monthly required</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-links">
                <a href="#">About Us</a>
                <a href="#">Compensation Plan</a>
                <a href="#">Terms of Service</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Contact</a>
            </div>

            <div class="social-links text-center mb-3">
                <a href="#" style="color: var(--text-secondary); font-size: 1.5rem; margin: 0 10px;">
                    <i class="fab fa-facebook"></i>
                </a>
                <a href="#" style="color: var(--text-secondary); font-size: 1.5rem; margin: 0 10px;">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="#" style="color: var(--text-secondary); font-size: 1.5rem; margin: 0 10px;">
                    <i class="fab fa-telegram"></i>
                </a>
                <a href="#" style="color: var(--text-secondary); font-size: 1.5rem; margin: 0 10px;">
                    <i class="fab fa-whatsapp"></i>
                </a>
            </div>

            <!-- Hidden Admin Login Trigger -->
            <div class="copyright">
                © 2025 <a href="#" class="admin-trigger" onclick="enableAdminAccess()">Z2B Legacy Builders</a>. All rights reserved.
            </div>
        </div>
    </footer>

    <!-- Login Modal -->
    <div class="modal fade" id="loginModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" style="color: var(--primary-gold);">Member Login</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="mb-3">
                            <label class="form-label">Username or Email</label>
                            <input type="text" class="form-control" name="username" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-control" name="password" required>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="rememberMe">
                            <label class="form-check-label" for="rememberMe">Remember me</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-gold" onclick="handleLogin()">Login</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Admin Login Modal (Hidden) -->
    <div class="modal fade" id="adminLoginModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" style="color: var(--danger);">Admin Access</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="adminLoginForm">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i> Authorized Personnel Only
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Admin Username</label>
                            <input type="text" class="form-control" name="admin_username" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Admin Password</label>
                            <input type="password" class="form-control" name="admin_password" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" onclick="handleAdminLogin()">Admin Login</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Register Modal -->
    <div class="modal fade" id="registerModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" style="color: var(--primary-gold);">Join Z2B Legacy Builders</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">First Name</label>
                                <input type="text" class="form-control" name="first_name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-control" name="last_name" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Username</label>
                                <input type="text" class="form-control" name="username" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" name="password" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" name="confirm_password" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Select Your Tier</label>
                            <select class="form-control" name="tier" required>
                                <option value="">Choose your tier...</option>
                                <option value="BLB">Bronze (R480/month)</option>
                                <option value="CLB">Copper (R980/month)</option>
                                <option value="SLB">Silver (R1,480/month)</option>
                                <option value="GLB">Gold (R2,980/month)</option>
                                <option value="PLB">Platinum (R4,980/month)</option>
                                <option value="DLB">Diamond (R5,980/month)</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Sponsor Code (Optional)</label>
                            <input type="text" class="form-control" name="sponsor_code">
                            <small class="text-muted">Enter your sponsor's referral code if you have one</small>
                        </div>
                        <div class="form-check mb-3">
                            <input type="checkbox" class="form-check-input" id="terms" required>
                            <label class="form-check-label" for="terms">
                                I agree to the Terms of Service and Privacy Policy
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-gold" onclick="handleRegister()">Create Account</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true
        });

        // Hidden admin access
        let adminClickCount = 0;
        let adminClickTimer = null;

        function enableAdminAccess() {
            adminClickCount++;

            if (adminClickTimer) {
                clearTimeout(adminClickTimer);
            }

            adminClickTimer = setTimeout(() => {
                adminClickCount = 0;
            }, 3000);

            if (adminClickCount === 5) {
                // Set session flag for admin access
                fetch('/api/admin-access.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({action: 'enable'})
                }).then(() => {
                    const adminModal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
                    adminModal.show();
                });
                adminClickCount = 0;
            }
        }

        // Handle member login
        function handleLogin() {
            const form = document.getElementById('loginForm');
            const formData = new FormData(form);

            fetch('/api/auth.php?action=login', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirect || '/dashboard';
                } else {
                    alert(data.message || 'Login failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        }

        // Handle admin login
        function handleAdminLogin() {
            const form = document.getElementById('adminLoginForm');
            const formData = new FormData(form);

            fetch('/api/auth.php?action=admin_login', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirect || '/admin/dashboard';
                } else {
                    alert(data.message || 'Admin login failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        }

        // Handle registration
        function handleRegister() {
            const form = document.getElementById('registerForm');
            const formData = new FormData(form);

            // Validate passwords match
            if (formData.get('password') !== formData.get('confirm_password')) {
                alert('Passwords do not match');
                return;
            }

            fetch('/api/auth.php?action=register', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Registration successful! Your referral code is: ' + data.referral_code);
                    // Close register modal and open login modal
                    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
                    setTimeout(() => {
                        new bootstrap.Modal(document.getElementById('loginModal')).show();
                    }, 500);
                } else {
                    alert(data.message || 'Registration failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    </script>
</body>
</html>