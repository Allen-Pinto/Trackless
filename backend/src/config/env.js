import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
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
      : ['http://localhost:3000', 
        'http://localhost:5001' ,
         'https://trackless-phi.vercel.app',
        'https://trackless-git-main-allens-projects-1b758e17.vercel.app',
        'https://trackless-np9ago47j-allens-projects-1b758e17.vercel.app']
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  dataRetention: {
    days: parseInt(process.env.DATA_RETENTION_DAYS) || 90
  },
  // Cloudinary config
  cloudinary: {
    cloudName: 'dxrp7vosv',
    apiKey: '856552496189723',
    apiSecret: 'CM9DNIbRtbCRsCrS7qSJT0T9OJ0'
  }
};

export default config;