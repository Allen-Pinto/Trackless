import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

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
    // Use the static method from User model
    const user = await User.findOrCreateFromOAuth('google', profile);
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_REDIRECT_URI,
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('GitHub Profile:', profile);
    
    // GitHub profile handling
    let email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    
    // If no email from GitHub, create a placeholder
    if (!email) {
      email = `${profile.username}@users.noreply.github.com`;
    }

    // Create a normalized profile object similar to Google's
    const normalizedProfile = {
      id: profile.id,
      displayName: profile.displayName || profile.username,
      emails: [{ value: email }],
      photos: profile.photos ? [{ value: profile.photos[0].value }] : [],
      username: profile.username
    };

    // Use the static method from User model
    const user = await User.findOrCreateFromOAuth('github', normalizedProfile);
    return done(null, user);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
}));

export default passport;