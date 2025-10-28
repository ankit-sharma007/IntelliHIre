const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Each requirement cannot exceed 500 characters']
  }],
  responsibilities: [{
    type: String,
    trim: true,
    maxlength: [500, 'Each responsibility cannot exceed 500 characters']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each skill cannot exceed 50 characters']
  }],
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    required: [true, 'Employment type is required']
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    required: [true, 'Experience level is required']
  },
  salaryRange: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: [3, 'Currency code cannot exceed 3 characters']
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'draft'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationDeadline: {
    type: Date
  },
  maxApplications: {
    type: Number,
    min: 1,
    default: 100
  },
  // AI Interview Configuration
  aiInterviewEnabled: {
    type: Boolean,
    default: true
  },
  interviewQuestions: [{
    question: {
      type: String,
      required: true,
      maxlength: [500, 'Question cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'general'],
      default: 'general'
    },
    expectedAnswer: {
      type: String,
      maxlength: [1000, 'Expected answer cannot exceed 1000 characters']
    }
  }],
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job'
});

// Virtual to check if job is expired
jobSchema.virtual('isExpired').get(function() {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
});

// Virtual to check if job is accepting applications
jobSchema.virtual('isAcceptingApplications').get(function() {
  return this.status === 'active' && 
         !this.isExpired && 
         this.applicationCount < this.maxApplications;
});

// Indexes for better query performance
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ department: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ 'skills': 1 });

// Text index for search functionality
jobSchema.index({
  title: 'text',
  description: 'text',
  'skills': 'text',
  department: 'text',
  location: 'text'
});

// Pre-save middleware to validate salary range
jobSchema.pre('save', function(next) {
  if (this.salaryRange.min && this.salaryRange.max) {
    if (this.salaryRange.min > this.salaryRange.max) {
      return next(new Error('Minimum salary cannot be greater than maximum salary'));
    }
  }
  next();
});

// Method to increment view count
jobSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment application count
jobSchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  return this.save();
};

// Static method to find active jobs
jobSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active',
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gte: new Date() } }
    ]
  });
};

// Static method to search jobs
jobSchema.statics.searchJobs = function(query, filters = {}) {
  const searchQuery = {
    status: 'active',
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .populate('postedBy', 'firstName lastName email department')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Job', jobSchema);