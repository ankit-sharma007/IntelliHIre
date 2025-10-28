import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { applicationsAPI } from '../../services/api';
import { Application, ApplicationFilters } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ClickableUserProfile from '../../components/UI/ClickableUserProfile';
import { useChat } from '../../contexts/ChatContext';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

const Applications: React.FC = () => {
  const { hasRole } = useAuth();
  const { showError } = useNotification();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, [filters, pagination.currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = hasRole('candidate') 
        ? await applicationsAPI.getMyApplications({
            ...filters,
            page: pagination.currentPage,
            limit: 10,
          })
        : await applicationsAPI.getApplications({
            ...filters,
            page: pagination.currentPage,
            limit: 10,
          });
      
      if (response.success && response.data) {
        setApplications(response.data.applications);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data?.pagination.totalPages || 1,
          totalApplications: response.data?.pagination.totalApplications || 0,
        }));
      }
    } catch (error: any) {
      showError('Error', 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ApplicationFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {hasRole('candidate') ? 'My Applications' : 'Applications'}
          </h1>
          <p className="text-gray-600">
            {pagination.totalApplications} application{pagination.totalApplications !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                className="input pl-10"
                value={filters.jobId || ''}
                onChange={(e) => handleFilterChange('jobId', e.target.value)}
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="select"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under-review">Under Review</option>
                  <option value="interview-scheduled">Interview Scheduled</option>
                  <option value="ai-interview-completed">AI Interview Completed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button onClick={clearFilters} className="btn-outline">
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((application) => (
              <div key={application._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link to={`/applications/${application._id}`} className="hover:text-primary-600">
                          {application.job?.title || 'Job Title'}
                        </Link>
                      </h3>
                      <span className={`badge ${getStatusBadge(application.status)}`}>
                        {formatStatus(application.status)}
                      </span>
                      {application.aiInterviewCompleted && (
                        <span className="badge-success text-xs">
                          AI Interview: {application.aiInterviewScore || 0}/100
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {!hasRole('candidate') && (
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {application.candidate?.fullName || 'Candidate'}
                        </div>
                      )}
                      <div className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-1" />
                        {application.job?.department || 'Department'}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {application.coverLetter && (
                      <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                        {application.coverLetter}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      {application.expectedSalary && (
                        <span className="text-gray-600">
                          Expected: ${application.expectedSalary.amount?.toLocaleString()} {application.expectedSalary.currency}
                        </span>
                      )}
                      {application.availabilityDate && (
                        <span className="text-gray-600">
                          Available: {new Date(application.availabilityDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end gap-2">
                    <Link to={`/applications/${application._id}`} className="btn-primary">
                      View Details
                    </Link>
                    
                    {hasRole('candidate') && application.requiresAiInterview && (
                      <Link 
                        to={`/interview/${application._id}`}
                        className="btn-success text-sm"
                      >
                        Take AI Interview
                      </Link>
                    )}
                    
                    {application.aiInterviewCompleted && (
                      <Link 
                        to={`/interview/${application._id}/report`}
                        className="btn-outline text-sm"
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasRole('candidate') 
                  ? "You haven't applied to any jobs yet."
                  : "No applications match your current filters."
                }
              </p>
              {hasRole('candidate') && (
                <div className="mt-6">
                  <Link to="/jobs" className="btn-primary">
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className="btn-outline disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="btn-outline disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;