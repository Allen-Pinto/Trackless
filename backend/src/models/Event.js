import mongoose from 'mongoose';
import config from '../config/env.js';

const eventSchema = new mongoose.Schema({
  // Core event data
  eventType: {
    type: String,
    required: true,
    enum: ['pageview', 'click', 'custom', 'session_start', 'session_end'],
    index: true
  },
  
  // Page information
  page: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: ''
  },
  
  // Referrer information
  referrerType: {
    type: String,
    enum: ['external', 'internal', 'none', 'direct'],
    default: 'none'
  },
  referrer: {
    type: String,
    default: ''
  },
  
  // Session and visitor (hashed for privacy)
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    index: true
  },
  
  // Device information
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  
  // Screen information
  screenWidth: {
    type: Number,
    default: 0
  },
  screenHeight: {
    type: Number,
    default: 0
  },
  
  // Localization
  language: {
    type: String,
    default: 'en-US'
  },
  country: {
    type: String,
    default: 'Unknown',
    index: true
  },
  region: {
    type: String,
    default: 'Unknown'
  },
  
  // Site identification
  siteId: {
    type: String,
    required: true,
    index: true
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    expires: config.dataRetention.days * 24 * 60 * 60 // TTL index for auto-deletion
  },
  
  // Custom event data (optional)
  customData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
  collection: 'events'
});

// Compound indexes for common queries
eventSchema.index({ siteId: 1, timestamp: -1 });
eventSchema.index({ siteId: 1, eventType: 1, timestamp: -1 });
eventSchema.index({ siteId: 1, page: 1, timestamp: -1 });
eventSchema.index({ siteId: 1, visitorId: 1, timestamp: -1 });

// Static methods for analytics
eventSchema.statics.getPageviews = async function(siteId, startDate, endDate) {
  return this.countDocuments({
    siteId,
    eventType: 'pageview',
    timestamp: { $gte: startDate, $lte: endDate }
  });
};

eventSchema.statics.getUniqueVisitors = async function(siteId, startDate, endDate) {
  return this.distinct('visitorId', {
    siteId,
    timestamp: { $gte: startDate, $lte: endDate }
  }).then(visitors => visitors.length);
};

eventSchema.statics.getTopPages = async function(siteId, startDate, endDate, limit = 10) {
  return this.aggregate([
    {
      $match: {
        siteId,
        eventType: 'pageview',
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$page',
        views: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$visitorId' }
      }
    },
    {
      $project: {
        page: '$_id',
        views: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' },
        _id: 0
      }
    },
    { $sort: { views: -1 } },
    { $limit: limit }
  ]);
};

const Event = mongoose.model('Event', eventSchema);

export default Event;