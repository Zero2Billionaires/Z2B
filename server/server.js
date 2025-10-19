import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { sanitizeInput } from './middleware/validateRequest.js';

// Import routes
import memberRoutes from './routes/memberRoutes.js';
import tierRoutes from './routes/tierRoutes.js';
import commissionRoutes from './routes/commissionRoutes.js';

// AI Coach routes
import authRoutes from './routes/authRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import btssRoutes from './routes/btssRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';

// Enhanced ManLaw API routes
import scriptureRoutes from './routes/scriptureRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Referral and membership routes
import referralRoutes from './routes/referralRoutes.js';

// Glowie AI App Builder routes
import glowieRoutes from './routes/glowieRoutes.js';

// VIDZIE D-ID Video Generation routes
import vidzieRoutes from './routes/vidzieRoutes.js';
import templateRoutes from './routes/templateRoutes.js';

// CEO Competition routes
import ceoCompetitionRoutes from './routes/ceoCompetitionRoutes.js';

// Admin Authentication routes
import adminAuthRoutes from './routes/adminAuthRoutes.js';

// TLI (Team Leadership Incentive) routes
import tliRoutes from './routes/tliRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize input
app.use(sanitizeInput);

// Serve static files from Z2B-v21 directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/Z2B-v21', express.static(path.join(__dirname, '..', 'Z2B-v21')));
app.use('/app', express.static(path.join(__dirname, '..', 'Z2B-v21', 'app')));
app.use('/admin', express.static(path.join(__dirname, '..', 'Z2B-v21', 'admin')));
app.use('/js', express.static(path.join(__dirname, '..', 'Z2B-v21', 'js')));
// Serve quick-login and other root files
app.use('/', express.static(path.join(__dirname, '..')));

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/tiers', tierRoutes);
app.use('/api/commissions', commissionRoutes);

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// AI Coach routes (will be protected)
app.use('/api/coach', coachRoutes);
app.use('/api/btss', btssRoutes);
app.use('/api/lessons', lessonRoutes);

// Enhanced ManLaw API routes
app.use('/api/scriptures', scriptureRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Referral and membership routes (protected)
app.use('/api/referrals', referralRoutes);

// Glowie AI App Builder routes (protected)
app.use('/api/glowie', glowieRoutes);

// VIDZIE D-ID Video Generation routes (protected)
app.use('/api/vidzie', vidzieRoutes);
app.use('/api/vidzie', templateRoutes);

// CEO Competition routes (admin/protected)
app.use('/api/ceo-competitions', ceoCompetitionRoutes);

// Admin Authentication routes
app.use('/api/admin-auth', adminAuthRoutes);

// TLI routes
app.use('/api/tli', tliRoutes);

// Root route - API Documentation
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({
    message: 'Welcome to Zero to Billionaires (Z2B) API',
    tagline: 'Building Legacy Builders Through Faith, Business & MLM Excellence',
    version: '1.0.0',
    documentation: {
      authentication: {
        description: 'User authentication and account management',
        endpoints: [
          { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
          { method: 'POST', path: '/api/auth/login', description: 'Login user' },
          { method: 'GET', path: '/api/auth/me', description: 'Get current user profile' },
          { method: 'PUT', path: '/api/auth/updateprofile', description: 'Update user profile' },
          { method: 'POST', path: '/api/auth/forgotpassword', description: 'Request password reset' }
        ]
      },
      coachManLaw: {
        description: 'AI-powered faith-based coaching system',
        endpoints: [
          { method: 'POST', path: '/api/coach/check-in', description: 'Start coaching session' },
          { method: 'POST', path: '/api/coach/chat', description: 'Chat with Coach ManLaw' },
          { method: 'GET', path: '/api/coach/chat/history/:userId', description: 'Get chat history' },
          { method: 'POST', path: '/api/coach/action', description: 'Create action item' },
          { method: 'GET', path: '/api/coach/actions/:userId', description: 'Get user actions' },
          { method: 'POST', path: '/api/coach/win', description: 'Record a win' }
        ],
        websocket: `ws://${req.get('host')}/ws/coach`
      },
      scriptures: {
        description: '95+ Bible verses for business & legacy building',
        endpoints: [
          { method: 'GET', path: '/api/scriptures/search?q=wisdom&limit=10', description: 'Search scriptures' },
          { method: 'GET', path: '/api/scriptures/leg/:legName', description: 'Get by leg category' },
          { method: 'GET', path: '/api/scriptures/random', description: 'Get random scripture' },
          { method: 'GET', path: '/api/scriptures/daily', description: 'Daily scripture' },
          { method: 'GET', path: '/api/scriptures/categories', description: 'List categories' }
        ]
      },
      btss: {
        description: 'Business Table Success Score assessment system',
        endpoints: [
          { method: 'POST', path: '/api/btss/assess', description: 'Submit BTSS assessment' },
          { method: 'GET', path: '/api/btss/:userId', description: 'Get latest BTSS score' },
          { method: 'GET', path: '/api/btss/history/:userId', description: 'Get score history' },
          { method: 'GET', path: '/api/btss/growth/:userId', description: 'Get growth trends' }
        ]
      },
      analytics: {
        description: 'User progress analytics and insights',
        endpoints: [
          { method: 'GET', path: '/api/analytics/user/:userId/dashboard', description: 'Comprehensive dashboard' },
          { method: 'GET', path: '/api/analytics/user/:userId/btss-trends', description: 'BTSS trend analysis' },
          { method: 'GET', path: '/api/analytics/user/:userId/progress-report', description: 'Progress report' },
          { method: 'GET', path: '/api/analytics/platform/overview', description: 'Platform stats (Admin)' }
        ]
      },
      lessons: {
        description: 'Video lessons and learning content',
        endpoints: [
          { method: 'GET', path: '/api/lessons', description: 'List all lessons' },
          { method: 'GET', path: '/api/lessons/:lessonId', description: 'Get lesson details' },
          { method: 'GET', path: '/api/lessons/leg/:legNumber', description: 'Get lessons by leg' },
          { method: 'POST', path: '/api/lessons/complete', description: 'Mark lesson complete' }
        ]
      },
      admin: {
        description: 'Platform administration (Admin only)',
        endpoints: [
          { method: 'GET', path: '/api/admin/users', description: 'List all users' },
          { method: 'GET', path: '/api/admin/lessons', description: 'Manage lessons' },
          { method: 'GET', path: '/api/admin/sessions', description: 'View all sessions' },
          { method: 'GET', path: '/api/admin/stats/summary', description: 'Platform statistics' },
          { method: 'POST', path: '/api/admin/broadcast', description: 'Broadcast message' }
        ]
      },
      glowie: {
        description: 'AI App Builder powered by Claude',
        endpoints: [
          { method: 'POST', path: '/api/glowie/generate', description: 'Generate app from prompt' },
          { method: 'GET', path: '/api/glowie/apps', description: 'List user apps' },
          { method: 'GET', path: '/api/glowie/app/:id', description: 'Get app details' }
        ]
      },
      vidzie: {
        description: 'D-ID Video Generation System',
        endpoints: [
          { method: 'POST', path: '/api/vidzie/generate', description: 'Generate video' },
          { method: 'GET', path: '/api/vidzie/videos', description: 'List user videos' },
          { method: 'GET', path: '/api/vidzie/video/:id', description: 'Get video details' }
        ]
      },
      referrals: {
        description: 'Membership and Referral Tracking',
        endpoints: [
          { method: 'GET', path: '/api/referrals/stats', description: 'Get referral statistics' },
          { method: 'GET', path: '/api/referrals/team', description: 'View team members' },
          { method: 'GET', path: '/api/referrals/validate/:membershipNumber', description: 'Validate referral code' },
          { method: 'GET', path: '/api/referrals/leaderboard', description: 'Top referrers' }
        ]
      }
    },
    webApplications: [
      { name: 'Coach ManLaw', url: `${baseUrl}/app/coach-manlaw.html` },
      { name: 'Glowie AI Builder', url: `${baseUrl}/app/glowie.html` },
      { name: 'VIDZIE Video Generator', url: `${baseUrl}/app/vidzie.html` },
      { name: 'Admin Dashboard', url: `${baseUrl}/admin/vidzie-dashboard.html` }
    ],
    quickLinks: [
      { name: 'Health Check', url: `${baseUrl}/api/health` },
      { name: 'API Test', url: `${baseUrl}/api/test` },
      { name: 'Daily Scripture', url: `${baseUrl}/api/scriptures/daily` }
    ],
    features: [
      'AI-Powered Faith-Based Coaching',
      'Real-Time WebSocket Chat',
      '95+ Scripture Database',
      'BTSS Assessment & Tracking',
      'Advanced Analytics & Trends',
      'Video Lesson Library',
      'AI App Generation (Glowie)',
      'D-ID Video Creation (VIDZIE)',
      'Full Admin Management Suite'
    ],
    status: {
      server: 'running',
      environment: process.env.NODE_ENV || 'development',
      aiProvider: process.env.AI_PROVIDER || 'claude',
      realTimeAI: process.env.ENABLE_REAL_TIME_AI === 'true' ? 'enabled' : 'placeholder mode'
    }
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Z2B API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      mongodb: 'connected',
      ai: process.env.ENABLE_REAL_TIME_AI === 'true' ? 'enabled' : 'placeholder mode'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Handle 404 errors
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Zero to Billionaires (Z2B) API Server                 ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                   ║
║   Port: ${PORT}                                             ║
║   AI Provider: ${process.env.AI_PROVIDER || 'claude'}                                   ║
║   Real-Time AI: ${process.env.ENABLE_REAL_TIME_AI === 'true' ? 'Enabled' : 'Disabled (Placeholder)'}            ║
║                                                           ║
║   API Endpoints:                                          ║
║   - http://localhost:${PORT}/api/test                     ║
║   - http://localhost:${PORT}/api/health                   ║
║   - http://localhost:${PORT}/api/coach                    ║
║   - http://localhost:${PORT}/api/btss                     ║
║   - http://localhost:${PORT}/api/lessons                  ║
║   - http://localhost:${PORT}/api/scriptures               ║
║   - http://localhost:${PORT}/api/analytics                ║
║   - http://localhost:${PORT}/api/admin                    ║
║   - http://localhost:${PORT}/api/glowie                   ║
║   - http://localhost:${PORT}/api/vidzie                   ║
║   - ws://localhost:${PORT}/ws/coach (WebSocket)          ║
║                                                           ║
║   Web Applications:                                       ║
║   - http://localhost:${PORT}/app/vidzie.html              ║
║   - http://localhost:${PORT}/app/glowie.html              ║
║   - http://localhost:${PORT}/app/coach-manlaw.html        ║
║   - http://localhost:${PORT}/admin/vidzie-dashboard.html  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Initialize WebSocket server for real-time coaching
  try {
    const { initializeWebSocket } = await import('./services/websocketServer.js');
    initializeWebSocket(server);
    console.log('🚀 WebSocket server initialized for real-time coaching');
  } catch (error) {
    console.warn('⚠️  WebSocket initialization skipped:', error.message);
  }
});
