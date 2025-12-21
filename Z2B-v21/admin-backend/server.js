const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware - CORS Configuration
// Allow specific origins to fix browser CORS errors
const allowedOrigins = [
    'https://z2blegacybuilders.co.za',
    'https://www.z2blegacybuilders.co.za',
    'http://z2blegacybuilders.co.za',
    'http://www.z2blegacybuilders.co.za',
    'http://localhost:3000',
    'http://localhost:5000'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl, local files)
        if (!origin || origin === 'null') return callback(null, true);

        // Clean origin (remove trailing dots/slashes)
        const cleanOrigin = origin.replace(/\.$/, '').replace(/\/$/, '');

        // Check if origin or cleanOrigin is in allowedOrigins
        if (allowedOrigins.includes(origin) || allowedOrigins.includes(cleanOrigin)) {
            callback(null, true);
        } else {
            console.log('⚠️ CORS blocked origin:', origin, '(cleaned:', cleanOrigin + ')');
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files only from public folder (for Railway deployment)
// Note: ../app directory doesn't exist on Railway, only on local dev
if (process.env.NODE_ENV !== 'production') {
    // Only serve app directory in development
    try {
        app.use(express.static(path.join(__dirname, '../app')));
    } catch (err) {
        console.log('⚠️ App directory not found (expected on Railway)');
    }
}
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const statsRoutes = require('./routes/stats');
const paymentRoutes = require('./routes/payment');
const coachRoutes = require('./routes/coach');
const referralsRoutes = require('./routes/referrals');
const communicationsRoutes = require('./routes/communications');
const questionnaireRoutes = require('./routes/questionnaire');
// TEMPORARILY DISABLED - Mavula routes causing Railway crash (pdf-parse/multer upload dir issue)
// const mavulaRoutes = require('./routes/mavula');
// const mavulaAIRoutes = require('./routes/mavulaAI');
// const mavulaWebhooksRoutes = require('./routes/mavulaWebhooks');

const marketplaceAdminRoutes = require('./routes/marketplaceAdmin');
const productRoutes = require('./routes/products');
const grantAccessRoutes = require('./routes/grant-access');
const appSelectionRoutes = require('./routes/appSelection');
const didVideoRoutes = require('./routes/did-video');

// Use Routes
app.use('/api', grantAccessRoutes);
app.use('/api/app-selection', appSelectionRoutes);
app.use('/api/did-video', didVideoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
// IMPORTANT: Register marketplaceAdminRoutes BEFORE userRoutes
// This ensures /api/users/app-access-grants hits the right handler
app.use('/api/users', marketplaceAdminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
// TEMPORARILY DISABLED - Mavula routes causing Railway crash
// app.use('/api/mavula', mavulaRoutes);
// app.use('/api/mavula/webhooks', mavulaWebhooksRoutes);
// app.use('/api/mavula/ai', mavulaAIRoutes);
app.use('/api/payments', marketplaceAdminRoutes);
app.use('/api/products', productRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Z2B Admin Backend is running',
        timestamp: new Date().toISOString(),
        version: '2.0.1-PROFILE-ENDPOINT-FIX',  // FIX: Profile endpoint with appAccess Map
        endpoints: {
            auth: '/api/auth/forgot-password',
            reset: '/api/auth/reset-password',
            referrals: '/api/referrals/stats',
            members: '/api/referrals/members'
        }
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Z2B Admin Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);

// Initialize MAVULA Cron Scheduler
// TEMPORARILY DISABLED - require('./jobs/mavulaScheduler');
});
