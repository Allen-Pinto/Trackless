import express from 'express';
import Event from '../models/Event.js';
import Session from '../models/Session.js';
import { validateTrackingData } from '../middleware/validator.js';
import { trackingRateLimiter } from '../middleware/rateLimit.js';
import { getClientIP, getGeoData } from '../utils/geoip.js';
import { generateSessionId, generateVisitorId, anonymizeIP } from '../utils/hash.js';
import { parseUserAgent, getReferrerType, sanitizeEventData } from '../utils/parser.js';

const router = express.Router();

/**
 * POST /api/track
 * Main tracking endpoint - receives events from client snippet
 */
router.post('/track', trackingRateLimiter, validateTrackingData, async (req, res) => {
  try {
    // Get client information
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const anonymizedIP = anonymizeIP(clientIP);

    // Generate privacy-friendly IDs
    const sessionId = generateSessionId(clientIP, userAgent);
    const visitorId = generateVisitorId(clientIP, userAgent);

    // Parse user agent
    const { device, browser, os } = parseUserAgent(userAgent);

    // Get geographic data
    const { country, region } = getGeoData(clientIP);

    // Sanitize incoming data
    const sanitizedData = sanitizeEventData(req.body);

    // Determine referrer type
    const referrerType = getReferrerType(
      sanitizedData.referrer,
      req.headers.host
    );

    // Create event object
    const eventData = {
      ...sanitizedData,
      sessionId,
      visitorId,
      device,
      browser,
      os,
      country,
      region,
      referrerType
    };

    // Save event to database
    const event = new Event(eventData);
    await event.save();

    // Update or create session
    await updateSession(eventData, sessionId, visitorId);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
});

/**
 * Update or create session
 */
async function updateSession(eventData, sessionId, visitorId) {
  try {
    let session = await Session.findOne({ sessionId });

    if (!session) {
      // Create new session
      session = new Session({
        sessionId,
        visitorId,
        siteId: eventData.siteId,
        entryPage: eventData.page,
        device: eventData.device,
        browser: eventData.browser,
        os: eventData.os,
        country: eventData.country,
        region: eventData.region,
        referrer: eventData.referrer,
        referrerType: eventData.referrerType
      });
    }

    // Update session statistics
    if (eventData.eventType === 'pageview') {
      session.pageviews += 1;
    }
    session.events += 1;
    session.exitPage = eventData.page;

    await session.updateActivity();

  } catch (error) {
    console.error('Session update error:', error);
  }
}

/**
 * GET /api/track/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

export default router;