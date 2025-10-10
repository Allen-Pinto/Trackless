import express from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// ✅ Multer Configuration (for Cloudinary uploads)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// ✅ Apply rate limiting to all auth routes
router.use(authRateLimiter);

/* ---------------------------------- SIGNUP ---------------------------------- */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account',
    });
  }
});

/* ---------------------------------- LOGIN ---------------------------------- */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

/* ----------------------------------- ME ------------------------------------ */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json({
      success: true,
      data: {
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

/* ----------------------------- UPDATE PROFILE ------------------------------ */
router.put('/update-profile', authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }

    req.user.name = name;
    await req.user.save();

    const updatedUser = await User.findById(req.user._id);
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

/* ----------------------- UPDATE PROFILE PICTURE ---------------------------- */
router.put(
  '/update-profile-picture',
  authenticate,
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided',
        });
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'trackless/avatars',
            public_id: `user_${req.user._id}_${Date.now()}`,
            transformation: [
              { width: 150, height: 150, crop: 'fill' },
              { quality: 'auto' },
              { format: 'webp' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      req.user.avatar = uploadResult.secure_url;
      await req.user.save();

      const updatedUser = await User.findById(req.user._id);
      return res.json({
        success: true,
        message: 'Profile picture updated successfully',
        data: {
          user: updatedUser.toPublicJSON(),
        },
      });
    } catch (error) {
      console.error('Update profile picture error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile picture',
      });
    }
  }
);

/* ---------------------- REMOVE PROFILE PICTURE ----------------------------- */
router.delete('/remove-profile-picture', authenticate, async (req, res) => {
  try {
    if (req.user.avatar) {
      try {
        const urlParts = req.user.avatar.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Cloudinary delete error:', err);
      }
    }

    req.user.avatar = null;
    await req.user.save();

    const updatedUser = await User.findById(req.user._id);
    return res.json({
      success: true,
      message: 'Profile picture removed successfully',
      data: {
        user: updatedUser.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove profile picture',
    });
  }
});

/* ----------------------------- CHANGE PASSWORD ----------------------------- */
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Both current and new passwords are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
    });
  }
});

export default router;
