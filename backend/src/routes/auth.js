import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: user.toPublicJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toPublicJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    // Refresh the user data from the database to ensure we have the latest avatar
    const freshUser = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        user: freshUser.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});

/**
 * PUT /api/auth/update-profile
 * Update user profile
 */
router.put('/update-profile', authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    req.user.name = name;
    await req.user.save();

    // Refresh user data from database
    const updatedUser = await User.findById(req.user._id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * PUT /api/auth/update-profile-picture
 * Update user profile picture (Cloudinary)
 */
router.put('/update-profile-picture', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    console.log('Uploading image to Cloudinary...', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'trackless/avatars',
          public_id: `user_${req.user._id}_${Date.now()}`,
          transformation: [
            { width: 150, height: 150, crop: 'fill' },
            { quality: 'auto' },
            { format: 'webp' } // Modern format for better compression
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', result);
            resolve(result);
          }
        }
      );

      // Convert buffer to stream and upload
      uploadStream.end(req.file.buffer);
    });

    // Update user in database
    req.user.avatar = uploadResult.secure_url;
    await req.user.save();

    console.log('User avatar updated:', req.user.avatar);

    // Refresh user data from database
    const updatedUser = await User.findById(req.user._id);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        user: updatedUser.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Update profile picture error:', error);
    
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({
        success: false,
        error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update profile picture: ' + error.message
    });
  }
});

/**
 * DELETE /api/auth/remove-profile-picture
 * Remove user profile picture
 */
router.delete('/remove-profile-picture', authenticate, async (req, res) => {
  try {
    // If there's an existing avatar, delete it from Cloudinary
    if (req.user.avatar) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = req.user.avatar.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        
        await cloudinary.uploader.destroy(publicId);
        console.log('Deleted old avatar from Cloudinary:', publicId);
      } catch (deleteError) {
        console.error('Error deleting from Cloudinary:', deleteError);
        // Continue anyway - we still want to remove the reference
      }
    }
    
    req.user.avatar = null;
    await req.user.save();

    // Refresh user data from database
    const updatedUser = await User.findById(req.user._id);

    res.json({
      success: true,
      message: 'Profile picture removed successfully',
      data: {
        user: updatedUser.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove profile picture'
    });
  }
});

/**
 * PUT /api/auth/change-password
 * Change user password
 */
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

export default router;