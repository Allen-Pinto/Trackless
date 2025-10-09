import crypto from 'crypto';
import config from '../config/env.js';

/**
 * Generate a SHA-256 hash with salt
 * @param {string} value - Value to hash
 * @param {string} salt - Optional salt (uses API secret if not provided)
 * @returns {string} - Hashed value
 */
export const hashValue = (value, salt = null) => {
  const saltValue = salt || config.security.apiSecret;
  return crypto
    .createHash('sha256')
    .update(value + saltValue)
    .digest('hex');
};

/**
 * Generate a session ID from IP and User-Agent
 * @param {string} ip - IP address
 * @param {string} userAgent - User agent string
 * @returns {string} - Hashed session ID
 */
export const generateSessionId = (ip, userAgent) => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const rawValue = `${ip}-${userAgent}-${date}`;
  return hashValue(rawValue);
};

/**
 * Generate a visitor ID from IP and User-Agent (persistent across days)
 * @param {string} ip - IP address
 * @param {string} userAgent - User agent string
 * @returns {string} - Hashed visitor ID
 */
export const generateVisitorId = (ip, userAgent) => {
  const rawValue = `${ip}-${userAgent}`;
  return hashValue(rawValue);
};

/**
 * Generate a random unique ID
 * @returns {string} - Random ID
 */
export const generateUniqueId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Anonymize IP address (keep only first 3 octets for IPv4)
 * @param {string} ip - IP address
 * @returns {string} - Anonymized IP
 */
export const anonymizeIP = (ip) => {
  if (!ip) return 'unknown';
  
  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  
  // IPv6 - keep first 4 segments
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + '::';
  }
  
  return 'unknown';
};