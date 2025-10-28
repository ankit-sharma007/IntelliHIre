import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { interviewAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const InterviewReport: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { hasRole } = useAuth();
  const { showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (applicationId) {
      fetchReport();
    }
  }, [applicationId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getReport(applicationId!);
      
      if (response.success && response.data) {
        setReport(response.data);
      }
    } catch (error: any) {
      showError('Error', 'Failed to load interview report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!report || !report.evaluationReport) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No report available</h3>
        <p className="mt-1 text-sm text-gray-500">
          The interview report is not ready yet or doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/applications" className="btn-primary">
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const { evaluationReport, interviewResponses } = report;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success-100';
    if (score >= 60) return 'bg-warning-100';
    return 'bg-danger-100';
  };

  const getSuitabilityBadge = (rating: string) => {
    const badges = {
      excellent: 'badge-success',
      good: 'badge-primary',
      average: 'badge-warning',
      'below-average': 'badge-warning',
      poor: 'badge-danger',
    };
    return badges[rating as keyof typeof badges] || 'badge-gray';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Interview Report</h1>
            <p className="text-gray-600">{report.candidate?.name} - {report.job?.title}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(evaluationReport.overallScore)}`}>
              {evaluationReport.overallScore}/100
            </div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Score Breakdown</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${getScoreBg(evaluationReport.technicalSkillsScore)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(evaluationReport.technicalSkillsScore)}`}>
                {evaluationReport.technicalSkillsScore}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-medium text-gray-900">Technical Skills</h3>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${evaluationReport.technicalSkillsScore >= 80 ? 'bg-success-500' : evaluationReport.technicalSkillsScore >= 60 ? 'bg-warning-500' : 'bg-danger-500'}`}
                style={{ width: `${evaluationReport.technicalSkillsScore}%` }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${getScoreBg(evaluationReport.communicationScore)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(evaluationReport.communicationScore)}`}>
                {evaluationReport.communicationScore}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-medium text-gray-900">Communication</h3>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${evaluationReport.communicationScore >= 80 ? 'bg-success-500' : evaluationReport.communicationScore >= 60 ? 'bg-warning-500' : 'bg-danger-500'}`}
                style={{ width: `${evaluationReport.communicationScore}%` }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${getScoreBg(evaluationReport.culturalFitScore)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(evaluationReport.culturalFitScore)}`}>
                {evaluationReport.culturalFitScore}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-medium text-gray-900">Cultural Fit</h3>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${evaluationReport.culturalFitScore >= 80 ? 'bg-success-500' : evaluationReport.culturalFitScore >= 60 ? 'bg-warning-500' : 'bg-danger-500'}`}
                style={{ width: `${evaluationReport.culturalFitScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Overall Assessment</h2>
          <span className={`ml-auto badge ${getSuitabilityBadge(evaluationReport.suitabilityRating)}`}>
            {evaluationReport.suitabilityRating.replace('-', ' ')}
          </span>
        </div>
        
        <p className="text-gray-700 leading-relaxed">
          {evaluationReport.overallAssessment}
        </p>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-6 w-6 text-success-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
          </div>
          
          <ul className="space-y-2">
            {evaluationReport.strengths.map((strength: string, index: number) => (
              <li key={index} className="flex items-start">
                <StarIcon className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-warning-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
          </div>
          
          <ul className="space-y-2">
            {evaluationReport.weaknesses.map((weakness: string, index: number) => (
              <li key={index} className="flex items-start">
                <ExclamationTriangleIcon className="h-4 w-4 text-warning-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        <p className="text-gray-700 leading-relaxed">
          {evaluationReport.recommendations}
        </p>
      </div>

      {/* Interview Responses (for HR/Admin) */}
      {hasRole(['admin', 'hr']) && interviewResponses && interviewResponses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Interview Responses</h3>
          
          <div className="space-y-6">
            {interviewResponses.map((response: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                  {response.score && (
                    <span className="text-sm font-medium text-primary-600">
                      Score: {response.score}/10
                    </span>
                  )}
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Question:</p>
                  <p className="text-gray-600">{response.question}</p>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Answer:</p>
                  <p className="text-gray-700">{response.answer}</p>
                </div>
                
                {response.aiAnalysis && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">AI Analysis:</p>
                    <p className="text-sm text-gray-600">{response.aiAnalysis}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link to="/applications" className="btn-outline">
          Back to Applications
        </Link>
        {hasRole('candidate') && (
          <Link to="/jobs" className="btn-primary">
            Browse More Jobs
          </Link>
        )}
      </div>
    </div>
  );
};

export default InterviewReport;