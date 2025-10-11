import cors from 'cors';
import config from '../config/env.js';

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS Check - Origin:', origin);
    
    // Allow requests with no origin (mobile apps, Postman, server-to-server, etc.)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (config.cors.allowedOrigins.includes('*')) {
      console.log('Allowing all origins (*)');
      return callback(null, true);
    }

    // Check for exact match or subdomain match
    const isAllowed = config.cors.allowedOrigins.some(allowedOrigin => {
      // Exact match
      if (allowedOrigin === origin) return true;
      
      // Wildcard subdomain match (e.g., *.vercel.app)
      if (allowedOrigin.includes('*')) {
        const regex = new RegExp(allowedOrigin.replace('*', '.*'));
        return regex.test(origin);
      }
      
      return false;
    });

    if (isAllowed) {
      console.log('✅ Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ Origin NOT allowed:', origin);
      console.log('📋 Allowed origins:', config.cors.allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-API-Key'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;