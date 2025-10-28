const express = require('express');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireAdmin, requireHrOrAdmin } = require('../middleware/auth');
const { validateUserUpdate, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin/HR only)
// @access  Private (Admin/HR)
router.get('/', authenticate, requireHrOrAdmin, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { role, search, isActive } = req.query;
  
  // Build query
  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Get users with pagination
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        }
      }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      recentUsers,
      roleStats: stats,
      inactiveUsers: totalUsers - activeUsers
    }
  });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin/HR or own profile)
router.get('/:id', authenticate, validateMongoId('id'), asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  // Check if user can access this profile
  if (req.user.role === 'candidate' && req.user._id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own profile.'
    });
  }

  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      user: user.toSafeObject()
    }
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user by ID (Admin only or own profile)
// @access  Private
router.put('/:id', authenticate, validateMongoId('id'), validateUserUpdate, asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  // Check permissions
  if (req.user.role === 'candidate' && req.user._id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only update your own profile.'
    });
  }

  // HR can only update their own profile and candidate profiles
  if (req.user.role === 'hr' && req.user._id.toString() !== userId) {
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR can only update candidate profiles.'
      });
    }
  }

  const allowedFields = ['firstName', 'lastName', 'phone', 'skills', 'experience', 'location', 'department'];
  const updates = {};

  // Only include allowed fields
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Admin-only fields
  if (req.user.role === 'admin') {
    if (req.body.role) updates.role = req.body.role;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: user.toSafeObject()
    }
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete/Deactivate user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  // Prevent admin from deleting themselves
  if (req.user._id.toString() === userId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }

  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Soft delete by deactivating the user
  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

// @route   PUT /api/users/:id/activate
// @desc    Activate user (Admin only)
// @access  Private (Admin)
router.put('/:id/activate', authenticate, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User activated successfully',
    data: {
      user: user.toSafeObject()
    }
  });
}));

// @route   GET /api/users/role/:role
// @desc    Get users by role (Admin/HR only)
// @access  Private (Admin/HR)
router.get('/role/:role', authenticate, requireHrOrAdmin, asyncHandler(async (req, res) => {
  const { role } = req.params;
  
  if (!['admin', 'hr', 'candidate'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role specified'
    });
  }

  const users = await User.findByRole(role).select('-password');

  res.json({
    success: true,
    data: {
      users,
      count: users.length
    }
  });
}));

// @route   PUT /api/users/:id/role
// @desc    Change user role (Admin only)
// @access  Private (Admin)
router.put('/:id/role', authenticate, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  if (!role || !['admin', 'hr', 'candidate'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Valid role is required (admin, hr, or candidate)'
    });
  }

  const userId = req.params.id;
  
  // Prevent admin from changing their own role
  if (req.user._id.toString() === userId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot change your own role'
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: `User role changed to ${role} successfully`,
    data: {
      user: user.toSafeObject()
    }
  });
}));

module.exports = router;