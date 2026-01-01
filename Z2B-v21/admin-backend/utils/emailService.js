const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    const port = parseInt(process.env.EMAIL_PORT) || 587;
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: port,
        secure: port === 465, // true for 465, false for other ports (587, etc)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // Accept self-signed certificates (common with cPanel)
        }
    });
};

// Welcome Email Template
const getWelcomeEmailHTML = (userData, password) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0A2647 0%, #144272 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #FFD700; }
        .credentials { background: #e8f5e9; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .referral-box { background: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .referral-code { font-size: 24px; font-weight: bold; color: #28a745; background: white; padding: 15px; border-radius: 5px; margin: 10px 0; font-family: monospace; }
        .button { display: inline-block; background: #FFD700; color: #0A2647; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Z2B Legacy Builders!</h1>
            <p>Transforming Employees to Wealth Creators</p>
        </div>

        <div class="content">
            <p>Dear <strong>${userData.firstName} ${userData.lastName}</strong>,</p>

            <p>Congratulations! Your account has been successfully created. Welcome to the Z2B Legacy Builders family!</p>

            <div class="info-box">
                <h3 style="color: #0A2647; margin-top: 0;">Your Account Details</h3>
                <div class="credentials">
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Password:</strong> ${password}</p>
                    <p><strong>Membership Tier:</strong> ${userData.tier}</p>
                </p>
                <p style="color: #dc3545; font-size: 12px; margin-top: 10px;">
                    ⚠️ <strong>Important:</strong> Please change your password after your first login for security.
                </p>
            </div>

            <div class="referral-box">
                <h3 style="color: #856404; margin-top: 0;">🎯 Your Membership Number</h3>
                <div class="referral-code">${userData.referralCode}</div>
                <p><strong>Your Referral Link:</strong></p>
                <p style="word-break: break-all; font-size: 14px; background: white; padding: 10px; border-radius: 5px;">
                    https://z2blegacybuilders.co.za/tiers.html?ref=${userData.referralCode}
                </p>
                <p style="font-size: 12px; color: #856404;">
                    Share this link to build your team and earn commissions!
                </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://z2blegacybuilders.co.za/dashboard.html" class="button">Login to Your Dashboard →</a>
            </div>

            <div class="info-box">
                <h3 style="color: #0A2647; margin-top: 0;">📋 Next Steps</h3>
                <ol style="padding-left: 20px;">
                    <li>Login to your dashboard using your email and password</li>
                    <li>Complete your profile information</li>
                    <li>Explore the 7 income streams available</li>
                    <li>Share your referral link to build your team</li>
                    <li>Access AI tools and training resources</li>
                </ol>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #0A2647;">💰 Your 7 Income Streams:</h4>
                <ul style="padding-left: 20px; margin: 10px 0;">
                    <li><strong>ISP</strong> - Individual Sales Profit (20%-45%)</li>
                    <li><strong>QPB</strong> - Quick Pathfinder Bonus (7.5%-10%)</li>
                    <li><strong>TSC</strong> - Team Sales Commission (10 levels)</li>
                    <li><strong>TPB</strong> - Team Performance Bonus</li>
                    <li><strong>TLI</strong> - Team Leadership Incentive</li>
                    <li><strong>CEO</strong> - CEO Awards & Competitions</li>
                    <li><strong>MKT</strong> - Marketplace Sales (95% yours!)</li>
                </ul>
            </div>

            <p style="margin-top: 30px;">If you have any questions, our support team is here to help!</p>

            <p style="color: #0A2647; font-weight: bold;">Let's build wealth together! 🚀</p>
        </div>

        <div class="footer">
            <p><strong>Z2B Legacy Builders</strong></p>
            <p>Website: <a href="https://z2blegacybuilders.co.za">z2blegacybuilders.co.za</a></p>
            <p>Email: support@z2blegacybuilders.co.za</p>
            <p style="margin-top: 20px; font-size: 11px; color: #999;">
                This email was sent because your account was created by an administrator.<br>
                If you did not request this, please contact us immediately.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

// Send Welcome Email
const sendWelcomeEmail = async (userData, password) => {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('⚠️  Email not configured. Skipping welcome email.');
            return { success: false, message: 'Email not configured' };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"Z2B Legacy Builders" <${process.env.EMAIL_USER}>`,
            to: userData.email,
            subject: `Welcome to Z2B Legacy Builders - Your Account is Ready! 🎉`,
            html: getWelcomeEmailHTML(userData, password)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendWelcomeEmail
};
