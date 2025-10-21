import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (user) {
      // Update existing user with Google ID if not already set
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    // Create new user
    user = await User.create({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0]?.value,
      isVerified: true, // Google emails are verified
      password: 'oauth-user-' + profile.id // Dummy password for OAuth users
    });

    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

export default passport;