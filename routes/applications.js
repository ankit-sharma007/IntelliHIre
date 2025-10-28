const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireCandidate, requireHrOrAdmin } = require('../middleware/auth');
const { 
  validateApplicationCreation, 
  validateApplicationStatusUpdate, 
  validateMongoId, 
  validatePagination 
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/applications
// @desc    Get applications (candidates see their own, HR/Admin see all)
// @access  Private
router.get('/', authenticate, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { status, jobId } = req.query;
  
  let query = {};
  
  // Candidates can only see their own applications
  if (req.user.role === 'candidate') {
    query.candidate = req.user._id;
  }
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by job
  if (jobId) {
    query.job = jobId;
    
    // If HR is filtering by job, ensure they own the job
    if (req.user.role === 'hr') {
      const job = await Job.findOne({ _id: jobId, postedBy: req.user._id });
      if (!job) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view applications for your jobs.'
        });
      }
    }
  } else if (req.user.role === 'hr') {
    // HR can only see applications for their jobs
    const hrJobs = await Job.find({ postedBy: req.user._id }).select('_id');
    const hrJobIds = hrJobs.map(job => job._id);
    query.job = { $in: hrJobIds };
  }

  const applications = await Application.find(query)
    .populate('job', 'title department location status')
    .populate('candidate', 'firstName lastName email skills experience location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Application.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalApplications: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

// @route   GET /api/applications/stats
// @desc    Get application statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  let matchQuery = {};
  
  if (req.user.role === 'candidate') {
    matchQuery.candidate = req.user._id;
  } else if (req.user.role === 'hr') {
    // Get HR's job IDs
    const hrJobs = await Job.find({ postedBy: req.user._id }).select('_id');
    const hrJobIds = hrJobs.map(job => job._id);
    matchQuery.job = { $in: hrJobIds };
  }

  const stats = await Application.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgAiScore: { $avg: '$aiInterviewScore' }
      }
    }
  ]);

  const totalApplications = await Application.countDocuments(matchQuery);
  const aiInterviewsCompleted = await Application.countDocuments({
    ...matchQuery,
    aiInterviewCompleted: true
  });

  res.json({
    success: true,
    data: {
      totalApplications,
      aiInterviewsCompleted,
      statusStats: stats,
      aiInterviewCompletionRate: totalApplications > 0 
        ? Math.round((aiInterviewsCompleted / totalApplications) * 100) 
        : 0
    }
  });
}));

// @route   GET /api/applications/:id
// @desc    Get application by ID
// @access  Private
router.get('/:id', authenticate, validateMongoId('id'), asyncHandler(async (req, res) => {
  const applicationId = req.params.id;
  
  let query = { _id: applicationId };
  
  // Candidates can only see their own applications
  if (req.user.role === 'candidate') {
    query.candidate = req.user._id;
  }

  const application = await Application.findOne(query)
    .populate('job', 'title description department location status aiInterviewEnabled')
    .populate('candidate', 'firstName lastName email skills experience location')
    .populate('hrNotes.addedBy', 'firstName lastName')
    .populate('statusHistory.changedBy', 'firstName lastName');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found or access denied'
    });
  }

  // If HR, check if they own the job
  if (req.user.role === 'hr') {
    const job = await Job.findOne({ _id: application.job._id, postedBy: req.user._id });
    if (!job) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view applications for your jobs.'
      });
    }
  }

  res.json({
    success: true,
    data: {
      application
    }
  });
}));

// @route   POST /api/applications
// @desc    Create new application (Candidates only)
// @access  Private (Candidate)
router.post('/', authenticate, requireCandidate, validateApplicationCreation, asyncHandler(async (req, res) => {
  const { jobId, coverLetter, expectedSalary, availabilityDate, noticePeriod } = req.body;

  // Check if job exists and is accepting applications
  const job = await Job.findById(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  if (!job.isAcceptingApplications) {
    return res.status(400).json({
      success: false,
      message: 'This job is no longer accepting applications'
    });
  }

  // Check if user has already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: req.user._id
  });

  if (existingApplication) {
    return res.status(400).json({
      success: false,
      message: 'You have already applied for this job'
    });
  }

  // Create application
  const applicationData = {
    job: jobId,
    candidate: req.user._id,
    coverLetter,
    expectedSalary,
    availabilityDate,
    noticePeriod
  };

  const application = await Application.create(applicationData);
  
  // Increment job application count
  await job.incrementApplicationCount();

  // Populate the application
  await application.populate('job', 'title department location');
  await application.populate('candidate', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: {
      application
    }
  });
}));

// @route   PUT /api/applications/:id/status
// @desc    Update application status (HR/Admin only)
// @access  Private (HR/Admin)
router.put('/:id/status', authenticate, requireHrOrAdmin, validateMongoId('id'), validateApplicationStatusUpdate, asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const applicationId = req.params.id;

  const application = await Application.findById(applicationId)
    .populate('job', 'title postedBy');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // HR can only update applications for their jobs
  if (req.user.role === 'hr' && application.job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only update applications for your jobs.'
    });
  }

  // Update status
  await application.updateStatus(status, req.user._id, reason);

  // Populate updated application
  await application.populate('candidate', 'firstName lastName email');

  res.json({
    success: true,
    message: `Application status updated to ${status}`,
    data: {
      application
    }
  });
}));

// @route   POST /api/applications/:id/notes
// @desc    Add HR note to application (HR/Admin only)
// @access  Private (HR/Admin)
router.post('/:id/notes', authenticate, requireHrOrAdmin, validateMongoId('id'), asyncHandler(async (req, res) => {
  const { note, isPrivate = false } = req.body;
  
  if (!note || note.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Note content is required'
    });
  }

  if (note.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Note cannot exceed 1000 characters'
    });
  }

  const applicationId = req.params.id;
  const application = await Application.findById(applicationId)
    .populate('job', 'title postedBy');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // HR can only add notes to applications for their jobs
  if (req.user.role === 'hr' && application.job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only add notes to applications for your jobs.'
    });
  }

  // Add note
  await application.addHrNote(note.trim(), req.user._id, isPrivate);

  // Populate the updated application
  await application.populate('hrNotes.addedBy', 'firstName lastName');

  res.json({
    success: true,
    message: 'Note added successfully',
    data: {
      application
    }
  });
}));

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application (Candidate only)
// @access  Private (Candidate)
router.put('/:id/withdraw', authenticate, requireCandidate, validateMongoId('id'), asyncHandler(async (req, res) => {
  const applicationId = req.params.id;

  const application = await Application.findOne({
    _id: applicationId,
    candidate: req.user._id
  }).populate('job', 'title');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check if application can be withdrawn
  if (['accepted', 'rejected', 'withdrawn'].includes(application.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot withdraw application with status: ${application.status}`
    });
  }

  // Update status to withdrawn
  await application.updateStatus('withdrawn', req.user._id, 'Withdrawn by candidate');

  res.json({
    success: true,
    message: 'Application withdrawn successfully',
    data: {
      application
    }
  });
}));

// @route   GET /api/applications/my/applications
// @desc    Get current candidate's applications
// @access  Private (Candidate)
router.get('/my/applications', authenticate, requireCandidate, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { status } = req.query;
  
  let query = { candidate: req.user._id };
  if (status) {
    query.status = status;
  }

  const applications = await Application.find(query)
    .populate('job', 'title department location status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Application.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalApplications: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

module.exports = router;