const express = require('express');
const router = express.Router();
const MavulaWhatsAppService = require('../services/MavulaWhatsAppService');

// ===================================================================
// WHATSAPP WEBHOOK ENDPOINTS
// ===================================================================

/**
 * POST /api/mavula/webhooks/whatsapp/twilio
 *
 * Webhook endpoint for incoming Twilio WhatsApp messages
 *
 * Twilio sends webhooks when:
 * - A prospect replies to a WhatsApp message
 * - A message status changes (delivered, read, etc.)
 *
 * Expected payload from Twilio:
 * {
 *   From: "whatsapp:+27821234567",
 *   To: "whatsapp:+14155238886",
 *   Body: "Hi, I'm interested in learning more",
 *   MessageSid: "SM1234567890abcdef",
 *   NumMedia: "0",
 *   ...
 * }
 */
router.post('/whatsapp/twilio', async (req, res) => {
    try {
        console.log('Received Twilio webhook:', JSON.stringify(req.body, null, 2));

        const webhookData = req.body;

        // Validate required fields
        if (!webhookData.From || !webhookData.Body) {
            console.warn('Invalid Twilio webhook data - missing From or Body');
            return res.status(400).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
        }

        // Process the incoming message
        const result = await MavulaWhatsAppService.processTwilioWebhook(webhookData);

        console.log('Twilio webhook processed:', result);

        // Respond with empty TwiML (Twilio expects XML response)
        // We don't want to auto-reply here - our automation engine handles that
        res.set('Content-Type', 'text/xml');
        res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    } catch (error) {
        console.error('Error processing Twilio webhook:', error);

        // Still return valid TwiML even on error
        res.set('Content-Type', 'text/xml');
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
});

/**
 * POST /api/mavula/webhooks/whatsapp/ultramsg
 *
 * Webhook endpoint for incoming Ultramsg WhatsApp messages
 *
 * Ultramsg sends webhooks when:
 * - A prospect replies to a WhatsApp message
 *
 * Expected payload from Ultramsg:
 * {
 *   "id": "message_id_here",
 *   "from": "27821234567@c.us",
 *   "body": "Hi, I'm interested",
 *   "type": "chat",
 *   "time": 1234567890,
 *   ...
 * }
 */
router.post('/whatsapp/ultramsg', async (req, res) => {
    try {
        console.log('Received Ultramsg webhook:', JSON.stringify(req.body, null, 2));

        const webhookData = req.body;

        // Validate required fields
        if (!webhookData.from || !webhookData.body) {
            console.warn('Invalid Ultramsg webhook data - missing from or body');
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook data'
            });
        }

        // Process the incoming message
        const result = await MavulaWhatsAppService.processUltramsgWebhook(webhookData);

        console.log('Ultramsg webhook processed:', result);

        // Respond with JSON (Ultramsg expects JSON response)
        res.json({
            success: true,
            message: 'Webhook received'
        });
    } catch (error) {
        console.error('Error processing Ultramsg webhook:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/mavula/webhooks/whatsapp/status
 *
 * Webhook endpoint for WhatsApp message status updates
 *
 * Twilio sends status updates for:
 * - sent, delivered, read, failed
 *
 * Expected payload:
 * {
 *   MessageSid: "SM1234567890abcdef",
 *   MessageStatus: "delivered",
 *   To: "whatsapp:+27821234567",
 *   ...
 * }
 */
router.post('/whatsapp/status', async (req, res) => {
    try {
        console.log('Received WhatsApp status update:', JSON.stringify(req.body, null, 2));

        const { MessageSid, MessageStatus, To } = req.body;

        if (!MessageSid || !MessageStatus) {
            console.warn('Invalid status webhook - missing MessageSid or MessageStatus');
            return res.status(400).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
        }

        // Extract phone number from To field (format: "whatsapp:+27821234567")
        const phone = To?.replace('whatsapp:', '');

        // Find prospect by phone and update message status
        if (phone) {
            const MavulaProspect = require('../models/MavulaProspect');
            const prospect = await MavulaProspect.findOne({
                phone: MavulaWhatsAppService.formatPhoneNumber(phone)
            });

            if (prospect) {
                await MavulaWhatsAppService.updateMessageStatus(
                    prospect._id,
                    MessageSid,
                    MessageStatus.toUpperCase()
                );
                console.log(`Updated message ${MessageSid} status to ${MessageStatus}`);
            }
        }

        // Respond with empty TwiML
        res.set('Content-Type', 'text/xml');
        res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    } catch (error) {
        console.error('Error processing status webhook:', error);

        res.set('Content-Type', 'text/xml');
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
});

/**
 * GET /api/mavula/webhooks/health
 *
 * Health check endpoint for webhook service
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'MAVULA Webhooks',
        endpoints: {
            twilio: '/api/mavula/webhooks/whatsapp/twilio',
            ultramsg: '/api/mavula/webhooks/whatsapp/ultramsg',
            status: '/api/mavula/webhooks/whatsapp/status'
        },
        timestamp: new Date()
    });
});

module.exports = router;
