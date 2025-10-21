import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password is only required for local authentication
      return this.authProvider === 'local';
    },
    minlength: 6,
    select: false // Don't return password by default
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  
  // OAuth fields
  googleId: {
    type: String,
    sparse: true, // Allows multiple nulls
    unique: true
  },
  githubId: {
    type: String,
    sparse: true,
    unique: true
  },
  
  // OAuth provider
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Account limits
  maxSites: {
    type: Number,
    default: 3 // Free tier limit
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ githubId: 1 });

// Hash password before saving (only for local auth users)
userSchema.pre('save', async function(next) {
  // Only hash if password is modified and user is local auth
  if (!this.isModified('password') || this.authProvider !== 'local') {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords (only for local auth users)
userSchema.methods.comparePassword = async function(candidatePassword) {
  // OAuth users don't have passwords
  if (this.authProvider !== 'local') {
    throw new Error('OAuth users do not have passwords. Please use OAuth login.');
  }
  
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to link OAuth account to existing user
userSchema.methods.linkOAuthAccount = async function(provider, providerId) {
  try {
    // Check if provider ID already exists for another user
    const existingUser = await this.constructor.findOne({
      [`${provider}Id`]: providerId,
      _id: { $ne: this._id }
    });
    
    if (existingUser) {
      throw new Error(`This ${provider} account is already linked to another user`);
    }
    
    // Link the account
    this[`${provider}Id`] = providerId;
    this.authProvider = provider;
    
    // For OAuth users, remove password requirement
    if (provider !== 'local' && !this.password) {
      this.password = `oauth-${provider}-${providerId}`;
    }
    
    await this.save();
    return this;
  } catch (error) {
    throw error;
  }
};

// Method to unlink OAuth account
userSchema.methods.unlinkOAuthAccount = async function(provider) {
  try {
    // Cannot unlink if it's the only auth method
    const authMethods = [];
    if (this.password && this.authProvider === 'local') authMethods.push('local');
    if (this.googleId) authMethods.push('google');
    if (this.githubId) authMethods.push('github');
    
    if (authMethods.length <= 1) {
      throw new Error('Cannot unlink the only authentication method');
    }
    
    // Unlink the account
    this[`${provider}Id`] = undefined;
    
    // If unlinking current auth provider, switch to another available method
    if (this.authProvider === provider) {
      const remainingMethods = authMethods.filter(method => method !== provider);
      this.authProvider = remainingMethods[0];
    }
    
    await this.save();
    return this;
  } catch (error) {
    throw error;
  }
};

// Method to get connected auth providers
userSchema.methods.getConnectedProviders = function() {
  const providers = {
    local: !!(this.password && this.authProvider === 'local'),
    google: !!this.googleId,
    github: !!this.githubId
  };
  
  return providers;
};

// Static method to find or create user from OAuth
userSchema.statics.findOrCreateFromOAuth = async function(provider, profile) {
  try {
    const providerId = `${provider}Id`;
    const providerEmail = profile.emails[0].value;
    
    // Try to find user by provider ID first
    let user = await this.findOne({ [providerId]: profile.id });
    
    if (user) {
      // Update user info if needed
      user.name = profile.displayName || user.name;
      user.avatar = profile.photos?.[0]?.value || user.avatar;
      user.lastLogin = new Date();
      await user.save();
      return user;
    }
    
    // Try to find user by email
    user = await this.findOne({ email: providerEmail });
    
    if (user) {
      // Link OAuth account to existing user
      return await user.linkOAuthAccount(provider, profile.id);
    }
    
    // Create new user
    user = new this({
      [providerId]: profile.id,
      name: profile.displayName,
      email: providerEmail,
      avatar: profile.photos?.[0]?.value,
      authProvider: provider,
      isVerified: true, // OAuth emails are verified
      password: `oauth-${provider}-${profile.id}` // Dummy password for OAuth users
    });
    
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

// Method to get public profile (without sensitive data)
userSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    name: this.name,
    avatar: this.avatar,
    authProvider: this.authProvider,
    isVerified: this.isVerified,
    maxSites: this.maxSites,
    isActive: this.isActive,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
    connectedProviders: this.getConnectedProviders()
  };
};

// Method to check if user can use password login
userSchema.methods.canUsePasswordLogin = function() {
  return this.authProvider === 'local' && this.password;
};

const User = mongoose.model('User', userSchema);

export default User;