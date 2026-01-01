// Tier Checkout Utility Functions
const PaymentGateway = require('../models/PaymentGateway');
const PaymentSession = require('../models/PaymentSession');
const Settings = require('../models/Settings');

// Tier code mapping (landing page codes to database codes)
const TIER_CODE_MAP = {
    'BLB': 'BRONZE',
    'CLB': 'COPPER',
    'SLB': 'SILVER',
    'GLB': 'GOLD',
    'PLB': 'PLATINUM',
    'FAM': 'FAM'
};

// Default tier configurations (fallback if MongoDB is unavailable)
const DEFAULT_TIERS = {
    FAM: {
        name: 'FAM - Free Affiliate',
        price: 0,
        betaPrice: 0,
        pvPoints: 0,
        ispCommission: 20
    },
    BRONZE: {
        name: 'Bronze Legacy Builder',
        price: 960,
        betaPrice: 480,
        pvPoints: 24,
        ispCommission: 25
    },
    COPPER: {
        name: 'Copper Legacy Builder',
        price: 1980,
        betaPrice: 990,
        pvPoints: 50,
        ispCommission: 30
    },
    SILVER: {
        name: 'Silver Legacy Builder',
        price: 2980,
        betaPrice: 1490,
        pvPoints: 74,
        ispCommission: 35
    },
    GOLD: {
        name: 'Gold Legacy Builder',
        price: 4980,
        betaPrice: 2490,
        pvPoints: 149,
        ispCommission: 40
    },
    PLATINUM: {
        name: 'Platinum Legacy Builder',
        price: 6980,
        betaPrice: 3490,
        pvPoints: 249,
        ispCommission: 45
    }
};

// Default payment gateway settings (fallback)
const DEFAULT_GATEWAY = {
    yoco: {
        enabled: true,
        publicKey: '',
        secretKey: 'sk_test_960bfde0VBrLlpK098e4ffeb53e1',
        webhookSecret: '',
        mode: 'test'
    }
};

/**
 * Create a tier checkout session
 */
async function createTierCheckout(req) {
    const { tier_code, referral_code } = req.body;

    if (!tier_code) {
        throw new Error('Tier code is required');
    }

    // Map tier code from landing page format to database format
    const dbTierCode = TIER_CODE_MAP[tier_code] || tier_code;

    // Use default tiers directly (MongoDB disabled for now)
    let tier;
    let isBeta = true; // Default to beta pricing

    // Use default tier configuration
    if (!DEFAULT_TIERS[dbTierCode]) {
        throw new Error('Invalid tier selected');
    }
    tier = DEFAULT_TIERS[dbTierCode];
    console.log('Using default tier settings for', dbTierCode);

    // Determine price (use betaPrice if beta program is active)
    const price = isBeta && tier.betaPrice ? tier.betaPrice : tier.price;
    const amountInCents = price * 100; // Convert to cents

    // Use default payment gateway (MongoDB disabled for now)
    let gateway = DEFAULT_GATEWAY;
    console.log('Using default payment gateway settings');

    // Generate unique reference
    const reference = `TIER-${tier_code}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Get base URL for callbacks
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const baseUrl = `${protocol}://${host}`;

    // Prepare Yoco checkout payload
    const payload = {
        amount: amountInCents,
        currency: 'ZAR',
        successUrl: `${baseUrl}/payment-success-register.html?ref=${reference}&tier=${tier_code}`,
        cancelUrl: `${baseUrl}/landing-page.html#tiers`,
        failureUrl: `${baseUrl}/payment-failed.html?ref=${reference}`,
        metadata: {
            tier_code: tier_code,
            tier_name: tier.name,
            reference: reference,
            referral_code: referral_code || ''
        }
    };

    // Make API request to Yoco
    const yocoSecretKey = gateway.yoco.secretKey || 'sk_test_960bfde0VBrLlpK098e4ffeb53e1';
    const yocoApiUrl = 'https://payments.yoco.com/api/checkouts';

    const response = await fetch(yocoApiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${yocoSecretKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Yoco API error: ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.redirectUrl) {
        throw new Error('No redirect URL received from payment gateway');
    }

    // Store checkout session for later verification (if MongoDB available)
    try {
        const paymentSession = new PaymentSession({
            reference: reference,
            tierCode: tier_code,
            referralCode: referral_code || null,
            checkoutId: responseData.id,
            status: 'pending',
            amount: price,
            currency: 'ZAR',
            metadata: {
                tier_name: tier.name,
                tier_db_code: dbTierCode
            }
        });

        await paymentSession.save();
        console.log('Payment session stored in MongoDB');
    } catch (saveError) {
        console.warn('Could not save payment session to MongoDB:', saveError.message);
        // Continue anyway - payment can still be processed
    }

    // Return success data
    return {
        success: true,
        redirectUrl: responseData.redirectUrl,
        checkoutId: responseData.id,
        reference: reference
    };
}

module.exports = {
    createTierCheckout,
    TIER_CODE_MAP
};
