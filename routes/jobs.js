const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireHrOrAdmin, optionalAuth } = require('../middleware/auth');
const { 
  validateJobCreation, 
  validateJobUpdate, 
  validateMongoId, 
  validatePagination,
  validateJobSearch 
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs (public for candidates, all for HR/Admin)
// @access  Public/Private
router.get('/', optionalAuth, validatePagination, validateJobSearch, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { search, department, location, employmentType, experienceLevel, status } = req.query;
  
  // Build query based on user role
  let query = {};
  
  // Non-authenticated users and candidates can only see active jobs
  if (!req.user || req.user.role === 'candidate') {
    query.status = 'active';
    query.$or = [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gte: new Date() } }
    ];
  } else {
    // HR and Admin can see jobs based on status filter
    if (status) {
      query.status = status;
    }
    
    // HR can only see their own jobs
    if (req.user.role === 'hr') {
      query.postedBy = req.user._id;
    }
  }
  
  // Apply filters
  if (department) query.department = { $regex: department, $options: 'i' };
  if (location) query.location = { $regex: location, $options: 'i' };
  if (employmentType) query.employmentType = employmentType;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  
  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Get jobs with pagination
  const jobs = await Job.find(query)
    .populate('postedBy', 'firstName lastName email department')
    .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Job.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalJobs: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

// @route   GET /api/jobs/stats
// @desc    Get job statistics (HR/Admin only)
// @access  Private (HR/Admin)
router.get('/stats', authenticate, requireHrOrAdmin, asyncHandler(async (req, res) => {
  let matchQuery = {};
  
  // HR can only see stats for their jobs
  if (req.user.role === 'hr') {
    matchQuery.postedBy = req.user._id;
  }

  const stats = await Job.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalViews: { $sum: '$viewCount' },
        totalApplications: { $sum: '$applicationCount' }
      }
    }
  ]);

  const departmentStats = await Job.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        activeJobs: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        }
      }
    }
  ]);

  const totalJobs = await Job.countDocuments(matchQuery);
  const activeJobs = await Job.countDocuments({ ...matchQuery, status: 'active' });

  res.json({
    success: true,
    data: {
      totalJobs,
      activeJobs,
      statusStats: stats,
      departmentStats,
      inactiveJobs: totalJobs - activeJobs
    }
  });
}));

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public/Private
router.get('/:id', optionalAuth, validateMongoId('id'), asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  
  let query = { _id: jobId };
  
  // Non-authenticated users and candidates can only see active jobs
  if (!req.user || req.user.role === 'candidate') {
    query.status = 'active';
  }

  const job = await Job.findOne(query)
    .populate('postedBy', 'firstName lastName email department');

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found or not accessible'
    });
  }

  // Increment view count for public access
  if (!req.user || req.user.role === 'candidate') {
    await job.incrementViewCount();
  }

  // Check if user has already applied (for candidates)
  let hasApplied = false;
  if (req.user && req.user.role === 'candidate') {
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id
    });
    hasApplied = !!existingApplication;
  }

  res.json({
    success: true,
    data: {
      job,
      hasApplied
    }
  });
}));

// @route   POST /api/jobs
// @desc    Create new job (HR/Admin only)
// @access  Private (HR/Admin)
router.post('/', authenticate, requireHrOrAdmin, validateJobCreation, asyncHandler(async (req, res) => {
  const jobData = {
    ...req.body,
    postedBy: req.user._id
  };

  const job = await Job.create(jobData);
  
  await job.populate('postedBy', 'firstName lastName email department');

  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: {
      job
    }
  });
}));

// @route   PUT /api/jobs/:id
// @desc    Update job (HR/Admin only, HR can only update own jobs)
// @access  Private (HR/Admin)
router.put('/:id', authenticate, requireHrOrAdmin, validateMongoId('id'), validateJobUpdate, asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  
  let query = { _id: jobId };
  
  // HR can only update their own jobs
  if (req.user.role === 'hr') {
    query.postedBy = req.user._id;
  }

  const job = await Job.findOneAndUpdate(
    query,
    req.body,
    { new: true, runValidators: true }
  ).populate('postedBy', 'firstName lastName email department');

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found or you do not have permission to update it'
    });
  }

  res.json({
    success: true,
    message: 'Job updated successfully',
    data: {
      job
    }
  });
}));

// @route   DELETE /api/jobs/:id
// @desc    Delete job (HR/Admin only, HR can only delete own jobs)
// @access  Private (HR/Admin)
router.delete('/:id', authenticate, requireHrOrAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  
  let query = { _id: jobId };
  
  // HR can only delete their own jobs
  if (req.user.role === 'hr') {
    query.postedBy = req.user._id;
  }

  const job = await Job.findOne(query);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found or you do not have permission to delete it'
    });
  }

  // Check if job has applications
  const applicationCount = await Application.countDocuments({ job: jobId });
  
  if (applicationCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete job with ${applicationCount} applications. Consider closing the job instead.`
    });
  }

  await Job.findByIdAndDelete(jobId);

  res.json({
    success: true,
    message: 'Job deleted successfully'
  });
}));

// @route   PUT /api/jobs/:id/status
// @desc    Update job status (HR/Admin only)
// @access  Private (HR/Admin)
router.put('/:id/status', authenticate, requireHrOrAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status || !['draft', 'active', 'paused', 'closed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Valid status is required (draft, active, paused, or closed)'
    });
  }

  const jobId = req.params.id;
  let query = { _id: jobId };
  
  // HR can only update their own jobs
  if (req.user.role === 'hr') {
    query.postedBy = req.user._id;
  }

  const job = await Job.findOneAndUpdate(
    query,
    { status },
    { new: true, runValidators: true }
  ).populate('postedBy', 'firstName lastName email department');

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found or you do not have permission to update it'
    });
  }

  res.json({
    success: true,
    message: `Job status updated to ${status}`,
    data: {
      job
    }
  });
}));

// @route   GET /api/jobs/:id/applications
// @desc    Get applications for a job (HR/Admin only)
// @access  Private (HR/Admin)
router.get('/:id/applications', authenticate, requireHrOrAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  
  // Check if user has access to this job
  let jobQuery = { _id: jobId };
  if (req.user.role === 'hr') {
    jobQuery.postedBy = req.user._id;
  }

  const job = await Job.findOne(jobQuery);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found or you do not have permission to view its applications'
    });
  }

  const applications = await Application.findByJob(jobId);

  res.json({
    success: true,
    data: {
      job: {
        _id: job._id,
        title: job.title,
        department: job.department
      },
      applications,
      count: applications.length
    }
  });
}));

// @route   GET /api/jobs/my/posted
// @desc    Get jobs posted by current HR user
// @access  Private (HR)
router.get('/my/posted', authenticate, requireHrOrAdmin, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { status } = req.query;
  
  let query = { postedBy: req.user._id };
  if (status) {
    query.status = status;
  }

  const jobs = await Job.find(query)
    .populate('postedBy', 'firstName lastName email department')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Job.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalJobs: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

module.exports = router;