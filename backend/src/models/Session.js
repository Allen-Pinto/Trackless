import mongoose from 'mongoose';
import config from '../config/env.js';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    index: true
  },
  siteId: {
    type: String,
    required: true,
    index: true
  },
  
  // Session metadata
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  
  // Session statistics
  pageviews: {
    type: Number,
    default: 0
  },
  events: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  
  // Entry and exit pages
  entryPage: {
    type: String,
    default: ''
  },
  exitPage: {
    type: String,
    default: ''
  },
  
  // Device info (captured at session start)
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: String,
  os: String,
  
  // Location info
  country: String,
  region: String,
  
  // Referrer
  referrer: String,
  referrerType: {
    type: String,
    enum: ['external', 'internal', 'none', 'direct'],
    default: 'none'
  },
  
  // Active status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // TTL for auto-deletion
  timestamp: {
    type: Date,
    default: Date.now,
    expires: config.dataRetention.days * 24 * 60 * 60
  }
}, {
  timestamps: true,
  collection: 'sessions'
});

// Compound indexes
sessionSchema.index({ siteId: 1, startTime: -1 });
sessionSchema.index({ siteId: 1, visitorId: 1, startTime: -1 });

// Methods
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  this.duration = Math.floor((this.lastActivity - this.startTime) / 1000);
  return this.save();
};

sessionSchema.methods.endSession = function(exitPage) {
  this.endTime = new Date();
  this.exitPage = exitPage;
  this.isActive = false;
  this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  return this.save();
};

// Static methods
sessionSchema.statics.getActiveSessions = async function(siteId, minutes = 30) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  return this.countDocuments({
    siteId,
    isActive: true,
    lastActivity: { $gte: cutoffTime }
  });
};

sessionSchema.statics.getAverageDuration = async function(siteId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        siteId,
        startTime: { $gte: startDate, $lte: endDate },
        duration: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);
  
  return result.length > 0 ? Math.round(result[0].avgDuration) : 0;
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;