import Event from '../models/Event.js';
import Session from '../models/Session.js';

/**
 * Analytics Service
 * Handles all analytics calculations and data aggregation
 */
class AnalyticsService {
  /**
   * Get overview statistics
   */
  async getOverview(siteId, startDate, endDate) {
    const [pageviews, uniqueVisitors, sessions, avgDuration] = await Promise.all([
      Event.getPageviews(siteId, startDate, endDate),
      Event.getUniqueVisitors(siteId, startDate, endDate),
      Session.countDocuments({
        siteId,
        startTime: { $gte: startDate, $lte: endDate }
      }),
      Session.getAverageDuration(siteId, startDate, endDate)
    ]);

    return {
      pageviews,
      uniqueVisitors,
      sessions,
      avgDuration,
      bounceRate: await this.calculateBounceRate(siteId, startDate, endDate)
    };
  }

  /**
   * Get pageviews over time (for time series chart)
   */
  async getPageviewsOverTime(siteId, startDate, endDate, interval = 'day') {
    const groupFormat = this.getDateGroupFormat(interval);

    const data = await Event.aggregate([
      {
        $match: {
          siteId,
          eventType: 'pageview',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$timestamp' }
          },
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $project: {
          date: '$_id',
          pageviews: '$count',
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    return data;
  }

  /**
   * Get top pages
   */
  async getTopPages(siteId, startDate, endDate, limit = 10) {
    return Event.getTopPages(siteId, startDate, endDate, limit);
  }

  /**
   * Get referrer statistics
   */
  async getReferrerStats(siteId, startDate, endDate, limit = 10) {
    const data = await Event.aggregate([
      {
        $match: {
          siteId,
          eventType: 'pageview',
          timestamp: { $gte: startDate, $lte: endDate },
          referrerType: 'external'
        }
      },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $project: {
          referrer: '$_id',
          visits: '$count',
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      { $sort: { visits: -1 } },
      { $limit: limit }
    ]);

    return data;
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(siteId, startDate, endDate) {
    const data = await Event.aggregate([
      {
        $match: {
          siteId,
          eventType: 'pageview',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $project: {
          device: '$_id',
          pageviews: '$count',
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      { $sort: { pageviews: -1 } }
    ]);

    return data;
  }

  /**
   * Get browser statistics
   */
  async getBrowserStats(siteId, startDate, endDate, limit = 10) {
    const data = await Event.aggregate([
      {
        $match: {
          siteId,
          eventType: 'pageview',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $project: {
          browser: '$_id',
          pageviews: '$count',
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      { $sort: { pageviews: -1 } },
      { $limit: limit }
    ]);

    return data;
  }

  /**
   * Get country statistics
   */
  async getCountryStats(siteId, startDate, endDate, limit = 10) {
    const data = await Event.aggregate([
      {
        $match: {
          siteId,
          eventType: 'pageview',
          timestamp: { $gte: startDate, $lte: endDate },
          country: { $ne: 'Unknown' }
        }
      },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $project: {
          country: '$_id',
          pageviews: '$count',
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0
        }
      },
      { $sort: { pageviews: -1 } },
      { $limit: limit }
    ]);

    return data;
  }

  /**
   * Get active sessions count
   */
  async getActiveSessions(siteId, minutes = 30) {
    return Session.getActiveSessions(siteId, minutes);
  }

  /**
   * Calculate bounce rate
   */
  async calculateBounceRate(siteId, startDate, endDate) {
    const singlePageSessions = await Session.countDocuments({
      siteId,
      startTime: { $gte: startDate, $lte: endDate },
      pageviews: 1
    });

    const totalSessions = await Session.countDocuments({
      siteId,
      startTime: { $gte: startDate, $lte: endDate }
    });

    if (totalSessions === 0) return 0;

    return Math.round((singlePageSessions / totalSessions) * 100);
  }

  /**
   * Get date group format based on interval
   */
  getDateGroupFormat(interval) {
    switch (interval) {
      case 'hour':
        return '%Y-%m-%d %H:00';
      case 'day':
        return '%Y-%m-%d';
      case 'week':
        return '%Y-W%V';
      case 'month':
        return '%Y-%m';
      default:
        return '%Y-%m-%d';
    }
  }

  /**
   * Get complete analytics dashboard data
   */
  async getDashboardData(siteId, startDate, endDate) {
    const [
      overview,
      pageviewsOverTime,
      topPages,
      referrers,
      devices,
      browsers,
      countries,
      activeSessions
    ] = await Promise.all([
      this.getOverview(siteId, startDate, endDate),
      this.getPageviewsOverTime(siteId, startDate, endDate),
      this.getTopPages(siteId, startDate, endDate),
      this.getReferrerStats(siteId, startDate, endDate),
      this.getDeviceStats(siteId, startDate, endDate),
      this.getBrowserStats(siteId, startDate, endDate),
      this.getCountryStats(siteId, startDate, endDate),
      this.getActiveSessions(siteId)
    ]);

    return {
      overview: {
        ...overview,
        activeSessions
      },
      charts: {
        pageviewsOverTime,
        topPages,
        referrers,
        devices,
        browsers,
        countries
      }
    };
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService;