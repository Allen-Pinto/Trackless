import mongoose from 'mongoose';
import crypto from 'crypto';

const siteSchema = new mongoose.Schema({
  // Owner information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Site identification
  siteId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: function() {
      // Generate default siteId if not provided
      const cleanDomain = this.domain ? this.domain.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'site';
      const randomStr = crypto.randomBytes(4).toString('hex');
      return `${cleanDomain}-${randomStr}`;
    }
  },
  
  // Site details
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  domain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 200
  },
  
  // Optional fields
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  
  // Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false // Whether analytics are publicly viewable
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastEventAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'sites'
});

// Compound indexes for faster queries
siteSchema.index({ userId: 1, createdAt: -1 });
siteSchema.index({ userId: 1, siteId: 1 });

// Generate unique siteId before saving (backup method)
siteSchema.pre('save', function(next) {
  if (!this.siteId || this.siteId.startsWith('site-')) {
    const cleanDomain = this.domain ? this.domain.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'site';
    const randomStr = crypto.randomBytes(4).toString('hex');
    this.siteId = `${cleanDomain}-${randomStr}`;
  }
  next();
});

// Static method to check ownership
siteSchema.statics.isOwner = async function(siteId, userId) {
  const site = await this.findOne({ siteId, userId });
  return !!site;
};

// Static method to get user's sites count
siteSchema.statics.getUserSitesCount = async function(userId) {
  return this.countDocuments({ userId, isActive: true });
};

// Method to update last event timestamp
siteSchema.methods.updateLastEvent = function() {
  this.lastEventAt = new Date();
  return this.save();
};

const Site = mongoose.model('Site', siteSchema);

export default Site;