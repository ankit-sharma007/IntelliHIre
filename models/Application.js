const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required']
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate reference is required']
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'interview-scheduled', 'ai-interview-completed', 'rejected', 'accepted', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resume: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: Date
  },
  // AI Interview Results
  aiInterviewCompleted: {
    type: Boolean,
    default: false
  },
  aiInterviewScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiEvaluationReport: {
    overallAssessment: String,
    strengths: [String],
    weaknesses: [String],
    recommendations: String,
    technicalSkillsScore: {
      type: Number,
      min: 0,
      max: 100
    },
    communicationScore: {
      type: Number,
      min: 0,
      max: 100
    },
    culturalFitScore: {
      type: Number,
      min: 0,
      max: 100
    },
    suitabilityRating: {
      type: String,
      enum: ['excellent', 'good', 'average', 'below-average', 'poor']
    }
  },
  // Interview Responses
  interviewResponses: [{
    questionId: mongoose.Schema.Types.ObjectId,
    question: String,
    answer: String,
    aiAnalysis: String,
    score: {
      type: Number,
      min: 0,
      max: 10
    },
    answeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  // HR Notes and Actions
  hrNotes: [{
    note: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
  // Timeline tracking
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  // Additional candidate information
  expectedSalary: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  availabilityDate: Date,
  noticePeriod: {
    type: String,
    maxlength: [100, 'Notice period cannot exceed 100 characters']
  },
  // Metadata
  source: {
    type: String,
    enum: ['direct', 'referral', 'job-board', 'social-media', 'other'],
    default: 'direct'
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one application per candidate per job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Indexes for better query performance
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ aiInterviewCompleted: 1 });
applicationSchema.index({ aiInterviewScore: -1 });

// Virtual for days since application
applicationSchema.virtual('daysSinceApplication').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual to check if AI interview is required
applicationSchema.virtual('requiresAiInterview').get(function() {
  return this.populated('job') && 
         this.job.aiInterviewEnabled && 
         !this.aiInterviewCompleted &&
         ['pending', 'under-review'].includes(this.status);
});

// Pre-save middleware to track status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

// Method to add HR note
applicationSchema.methods.addHrNote = function(note, addedBy, isPrivate = false) {
  this.hrNotes.push({
    note,
    addedBy,
    isPrivate
  });
  return this.save();
};

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, changedBy, reason) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    changedBy,
    reason,
    changedAt: new Date()
  });
  
  return this.save();
};

// Method to calculate overall AI score
applicationSchema.methods.calculateOverallAiScore = function() {
  if (!this.aiEvaluationReport) return 0;
  
  const { technicalSkillsScore, communicationScore, culturalFitScore } = this.aiEvaluationReport;
  
  if (!technicalSkillsScore && !communicationScore && !culturalFitScore) return 0;
  
  const scores = [technicalSkillsScore, communicationScore, culturalFitScore].filter(score => score !== undefined);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  this.aiInterviewScore = Math.round(average);
  return this.aiInterviewScore;
};

// Static method to find applications by status
applicationSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('job', 'title department location')
    .populate('candidate', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get applications for a specific job
applicationSchema.statics.findByJob = function(jobId) {
  return this.find({ job: jobId })
    .populate('candidate', 'firstName lastName email skills experience location')
    .sort({ aiInterviewScore: -1, createdAt: -1 });
};

// Static method to get candidate's applications
applicationSchema.statics.findByCandidate = function(candidateId) {
  return this.find({ candidate: candidateId })
    .populate('job', 'title department location status')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Application', applicationSchema);