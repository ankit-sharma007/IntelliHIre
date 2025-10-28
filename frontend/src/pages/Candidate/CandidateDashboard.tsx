import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon,
  BookmarkIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Application, Job } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    offersReceived: 0,
  });

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockApplications: Application[] = [
        {
          _id: '1',
          job: {
            _id: '1',
            title: 'Senior React Developer',
            department: 'Engineering',
            location: 'San Francisco, CA',
            employmentType: 'full-time',
            experienceLevel: 'senior',
            status: 'active',
          } as Job,
          candidate: user!,
          status: 'ai-interview-completed',
          aiInterviewCompleted: true,
          aiInterviewScore: 8.5,
          interviewResponses: [],
          hrNotes: [],
          statusHistory: [],
          source: 'direct',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
          daysSinceApplication: 6,
          requiresAiInterview: true,
        },
        {
          _id: '2',
          job: {
            _id: '2',
            title: 'Frontend Engineer',
            department: 'Engineering',
            location: 'Remote',
            employmentType: 'full-time',
            experienceLevel: 'mid',
            status: 'active',
          } as Job,
          candidate: user!,
          status: 'under-review',
          aiInterviewCompleted: false,
          interviewResponses: [],
          hrNotes: [],
          statusHistory: [],
          source: 'direct',
          createdAt: '2024-01-12T09:00:00Z',
          updatedAt: '2024-01-12T09:00:00Z',
          daysSinceApplication: 4,
          requiresAiInterview: true,
        },
      ];

      const mockSavedJobs: Job[] = [
        {
          _id: '3',
          title: 'Full Stack Developer',
          description: 'Join our team to build amazing web applications',
          requirements: ['React', 'Node.js', 'TypeScript'],
          responsibilities: ['Develop features', 'Code reviews'],
          skills: ['React', 'Node.js', 'TypeScript'],
          department: 'Engineering',
          location: 'New York, NY',
          employmentType: 'full-time',
          experienceLevel: 'mid',
          salaryRange: { min: 90000, max: 130000, currency: 'USD' },
          status: 'active',
          postedBy: user!,
          maxApplications: 50,
          aiInterviewEnabled: true,
          interviewQuestions: [],
          viewCount: 245,
          applicationCount: 23,
          createdAt: '2024-01-08T12:00:00Z',
          updatedAt: '2024-01-08T12:00:00Z',
          isExpired: false,
          isAcceptingApplications: true,
        },
      ];

      const mockRecommendedJobs: Job[] = [
        {
          _id: '4',
          title: 'React Native Developer',
          description: 'Build mobile applications with React Native',
          requirements: ['React Native', 'JavaScript', 'Mobile Development'],
          responsibilities: ['Mobile app development', 'Performance optimization'],
          skills: ['React Native', 'JavaScript', 'iOS', 'Android'],
          department: 'Mobile',
          location: 'Austin, TX',
          employmentType: 'full-time',
          experienceLevel: 'mid',
          salaryRange: { min: 85000, max: 120000, currency: 'USD' },
          status: 'active',
          postedBy: user!,
          maxApplications: 30,
          aiInterviewEnabled: true,
          interviewQuestions: [],
          viewCount: 189,
          applicationCount: 15,
          createdAt: '2024-01-14T10:00:00Z',
          updatedAt: '2024-01-14T10:00:00Z',
          isExpired: false,
          isAcceptingApplications: true,
        },
      ];

      setApplications(mockApplications);
      setSavedJobs(mockSavedJobs);
      setRecommendedJobs(mockRecommendedJobs);
      
      setStats({
        totalApplications: mockApplications.length,
        pendingApplications: mockApplications.filter(app => app.status === 'pending').length,
        interviewsScheduled: mockApplications.filter(app => app.status === 'interview-scheduled').length,
        offersReceived: mockApplications.filter(app => app.status === 'accepted').length,
      });
      
    } catch (error) {
      console.error('Error fetching candidate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      'under-review': 'text-blue-600 bg-blue-100',
      'interview-scheduled': 'text-purple-600 bg-purple-100',
      'ai-interview-completed': 'text-indigo-600 bg-indigo-100',
      accepted: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      withdrawn: 'text-gray-600 bg-gray-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
            <p className="text-blue-100">Track your applications and discover new opportunities</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <div className="text-blue-100">Active Applications</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.offersReceived}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <Link
              to="/applications"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {applications.map(application => (
            <div key={application._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BriefcaseIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.job.title}
                    </h3>
                    <p className="text-gray-600">
                      {application.job.department} • {application.job.location}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Applied {application.daysSinceApplication} days ago</span>
                      {application.aiInterviewScore && (
                        <span className="flex items-center space-x-1">
                          <ChartBarIcon className="h-4 w-4" />
                          <span>AI Score: {application.aiInterviewScore}/10</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <span className="ml-1 capitalize">{application.status.replace('-', ' ')}</span>
                  </span>
                  <Link
                    to={`/applications/${application._id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Jobs and Saved Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommended Jobs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
              <Link
                to="/jobs"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {recommendedJobs.map(job => (
              <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {job.department} • {job.location}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {job.skills.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-100 rounded-lg">
                      <BookmarkIcon className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Jobs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Saved Jobs</h2>
              <span className="text-sm text-gray-500">{savedJobs.length} saved</span>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {savedJobs.map(job => (
              <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {job.department} • {job.location}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {job.skills.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-yellow-500 hover:text-gray-400 hover:bg-gray-100 rounded-lg">
                      <BookmarkIcon className="h-4 w-4 fill-current" />
                    </button>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {savedJobs.length === 0 && (
              <div className="text-center py-8">
                <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No saved jobs yet</p>
                <p className="text-sm text-gray-400">Save jobs you're interested in to view them here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BriefcaseIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Browse Jobs</p>
              <p className="text-sm text-gray-500">Find your next opportunity</p>
            </div>
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Update Profile</p>
              <p className="text-sm text-gray-500">Keep your profile current</p>
            </div>
          </Link>
          
          <Link
            to="/calendar"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CalendarIcon className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Calendar</p>
              <p className="text-sm text-gray-500">Check upcoming interviews</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;