import UAParser from 'ua-parser-js';

/**
 * Parse user agent string to extract device, browser, and OS info
 * @param {string} userAgent - User agent string
 * @returns {object} - Parsed data { device, browser, os }
 */
export const parseUserAgent = (userAgent) => {
  if (!userAgent) {
    return {
      device: 'unknown',
      browser: 'Unknown',
      os: 'Unknown'
    };
  }

  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Determine device type
    let device = 'desktop';
    if (result.device.type === 'mobile') {
      device = 'mobile';
    } else if (result.device.type === 'tablet') {
      device = 'tablet';
    }

    // Get browser name and version
    const browser = result.browser.name 
      ? `${result.browser.name} ${result.browser.version || ''}`.trim()
      : 'Unknown';

    // Get OS name and version
    const os = result.os.name
      ? `${result.os.name} ${result.os.version || ''}`.trim()
      : 'Unknown';

    return {
      device,
      browser,
      os
    };
  } catch (error) {
    console.error('User agent parsing error:', error.message);
    return {
      device: 'unknown',
      browser: 'Unknown',
      os: 'Unknown'
    };
  }
};

/**
 * Determine referrer type (external, internal, direct, none)
 * @param {string} referrer - Referrer URL
 * @param {string} currentHost - Current site host
 * @returns {string} - Referrer type
 */
export const getReferrerType = (referrer, currentHost) => {
  if (!referrer || referrer === '') {
    return 'direct';
  }

  try {
    const referrerUrl = new URL(referrer);
    const referrerHost = referrerUrl.hostname;

    if (referrerHost === currentHost || referrerHost.endsWith(`.${currentHost}`)) {
      return 'internal';
    }

    return 'external';
  } catch (error) {
    return 'none';
  }
};

/**
 * Extract clean page path from URL
 * @param {string} url - Full URL or path
 * @returns {string} - Clean path
 */
export const cleanPagePath = (url) => {
  if (!url) return '/';

  try {
    // If it's a full URL, extract pathname
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      return urlObj.pathname;
    }

    // Already a path
    return url.startsWith('/') ? url : `/${url}`;
  } catch (error) {
    return '/';
  }
};

/**
 * Validate and sanitize event data
 * @param {object} data - Raw event data
 * @returns {object} - Sanitized data
 */
export const sanitizeEventData = (data) => {
  return {
    eventType: data.eventType || 'pageview',
    page: cleanPagePath(data.page),
    title: (data.title || '').substring(0, 200), // Limit title length
    referrer: (data.referrer || '').substring(0, 500),
    language: (data.language || 'en-US').substring(0, 10),
    screenWidth: parseInt(data.screenWidth) || 0,
    screenHeight: parseInt(data.screenHeight) || 0,
    siteId: (data.siteId || '').substring(0, 50),
    customData: data.customData || null
  };
};

export default {
  parseUserAgent,
  getReferrerType,
  cleanPagePath,
  sanitizeEventData
};