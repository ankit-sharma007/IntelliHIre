const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const aiService = require('../services/aiService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireCandidate, requireHrOrAdmin } = require('../middleware/auth');
const { validateInterviewResponse, validateMongoId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/interviews/application/:applicationId
// @desc    Get AI interview for an application (Candidate only for their own)
// @access  Private
router.get('/application/:applicationId', authenticate, validateMongoId('applicationId'), asyncHandler(async (req, res) => {
  const applicationId = req.params.applicationId;
  
  let query = { _id: applicationId };
  
  // Candidates can only access their own applications
  if (req.user.role === 'candidate') {
    query.candidate = req.user._id;
  }

  const application = await Application.findOne(query)
    .populate('job', 'title description requirements skills aiInterviewEnabled interviewQuestions')
    .populate('candidate', 'firstName lastName email skills experience');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found or access denied'
    });
  }

  // Check if AI interview is enabled for this job
  if (!application.job.aiInterviewEnabled) {
    return res.status(400).json({
      success: false,
      message: 'AI interview is not enabled for this job'
    });
  }

  // If HR/Admin is accessing, check if they own the job
  if (req.user.role === 'hr') {
    const job = await Job.findOne({ _id: application.job._id, postedBy: req.user._id });
    if (!job) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view interviews for your jobs.'
      });
    }
  }

  // Generate questions if not already generated
  let questions = application.job.interviewQuestions || [];
  
  if (questions.length === 0) {
    try {
      const generatedQuestions = await aiService.generateInterviewQuestions(
        application.job.description,
        5 // Generate 5 questions
      );
      
      // Update job with generated questions
      application.job.interviewQuestions = generatedQuestions;
      await application.job.save();
      
      questions = generatedQuestions;
    } catch (error) {
      console.error('Error generating interview questions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate interview questions. Please try again later.'
      });
    }
  }

  res.json({
    success: true,
    data: {
      application: {
        _id: application._id,
        status: application.status,
        aiInterviewCompleted: application.aiInterviewCompleted,
        aiInterviewScore: application.aiInterviewScore
      },
      job: {
        _id: application.job._id,
        title: application.job.title,
        description: application.job.description
      },
      questions,
      responses: application.interviewResponses || []
    }
  });
}));

// @route   POST /api/interviews/application/:applicationId/answer
// @desc    Submit answer to interview question (Candidate only)
// @access  Private (Candidate)
router.post('/application/:applicationId/answer', authenticate, requireCandidate, validateMongoId('applicationId'), validateInterviewResponse, asyncHandler(async (req, res) => {
  const { questionId, answer } = req.body;
  const applicationId = req.params.applicationId;

  const application = await Application.findOne({
    _id: applicationId,
    candidate: req.user._id
  }).populate('job', 'title description interviewQuestions');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // Check if AI interview is completed
  if (application.aiInterviewCompleted) {
    return res.status(400).json({
      success: false,
      message: 'AI interview has already been completed'
    });
  }

  // Find the question
  const question = application.job.interviewQuestions.find(q => q._id.toString() === questionId);
  
  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  // Check if question has already been answered
  const existingResponse = application.interviewResponses.find(r => r.questionId.toString() === questionId);
  
  if (existingResponse) {
    return res.status(400).json({
      success: false,
      message: 'This question has already been answered'
    });
  }

  try {
    // Analyze the answer using AI
    const analysis = await aiService.analyzeAnswer(
      question.question,
      answer,
      application.job.description
    );

    // Add response to application
    const response = {
      questionId,
      question: question.question,
      answer: answer.trim(),
      aiAnalysis: analysis.analysis || 'Analysis completed',
      score: analysis.score || 5,
      answeredAt: new Date()
    };

    application.interviewResponses.push(response);

    // Check if all questions have been answered
    const totalQuestions = application.job.interviewQuestions.length;
    const answeredQuestions = application.interviewResponses.length;

    if (answeredQuestions >= totalQuestions) {
      // Mark interview as completed and generate evaluation report
      application.aiInterviewCompleted = true;
      
      try {
        const evaluationReport = await aiService.generateEvaluationReport(
          application.job.description,
          application.interviewResponses,
          {
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            skills: req.user.skills,
            experience: req.user.experience,
            location: req.user.location
          }
        );

        application.aiEvaluationReport = evaluationReport;
        application.aiInterviewScore = evaluationReport.overallScore;
        
        // Update application status
        if (application.status === 'pending') {
          await application.updateStatus('ai-interview-completed', req.user._id, 'AI interview completed');
        }
      } catch (error) {
        console.error('Error generating evaluation report:', error);
        // Continue without evaluation report - can be generated later
        application.aiInterviewCompleted = true;
      }
    }

    await application.save();

    res.json({
      success: true,
      message: answeredQuestions >= totalQuestions 
        ? 'Interview completed successfully!' 
        : 'Answer submitted successfully',
      data: {
        response,
        interviewCompleted: application.aiInterviewCompleted,
        questionsRemaining: Math.max(0, totalQuestions - answeredQuestions),
        aiScore: application.aiInterviewScore
      }
    });

  } catch (error) {
    console.error('Error processing interview answer:', error);
    
    // Save the answer without AI analysis as fallback
    const response = {
      questionId,
      question: question.question,
      answer: answer.trim(),
      aiAnalysis: 'Analysis pending',
      score: 5,
      answeredAt: new Date()
    };

    application.interviewResponses.push(response);
    await application.save();

    res.json({
      success: true,
      message: 'Answer submitted successfully (analysis pending)',
      data: {
        response,
        interviewCompleted: false,
        questionsRemaining: application.job.interviewQuestions.length - application.interviewResponses.length
      }
    });
  }
}));

// @route   POST /api/interviews/application/:applicationId/generate-report
// @desc    Generate or regenerate AI evaluation report (HR/Admin only)
// @access  Private (HR/Admin)
router.post('/application/:applicationId/generate-report', authenticate, requireHrOrAdmin, validateMongoId('applicationId'), asyncHandler(async (req, res) => {
  const applicationId = req.params.applicationId;

  const application = await Application.findById(applicationId)
    .populate('job', 'title description postedBy')
    .populate('candidate', 'firstName lastName email skills experience location');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  // HR can only generate reports for their jobs
  if (req.user.role === 'hr' && application.job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only generate reports for your jobs.'
    });
  }

  // Check if interview responses exist
  if (!application.interviewResponses || application.interviewResponses.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No interview responses found for this application'
    });
  }

  try {
    const evaluationReport = await aiService.generateEvaluationReport(
      application.job.description,
      application.interviewResponses,
      {
        firstName: application.candidate.firstName,
        lastName: application.candidate.lastName,
        skills: application.candidate.skills,
        experience: application.candidate.experience,
        location: application.candidate.location
      }
    );

    application.aiEvaluationReport = evaluationReport;
    application.aiInterviewScore = evaluationReport.overallScore;
    application.aiInterviewCompleted = true;

    await application.save();

    res.json({
      success: true,
      message: 'AI evaluation report generated successfully',
      data: {
        evaluationReport,
        aiScore: application.aiInterviewScore
      }
    });

  } catch (error) {
    console.error('Error generating evaluation report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate evaluation report. Please try again.'
    });
  }
}));

// @route   GET /api/interviews/application/:applicationId/report
// @desc    Get AI evaluation report for an application
// @access  Private
router.get('/application/:applicationId/report', authenticate, validateMongoId('applicationId'), asyncHandler(async (req, res) => {
  const applicationId = req.params.applicationId;
  
  let query = { _id: applicationId };
  
  // Candidates can only access their own applications
  if (req.user.role === 'candidate') {
    query.candidate = req.user._id;
  }

  const application = await Application.findOne(query)
    .populate('job', 'title postedBy')
    .populate('candidate', 'firstName lastName email');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found or access denied'
    });
  }

  // HR can only view reports for their jobs
  if (req.user.role === 'hr' && application.job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view reports for your jobs.'
    });
  }

  if (!application.aiEvaluationReport) {
    return res.status(404).json({
      success: false,
      message: 'AI evaluation report not found. Interview may not be completed yet.'
    });
  }

  res.json({
    success: true,
    data: {
      application: {
        _id: application._id,
        aiInterviewCompleted: application.aiInterviewCompleted,
        aiInterviewScore: application.aiInterviewScore
      },
      candidate: {
        name: `${application.candidate.firstName} ${application.candidate.lastName}`,
        email: application.candidate.email
      },
      job: {
        title: application.job.title
      },
      evaluationReport: application.aiEvaluationReport,
      interviewResponses: application.interviewResponses
    }
  });
}));

// @route   POST /api/interviews/job/:jobId/generate-questions
// @desc    Generate interview questions for a job (HR/Admin only)
// @access  Private (HR/Admin)
router.post('/job/:jobId/generate-questions', authenticate, requireHrOrAdmin, validateMongoId('jobId'), asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;
  const { questionCount = 5 } = req.body;

  let query = { _id: jobId };
  
  // HR can only generate questions for their jobs
  if (req.user.role === 'hr') {
    query.postedBy = req.user._id;
  }

  const job = await Job.findOne(query);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found or access denied'
    });
  }

  try {
    const questions = await aiService.generateInterviewQuestions(
      job.description,
      Math.min(Math.max(questionCount, 1), 10) // Limit between 1 and 10
    );

    job.interviewQuestions = questions;
    await job.save();

    res.json({
      success: true,
      message: `${questions.length} interview questions generated successfully`,
      data: {
        questions
      }
    });

  } catch (error) {
    console.error('Error generating interview questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate interview questions. Please try again.'
    });
  }
}));

module.exports = router;