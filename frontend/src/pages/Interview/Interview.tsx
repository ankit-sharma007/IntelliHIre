import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { interviewAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Interview: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [responses, setResponses] = useState<any[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (applicationId) {
      fetchInterview();
    }
  }, [applicationId]);

  const fetchInterview = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getInterview(applicationId!);
      
      if (response.success && response.data) {
        setInterview(response.data);
        setResponses(response.data.responses || []);
        
        // Find the next unanswered question
        const answeredQuestionIds = (response.data.responses || []).map((r: any) => r.questionId);
        const nextQuestionIndex = response.data.questions.findIndex((q: any) => 
          !answeredQuestionIds.includes(q._id)
        );
        
        if (nextQuestionIndex >= 0) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          // All questions answered
          navigate(`/interview/${applicationId}/report`);
        }
      }
    } catch (error: any) {
      showError('Error', 'Failed to load interview');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !interview) return;
    
    try {
      setSubmitting(true);
      const currentQuestion = interview.questions[currentQuestionIndex];
      
      const response = await interviewAPI.submitAnswer(applicationId!, {
        questionId: currentQuestion._id,
        answer: answer.trim(),
      });
      
      if (response.success) {
        setResponses(prev => [...prev, response.data.response]);
        setAnswer('');
        
        if (response.data.interviewCompleted) {
          setShowCompletion(true);
          showSuccess('🎉 Interview Completed!', 'Congratulations! Your AI interview has been completed successfully.');
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
          showSuccess('✅ Answer Recorded', `Question ${currentQuestionIndex + 1} completed. Moving to next question...`);
        }
      }
    } catch (error: any) {
      showError('Error', 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Interview not available</h3>
        <p className="text-gray-500">The interview you're looking for is not accessible.</p>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  // Show completion screen
  if (showCompletion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-10 w-10 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Completed! 🎉</h1>
          <p className="text-gray-600 mb-6">
            Congratulations! You have successfully completed your AI interview for <strong>{interview.job?.title}</strong>.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{responses.length}</div>
                <div className="text-sm text-gray-500">Questions Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-600">100%</div>
                <div className="text-sm text-gray-500">Completion Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning-600">⏳</div>
                <div className="text-sm text-gray-500">Processing Results</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Our AI is now analyzing your responses and generating a detailed evaluation report.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate(`/interview/${applicationId}/report`)}
                className="btn-primary"
              >
                View Results
              </button>
              <button
                onClick={() => navigate('/applications')}
                className="btn-outline"
              >
                Back to Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Interview</h1>
            <p className="text-gray-600">{interview.job?.title}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Question {currentQuestionIndex + 1} of {interview.questions.length}</div>
            <div className="text-lg font-semibold text-primary-600">{Math.round(progress)}% Complete</div>
            <div className="text-xs text-gray-400 mt-1">
              {interview.questions.length - currentQuestionIndex - 1} questions remaining
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-primary-500 p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Question {currentQuestionIndex + 1}
              </h3>
              {currentQuestion?.type && (
                <span className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full capitalize">
                  {currentQuestion.type.replace('-', ' ')}
                </span>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-l-2 border-primary-200">
              <p className="text-gray-800 text-lg leading-relaxed font-medium">
                {currentQuestion?.question}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Input */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-success-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-success-600 font-semibold text-sm">A</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Your Answer</h4>
        </div>
        
        <div className="relative">
          <textarea
            rows={6}
            className="textarea resize-none"
            placeholder="Type your detailed answer here... 

Tips:
• Be specific and provide examples
• Use the STAR method for behavioral questions (Situation, Task, Action, Result)
• Take your time to think through your response"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {answer.length} characters
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>No time limit - take your time to craft a thoughtful response</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentQuestionIndex > 0 && (
              <span className="text-sm text-gray-500">
                {responses.length} of {interview.questions.length} answered
              </span>
            )}
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || submitting}
              className="btn-primary px-6 py-3 text-sm font-medium"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Submitting Answer...
                </>
              ) : (
                <>
                  {currentQuestionIndex === interview.questions.length - 1 ? (
                    <>🎯 Complete Interview</>
                  ) : (
                    <>📝 Submit & Continue</>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Previous Responses */}
      {responses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Previous Responses</h4>
          
          <div className="space-y-4">
            {responses.map((response, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircleIcon className="h-5 w-5 text-success-500 mr-2" />
                  <span className="font-medium text-gray-900">Question {index + 1}</span>
                  {response.score && (
                    <span className="ml-auto text-sm font-medium text-primary-600">
                      Score: {response.score}/10
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{response.question}</p>
                <p className="text-gray-700">{response.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-semibold text-sm">💡</span>
          </div>
          <h4 className="text-lg font-semibold text-blue-900">Interview Tips</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-sm text-blue-800">Be specific and provide concrete examples</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-sm text-blue-800">Take your time to think through responses</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-sm text-blue-800">Use STAR method for behavioral questions</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-sm text-blue-800">Be honest and authentic in your answers</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-sm text-blue-800">Focus on your achievements and learnings</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-sm text-blue-800">Show enthusiasm for the role</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;