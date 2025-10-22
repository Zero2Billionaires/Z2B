<?php
/**
 * Z2B Legacy Builders - Yoco PRODUCTION Configuration
 *
 * IMPORTANT:
 * 1. Rename this file to yoco.php on production server
 * 2. Get your LIVE API keys from: https://portal.yoco.com/settings/keys
 * 3. Configure webhook at: https://portal.yoco.com/settings/webhooks
 */

// ==============================================
// LIVE API KEYS (for real payments)
// ==============================================
// Get these from Yoco Portal → Settings → API Keys → Live Keys
define('YOCO_SECRET_KEY', 'sk_live_YOUR_LIVE_SECRET_KEY_HERE');
define('YOCO_PUBLIC_KEY', 'pk_live_YOUR_LIVE_PUBLIC_KEY_HERE');

// ==============================================
// WEBHOOK SECRET (for security)
// ==============================================
// Get this when you create the webhook in Yoco portal
// Webhook URL: https://z2blegacybuilders.co.za/api/yoco-webhook.php
define('YOCO_WEBHOOK_SECRET', 'whsec_YOUR_WEBHOOK_SECRET_HERE');

// ==============================================
// TEST KEYS (for testing before going live)
// ==============================================
// Uncomment these and comment out live keys above for testing
// define('YOCO_SECRET_KEY', 'sk_test_960bfde0VBrLlpK098e4ffeb53e1');
// define('YOCO_PUBLIC_KEY', 'pk_test_ed3c54a6gOol69qa7f45');

/**
 * WEBHOOK SETUP INSTRUCTIONS:
 *
 * 1. Go to: https://portal.yoco.com/settings/webhooks
 * 2. Click "Add Webhook"
 * 3. Enter URL: https://z2blegacybuilders.co.za/api/yoco-webhook.php
 * 4. Select these events:
 *    - checkout.succeeded
 *    - checkout.completed
 *    - payment.succeeded
 *    - checkout.failed
 *    - payment.failed
 * 5. Copy the webhook secret shown
 * 6. Paste it above in YOCO_WEBHOOK_SECRET
 * 7. Click "Save"
 */
?>
