import express from 'express';
import passport from '../config/passport.js';
import { generateToken } from '../utils/jwt.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route   GET /api/oauth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * @route   GET /api/oauth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Redirect to frontend success page with token and user data
      const userData = encodeURIComponent(JSON.stringify(req.user.toPublicJSON()));
      res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

/**
 * @route   GET /api/oauth/github
 * @desc    Initiate GitHub OAuth flow
 * @access  Public
 */
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));

/**
 * @route   GET /api/oauth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Redirect to frontend success page with token and user data
      const userData = encodeURIComponent(JSON.stringify(req.user.toPublicJSON()));
      res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

/**
 * @route   POST /api/oauth/link-account
 * @desc    Link OAuth account to existing local account
 * @access  Private
 */
router.post('/link-account', async (req, res) => {
  try {
    const { provider, providerId, email } = req.body;
    
    if (!provider || !providerId || !email) {
      return res.status(400).json({
        success: false,
        error: 'Provider, providerId, and email are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Use the instance method from User model
    await user.linkOAuthAccount(provider, providerId);

    res.json({
      success: true,
      message: 'Account linked successfully',
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Link account error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to link account'
    });
  }
});

/**
 * @route   POST /api/oauth/unlink-account
 * @desc    Unlink OAuth account from user
 * @access  Private
 */
router.post('/unlink-account', async (req, res) => {
  try {
    const { provider } = req.body;
    
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Provider is required'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Use the instance method from User model
    await user.unlinkOAuthAccount(provider);

    res.json({
      success: true,
      message: 'Account unlinked successfully',
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Unlink account error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to unlink account'
    });
  }
});

/**
 * @route   GET /api/oauth/providers
 * @desc    Get user's connected OAuth providers
 * @access  Private
 */
router.get('/providers', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const providers = user.getConnectedProviders();

    res.json({
      success: true,
      data: { providers }
    });

  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get providers'
    });
  }
});

/**
 * @route   GET /api/oauth/debug
 * @desc    Debug OAuth configuration
 * @access  Public
 */
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: 'OAuth router is working!',
    environment: {
      googleClientId: !!process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
      githubClientId: !!process.env.GITHUB_CLIENT_ID,
      githubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
      githubRedirectUri: process.env.GITHUB_REDIRECT_URI,
      frontendUrl: process.env.FRONTEND_URL
    },
    routes: [
      'GET /api/oauth/google',
      'GET /api/oauth/google/callback',
      'GET /api/oauth/github',
      'GET /api/oauth/github/callback',
      'POST /api/oauth/link-account',
      'POST /api/oauth/unlink-account',
      'GET /api/oauth/providers',
      'GET /api/oauth/debug'
    ]
  });
});

export default router;