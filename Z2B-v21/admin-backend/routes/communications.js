const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Middleware to verify admin authentication
const { verifyToken } = require('../middleware/auth');

// WhatsApp Service
const { sendWhatsAppMessage } = require('../utils/whatsappService');

// SMS Configuration (using Africa's Talking or similar SMS gateway)
// You'll need to install: npm install africastalking
// Or use Twilio: npm install twilio
const SMS_API_KEY = process.env.SMS_API_KEY || 'your_sms_api_key';
const SMS_USERNAME = process.env.SMS_USERNAME || 'sandbox';

// Email Configuration using existing emailService
const { transporter } = require('../utils/emailService');

// Send SMS Route
router.post('/sms', verifyToken, async (req, res) => {
    try {
        const { recipients, message } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Recipients array is required'
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // TODO: Implement SMS sending using your preferred SMS gateway
        // Example with Africa's Talking (uncomment when configured):
        /*
        const AfricasTalking = require('africastalking')({
            apiKey: SMS_API_KEY,
            username: SMS_USERNAME
        });

        const sms = AfricasTalking.SMS;
        const result = await sms.send({
            to: recipients,
            message: message,
            from: 'Z2B' // Your sender ID
        });
        */

        // For now, return success (you need to configure SMS gateway)
        console.log('SMS Send Request:', {
            recipients: recipients.length,
            message: message.substring(0, 50) + '...'
        });

        res.json({
            success: true,
            message: `SMS queued for ${recipients.length} recipient(s)`,
            note: 'Please configure SMS gateway in backend/routes/communications.js'
        });

    } catch (error) {
        console.error('SMS sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send SMS',
            error: error.message
        });
    }
});


// Send WhatsApp Route (Bulk Messaging)
router.post('/whatsapp', verifyToken, async (req, res) => {
    try {
        const { recipients, message } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Recipients array is required'
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const results = {
            total: recipients.length,
            successful: 0,
            failed: 0,
            errors: []
        };

        // Send WhatsApp to each recipient with delay to avoid rate limiting
        for (let i = 0; i < recipients.length; i++) {
            const phone = recipients[i];
            
            try {
                const result = await sendWhatsAppMessage(phone, message);
                
                if (result.success) {
                    results.successful++;
                    console.log(`WhatsApp sent to ${phone} via ${result.provider}`);
                } else {
                    results.failed++;
                    results.errors.push({
                        phone,
                        error: result.error
                    });
                    console.error(`Failed to send to ${phone}: ${result.error}`);
                }
            } catch (error) {
                results.failed++;
                results.errors.push({
                    phone,
                    error: error.message
                });
                console.error(`Error sending to ${phone}:`, error);
            }

            // Add delay between messages to avoid rate limiting (500ms)
            if (i < recipients.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        res.json({
            success: results.successful > 0,
            message: `WhatsApp messages sent: ${results.successful} successful, ${results.failed} failed`,
            data: results
        });

    } catch (error) {
        console.error('WhatsApp bulk send error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send WhatsApp messages',
            error: error.message
        });
    }
});

// Send Email Route
router.post('/email', verifyToken, async (req, res) => {
    try {
        const { recipients, subject, message } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Recipients array is required'
            });
        }

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: 'Subject is required'
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Send emails using nodemailer
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Z2B Legacy Builders <noreply@z2blegacybuilders.co.za>',
            bcc: recipients, // Use BCC to send to multiple recipients privately
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #0A2647, #144272);
                            color: #FFD700;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #ffffff;
                            padding: 30px;
                            border: 1px solid #e0e0e0;
                        }
                        .footer {
                            background: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                            border-radius: 0 0 10px 10px;
                        }
                        .message-content {
                            white-space: pre-wrap;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Z2B Legacy Builders</h1>
                        </div>
                        <div class="content">
                            <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 Z2B Legacy Builders. All Rights Reserved.</p>
                            <p>Built with ❤️ for Future Billionaires</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: message // Plain text version
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: `Email sent successfully to ${recipients.length} recipient(s)`
        });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

// Get Communication Stats
router.get('/stats', verifyToken, async (req, res) => {
    try {
        // TODO: Implement communication statistics
        // Track sent messages, delivery rates, etc.

        res.json({
            success: true,
            data: {
                totalEmailsSent: 0,
                totalSmsSent: 0,
                totalWhatsAppSent: 0,
                lastEmailSent: null,
                lastSmsSent: null
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load statistics'
        });
    }
});

module.exports = router;
