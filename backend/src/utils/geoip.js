import geoip from 'geoip-lite';

/**
 * Get geographic information from IP address
 * @param {string} ip - IP address
 * @returns {object} - Geographic data { country, region }
 */
export const getGeoData = (ip) => {
  if (!ip || ip === 'unknown') {
    return {
      country: 'Unknown',
      region: 'Unknown'
    };
  }

  try {
    const geo = geoip.lookup(ip);
    
    if (geo) {
      return {
        country: geo.country || 'Unknown',
        region: geo.region || 'Unknown'
      };
    }
  } catch (error) {
    console.error('GeoIP lookup error:', error.message);
  }

  return {
    country: 'Unknown',
    region: 'Unknown'
  };
};

/**
 * Get client IP address from request (handles proxies)
 * @param {object} req - Express request object
 * @returns {string} - IP address
 */
export const getClientIP = (req) => {
  // Check various headers for real IP (considering proxies)
  const ip = 
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] || // Cloudflare
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown';

  // Remove IPv6 prefix if present
  return ip.replace(/^::ffff:/, '');
};

export default {
  getGeoData,
  getClientIP
};