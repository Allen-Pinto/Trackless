import express from 'express';
import { validateAnalyticsQuery } from '../middleware/validator.js';
import { analyticsRateLimiter } from '../middleware/rateLimit.js';
import { authenticate, verifySiteOwnership } from '../middleware/auth.js';
import analyticsService from '../services/analytics.service.js';

const router = express.Router();

// All analytics routes require authentication and site ownership verification
router.use(authenticate);

/**
 * Helper function to parse date range
 */
function getDateRange(startDate, endDate) {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return { start, end };
}

/**
 * GET /api/analytics/dashboard
 * Get complete dashboard data
 */
router.get('/dashboard', analyticsRateLimiter, validateAnalyticsQuery, verifySiteOwnership, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const data = await analyticsService.getDashboardData(req.siteId, start, end);

    res.json({
      success: true,
      data,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

/**
 * GET /api/analytics/overview
 * Get overview statistics
 */
router.get('/overview', analyticsRateLimiter, validateAnalyticsQuery, verifySiteOwnership, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const overview = await analyticsService.getOverview(req.siteId, start, end);
    const activeSessions = await analyticsService.getActiveSessions(req.siteId);

    res.json({
      success: true,
      data: {
        ...overview,
        activeSessions
      }
    });

  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview'
    });
  }
});

/**
 * GET /api/analytics/pageviews
 * Get pageviews over time
 */
router.get('/pageviews', analyticsRateLimiter, validateAnalyticsQuery, verifySiteOwnership, async (req, res) => {
  try {
    const { startDate, endDate, interval = 'day' } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const data = await analyticsService.getPageviewsOverTime(req.siteId, start, end, interval);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Pageviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pageviews'
    });
  }
});

/**
 * GET /api/analytics/pages
 * Get top pages
 */
router.get('/pages', analyticsRateLimiter, validateAnalyticsQuery, verifySiteOwnership, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const data = await analyticsService.getTopPages(req.siteId, start, end, parseInt(limit));

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Top pages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top pages'
    });
  }
});

/**
 * GET /api/analytics/referrers
 * Get referrer statistics
 */
router.get('/referrers', analyticsRateLimiter, validateAnalyticsQuery, verifySiteOwnership, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const data = await analyticsService.getReferrerStats(req.siteId, start, end, parseInt(limit));

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Referrers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch referrers'
    });
  }
});

/**
 * GET /api/analytics/devices
 * Get device statistics
 */
router.get('/devices', analyticsRateLimiter, validateAnalyticsQuery, verifySiteOwnership, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const data = await analyticsService.getDeviceStats(req.siteId, start, end);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Devices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device stats'
    });
  }
});

/**
 * GET /api/analytics/browsers
 * Get browser statistics
 */
router.get('/browsers', analyticsRateLimiter, validateAnalyticsQuery, verifySiteOwnership, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const data = await analyticsService.getBrowserStats(req.siteId, start, end, parseInt(limit));

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Browsers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch browser stats'
    });
  }
});

/**
 * GET /api/analytics/countries
 * Get country statistics
 */
router.get('/countries', analyticsRateLimiter, validateAnalyticsQuery, verifySiteOwnership, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const data = await analyticsService.getCountryStats(req.siteId, start, end, parseInt(limit));

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Countries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch country stats'
    });
  }
});

export default router;