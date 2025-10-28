const express = require('express');
const Role = require('../models/Role');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validation');

const router = express.Router();

// Helper function to get client info
const getClientInfo = (req) => {
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const device = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
  const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                 userAgent.includes('Firefox') ? 'Firefox' : 
                 userAgent.includes('Safari') ? 'Safari' : 'Unknown';
  
  return { userAgent, ipAddress, device, browser };
};

// @route   GET /api/roles
// @desc    Get all roles
// @access  Private (Admin)
router.get('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const roles = await Role.find({ isActive: true })
    .populate('userCount')
    .sort({ createdAt: -1 });

  // Get user counts for each role
  const rolesWithCounts = await Promise.all(
    roles.map(async (role) => {
      const userCount = await User.countDocuments({ role: role.name, isActive: true });
      return {
        ...role.toObject(),
        userCount
      };
    })
  );

  res.json({
    success: true,
    data: {
      roles: rolesWithCounts
    }
  });
}));

// @route   GET /api/roles/permissions
// @desc    Get all available permissions
// @access  Private (Admin)
router.get('/permissions', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const permissions = [
    { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete users', category: 'Users' },
    { id: 'role_management', name: 'Role Management', description: 'Manage roles and permissions', category: 'Users' },
    { id: 'system_settings', name: 'System Settings', description: 'Configure system-wide settings', category: 'System' },
    { id: 'analytics', name: 'Analytics', description: 'View analytics and reports', category: 'Reports' },
    { id: 'candidate_management', name: 'Candidate Management', description: 'Manage candidate profiles and applications', category: 'Hiring' },
    { id: 'interview_scheduling', name: 'Interview Scheduling', description: 'Schedule and manage interviews', category: 'Hiring' },
    { id: 'job_posting', name: 'Job Posting', description: 'Create and manage job postings', category: 'Hiring' },
    { id: 'reports', name: 'Reports', description: 'Generate and view reports', category: 'Reports' },
    { id: 'interview_conduct', name: 'Interview Conduct', description: 'Conduct interviews and evaluations', category: 'Hiring' },
    { id: 'candidate_evaluation', name: 'Candidate Evaluation', description: 'Evaluate and score candidates', category: 'Hiring' },
    { id: 'profile_management', name: 'Profile Management', description: 'Manage own profile and settings', category: 'Personal' },
    { id: 'application_tracking', name: 'Application Tracking', description: 'Track job applications', category: 'Personal' }
  ];

  res.json({
    success: true,
    data: {
      permissions
    }
  });
}));

// @route   POST /api/roles
// @desc    Create new role
// @access  Private (Admin)
router.post('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { name, description, permissions, color } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: 'Name and description are required'
    });
  }

  // Check if role already exists
  const existingRole = await Role.findOne({ name: name.toLowerCase() });
  if (existingRole) {
    return res.status(400).json({
      success: false,
      message: 'Role already exists'
    });
  }

  const role = new Role({
    name: name.toLowerCase(),
    description,
    permissions: permissions || [],
    color: color || 'blue',
    isSystem: false
  });

  await role.save();

  // Log activity
  const clientInfo = getClientInfo(req);
  await ActivityLog.logActivity({
    userId: req.user._id,
    action: 'Role Created',
    details: `Created new role: ${name}`,
    category: 'user_management',
    severity: 'medium',
    ...clientInfo
  });

  res.status(201).json({
    success: true,
    message: 'Role created successfully',
    data: {
      role
    }
  });
}));

// @route   PUT /api/roles/:id
// @desc    Update role
// @access  Private (Admin)
router.put('/:id', authenticate, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { name, description, permissions, color } = req.body;

  const role = await Role.findById(req.params.id);
  if (!role) {
    return res.status(404).json({
      success: false,
      message: 'Role not found'
    });
  }

  // Prevent updating system roles
  if (role.isSystem) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update system roles'
    });
  }

  // Update fields
  if (name) role.name = name.toLowerCase();
  if (description) role.description = description;
  if (permissions) role.permissions = permissions;
  if (color) role.color = color;

  await role.save();

  // Log activity
  const clientInfo = getClientInfo(req);
  await ActivityLog.logActivity({
    userId: req.user._id,
    action: 'Role Updated',
    details: `Updated role: ${role.name}`,
    category: 'user_management',
    severity: 'low',
    ...clientInfo
  });

  res.json({
    success: true,
    message: 'Role updated successfully',
    data: {
      role
    }
  });
}));

// @route   DELETE /api/roles/:id
// @desc    Delete role
// @access  Private (Admin)
router.delete('/:id', authenticate, requireAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return res.status(404).json({
      success: false,
      message: 'Role not found'
    });
  }

  // Prevent deleting system roles
  if (role.isSystem) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete system roles'
    });
  }

  // Check if any users have this role
  const userCount = await User.countDocuments({ role: role.name, isActive: true });
  if (userCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete role. ${userCount} users are assigned to this role.`
    });
  }

  // Soft delete
  role.isActive = false;
  await role.save();

  // Log activity
  const clientInfo = getClientInfo(req);
  await ActivityLog.logActivity({
    userId: req.user._id,
    action: 'Role Deleted',
    details: `Deleted role: ${role.name}`,
    category: 'user_management',
    severity: 'high',
    ...clientInfo
  });

  res.json({
    success: true,
    message: 'Role deleted successfully'
  });
}));

module.exports = router;