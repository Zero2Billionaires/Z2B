<?php
/**
 * Z2B Legacy Builders - Email Notification Service
 * Handles all email notifications for payments, registrations, etc.
 */

class EmailService {
    private $fromEmail;
    private $fromName;
    private $replyTo;

    public function __construct() {
        $this->fromEmail = 'noreply@z2blegacybuilders.co.za';
        $this->fromName = 'Z2B Legacy Builders';
        $this->replyTo = 'support@z2blegacybuilders.co.za';
    }

    /**
     * Send payment confirmation email
     */
    public function sendPaymentConfirmation($toEmail, $data) {
        $subject = 'Payment Successful - Welcome to Z2B Legacy Builders!';
        $message = $this->getPaymentConfirmationTemplate($data);

        return $this->sendEmail($toEmail, $subject, $message);
    }

    /**
     * Send registration email with login credentials
     */
    public function sendRegistrationEmail($toEmail, $data) {
        $subject = 'Welcome to Z2B - Your Account Details';
        $message = $this->getRegistrationTemplate($data);

        return $this->sendEmail($toEmail, $subject, $message);
    }

    /**
     * Send referral notification to referrer
     */
    public function sendReferralNotification($toEmail, $data) {
        $subject = 'Great News! Someone Used Your Referral Code';
        $message = $this->getReferralNotificationTemplate($data);

        return $this->sendEmail($toEmail, $subject, $message);
    }

    /**
     * Core email sending function
     */
    private function sendEmail($to, $subject, $htmlMessage) {
        // Email headers
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . $this->fromName . ' <' . $this->fromEmail . '>',
            'Reply-To: ' . $this->replyTo,
            'X-Mailer: PHP/' . phpversion()
        ];

        try {
            // Use PHP mail() function (works with most hosting)
            $sent = mail($to, $subject, $htmlMessage, implode("\r\n", $headers));

            if ($sent) {
                error_log("Email sent successfully to: $to");
                return ['success' => true, 'message' => 'Email sent'];
            } else {
                error_log("Failed to send email to: $to");
                return ['success' => false, 'message' => 'Mail function failed'];
            }

        } catch (Exception $e) {
            error_log("Email error: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Payment confirmation email template
     */
    private function getPaymentConfirmationTemplate($data) {
        $tierName = $data['tier_name'] ?? 'Legacy Builder';
        $amount = $data['amount'] ?? '0';
        $reference = $data['reference'] ?? 'N/A';
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $loginUrl = 'https://z2blegacybuilders.co.za/login';

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0A2647, #051428); color: #FFD700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #FFD700; color: #0A2647; padding: 15px 30px; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .highlight { color: #FFD700; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Payment Successful!</h1>
            <p>Welcome to Z2B Legacy Builders</p>
        </div>
        <div class="content">
            <h2>Thank You for Your Purchase!</h2>
            <p>Your payment has been processed successfully. Welcome to the <span class="highlight">{$tierName}</span> tier!</p>

            <div class="details">
                <h3>Payment Details:</h3>
                <p><strong>Amount:</strong> R{$amount}</p>
                <p><strong>Reference:</strong> {$reference}</p>
                <p><strong>Tier:</strong> {$tierName}</p>
                <p><strong>Date:</strong> " . date('F j, Y, g:i a') . "</p>
            </div>

            <div class="details">
                <h3>Your Login Credentials:</h3>
                <p><strong>Username:</strong> {$username}</p>
                <p><strong>Password:</strong> {$password}</p>
                <p style="color: #666; font-size: 14px;"><em>Please change your password after first login</em></p>
            </div>

            <div style="text-align: center;">
                <a href="{$loginUrl}" class="button">Login to Your Dashboard</a>
            </div>

            <h3>What's Next?</h3>
            <ul>
                <li>✅ Log in to your dashboard</li>
                <li>✅ Complete your profile</li>
                <li>✅ Explore all 7 AI apps</li>
                <li>✅ Start building your team</li>
                <li>✅ Access your unique referral link</li>
            </ul>

            <h3>Your Benefits Include:</h3>
            <ul>
                <li>🤖 Access to all 7 AI-powered apps</li>
                <li>💰 7 income streams</li>
                <li>📱 Digital marketplace access</li>
                <li>🎓 Training and support</li>
                <li>👥 Team building tools</li>
            </ul>
        </div>
        <div class="footer">
            <p>Need help? Contact us on WhatsApp: <a href="https://wa.me/27774901639">077 490 1639</a></p>
            <p>&copy; 2025 Z2B Legacy Builders. All Rights Reserved.</p>
            <p>Built for Future Billionaires 🚀</p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Registration email template
     */
    private function getRegistrationTemplate($data) {
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $tierName = $data['tier_name'] ?? 'Legacy Builder';
        $referralLink = $data['referral_link'] ?? '';

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0A2647, #051428); color: #FFD700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #FFD700; color: #0A2647; padding: 15px 30px; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .referral-box { background: #FFF4CC; padding: 15px; border-radius: 5px; border: 2px dashed #FFD700; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to Z2B!</h1>
            <p>Your Account is Ready</p>
        </div>
        <div class="content">
            <h2>Welcome, {$username}!</h2>
            <p>Your {$tierName} account has been activated. You're now part of the Z2B Legacy Builders family!</p>

            <div class="details">
                <h3>Your Login Details:</h3>
                <p><strong>Username:</strong> {$username}</p>
                <p><strong>Password:</strong> {$password}</p>
            </div>

            <div class="referral-box">
                <h3>📎 Your Unique Referral Link:</h3>
                <p style="word-break: break-all; background: white; padding: 10px; border-radius: 3px;">{$referralLink}</p>
                <p style="font-size: 14px; margin-top: 10px;">Share this link to earn commissions on every sale!</p>
            </div>

            <div style="text-align: center;">
                <a href="https://z2blegacybuilders.co.za/login" class="button">Access Your Dashboard</a>
            </div>
        </div>
        <div class="footer">
            <p>Questions? WhatsApp us: <a href="https://wa.me/27774901639">077 490 1639</a></p>
            <p>&copy; 2025 Z2B Legacy Builders</p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Referral notification template
     */
    private function getReferralNotificationTemplate($data) {
        $referrerName = $data['referrer_name'] ?? 'Builder';
        $newMemberName = $data['new_member_name'] ?? 'Someone';
        $tierName = $data['tier_name'] ?? 'a tier';
        $commission = $data['commission'] ?? '0';

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0A2647, #051428); color: #FFD700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight-box { background: #FFF4CC; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>You Earned a Referral Commission</p>
        </div>
        <div class="content">
            <h2>Great News, {$referrerName}!</h2>
            <p>{$newMemberName} just joined Z2B using your referral link and purchased {$tierName}!</p>

            <div class="highlight-box">
                <h2 style="color: #FFD700; margin: 0;">R{$commission}</h2>
                <p style="margin: 10px 0 0 0;">Referral Commission Earned</p>
            </div>

            <p>Keep sharing your referral link to build your team and increase your income!</p>

            <p style="text-align: center; margin-top: 30px;">
                <a href="https://z2blegacybuilders.co.za/dashboard" style="background: #FFD700; color: #0A2647; padding: 15px 30px; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold;">View Your Dashboard</a>
            </p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Z2B Legacy Builders</p>
        </div>
    </div>
</body>
</html>
HTML;
    }
}
