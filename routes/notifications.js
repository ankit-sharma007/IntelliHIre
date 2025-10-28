const express = require('express');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validatePagination, validateMongoId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', authenticate, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  const { isRead, type, category, priority } = req.query;
  
  // Build query
  const query = { userId: req.user._id };
  
  if (isRead !== undefined) query.isRead = isRead === 'true';
  if (type) query.type = type;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ 
    userId: req.user._id, 
    isRead: false 
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        unreadCount
      }
    }
  });
}));

// @route   GET /api/notifications/unread
// @desc    Get unread notifications count
// @access  Private
router.get('/unread', authenticate, asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({ 
    userId: req.user._id, 
    isRead: false 
  });

  const recentNotifications = await Notification.find({ 
    userId: req.user._id, 
    isRead: false 
  })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      unreadCount,
      recentNotifications
    }
  });
}));

// @route   POST /api/notifications
// @desc    Create notification (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { 
    userId, title, message, type, category, priority, 
    actionUrl, actionText, expiresAt 
  } = req.body;

  if (!userId || !title || !message || !category) {
    return res.status(400).json({
      success: false,
      message: 'UserId, title, message, and category are required'
    });
  }

  const notification = await Notification.createNotification({
    userId,
    title,
    message,
    type: type || 'info',
    category,
    priority: priority || 'medium',
    actionUrl,
    actionText,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined
  });

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: {
      notification
    }
  });
}));

// @route   POST /api/notifications/broadcast
// @desc    Broadcast notification to multiple users
// @access  Private (Admin)
router.post('/broadcast', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { 
    userIds, roles, title, message, type, category, priority, 
    actionUrl, actionText, expiresAt 
  } = req.body;

  if (!title || !message || !category) {
    return res.status(400).json({
      success: false,
      message: 'Title, message, and category are required'
    });
  }

  let targetUserIds = [];

  // If specific user IDs provided
  if (userIds && Array.isArray(userIds)) {
    targetUserIds = userIds;
  }

  // If roles provided, get users with those roles
  if (roles && Array.isArray(roles)) {
    const User = require('../models/User');
    const users = await User.find({ 
      role: { $in: roles }, 
      isActive: true 
    }).select('_id');
    
    const roleUserIds = users.map(user => user._id);
    targetUserIds = [...new Set([...targetUserIds, ...roleUserIds])];
  }

  if (targetUserIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No target users specified'
    });
  }

  // Create notifications for all target users
  const notifications = await Promise.all(
    targetUserIds.map(userId => 
      Notification.createNotification({
        userId,
        title,
        message,
        type: type || 'info',
        category,
        priority: priority || 'medium',
        actionUrl,
        actionText,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      })
    )
  );

  res.status(201).json({
    success: true,
    message: `Broadcast sent to ${notifications.length} users`,
    data: {
      notificationCount: notifications.length
    }
  });
}));

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticate, validateMongoId('id'), asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found or already read'
    });
  }

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: {
      notification
    }
  });
}));

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', authenticate, asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({
    success: true,
    message: `Marked ${result.modifiedCount} notifications as read`,
    data: {
      markedCount: result.modifiedCount
    }
  });
}));

// @route   PUT /api/notifications/bulk-read
// @desc    Mark multiple notifications as read
// @access  Private
router.put('/bulk-read', authenticate, asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    return res.status(400).json({
      success: false,
      message: 'Notification IDs array is required'
    });
  }

  const result = await Notification.markAsRead(req.user._id, notificationIds);

  res.json({
    success: true,
    message: `Marked ${result.modifiedCount} notifications as read`,
    data: {
      markedCount: result.modifiedCount
    }
  });
}));

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', authenticate, validateMongoId('id'), asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

// @route   DELETE /api/notifications/cleanup
// @desc    Clean up old read notifications
// @access  Private
router.delete('/cleanup', authenticate, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await Notification.deleteMany({
    userId: req.user._id,
    isRead: true,
    readAt: { $lt: cutoffDate }
  });

  res.json({
    success: true,
    message: `Cleaned up ${result.deletedCount} old notifications`,
    data: {
      deletedCount: result.deletedCount
    }
  });
}));

// @route   GET /api/notifications/admin/stats
// @desc    Get notification statistics (Admin only)
// @access  Private (Admin)
router.get('/admin/stats', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const stats = await Notification.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
        info: { $sum: { $cond: [{ $eq: ['$type', 'info'] }, 1, 0] } },
        success: { $sum: { $cond: [{ $eq: ['$type', 'success'] }, 1, 0] } },
        warning: { $sum: { $cond: [{ $eq: ['$type', 'warning'] }, 1, 0] } },
        error: { $sum: { $cond: [{ $eq: ['$type', 'error'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
      }
    }
  ]);

  const recentNotifications = await Notification.find()
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      ...stats[0],
      recentNotifications
    }
  });
}));

module.exports = router;