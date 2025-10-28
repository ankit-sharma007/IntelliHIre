const express = require('express');
const Settings = require('../models/Settings');
const aiService = require('../services/aiService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateAiSettings } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/settings
// @desc    Get application settings (Admin only)
// @access  Private (Admin)
router.get('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  res.json({
    success: true,
    data: {
      settings: settings.getSafeSettings()
    }
  });
}));

// @route   PUT /api/settings/ai
// @desc    Update AI settings (Admin only)
// @access  Private (Admin)
router.put('/ai', authenticate, requireAdmin, validateAiSettings, asyncHandler(async (req, res) => {
  const { openRouterApiKey, modelName } = req.body;

  let settings = await Settings.getSettingsWithSecrets();
  
  // Update AI settings
  await settings.updateAiSettings(openRouterApiKey, modelName, req.user._id);

  res.json({
    success: true,
    message: 'AI settings updated successfully',
    data: {
      modelName: settings.modelName,
      isAiConfigured: settings.isAiConfigured
    }
  });
}));

// @route   GET /api/settings/debug
// @desc    Debug settings (Admin only)
// @access  Private (Admin)
router.get('/debug', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getSettingsWithSecrets();
    
    res.json({
      success: true,
      data: {
        hasApiKey: !!settings.openRouterApiKey,
        apiKeyPrefix: settings.openRouterApiKey ? settings.openRouterApiKey.substring(0, 15) + '...' : 'none',
        modelName: settings.modelName,
        settingsId: settings._id
      }
    });
  } catch (error) {
    console.error('Debug settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug settings',
      error: error.message
    });
  }
}));

// @route   POST /api/settings/ai/test
// @desc    Test AI connection (Admin only)
// @access  Private (Admin)
router.post('/ai/test', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const testResult = await aiService.testConnection();
    
    res.json({
      success: testResult.success,
      message: testResult.success 
        ? 'AI connection test successful' 
        : 'AI connection test failed',
      data: testResult
    });
  } catch (error) {
    console.error('AI connection test error:', error);
    res.status(500).json({
      success: false,
      message: 'AI connection test failed',
      error: error.message
    });
  }
}));

// @route   PUT /api/settings/interview
// @desc    Update AI interview settings (Admin only)
// @access  Private (Admin)
router.put('/interview', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const {
    maxQuestions,
    questionTimeoutMinutes,
    enableTechnicalQuestions,
    enableBehavioralQuestions,
    enableSituationalQuestions,
    passingScore
  } = req.body;

  const settings = await Settings.getSettings();
  
  // Update interview settings
  if (maxQuestions !== undefined) {
    if (maxQuestions < 1 || maxQuestions > 20) {
      return res.status(400).json({
        success: false,
        message: 'Max questions must be between 1 and 20'
      });
    }
    settings.aiInterviewSettings.maxQuestions = maxQuestions;
  }
  
  if (questionTimeoutMinutes !== undefined) {
    if (questionTimeoutMinutes < 1 || questionTimeoutMinutes > 60) {
      return res.status(400).json({
        success: false,
        message: 'Question timeout must be between 1 and 60 minutes'
      });
    }
    settings.aiInterviewSettings.questionTimeoutMinutes = questionTimeoutMinutes;
  }
  
  if (enableTechnicalQuestions !== undefined) {
    settings.aiInterviewSettings.enableTechnicalQuestions = enableTechnicalQuestions;
  }
  
  if (enableBehavioralQuestions !== undefined) {
    settings.aiInterviewSettings.enableBehavioralQuestions = enableBehavioralQuestions;
  }
  
  if (enableSituationalQuestions !== undefined) {
    settings.aiInterviewSettings.enableSituationalQuestions = enableSituationalQuestions;
  }
  
  if (passingScore !== undefined) {
    if (passingScore < 0 || passingScore > 100) {
      return res.status(400).json({
        success: false,
        message: 'Passing score must be between 0 and 100'
      });
    }
    settings.aiInterviewSettings.passingScore = passingScore;
  }

  settings.lastUpdatedBy = req.user._id;
  await settings.save();

  res.json({
    success: true,
    message: 'Interview settings updated successfully',
    data: {
      aiInterviewSettings: settings.aiInterviewSettings
    }
  });
}));

// @route   PUT /api/settings/application
// @desc    Update application settings (Admin only)
// @access  Private (Admin)
router.put('/application', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const {
    maxApplicationsPerJob,
    autoRejectAfterDays,
    requireCoverLetter,
    allowResumeUpload,
    maxResumeSize
  } = req.body;

  const settings = await Settings.getSettings();
  
  // Update application settings
  if (maxApplicationsPerJob !== undefined) {
    if (maxApplicationsPerJob < 1) {
      return res.status(400).json({
        success: false,
        message: 'Max applications per job must be at least 1'
      });
    }
    settings.applicationSettings.maxApplicationsPerJob = maxApplicationsPerJob;
  }
  
  if (autoRejectAfterDays !== undefined) {
    if (autoRejectAfterDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Auto reject after days must be at least 1'
      });
    }
    settings.applicationSettings.autoRejectAfterDays = autoRejectAfterDays;
  }
  
  if (requireCoverLetter !== undefined) {
    settings.applicationSettings.requireCoverLetter = requireCoverLetter;
  }
  
  if (allowResumeUpload !== undefined) {
    settings.applicationSettings.allowResumeUpload = allowResumeUpload;
  }
  
  if (maxResumeSize !== undefined) {
    if (maxResumeSize < 1048576) { // 1MB minimum
      return res.status(400).json({
        success: false,
        message: 'Max resume size must be at least 1MB'
      });
    }
    settings.applicationSettings.maxResumeSize = maxResumeSize;
  }

  settings.lastUpdatedBy = req.user._id;
  await settings.save();

  res.json({
    success: true,
    message: 'Application settings updated successfully',
    data: {
      applicationSettings: settings.applicationSettings
    }
  });
}));

// @route   PUT /api/settings/system
// @desc    Update system settings (Admin only)
// @access  Private (Admin)
router.put('/system', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const {
    siteName,
    siteUrl,
    maintenanceMode,
    allowRegistration,
    defaultUserRole
  } = req.body;

  const settings = await Settings.getSettings();
  
  // Update system settings
  if (siteName !== undefined) {
    if (siteName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Site name cannot be empty'
      });
    }
    settings.systemSettings.siteName = siteName.trim();
  }
  
  if (siteUrl !== undefined) {
    if (siteUrl.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Site URL cannot be empty'
      });
    }
    settings.systemSettings.siteUrl = siteUrl.trim();
  }
  
  if (maintenanceMode !== undefined) {
    settings.systemSettings.maintenanceMode = maintenanceMode;
  }
  
  if (allowRegistration !== undefined) {
    settings.systemSettings.allowRegistration = allowRegistration;
  }
  
  if (defaultUserRole !== undefined) {
    if (!['candidate', 'hr'].includes(defaultUserRole)) {
      return res.status(400).json({
        success: false,
        message: 'Default user role must be candidate or hr'
      });
    }
    settings.systemSettings.defaultUserRole = defaultUserRole;
  }

  settings.lastUpdatedBy = req.user._id;
  await settings.save();

  res.json({
    success: true,
    message: 'System settings updated successfully',
    data: {
      systemSettings: settings.systemSettings
    }
  });
}));

// @route   PUT /api/settings/security
// @desc    Update security settings (Admin only)
// @access  Private (Admin)
router.put('/security', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const {
    sessionTimeout,
    maxLoginAttempts,
    lockoutDuration,
    requirePasswordChange,
    passwordExpiryDays
  } = req.body;

  const settings = await Settings.getSettings();
  
  // Update security settings
  if (sessionTimeout !== undefined) {
    if (sessionTimeout < 1 || sessionTimeout > 168) {
      return res.status(400).json({
        success: false,
        message: 'Session timeout must be between 1 and 168 hours'
      });
    }
    settings.securitySettings.sessionTimeout = sessionTimeout;
  }
  
  if (maxLoginAttempts !== undefined) {
    if (maxLoginAttempts < 3 || maxLoginAttempts > 10) {
      return res.status(400).json({
        success: false,
        message: 'Max login attempts must be between 3 and 10'
      });
    }
    settings.securitySettings.maxLoginAttempts = maxLoginAttempts;
  }
  
  if (lockoutDuration !== undefined) {
    if (lockoutDuration < 5 || lockoutDuration > 1440) {
      return res.status(400).json({
        success: false,
        message: 'Lockout duration must be between 5 and 1440 minutes'
      });
    }
    settings.securitySettings.lockoutDuration = lockoutDuration;
  }
  
  if (requirePasswordChange !== undefined) {
    settings.securitySettings.requirePasswordChange = requirePasswordChange;
  }
  
  if (passwordExpiryDays !== undefined) {
    if (passwordExpiryDays < 30 || passwordExpiryDays > 365) {
      return res.status(400).json({
        success: false,
        message: 'Password expiry days must be between 30 and 365'
      });
    }
    settings.securitySettings.passwordExpiryDays = passwordExpiryDays;
  }

  settings.lastUpdatedBy = req.user._id;
  await settings.save();

  res.json({
    success: true,
    message: 'Security settings updated successfully',
    data: {
      securitySettings: settings.securitySettings
    }
  });
}));

// @route   GET /api/settings/public
// @desc    Get public settings (no authentication required)
// @access  Public
router.get('/public', asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  // Only return public settings
  const publicSettings = {
    siteName: settings.systemSettings.siteName,
    allowRegistration: settings.systemSettings.allowRegistration,
    defaultUserRole: settings.systemSettings.defaultUserRole,
    maintenanceMode: settings.systemSettings.maintenanceMode,
    requireCoverLetter: settings.applicationSettings.requireCoverLetter,
    allowResumeUpload: settings.applicationSettings.allowResumeUpload,
    maxResumeSize: settings.applicationSettings.maxResumeSize
  };

  res.json({
    success: true,
    data: {
      settings: publicSettings
    }
  });
}));

module.exports = router;