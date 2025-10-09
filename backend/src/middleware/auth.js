import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import Site from '../models/Site.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please login.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.security.jwtSecret);

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user account deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Verify that user owns the site
 */
export const verifySiteOwnership = async (req, res, next) => {
  try {
    const siteId = req.params.siteId || req.query.siteId || req.body.siteId;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        error: 'siteId is required'
      });
    }

    // Check if user owns this site
    const isOwner = await Site.isOwner(siteId, req.user._id);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this site'
      });
    }

    // Attach siteId to request for convenience
    req.siteId = siteId;
    next();

  } catch (error) {
    console.error('Site ownership verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify site ownership'
    });
  }
};

/**
 * Optional authentication - allows both authenticated and unauthenticated requests
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.security.jwtSecret);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};