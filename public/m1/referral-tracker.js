/**
 * Z2B Legacy Builders - Referral Tracking System
 *
 * This script ensures that when a Builder shares a prospect link,
 * the referral is tracked throughout the entire journey:
 * 1. Prospect lands on start-milestone-1.html with ?ref=BUILDER_ID
 * 2. Prospect completes M1
 * 3. Prospect sees tier upsell
 * 4. Prospect purchases tier → Original Builder gets credit
 *
 * The referral is stored in localStorage and sessionStorage for persistence
 */

class ReferralTracker {
    constructor() {
        this.STORAGE_KEY = 'z2b_referral_builder';
        this.SESSION_KEY = 'z2b_referral_session';
        this.init();
    }

    /**
     * Initialize the referral tracker
     */
    init() {
        // Check if there's a referral parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const referralId = urlParams.get('ref') || urlParams.get('referral') || urlParams.get('builder');

        if (referralId) {
            this.storeReferral(referralId);
            console.log('[Referral Tracker] New referral detected:', referralId);
        } else {
            // Check if we already have a stored referral
            const stored = this.getReferral();
            if (stored) {
                console.log('[Referral Tracker] Existing referral found:', stored);
            }
        }
    }

    /**
     * Store the referral builder ID in both localStorage and sessionStorage
     * @param {string} builderId - The builder's unique ID
     */
    storeReferral(builderId) {
        const referralData = {
            builderId: builderId,
            timestamp: new Date().toISOString(),
            source: window.location.pathname
        };

        // Store in localStorage (persists across sessions)
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(referralData));

        // Store in sessionStorage (backup for current session)
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(referralData));

        // Also store in a cookie as a third backup (30 days)
        this.setCookie(this.STORAGE_KEY, builderId, 30);
    }

    /**
     * Get the stored referral builder ID
     * @returns {object|null} - The referral data or null if not found
     */
    getReferral() {
        // Try localStorage first
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('[Referral Tracker] Error parsing localStorage:', e);
            }
        }

        // Try sessionStorage
        const session = sessionStorage.getItem(this.SESSION_KEY);
        if (session) {
            try {
                return JSON.parse(session);
            } catch (e) {
                console.error('[Referral Tracker] Error parsing sessionStorage:', e);
            }
        }

        // Try cookie
        const cookie = this.getCookie(this.STORAGE_KEY);
        if (cookie) {
            return { builderId: cookie };
        }

        return null;
    }

    /**
     * Get the referral builder ID only (without metadata)
     * @returns {string|null}
     */
    getReferralBuilderId() {
        const referral = this.getReferral();
        return referral ? referral.builderId : null;
    }

    /**
     * Clear the referral data (use when prospect becomes a member)
     */
    clearReferral() {
        localStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.SESSION_KEY);
        this.deleteCookie(this.STORAGE_KEY);
        console.log('[Referral Tracker] Referral data cleared');
    }

    /**
     * Set a cookie
     * @param {string} name
     * @param {string} value
     * @param {number} days
     */
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    }

    /**
     * Get a cookie value
     * @param {string} name
     * @returns {string|null}
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    /**
     * Delete a cookie
     * @param {string} name
     */
    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }

    /**
     * Attach referral data to form submissions
     * @param {object} formData - The form data object
     * @returns {object} - Form data with referral info added
     */
    attachToFormData(formData) {
        const builderId = this.getReferralBuilderId();
        if (builderId) {
            formData.referralBuilderId = builderId;
            formData.referralSource = 'prospect_funnel';
        }
        return formData;
    }

    /**
     * Generate a shareable prospect link for builders
     * @param {string} builderId - The builder's ID
     * @param {string} baseUrl - Optional base URL (defaults to current origin)
     * @returns {string} - The shareable link
     */
    static generateProspectLink(builderId, baseUrl = window.location.origin) {
        return `${baseUrl}/milestone1-deployment-package/frontend/start-milestone-1.html?ref=${builderId}`;
    }

    /**
     * Check if current user is a prospect (has referral) or direct user
     * @returns {boolean}
     */
    isProspect() {
        return this.getReferralBuilderId() !== null;
    }
}

// Initialize the tracker globally
window.ReferralTracker = new ReferralTracker();

// Make it easy to access the builder ID
window.getReferralBuilderId = () => window.ReferralTracker.getReferralBuilderId();

console.log('[Referral Tracker] Initialized');
