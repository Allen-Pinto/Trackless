import express from 'express';
import passport from '../config/passport.js';
import { generateToken } from '../utils/jwt.js';

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
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user.toPublicJSON()))}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
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

    // Check if provider ID already exists
    const existingUser = await User.findOne({
      [`${provider}Id`]: providerId
    });
    
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'This account is already linked to another user'
      });
    }

    // Link the account
    user[`${provider}Id`] = providerId;
    user.authProvider = provider;
    await user.save();

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
      error: 'Failed to link account'
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
    
    const providers = {
      google: !!user.googleId,
      github: !!user.githubId,
      local: user.authProvider === 'local'
    };

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

export default router;