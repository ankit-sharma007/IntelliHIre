import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { jobsAPI, applicationsAPI, usersAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import CandidateDashboard from '../Candidate/CandidateDashboard';
import ClickableUserProfile from '../../components/UI/ClickableUserProfile';
import { useChat } from '../../contexts/ChatContext';

interface DashboardStats {
  totalJobs?: number;
  activeJobs?: number;
  totalApplications?: number;
  aiInterviewsCompleted?: number;
  totalUsers?: number;
  activeUsers?: number;
}

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { startChat } = useChat();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats based on user role
        const promises = [];
        
        if (hasRole(['admin', 'hr'])) {
          promises.push(jobsAPI.getJobStats());
          promises.push(applicationsAPI.getApplicationStats());
          
          if (hasRole('admin')) {
            promises.push(usersAPI.getUserStats());
          }
        }
        
        // Fetch recent jobs
        promises.push(jobsAPI.getJobs({ limit: 5 }));
        
        // Fetch recent applications
        if (hasRole('candidate')) {
          promises.push(applicationsAPI.getMyApplications({ limit: 5 }));
        } else {
          promises.push(applicationsAPI.getApplications({ limit: 5 }));
        }

        const results = await Promise.allSettled(promises);
        
        let statsData: DashboardStats = {};
        let jobsData: any[] = [];
        let applicationsData: any[] = [];
        
        let resultIndex = 0;
        
        if (hasRole(['admin', 'hr'])) {
          // Job stats
          if (results[resultIndex].status === 'fulfilled') {
            const jobStats = (results[resultIndex] as any).value.data;
            statsData.totalJobs = jobStats.totalJobs;
            statsData.activeJobs = jobStats.activeJobs;
          }
          resultIndex++;
          
          // Application stats
          if (results[resultIndex].status === 'fulfilled') {
            const appStats = (results[resultIndex] as any).value.data;
            statsData.totalApplications = appStats.totalApplications;
            statsData.aiInterviewsCompleted = appStats.aiInterviewsCompleted;
          }
          resultIndex++;
          
          // User stats (admin only)
          if (hasRole('admin')) {
            if (results[resultIndex].status === 'fulfilled') {
              const userStats = (results[resultIndex] as any).value.data;
              statsData.totalUsers = userStats.totalUsers;
              statsData.activeUsers = userStats.activeUsers;
            }
            resultIndex++;
          }
        }
        
        // Recent jobs
        if (results[resultIndex].status === 'fulfilled') {
          jobsData = (results[resultIndex] as any).value.data.jobs || [];
        }
        resultIndex++;
        
        // Recent applications
        if (results[resultIndex].status === 'fulfilled') {
          applicationsData = (results[resultIndex] as any).value.data.applications || [];
        }
        
        setStats(statsData);
        setRecentJobs(jobsData);
        setRecentApplications(applicationsData);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [hasRole]);

  // Show candidate-specific dashboard for candidates
  if (hasRole('candidate')) {
    return <CandidateDashboard />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'badge-success',
      pending: 'badge-warning',
      'under-review': 'badge-primary',
      'ai-interview-completed': 'badge-primary',
      accepted: 'badge-success',
      rejected: 'badge-danger',
      withdrawn: 'badge-gray',
      draft: 'badge-gray',
      paused: 'badge-warning',
      closed: 'badge-danger',
    };
    
    return statusClasses[status as keyof typeof statusClasses] || 'badge-gray';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-levitate"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-levitate" style={{ animationDelay: '2s' }}></div>
        
        {/* Content */}
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center animate-gradient neon-glow">
                  <span className="text-3xl animate-wave">👋</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 animate-slide-in-left">
                  {getGreeting()}, {user?.firstName}!
                </h1>
                <p className="text-gray-300 text-xl animate-slide-in-right">
                  Welcome to your AI-powered hiring dashboard
                </p>
                <div className="flex items-center mt-3 space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-semibold">System Online</span>
                </div>
              </div>
            </div>
            
            {/* Time Display */}
            <div className="text-right animate-bounce-in">
              <div className="text-white/80 text-sm">Current Time</div>
              <div className="text-2xl font-mono text-white">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hasRole(['admin', 'hr']) && (
          <>
            <div className="group perspective-card animate-scale-in">
              <div className="card-3d glass-card rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 magnetic-hover relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 animate-rotate-slow"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 neon-glow">
                          <BriefcaseIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-1">Total Jobs</p>
                        <p className="text-4xl font-bold text-white mb-1 animate-glow">{stats.totalJobs || 0}</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <p className="text-sm text-green-400 font-semibold">{stats.activeJobs || 0} active positions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full animate-gradient"
                      style={{ width: `${Math.min(100, (stats.activeJobs || 0) * 10)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400">Job Activity Level</p>
                </div>
              </div>
            </div>

            <div className="group perspective-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="card-3d glass-card rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 magnetic-hover relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating Elements */}
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 animate-morphing"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 neon-glow">
                          <DocumentTextIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-1">Applications</p>
                        <p className="text-4xl font-bold text-white mb-1 animate-glow">{stats.totalApplications || 0}</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <p className="text-sm text-yellow-400 font-semibold">{stats.aiInterviewsCompleted || 0} AI interviews</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Interview Progress */}
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full animate-gradient"
                      style={{ width: `${Math.min(100, ((stats.aiInterviewsCompleted || 0) / Math.max(1, stats.totalApplications || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400">AI Interview Completion Rate</p>
                </div>
              </div>
            </div>
          </>
        )}

        {hasRole('admin') && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers || 0}</p>
                <p className="text-sm text-gray-600">{stats.activeUsers || 0} active</p>
              </div>
            </div>
          </div>
        )}

        {hasRole('candidate') && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{recentApplications.length}</p>
                <p className="text-sm text-gray-600">Recent submissions</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">AI Interviews</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.aiInterviewsCompleted || 0}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasRole(['admin', 'hr']) && (
            <Link
              to="/jobs/create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Post New Job</p>
                <p className="text-sm text-gray-500">Create a new job posting</p>
              </div>
            </Link>
          )}
          
          <Link
            to="/jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <EyeIcon className="h-6 w-6 text-success-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Browse Jobs</p>
              <p className="text-sm text-gray-500">View available positions</p>
            </div>
          </Link>
          
          <Link
            to="/applications"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="h-6 w-6 text-warning-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Applications</p>
              <p className="text-sm text-gray-500">Manage applications</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
            <Link to="/jobs" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.department} • {job.location}</p>
                  </div>
                  <span className={`badge ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent jobs</p>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/applications" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {application.job?.title || 'Job Title'}
                    </p>
                    {hasRole('candidate') ? (
                      <p className="text-xs text-gray-500">
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    ) : application.candidate ? (
                      <ClickableUserProfile
                        user={application.candidate}
                        size="xs"
                        showName={true}
                        showRole={false}
                        showStatus={false}
                        onStartChat={startChat}
                        className="!p-0 hover:!bg-transparent"
                      />
                    ) : (
                      <p className="text-xs text-gray-500">Candidate</p>
                    )}
                  </div>
                  <span className={`badge ${getStatusBadge(application.status)}`}>
                    {application.status.replace('-', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent applications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;