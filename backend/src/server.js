import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import config from './config/env.js';
import connectDatabase from './config/database.js';
import corsMiddleware from './middleware/cors.js';
import trackRoutes from './routes/track.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';
import sitesRoutes from './routes/sites.js';

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Logging middleware (only in development)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Trust proxy (for getting real IP behind reverse proxy)
app.set('trust proxy', 1);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Trackless Analytics API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      sites: '/api/sites',
      tracking: '/api/track',
      analytics: '/api/analytics',
      health: '/api/health'
    },
    documentation: 'See API_DOCUMENTATION.md for complete API reference'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api', trackRoutes);
app.use('/api/analytics', analyticsRoutes);



// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy: Origin not allowed'
    });
  }

  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log('');
      console.log('🚀 Trackless Backend Server Started');
      console.log('=====================================');
      console.log(`📡 Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔐 Auth: http://localhost:${config.port}/api/auth`);
      console.log(`🌐 Sites: http://localhost:${config.port}/api/sites`);
      console.log(`📊 Track: http://localhost:${config.port}/api/track`);
      console.log(`📈 Analytics: http://localhost:${config.port}/api/analytics`);
      console.log(`💚 Health: http://localhost:${config.port}/api/health`);
      console.log('=====================================');
      console.log('');
      console.log('✨ Ready to accept requests!');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;