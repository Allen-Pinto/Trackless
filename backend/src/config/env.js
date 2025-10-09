import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/trackless'
  },
  security: {
    apiSecret: process.env.API_SECRET || 'default-secret-change-me',
    jwtSecret: process.env.JWT_SECRET || process.env.API_SECRET || 'jwt-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5000','http://localhost:3000','http://localhost:4000']
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  dataRetention: {
    days: parseInt(process.env.DATA_RETENTION_DAYS) || 90
  }
};

export default config;