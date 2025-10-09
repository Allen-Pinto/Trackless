import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    config.security.jwtSecret,
    { expiresIn: config.security.jwtExpiresIn }
  );
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} - Refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.security.jwtSecret,
    { expiresIn: '7d' }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.security.jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken
};