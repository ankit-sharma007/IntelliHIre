import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { jobsAPI, applicationsAPI } from '../../services/api';
import { Job } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  EyeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availabilityDate: '',
    noticePeriod: '',
  });

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJob(id!);
      
      if (response.success && response.data) {
        setJob(response.data.job);
        setHasApplied(response.data.hasApplied || false);
      }
    } catch (error: any) {
      showError('Error', 'Failed to fetch job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!job) return;
    
    try {
      setApplying(true);
      const response = await applicationsAPI.createApplication({
        jobId: job._id,
        coverLetter: applicationData.coverLetter || undefined,
        expectedSalary: applicationData.expectedSalary ? {
          amount: parseInt(applicationData.expectedSalary),
          currency: 'USD'
        } : undefined,
        availabilityDate: applicationData.availabilityDate || undefined,
        noticePeriod: applicationData.noticePeriod || undefined,
      });
      
      if (response.success) {
        showSuccess('Application Submitted', 'Your application has been submitted successfully!');
        setHasApplied(true);
        setShowApplicationForm(false);
      }
    } catch (error: any) {
      showError('Application Failed', error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Job not found</h3>
        <p className="text-gray-500">The job you're looking for doesn't exist.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'badge-success',
      draft: 'badge-gray',
      paused: 'badge-warning',
      closed: 'badge-danger',
    };
    return statusClasses[status as keyof typeof statusClasses] || 'badge-gray';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <span className={`badge ${getStatusBadge(job.status)}`}>
                {job.status}
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-1" />
                {job.department}
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                {job.viewCount} views
              </div>
            </div>
            
            {job.salaryRange && job.salaryRange.min && job.salaryRange.max && (
              <div className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()} {job.salaryRange.currency}
              </div>
            )}
          </div>
          
          {hasRole('candidate') && job.isAcceptingApplications && (
            <div className="ml-6">
              {hasApplied ? (
                <div className="flex items-center text-success-600">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Applied
                </div>
              ) : (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="btn-primary"
                >
                  Apply Now
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <span className="badge-primary">
            {job.employmentType.replace('-', ' ')}
          </span>
          <span className="badge-gray">
            {job.experienceLevel} level
          </span>
          {job.aiInterviewEnabled && (
            <span className="badge-success">
              AI Interview Enabled
            </span>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>
      </div>

      {/* Requirements & Responsibilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h3>
            <ul className="space-y-2">
              {job.responsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span className="text-gray-700">{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span key={skill} className="badge-primary">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for {job.title}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter (Optional)
                </label>
                <textarea
                  rows={4}
                  className="textarea"
                  placeholder="Tell us why you're interested in this position..."
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Salary (USD, Optional)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g., 80000"
                  value={applicationData.expectedSalary}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability Date (Optional)
                </label>
                <input
                  type="date"
                  className="input"
                  value={applicationData.availabilityDate}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, availabilityDate: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notice Period (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., 2 weeks"
                  value={applicationData.noticePeriod}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, noticePeriod: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowApplicationForm(false)}
                className="btn-outline"
                disabled={applying}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="btn-primary"
              >
                {applying ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;