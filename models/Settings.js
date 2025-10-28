const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // AI Configuration
  openRouterApiKey: {
    type: String,
    required: [true, 'OpenRouter API key is required'],
    select: false // Don't include in queries by default for security
  },
  modelName: {
    type: String,
    default: 'openai/gpt-4o',
    required: [true, 'Model name is required']
  },
  // AI Interview Settings
  aiInterviewSettings: {
    maxQuestions: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },
    questionTimeoutMinutes: {
      type: Number,
      default: 10,
      min: 1,
      max: 60
    },
    enableTechnicalQuestions: {
      type: Boolean,
      default: true
    },
    enableBehavioralQuestions: {
      type: Boolean,
      default: true
    },
    enableSituationalQuestions: {
      type: Boolean,
      default: true
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    }
  },
  // Application Settings
  applicationSettings: {
    maxApplicationsPerJob: {
      type: Number,
      default: 100,
      min: 1
    },
    autoRejectAfterDays: {
      type: Number,
      default: 30,
      min: 1
    },
    requireCoverLetter: {
      type: Boolean,
      default: false
    },
    allowResumeUpload: {
      type: Boolean,
      default: true
    },
    maxResumeSize: {
      type: Number,
      default: 5242880, // 5MB in bytes
      min: 1048576 // 1MB minimum
    }
  },
  // Email Settings
  emailSettings: {
    smtpHost: String,
    smtpPort: {
      type: Number,
      default: 587
    },
    smtpUser: String,
    smtpPassword: {
      type: String,
      select: false
    },
    fromEmail: String,
    fromName: {
      type: String,
      default: 'AI Hiring Platform'
    },
    enableNotifications: {
      type: Boolean,
      default: true
    }
  },
  // System Settings
  systemSettings: {
    siteName: {
      type: String,
      default: 'AI Hiring Platform'
    },
    siteUrl: {
      type: String,
      default: 'http://localhost:3000'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    allowRegistration: {
      type: Boolean,
      default: true
    },
    defaultUserRole: {
      type: String,
      enum: ['candidate', 'hr'],
      default: 'candidate'
    }
  },
  // Security Settings
  securitySettings: {
    sessionTimeout: {
      type: Number,
      default: 24, // hours
      min: 1,
      max: 168 // 1 week
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 10
    },
    lockoutDuration: {
      type: Number,
      default: 30, // minutes
      min: 5,
      max: 1440 // 24 hours
    },
    requirePasswordChange: {
      type: Boolean,
      default: false
    },
    passwordExpiryDays: {
      type: Number,
      default: 90,
      min: 30,
      max: 365
    }
  },
  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.openRouterApiKey;
      delete ret.emailSettings?.smtpPassword;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

// Virtual to check if AI is properly configured
settingsSchema.virtual('isAiConfigured').get(function() {
  return !!(this.openRouterApiKey && this.modelName);
});

// Virtual to check if email is properly configured
settingsSchema.virtual('isEmailConfigured').get(function() {
  const email = this.emailSettings;
  return !!(email?.smtpHost && email?.smtpUser && email?.smtpPassword && email?.fromEmail);
});

// Method to get safe settings (without sensitive data)
settingsSchema.methods.getSafeSettings = function() {
  const settings = this.toObject();
  delete settings.openRouterApiKey;
  if (settings.emailSettings) {
    delete settings.emailSettings.smtpPassword;
  }
  return settings;
};

// Method to update AI settings
settingsSchema.methods.updateAiSettings = function(apiKey, modelName, updatedBy) {
  this.openRouterApiKey = apiKey;
  this.modelName = modelName;
  this.lastUpdatedBy = updatedBy;
  return this.save();
};

// Static method to get or create settings
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Static method to get settings with sensitive data (for internal use)
settingsSchema.statics.getSettingsWithSecrets = async function() {
  let settings = await this.findOne().select('+openRouterApiKey +emailSettings.smtpPassword');
  if (!settings) {
    settings = await this.create({});
    settings = await this.findOne().select('+openRouterApiKey +emailSettings.smtpPassword');
  }
  return settings;
};

// Pre-save middleware to validate settings
settingsSchema.pre('save', function(next) {
  // Validate email settings if provided
  if (this.emailSettings?.smtpHost && !this.emailSettings?.fromEmail) {
    return next(new Error('From email is required when SMTP host is configured'));
  }
  
  // Validate AI settings
  if (this.aiInterviewSettings?.maxQuestions > 20) {
    return next(new Error('Maximum questions cannot exceed 20'));
  }
  
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);