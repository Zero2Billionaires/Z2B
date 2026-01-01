/**
 * Z2B Request Limiter - Client Side
 *
 * Tracks request usage and shows warnings to users
 *
 * @package Z2B
 * @version 1.0.0
 */

class RequestLimiter {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || '/api/usage-status.php';
        this.checkInterval = options.checkInterval || 60000; // Check every minute
        this.showWarnings = options.showWarnings !== false;
        this.warningContainer = options.warningContainer || 'request-limit-warning';

        this.usageData = null;
        this.features = null;
        this.warning = null;
        this.intervalId = null;

        this.init();
    }

    /**
     * Initialize the request limiter
     */
    async init() {
        // Fetch initial usage data
        await this.fetchUsageData();

        // Start periodic checks
        this.startPeriodicCheck();

        // Add before unload check
        window.addEventListener('beforeunload', () => this.stopPeriodicCheck());
    }

    /**
     * Fetch current usage data from API
     */
    async fetchUsageData() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.usageData = data.data.usage;
                    this.features = data.data.features;
                    this.warning = data.data.warning;

                    // Store headers
                    this.headers = {
                        limit: response.headers.get('X-RateLimit-Limit'),
                        remaining: response.headers.get('X-RateLimit-Remaining'),
                        reset: response.headers.get('X-RateLimit-Reset'),
                        tier: response.headers.get('X-RateLimit-Tier')
                    };

                    // Show warning if needed
                    if (this.showWarnings && this.warning) {
                        this.displayWarning();
                    }

                    // Dispatch custom event
                    this.dispatchUsageEvent();

                    return data.data;
                }
            }
        } catch (error) {
            console.error('Failed to fetch usage data:', error);
        }
        return null;
    }

    /**
     * Start periodic usage checks
     */
    startPeriodicCheck() {
        if (this.intervalId) return;

        this.intervalId = setInterval(() => {
            this.fetchUsageData();
        }, this.checkInterval);
    }

    /**
     * Stop periodic checks
     */
    stopPeriodicCheck() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Display warning notification
     */
    displayWarning() {
        if (!this.warning) return;

        const container = document.getElementById(this.warningContainer);
        if (!container) {
            console.warn('Warning container not found');
            return;
        }

        const { level, message, show_upgrade } = this.warning;

        // Determine color and icon
        const colors = {
            critical: { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', icon: '⚠️' },
            warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: '⚡' },
            info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: 'ℹ️' }
        };

        const color = colors[level] || colors.info;

        // Create warning HTML
        const html = `
            <div class="request-limit-warning ${level}" style="
                background: ${color.bg};
                border: 2px solid ${color.border};
                border-radius: 8px;
                padding: 16px;
                margin: 16px 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                animation: slideIn 0.3s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">${color.icon}</span>
                    <div>
                        <div style="font-weight: 600; color: ${color.text}; margin-bottom: 4px;">
                            ${message}
                        </div>
                        <div style="font-size: 14px; color: ${color.text}; opacity: 0.8;">
                            ${this.getUsageSummary()}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    ${show_upgrade ? `
                        <button onclick="window.requestLimiter.showUpgradeModal()" style="
                            background: ${color.border};
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: opacity 0.2s;
                        " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                            Upgrade Tier
                        </button>
                    ` : ''}
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: transparent;
                        border: none;
                        color: ${color.text};
                        font-size: 20px;
                        cursor: pointer;
                        padding: 0 8px;
                    ">×</button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Add animation keyframes if not exists
        if (!document.querySelector('#request-limiter-styles')) {
            const style = document.createElement('style');
            style.id = 'request-limiter-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Get usage summary text
     */
    getUsageSummary() {
        if (!this.usageData) return '';

        const { today, tier } = this.usageData;
        return `${today.used} of ${tier.daily_limit} requests used today (${today.percentage}%)`;
    }

    /**
     * Show usage stats in console
     */
    logUsageStats() {
        if (!this.usageData) return;

        console.group('📊 Z2B Request Usage');
        console.log('Tier:', this.usageData.tier.name);
        console.log('Today:', `${this.usageData.today.used}/${this.usageData.tier.daily_limit} (${this.usageData.today.percentage}%)`);
        console.log('This Month:', `${this.usageData.month.used}/${this.usageData.tier.monthly_limit} (${this.usageData.month.percentage}%)`);
        console.log('Rollover:', `${this.usageData.rollover.current}/${this.usageData.rollover.max}`);
        console.log('Available:', this.usageData.today.available);
        console.groupEnd();
    }

    /**
     * Dispatch custom event with usage data
     */
    dispatchUsageEvent() {
        const event = new CustomEvent('usageDataUpdated', {
            detail: {
                usage: this.usageData,
                features: this.features,
                warning: this.warning
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Show upgrade modal
     */
    showUpgradeModal() {
        const modal = `
            <div id="upgrade-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            " onclick="if(event.target === this) this.remove()">
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 32px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <h2 style="margin: 0 0 16px 0; color: #1F2937;">Upgrade Your Tier</h2>
                    <p style="color: #6B7280; margin-bottom: 24px;">
                        Get more requests, advanced features, and priority support by upgrading your membership tier.
                    </p>

                    ${this.getTierComparisonHTML()}

                    <div style="display: flex; gap: 12px; margin-top: 24px;">
                        <button onclick="window.location.href='/marketplace/subscriptions'" style="
                            flex: 1;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 16px;
                        ">
                            View Plans
                        </button>
                        <button onclick="document.getElementById('upgrade-modal').remove()" style="
                            flex: 1;
                            background: #E5E7EB;
                            color: #374151;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 16px;
                        ">
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
    }

    /**
     * Get tier comparison HTML
     */
    getTierComparisonHTML() {
        const tiers = [
            { name: 'Bronze', daily: 25, monthly: 750, features: ['Basic Analytics'] },
            { name: 'Copper', daily: 60, monthly: 1800, features: ['Advanced Analytics', 'Extended Memory (30 msgs)'] },
            { name: 'Silver', daily: 120, monthly: 3600, features: ['Goal Tracking', 'Priority Support', 'Extended Memory (50 msgs)'] },
            { name: 'Gold', daily: 250, monthly: 7500, features: ['Export Features', 'Premium Support', 'Extended Memory (100 msgs)'] },
            { name: 'Platinum', daily: 500, monthly: 15000, features: ['All Features', 'Premium Support', 'Extended Memory (200 msgs)'] }
        ];

        const currentTier = this.usageData?.tier?.name || '';

        return `
            <div style="display: grid; gap: 12px;">
                ${tiers.map(tier => {
                    const isCurrent = currentTier.includes(tier.name);
                    return `
                        <div style="
                            border: 2px solid ${isCurrent ? '#667eea' : '#E5E7EB'};
                            border-radius: 8px;
                            padding: 16px;
                            ${isCurrent ? 'background: #F3F4F6;' : ''}
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <h3 style="margin: 0; color: #1F2937;">${tier.name}${isCurrent ? ' (Current)' : ''}</h3>
                                <div style="text-align: right;">
                                    <div style="font-size: 14px; color: #6B7280;">Daily: ${tier.daily}</div>
                                    <div style="font-size: 14px; color: #6B7280;">Monthly: ${tier.monthly.toLocaleString()}</div>
                                </div>
                            </div>
                            <div style="font-size: 14px; color: #6B7280;">
                                ${tier.features.map(f => `✓ ${f}`).join(' • ')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Create usage widget for dashboard
     */
    createUsageWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.usageData) return;

        const { today, tier, month, rollover } = this.usageData;

        const html = `
            <div class="usage-widget" style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            ">
                <h3 style="margin: 0 0 16px 0; color: #1F2937; display: flex; align-items: center; gap: 8px;">
                    📊 Request Usage
                    <span style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        font-size: 12px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-weight: 600;
                    ">${tier.name}</span>
                </h3>

                <!-- Today's Usage -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: #6B7280;">Today</span>
                        <span style="font-weight: 600; color: #1F2937;">${today.used} / ${tier.daily_limit}</span>
                    </div>
                    <div style="
                        background: #E5E7EB;
                        height: 8px;
                        border-radius: 4px;
                        overflow: hidden;
                    ">
                        <div style="
                            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                            height: 100%;
                            width: ${Math.min(today.percentage, 100)}%;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                    <div style="font-size: 12px; color: #9CA3AF; margin-top: 4px;">
                        ${today.available} requests remaining
                    </div>
                </div>

                <!-- Monthly Usage -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: #6B7280;">This Month</span>
                        <span style="font-weight: 600; color: #1F2937;">${month.used} / ${month.limit.toLocaleString()}</span>
                    </div>
                    <div style="
                        background: #E5E7EB;
                        height: 8px;
                        border-radius: 4px;
                        overflow: hidden;
                    ">
                        <div style="
                            background: linear-gradient(90deg, #10B981 0%, #059669 100%);
                            height: 100%;
                            width: ${Math.min(month.percentage, 100)}%;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                </div>

                <!-- Rollover Balance -->
                ${rollover.current > 0 ? `
                    <div style="
                        background: #FEF3C7;
                        border: 1px solid #F59E0B;
                        border-radius: 6px;
                        padding: 12px;
                        margin-bottom: 16px;
                    ">
                        <div style="font-size: 14px; color: #92400E; font-weight: 600; margin-bottom: 4px;">
                            🎁 Rollover Bonus
                        </div>
                        <div style="font-size: 12px; color: #92400E;">
                            ${rollover.current} extra requests from unused daily allowance
                        </div>
                    </div>
                ` : ''}

                <button onclick="window.requestLimiter.showUpgradeModal()" style="
                    width: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s;
                " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    Upgrade for More Requests
                </button>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Check if feature is available
     */
    hasFeature(featureName) {
        return this.features?.[featureName] || false;
    }

    /**
     * Get remaining requests
     */
    getRemainingRequests() {
        return this.usageData?.today?.available || 0;
    }

    /**
     * Check if user can make request
     */
    canMakeRequest() {
        return this.getRemainingRequests() > 0;
    }
}

// Make it globally available
window.RequestLimiter = RequestLimiter;

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('request-limit-warning')) {
        window.requestLimiter = new RequestLimiter();
    }
});
