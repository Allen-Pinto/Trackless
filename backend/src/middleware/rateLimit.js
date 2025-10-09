import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

/**
 * Rate limiter for tracking endpoint
 * Prevents abuse while allowing legitimate traffic
 */
export const trackingRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP + User-Agent for rate limiting
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';
    return `${ip}-${userAgent}`;
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

/**
 * Rate limiter for analytics endpoint
 * More restrictive to protect against data scraping
 */
export const analyticsRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Too many analytics requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for sites endpoint
 * Moderate rate limiting for site management operations
 */
export const sitesRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute for site operations
  message: {
    success: false,
    error: 'Too many site requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for development environment
    return process.env.NODE_ENV === 'development';
  }
});

/**
 * Rate limiter for auth endpoint
 * More lenient for authentication operations
 */
export const authRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // 20 auth requests per minute
  message: {
    success: false,
    error: 'Too many authentication requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for development environment
    return process.env.NODE_ENV === 'development';
  }
});