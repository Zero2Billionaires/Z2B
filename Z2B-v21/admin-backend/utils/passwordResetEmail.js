const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    const port = parseInt(process.env.EMAIL_PORT) || 587;
    return nodemailer.createTransporter({
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

// Password Reset Email Template
const getPasswordResetEmailHTML = (userData, resetUrl) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0A2647 0%, #144272 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107; }
        .button { display: inline-block; background: #FFD700; color: #0A2647; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .reset-link { word-break: break-all; background: white; padding: 15px; border-radius: 5px; font-size: 14px; color: #0A2647; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset Request</h1>
            <p>Z2B Legacy Builders</p>
        </div>

        <div class="content">
            <p>Dear <strong>${userData.firstName} ${userData.lastName}</strong>,</p>

            <p>We received a request to reset the password for your Z2B Legacy Builders account.</p>

            <div class="warning-box">
                <p style="margin: 0;"><strong>⚠️ Important:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>

            <p>To reset your password, click the button below:</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>

            <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
            <div class="reset-link">${resetUrl}</div>

            <div style="background: #fee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <p style="margin: 0; color: #721c24;"><strong>⏰ This link will expire in 1 hour</strong> for security reasons.</p>
            </div>

            <p style="margin-top: 30px;">If you're having trouble, please contact our support team at <a href="mailto:support@z2blegacybuilders.co.za">support@z2blegacybuilders.co.za</a></p>

            <p style="color: #0A2647; font-weight: bold;">Stay secure! 🛡️</p>
        </div>

        <div class="footer">
            <p><strong>Z2B Legacy Builders</strong></p>
            <p>Website: <a href="https://z2blegacybuilders.co.za">z2blegacybuilders.co.za</a></p>
            <p>Email: support@z2blegacybuilders.co.za</p>
        </div>
    </div>
</body>
</html>
    `;
};

// Send Password Reset Email
const sendPasswordResetEmail = async (userData, resetUrl) => {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('⚠️  Email not configured. Skipping password reset email.');
            return { success: false, message: 'Email not configured' };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"Z2B Legacy Builders Security" <${process.env.EMAIL_USER}>`,
            to: userData.email,
            subject: `Password Reset Request - Z2B Legacy Builders 🔒`,
            html: getPasswordResetEmailHTML(userData, resetUrl)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendPasswordResetEmail
};
