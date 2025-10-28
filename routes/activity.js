const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/activity
// @desc    Get all activity logs
// @access  Private (Admin)
router.get('/', authenticate, requireAdmin, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  const { category, severity, userId, search, startDate, endDate } = req.query;
  
  // Build query
  const query = {};
  
  if (category) query.category = category;
  if (severity) query.severity = severity;
  if (userId) query.userId = userId;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  if (search) {
    query.$or = [
      { action: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } }
    ];
  }

  const activities = await ActivityLog.find(query)
    .populate('userId', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ActivityLog.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      activities,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

// @route   GET /api/activity/stats
// @desc    Get activity statistics
// @access  Private (Admin)
router.get('/stats', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { timeframe = '7d' } = req.query;
  
  let startDate;
  switch (timeframe) {
    case '1d':
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  const stats = await ActivityLog.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        authentication: { $sum: { $cond: [{ $eq: ['$category', 'authentication'] }, 1, 0] } },
        user_management: { $sum: { $cond: [{ $eq: ['$category', 'user_management'] }, 1, 0] } },
        system: { $sum: { $cond: [{ $eq: ['$category', 'system'] }, 1, 0] } },
        data: { $sum: { $cond: [{ $eq: ['$category', 'data'] }, 1, 0] } },
        security: { $sum: { $cond: [{ $eq: ['$category', 'security'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } }
      }
    }
  ]);

  // Get active sessions count
  const activeSessions = await User.aggregate([
    { $unwind: '$sessions' },
    { $match: { 'sessions.isActive': true } },
    { $count: 'total' }
  ]);

  // Get recent security events
  const securityEvents = await ActivityLog.countDocuments({
    category: 'security',
    createdAt: { $gte: startDate }
  });

  res.json({
    success: true,
    data: {
      ...stats[0],
      activeSessions: activeSessions[0]?.total || 0,
      securityEvents,
      timeframe
    }
  });
}));

// @route   GET /api/activity/sessions
// @desc    Get active user sessions
// @access  Private (Admin)
router.get('/sessions', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const sessions = await User.aggregate([
    { $unwind: '$sessions' },
    { $match: { 'sessions.isActive': true } },
    {
      $project: {
        userId: '$_id',
        userName: { $concat: ['$firstName', ' ', '$lastName'] },
        session: '$sessions'
      }
    },
    { $sort: { 'session.lastActivity': -1 } }
  ]);

  res.json({
    success: true,
    data: {
      sessions
    }
  });
}));

// @route   POST /api/activity/log
// @desc    Create activity log entry
// @access  Private
router.post('/log', authenticate, asyncHandler(async (req, res) => {
  const { action, details, category, severity, metadata } = req.body;

  if (!action || !details || !category) {
    return res.status(400).json({
      success: false,
      message: 'Action, details, and category are required'
    });
  }

  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;

  const activity = await ActivityLog.logActivity({
    userId: req.user._id,
    action,
    details,
    category,
    severity: severity || 'low',
    ipAddress,
    userAgent,
    sessionId: req.sessionID,
    metadata: metadata || {}
  });

  res.status(201).json({
    success: true,
    message: 'Activity logged successfully',
    data: {
      activity
    }
  });
}));

// @route   DELETE /api/activity/cleanup
// @desc    Clean up old activity logs
// @access  Private (Admin)
router.delete('/cleanup', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { days = 90 } = req.query;
  
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await ActivityLog.deleteMany({
    createdAt: { $lt: cutoffDate },
    severity: { $in: ['low', 'medium'] } // Keep high and critical logs longer
  });

  res.json({
    success: true,
    message: `Cleaned up ${result.deletedCount} old activity logs`,
    data: {
      deletedCount: result.deletedCount,
      cutoffDate
    }
  });
}));

module.exports = router;