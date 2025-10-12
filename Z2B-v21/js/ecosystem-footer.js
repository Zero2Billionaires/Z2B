/**
 * Z2B Ecosystem Footer Component
 * Add this to all apps to show the complete ecosystem and invite functionality
 */

function createZ2BEcosystemFooter() {
    const footer = document.createElement('div');
    footer.id = 'z2b-ecosystem-footer';

    // Check if user is in demo mode
    const appAccess = window.Z2BAppAccess;
    const isDemo = appAccess && appAccess.currentUser && appAccess.currentUser.isDemo;

    footer.innerHTML = `
        <style>
            #z2b-ecosystem-footer {
                background: linear-gradient(135deg, #0A2647 0%, #051428 100%);
                border-top: 4px solid #FFD700;
                padding: ${isDemo ? '4rem 2rem' : '3rem 2rem'};
                margin-top: 4rem;
                ${isDemo ? 'box-shadow: 0 -10px 40px rgba(255, 215, 0, 0.3);' : ''}
            }

            .ecosystem-container {
                max-width: 1200px;
                margin: 0 auto;
                color: white;
            }

            .demo-spotlight {
                background: linear-gradient(135deg, #FFD700, #FF6B35);
                color: #0A2647;
                padding: 2rem;
                border-radius: 20px;
                text-align: center;
                margin-bottom: 3rem;
                box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4);
                animation: pulse-glow 2s infinite;
            }

            @keyframes pulse-glow {
                0%, 100% {
                    box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4);
                }
                50% {
                    box-shadow: 0 12px 40px rgba(255, 215, 0, 0.6);
                }
            }

            .demo-spotlight h2 {
                font-size: 2.5rem;
                font-weight: 900;
                margin-bottom: 1rem;
            }

            .demo-spotlight p {
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 0;
            }

            .ecosystem-header {
                text-align: center;
                margin-bottom: 3rem;
            }

            .ecosystem-header h3 {
                color: #FFD700;
                font-size: ${isDemo ? '2.5rem' : '2rem'};
                font-weight: 800;
                margin-bottom: 0.5rem;
            }

            .ecosystem-header p {
                font-size: ${isDemo ? '1.2rem' : '1.1rem'};
                opacity: 0.9;
                font-style: italic;
            }

            .ecosystem-apps-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }

            .ecosystem-app-card {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 2rem;
                text-align: center;
                transition: all 0.3s;
                border: 2px solid transparent;
                cursor: pointer;
            }

            .ecosystem-app-card:hover {
                transform: translateY(-5px);
                border-color: #FFD700;
                box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
            }

            .ecosystem-app-card.locked {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .ecosystem-app-card.locked::after {
                content: '🔒';
                position: absolute;
                top: 1rem;
                right: 1rem;
                font-size: 1.5rem;
            }

            .ecosystem-app-card {
                position: relative;
            }

            .ecosystem-app-icon {
                font-size: 3rem;
                color: #FFD700;
                margin-bottom: 1rem;
            }

            .ecosystem-app-name {
                font-size: 1.2rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                color: white;
            }

            .ecosystem-app-desc {
                font-size: 0.9rem;
                opacity: 0.8;
                margin-bottom: 1rem;
            }

            .ecosystem-app-access {
                display: inline-block;
                padding: 0.3rem 0.8rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
            }

            .access-full {
                background: #4ECDC4;
                color: white;
            }

            .access-demo {
                background: #FF6B35;
                color: white;
            }

            .access-locked {
                background: #666;
                color: white;
            }

            .ecosystem-actions {
                display: flex;
                justify-content: center;
                gap: 1rem;
                flex-wrap: wrap;
                padding-top: 2rem;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }

            .ecosystem-btn {
                padding: 1rem 2rem;
                border-radius: 50px;
                font-weight: 700;
                text-decoration: none;
                transition: all 0.3s;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }

            .ecosystem-btn-primary {
                background: linear-gradient(135deg, #FFD700, #FF6B35);
                color: #0A2647;
            }

            .ecosystem-btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 2px solid #FFD700;
            }

            .ecosystem-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
            }

            @media (max-width: 768px) {
                .ecosystem-apps-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>

        <div class="ecosystem-container">
            ${isDemo ? `
            <div class="demo-spotlight">
                <h2>🎯 Explore the Z2B Ecosystem</h2>
                <p>You're experiencing our powerful AI apps in demo mode! Explore all the tools below and see how they can transform your business.</p>
            </div>
            ` : ''}

            <div class="ecosystem-header">
                <h3><i class="fas fa-rocket"></i> ${isDemo ? 'Complete Z2B Ecosystem - Try All Apps!' : 'Complete Z2B Ecosystem'}</h3>
                <p>"I am a Legacy Builder, You are a Legacy Builder, and Together we are Builders of Legacies."</p>
            </div>

            <div class="ecosystem-apps-grid" id="ecosystemAppsGrid">
                <!-- Populated by JavaScript -->
            </div>

            <div class="ecosystem-actions">
                <a href="tiers.html" class="ecosystem-btn ecosystem-btn-primary">
                    <i class="fas fa-arrow-up"></i> Upgrade Your Tier
                </a>
                <button class="ecosystem-btn ecosystem-btn-secondary" onclick="shareReferralLink()">
                    <i class="fas fa-share-alt"></i> Invite & Earn
                </button>
                <a href="dashboard.html" class="ecosystem-btn ecosystem-btn-secondary">
                    <i class="fas fa-home"></i> Back to Dashboard
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(footer);
    populateEcosystemApps();
}

function populateEcosystemApps() {
    const grid = document.getElementById('ecosystemAppsGrid');
    if (!grid) return;

    const appAccess = window.Z2BAppAccess;
    if (!appAccess) return;

    const allApps = Object.values(window.Z2B_APPS || {});
    const availableApps = appAccess.getAvailableApps();
    const lockedApps = appAccess.getLockedApps();

    grid.innerHTML = '';

    // Add available apps
    availableApps.forEach(app => {
        const card = createAppCard(app, false);
        grid.appendChild(card);
    });

    // Add locked apps
    lockedApps.forEach(app => {
        const card = createAppCard(app, true);
        grid.appendChild(card);
    });
}

function createAppCard(app, isLocked) {
    const card = document.createElement('div');
    card.className = `ecosystem-app-card ${isLocked ? 'locked' : ''}`;

    if (!isLocked) {
        card.onclick = () => window.location.href = app.url;
    }

    const accessBadge = isLocked
        ? '<span class="ecosystem-app-access access-locked">Locked</span>'
        : app.isDemo
            ? '<span class="ecosystem-app-access access-demo">Demo</span>'
            : '<span class="ecosystem-app-access access-full">Full Access</span>';

    const unlockInfo = isLocked && app.unlockTier
        ? `<div style="font-size: 0.8rem; margin-top: 0.5rem; color: #FFD700;">Unlock with ${app.unlockTier.tierName}</div>`
        : '';

    card.innerHTML = `
        <div class="ecosystem-app-icon"><i class="${app.icon}"></i></div>
        <div class="ecosystem-app-name">${app.name}</div>
        <div class="ecosystem-app-desc">${app.description}</div>
        ${accessBadge}
        ${unlockInfo}
    `;

    return card;
}

function shareReferralLink() {
    const appAccess = window.Z2BAppAccess;
    if (!appAccess) return;

    const currentUrl = window.location.href;
    const baseUrl = currentUrl.split('?')[0];
    const referralUrl = `${baseUrl}?demo=true&ref=${appAccess.currentUser.id}`;

    // Copy to clipboard
    navigator.clipboard.writeText(referralUrl).then(() => {
        alert(`✅ Referral link copied!\n\nShare this link:\n${referralUrl}\n\nWhen someone signs up using your link, you'll earn commission!`);
    }).catch(() => {
        // Fallback
        prompt('Copy your referral link:', referralUrl);
    });
}

// Handle referral parameters from URL
function handleReferralParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const referrerId = urlParams.get('ref');
    const isDemo = urlParams.get('demo') === 'true';

    if (referrerId && window.Z2BAppAccess) {
        // Store referrer ID
        window.Z2BAppAccess.setReferrer(referrerId);

        // Show demo banner if in demo mode
        if (isDemo) {
            const demoBanner = document.createElement('div');
            demoBanner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #FFD700, #FF6B35);
                color: #0A2647;
                padding: 1rem 2rem;
                text-align: center;
                font-weight: 700;
                z-index: 9999;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            `;

            const daysRemaining = window.Z2BAppAccess.getDemoDaysRemaining();
            demoBanner.innerHTML = `
                <i class="fas fa-gift"></i> You're in Demo Mode! ${daysRemaining} days remaining.
                <a href="tiers.html" style="color: #0A2647; text-decoration: underline; font-weight: 800; margin-left: 1rem;">
                    Upgrade Now to Unlock Full Access
                </a>
            `;

            document.body.insertBefore(demoBanner, document.body.firstChild);

            // Add padding to body so content doesn't hide under banner
            document.body.style.paddingTop = '60px';
        }
    }
}

// Auto-initialize if app-config.js is loaded
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for app-config.js to load
        setTimeout(() => {
            if (window.Z2BAppAccess) {
                handleReferralParams();
                createZ2BEcosystemFooter();
            }
        }, 100);
    });
}
