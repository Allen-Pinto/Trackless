import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import config from './config/env.js';
import connectDatabase from './config/database.js';
import corsMiddleware from './middleware/cors.js';
import passport from './config/passport.js';
import trackRoutes from './routes/track.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';
import sitesRoutes from './routes/sites.js';
import notificationsRoutes from './routes/notifications.js'; 
import oauthRoutes from './routes/oauth.js';

const app = express();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined')); 
}

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for production
app.set('trust proxy', 1);

// Session middleware (for OAuth)
app.use(session({
  secret: process.env.API_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  store: config.nodeEnv === 'production' 
    ? // In production, you might want to use Redis or MongoDB session store
      // For now using MemoryStore (not recommended for production)
      new session.MemoryStore()
    : new session.MemoryStore()
}));

// Initialize Passport (OAuth)
app.use(passport.initialize());
app.use(passport.session());

// Handle preflight requests
app.options('*', corsMiddleware);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Trackless Analytics API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      oauth: '/api/oauth',
      sites: '/api/sites',
      tracking: '/api/track',
      analytics: '/api/analytics',
      notifications: '/api/notifications', 
      health: '/api/health',
    },
    documentation: 'See API_DOCUMENTATION.md for complete API reference',
    environment: config.nodeEnv,
    cors: {
      allowedOrigins: config.cors.allowedOrigins
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    memory: process.memoryUsage(),
  });
});

// Detailed health check endpoint
app.get('/api/health/detailed', corsMiddleware, (req, res) => {
  const healthCheck = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },
    cors: {
      allowedOrigins: config.cors.allowedOrigins,
      requestOrigin: req.headers.origin || 'No origin header',
    },
    database: 'connected', 
    oauth: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      github: !!process.env.GITHUB_CLIENT_ID
    }
  };

  const mongoose = require('mongoose');
  healthCheck.database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json(healthCheck);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes); // OAuth routes
app.use('/api/sites', sitesRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Test endpoint to verify CORS is working
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin header',
    environment: config.nodeEnv,
  });
});

// OAuth test endpoint
app.get('/api/oauth-test', (req, res) => {
  res.json({
    success: true,
    message: 'OAuth endpoints are available',
    endpoints: {
      google: '/api/oauth/google',
      google_callback: '/api/oauth/google/callback',
      providers: '/api/oauth/providers'
    },
    environment: config.nodeEnv,
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Endpoint not found:', req.method, req.path);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global error handler:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
  });

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy: Origin not allowed',
      requestedOrigin: req.headers.origin,
      allowedOrigins: config.cors.allowedOrigins,
    });
  }

  // MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      error: 'Database error occurred',
      ...(config.nodeEnv === 'development' && { details: err.message })
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }

  // Passport/OAuth errors
  if (err.name === 'AuthenticationError') {
    return res.status(401).json({
      success: false,
      error: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Trackless Backend Server...');
    console.log('=====================================');
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Port: ${config.port}`);
    console.log(`CORS Allowed Origins: ${config.cors.allowedOrigins.join(', ')}`);
    
    // Check OAuth configuration
    if (process.env.GOOGLE_CLIENT_ID) {
      console.log(`✅ Google OAuth: Configured`);
    } else {
      console.log(`⚠️  Google OAuth: Not configured (set GOOGLE_CLIENT_ID)`);
    }
    
    await connectDatabase();

    app.listen(config.port, () => {
      console.log('✅ Trackless Backend Server Started Successfully');
      console.log('=====================================');
      console.log(`📍 Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔐 Auth: http://localhost:${config.port}/api/auth`);
      console.log(`🔐 OAuth: http://localhost:${config.port}/api/oauth`);
      console.log(`🌐 Sites: http://localhost:${config.port}/api/sites`);
      console.log(`📊 Track: http://localhost:${config.port}/api/track`);
      console.log(`📈 Analytics: http://localhost:${config.port}/api/analytics`);
      console.log(`🔔 Notifications: http://localhost:${config.port}/api/notifications`);
      console.log(`❤️ Health: http://localhost:${config.port}/api/health`);
      console.log(`🔄 CORS Test: http://localhost:${config.port}/api/test-cors`);
      console.log(`🔐 OAuth Test: http://localhost:${config.port}/api/oauth-test`);
      console.log('=====================================');
      console.log('🎯 OAuth Endpoints:');
      console.log(`   • Google Login: http://localhost:${config.port}/api/oauth/google`);
      console.log(`   • Google Callback: http://localhost:${config.port}/api/oauth/google/callback`);
      console.log('=====================================');
      console.log('🎯 Ready to accept requests from:');
      config.cors.allowedOrigins.forEach(origin => {
        console.log(`   • ${origin}`);
      });
      console.log('=====================================');
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
  console.log('👋 Shutting down server gracefully...');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  console.log('👋 Shutting down server gracefully...');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received - shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received - shutting down gracefully');
  process.exit(0);
});

startServer();

export default app;