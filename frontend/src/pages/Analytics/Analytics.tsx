import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { AnalyticsData, JobPerformance, StatusDistribution } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Analytics: React.FC = () => {
  const { hasRole } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        jobMetrics: {
          totalJobs: 45,
          activeJobs: 23,
          jobsThisMonth: 8,
          avgApplicationsPerJob: 12.5,
          topPerformingJobs: [
            { jobId: '1', title: 'Senior React Developer', applications: 45, views: 234, conversionRate: 19.2 },
            { jobId: '2', title: 'Product Manager', applications: 38, views: 189, conversionRate: 20.1 },
            { jobId: '3', title: 'UX Designer', applications: 32, views: 156, conversionRate: 20.5 },
          ]
        },
        applicationMetrics: {
          totalApplications: 567,
          applicationsThisMonth: 89,
          avgTimeToHire: 18.5,
          conversionRate: 12.8,
          statusDistribution: [
            { status: 'pending', count: 45, percentage: 35.2 },
            { status: 'under-review', count: 32, percentage: 25.0 },
            { status: 'ai-interview-completed', count: 28, percentage: 21.9 },
            { status: 'accepted', count: 15, percentage: 11.7 },
            { status: 'rejected', count: 8, percentage: 6.2 },
          ]
        },
        candidateMetrics: {
          totalCandidates: 234,
          activeCandidates: 189,
          topSkills: [
            { skill: 'React', count: 89 },
            { skill: 'Node.js', count: 76 },
            { skill: 'Python', count: 65 },
            { skill: 'AWS', count: 54 },
            { skill: 'TypeScript', count: 48 },
          ],
          experienceDistribution: [
            { level: 'Entry (0-2 years)', count: 45 },
            { level: 'Mid (3-5 years)', count: 78 },
            { level: 'Senior (6-10 years)', count: 67 },
            { level: 'Lead (10+ years)', count: 44 },
          ]
        },
        aiMetrics: {
          totalInterviews: 156,
          avgScore: 7.2,
          passRate: 68.5,
          timesSaved: 312,
        }
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole(['admin', 'hr'])) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to view analytics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    );
  }

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your hiring process</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Jobs"
          value={analyticsData.jobMetrics.totalJobs}
          change={15.2}
          icon={BriefcaseIcon}
          color="bg-blue-500"
        />
        <MetricCard
          title="Total Applications"
          value={analyticsData.applicationMetrics.totalApplications}
          change={8.7}
          icon={DocumentTextIcon}
          color="bg-green-500"
        />
        <MetricCard
          title="Active Candidates"
          value={analyticsData.candidateMetrics.activeCandidates}
          change={12.3}
          icon={UsersIcon}
          color="bg-purple-500"
        />
        <MetricCard
          title="AI Interviews"
          value={analyticsData.aiMetrics.totalInterviews}
          change={25.6}
          icon={CpuChipIcon}
          color="bg-orange-500"
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Job Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Jobs</h3>
          <div className="space-y-4">
            {analyticsData.jobMetrics.topPerformingJobs.map((job, index) => (
              <div key={job.jobId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{job.title}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">{job.applications} applications</span>
                    <span className="text-sm text-gray-600">{job.views} views</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">{job.conversionRate}%</p>
                  <p className="text-xs text-gray-500">conversion rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
          <div className="space-y-3">
            {analyticsData.applicationMetrics.statusDistribution.map((status) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {status.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{status.count}</span>
                  <span className="text-sm font-medium text-gray-900">{status.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most In-Demand Skills</h3>
          <div className="space-y-3">
            {analyticsData.candidateMetrics.topSkills.map((skill, index) => (
              <div key={skill.skill} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(skill.count / analyticsData.candidateMetrics.topSkills[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{skill.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Interview Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{analyticsData.aiMetrics.avgScore}/10</p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{analyticsData.aiMetrics.passRate}%</p>
              <p className="text-sm text-gray-600">Pass Rate</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg col-span-2">
              <p className="text-2xl font-bold text-purple-600">{analyticsData.aiMetrics.timesSaved}h</p>
              <p className="text-sm text-gray-600">Time Saved This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <ClockIcon className="h-6 w-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Time to Hire</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analyticsData.applicationMetrics.avgTimeToHire} days</p>
          <p className="text-sm text-gray-600 mt-1">Average time from application to hire</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analyticsData.applicationMetrics.conversionRate}%</p>
          <p className="text-sm text-gray-600 mt-1">Applications to hires ratio</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <EyeIcon className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Avg Applications</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analyticsData.jobMetrics.avgApplicationsPerJob}</p>
          <p className="text-sm text-gray-600 mt-1">Per job posting</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;