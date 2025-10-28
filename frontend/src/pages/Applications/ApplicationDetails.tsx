import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { applicationsAPI } from '../../services/api';
import { Application } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplicationDetails();
    }
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getApplication(id!);
      
      if (response.success && response.data) {
        setApplication(response.data.application);
      }
    } catch (error: any) {
      showError('Error', 'Failed to fetch application details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return;
    
    try {
      setUpdatingStatus(true);
      const response = await applicationsAPI.updateApplicationStatus(application._id, newStatus);
      
      if (response.success && response.data) {
        setApplication(response.data.application);
        showSuccess('Status Updated', `Application status changed to ${newStatus}`);
      }
    } catch (error: any) {
      showError('Error', 'Failed to update application status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!application || !newNote.trim()) return;
    
    try {
      setAddingNote(true);
      const response = await applicationsAPI.addHRNote(application._id, newNote.trim());
      
      if (response.success && response.data) {
        setApplication(response.data.application);
        setNewNote('');
        showSuccess('Note Added', 'HR note has been added successfully');
      }
    } catch (error: any) {
      showError('Error', 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleWithdraw = async () => {
    if (!application) return;
    
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        const response = await applicationsAPI.withdrawApplication(application._id);
        
        if (response.success && response.data) {
          setApplication(response.data.application);
          showSuccess('Application Withdrawn', 'Your application has been withdrawn');
        }
      } catch (error: any) {
        showError('Error', 'Failed to withdraw application');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Application not found</h3>
        <p className="text-gray-500">The application you're looking for doesn't exist.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'badge-warning',
      'under-review': 'badge-primary',
      'interview-scheduled': 'badge-primary',
      'ai-interview-completed': 'badge-success',
      accepted: 'badge-success',
      rejected: 'badge-danger',
      withdrawn: 'badge-gray',
    };
    return statusClasses[status as keyof typeof statusClasses] || 'badge-gray';
  };

  const formatStatus = (status: string) => {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const canUpdateStatus = hasRole(['admin', 'hr']) && !['accepted', 'rejected', 'withdrawn'].includes(application.status);
  const canWithdraw = hasRole('candidate') && user?._id === application.candidate._id && !['accepted', 'rejected', 'withdrawn'].includes(application.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {application.job?.title || 'Job Application'}
              </h1>
              <span className={`badge ${getStatusBadge(application.status)}`}>
                {formatStatus(application.status)}
              </span>
              {application.aiInterviewCompleted && (
                <span className="badge-success">
                  AI Score: {application.aiInterviewScore || 0}/100
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {application.candidate?.fullName || 'Candidate'}
              </div>
              <div className="flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-1" />
                {application.job?.department || 'Department'}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Applied {new Date(application.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="ml-6 flex flex-col gap-2">
            {application.requiresAiInterview && hasRole('candidate') && (
              <Link 
                to={`/interview/${application._id}`}
                className="btn-success"
              >
                Take AI Interview
              </Link>
            )}
            
            {application.aiInterviewCompleted && (
              <Link 
                to={`/interview/${application._id}/report`}
                className="btn-primary"
              >
                View AI Report
              </Link>
            )}
            
            {canWithdraw && (
              <button
                onClick={handleWithdraw}
                className="btn-danger"
              >
                Withdraw Application
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* AI Interview Results */}
          {application.aiEvaluationReport && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Evaluation Report</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {application.aiEvaluationReport.technicalSkillsScore}
                  </div>
                  <div className="text-sm text-gray-600">Technical Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">
                    {application.aiEvaluationReport.communicationScore}
                  </div>
                  <div className="text-sm text-gray-600">Communication</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">
                    {application.aiEvaluationReport.culturalFitScore}
                  </div>
                  <div className="text-sm text-gray-600">Cultural Fit</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Overall Assessment</h4>
                  <p className="text-gray-700">{application.aiEvaluationReport.overallAssessment}</p>
                </div>
                
                {application.aiEvaluationReport.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {application.aiEvaluationReport.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {application.aiEvaluationReport.weaknesses.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {application.aiEvaluationReport.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-gray-700">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <p className="text-gray-700">{application.aiEvaluationReport.recommendations}</p>
                </div>
              </div>
            </div>
          )}

          {/* HR Notes */}
          {hasRole(['admin', 'hr']) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">HR Notes</h3>
              
              {/* Add Note */}
              <div className="mb-6">
                <textarea
                  rows={3}
                  className="textarea"
                  placeholder="Add a note about this application..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addingNote}
                    className="btn-primary"
                  >
                    {addingNote ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Adding...
                      </>
                    ) : (
                      'Add Note'
                    )}
                  </button>
                </div>
              </div>
              
              {/* Notes List */}
              <div className="space-y-4">
                {application.hrNotes && application.hrNotes.length > 0 ? (
                  application.hrNotes.map((note, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                          {note.addedBy?.fullName || 'HR'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(note.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-700">{note.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No notes yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
            
            <div className="space-y-3">
              {application.expectedSalary && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expected Salary</dt>
                  <dd className="text-sm text-gray-900">
                    ${application.expectedSalary.amount?.toLocaleString()} {application.expectedSalary.currency}
                  </dd>
                </div>
              )}
              
              {application.availabilityDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Availability Date</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(application.availabilityDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
              
              {application.noticePeriod && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Notice Period</dt>
                  <dd className="text-sm text-gray-900">{application.noticePeriod}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Source</dt>
                <dd className="text-sm text-gray-900 capitalize">{application.source}</dd>
              </div>
            </div>
          </div>

          {/* Status Management */}
          {canUpdateStatus && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
              
              <div className="space-y-2">
                {['under-review', 'interview-scheduled', 'accepted', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updatingStatus || application.status === status}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      application.status === status
                        ? 'bg-primary-100 text-primary-800 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {formatStatus(status)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          {application.statusHistory && application.statusHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
              
              <div className="space-y-3">
                {application.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="flex-1">
                      <span className="font-medium">{formatStatus(history.status)}</span>
                      {history.reason && (
                        <span className="text-gray-500"> - {history.reason}</span>
                      )}
                    </div>
                    <div className="text-gray-500">
                      {new Date(history.changedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;