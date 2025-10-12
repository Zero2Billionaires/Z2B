import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { sanitizeInput } from './middleware/validateRequest.js';

// Import routes
import memberRoutes from './routes/memberRoutes.js';
import tierRoutes from './routes/tierRoutes.js';
import commissionRoutes from './routes/commissionRoutes.js';

// AI Coach routes
import coachRoutes from './routes/coachRoutes.js';
import btssRoutes from './routes/btssRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize input
app.use(sanitizeInput);

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/members', memberRoutes)
app.use('/api/tiers', tierRoutes)
app.use('/api/commissions', commissionRoutes)

// AI Coach routes
app.use('/api/coach', coachRoutes)
app.use('/api/btss', btssRoutes)
app.use('/api/lessons', lessonRoutes)

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

app.listen(PORT, () => {
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
║   Endpoints:                                              ║
║   - http://localhost:${PORT}/api/test                     ║
║   - http://localhost:${PORT}/api/health                   ║
║   - http://localhost:${PORT}/api/coach                    ║
║   - http://localhost:${PORT}/api/btss                     ║
║   - http://localhost:${PORT}/api/lessons                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
