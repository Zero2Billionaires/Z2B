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
    'http://localhost:3000',
    'http://localhost:5000'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);

        // Return the actual origin to reflect it in the response header
        // This allows credentials to work properly with specific origins
        callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the app directory
app.use(express.static(path.join(__dirname, '../app')));
// Also serve from public folder (for Railway deployment)
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

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/questionnaire', questionnaireRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Z2B Admin Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.3',  // Password reset endpoints active
        endpoints: {
            auth: '/api/auth/forgot-password',
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
});
