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
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [
          'http://localhost:3000',
          'http://localhost:5001',
          'https://trackless-phi.vercel.app', 
          'https://trackless-git-main-allens-projects-1b758e17.vercel.app',
          'https://trackless-np9ago47j-allens-projects-1b758e17.vercel.app',
          'https://trackless-fxoj.onrender.com' 
        ]
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  dataRetention: {
    days: parseInt(process.env.DATA_RETENTION_DAYS) || 90
  },

  // ✅ Secure Cloudinary config (prefer to move keys into .env on Render)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dxrp7vosv',
    apiKey: process.env.CLOUDINARY_API_KEY || '856552496189723',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'CM9DNIbRtbCRsCrS7qSJT0T9OJ0'
  }
};

export default config;
