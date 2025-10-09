import express from 'express';
import crypto from 'crypto';
import Site from '../models/Site.js';
import Event from '../models/Event.js';
import Session from '../models/Session.js';
import { authenticate, verifySiteOwnership } from '../middleware/auth.js';
import { sitesRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Apply rate limiting to all sites routes
router.use(sitesRateLimiter);

/**
 * GET /api/sites
 * Get all sites owned by the user
 */
router.get('/', async (req, res) => {
  try {
    const sites = await Site.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Get event counts for each site
    const sitesWithStats = await Promise.all(
      sites.map(async (site) => {
        const [eventCount, lastEvent] = await Promise.all([
          Event.countDocuments({ siteId: site.siteId }),
          Event.findOne({ siteId: site.siteId }).sort({ timestamp: -1 }).select('timestamp')
        ]);

        return {
          ...site,
          totalEvents: eventCount,
          lastEventAt: lastEvent?.timestamp || null
        };
      })
    );

    res.json({
      success: true,
      data: {
        sites: sitesWithStats,
        total: sitesWithStats.length,
        maxSites: req.user.maxSites
      }
    });

  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sites'
    });
  }
});

/**
 * POST /api/sites
 * Add a new site
 */
router.post('/', async (req, res) => {
  try {
    const { name, domain, description } = req.body;

    // Validation
    if (!name || !domain) {
      return res.status(400).json({
        success: false,
        error: 'Site name and domain are required'
      });
    }

    // Check if user has reached site limit
    const siteCount = await Site.getUserSitesCount(req.user._id);
    if (siteCount >= req.user.maxSites) {
      return res.status(403).json({
        success: false,
        error: `You have reached the maximum limit of ${req.user.maxSites} sites`
      });
    }

    // Check if domain already exists for this user
    const existingSite = await Site.findOne({
      userId: req.user._id,
      domain: domain.toLowerCase(),
      isActive: true
    });

    if (existingSite) {
      return res.status(400).json({
        success: false,
        error: 'A site with this domain already exists'
      });
    }

    // Create new site with explicit siteId generation
    const cleanDomain = domain.toLowerCase().replace(/[^a-z0-9]/gi, '-');
    const randomStr = crypto.randomBytes(4).toString('hex');
    const siteId = `${cleanDomain}-${randomStr}`;

    const site = new Site({
      userId: req.user._id,
      siteId, // Explicitly set siteId
      name,
      domain: domain.toLowerCase(),
      description: description || ''
    });

    await site.save();

    res.status(201).json({
      success: true,
      message: 'Site added successfully',
      data: {
        site: site.toObject()
      }
    });

  } catch (error) {
    console.error('Add site error:', error);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${errors.join(', ')}`
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A site with this domain or site ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to add site'
    });
  }
});

/**
 * GET /api/sites/:siteId
 * Get specific site details
 */
router.get('/:siteId', verifySiteOwnership, async (req, res) => {
  try {
    const site = await Site.findOne({
      siteId: req.params.siteId,
      userId: req.user._id
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }

    // Get additional stats
    const [totalEvents, totalSessions, uniqueVisitors] = await Promise.all([
      Event.countDocuments({ siteId: site.siteId }),
      Session.countDocuments({ siteId: site.siteId }),
      Event.distinct('visitorId', { siteId: site.siteId }).then(v => v.length)
    ]);

    res.json({
      success: true,
      data: {
        site: {
          ...site.toObject(),
          stats: {
            totalEvents,
            totalSessions,
            uniqueVisitors
          }
        }
      }
    });

  } catch (error) {
    console.error('Get site error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch site'
    });
  }
});

/**
 * PUT /api/sites/:siteId
 * Update site details
 */
router.put('/:siteId', verifySiteOwnership, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const site = await Site.findOne({
      siteId: req.params.siteId,
      userId: req.user._id
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }

    // Update fields
    if (name) site.name = name;
    if (description !== undefined) site.description = description;
    if (isPublic !== undefined) site.isPublic = isPublic;

    await site.save();

    res.json({
      success: true,
      message: 'Site updated successfully',
      data: {
        site: site.toObject()
      }
    });

  } catch (error) {
    console.error('Update site error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${errors.join(', ')}`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update site'
    });
  }
});

/**
 * DELETE /api/sites/:siteId
 * Delete a site (soft delete)
 */
router.delete('/:siteId', verifySiteOwnership, async (req, res) => {
  try {
    const site = await Site.findOne({
      siteId: req.params.siteId,
      userId: req.user._id
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }

    // Soft delete
    site.isActive = false;
    await site.save();

    // Optional: Also delete all events and sessions for this site
    // await Event.deleteMany({ siteId: site.siteId });
    // await Session.deleteMany({ siteId: site.siteId });

    res.json({
      success: true,
      message: 'Site deleted successfully'
    });

  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete site'
    });
  }
});

/**
 * GET /api/sites/:siteId/snippet
 * Get tracking snippet code for a site
 */
router.get('/:siteId/snippet', verifySiteOwnership, async (req, res) => {
  try {
    const site = await Site.findOne({
      siteId: req.params.siteId,
      userId: req.user._id
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }

    const snippetCode = `<script async src="https://api.trackless.dev/tracker.js" data-site-id="${site.siteId}"></script>`;

    res.json({
      success: true,
      data: {
        siteId: site.siteId,
        snippet: snippetCode,
        instructions: 'Add this snippet to your website before the closing </body> tag'
      }
    });

  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get snippet'
    });
  }
});

export default router;