/**
 * Validate tracking event data
 */
export const validateTrackingData = (req, res, next) => {
  const { eventType, page, siteId } = req.body;

  // Required fields
  if (!eventType || !page || !siteId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: eventType, page, and siteId are required'
    });
  }

  // Validate eventType
  const validEventTypes = ['pageview', 'click', 'custom', 'session_start', 'session_end'];
  if (!validEventTypes.includes(eventType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}`
    });
  }

  // Validate siteId format (basic alphanumeric check)
  if (!/^[a-zA-Z0-9-_]{3,50}$/.test(siteId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid siteId format. Must be 3-50 alphanumeric characters'
    });
  }

  // Validate page path
  if (typeof page !== 'string' || page.length > 500) {
    return res.status(400).json({
      success: false,
      error: 'Invalid page path. Must be a string under 500 characters'
    });
  }

  next();
};

/**
 * Validate analytics query parameters
 */
export const validateAnalyticsQuery = (req, res, next) => {
  const { siteId, startDate, endDate } = req.query;

  // Required siteId
  if (!siteId) {
    return res.status(400).json({
      success: false,
      error: 'siteId query parameter is required'
    });
  }

  // Validate date format if provided
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid startDate format. Use ISO 8601 format'
    });
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid endDate format. Use ISO 8601 format'
    });
  }

  next();
};