import React from 'react';
import {
  UsersIcon,
  SparklesIcon,
  ClockIcon,
  CheckIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const ComingSoonUsers: React.FC = () => {
  const upcomingFeatures = [
    {
      icon: UsersIcon,
      title: 'Advanced User Management',
      description: 'Comprehensive user profiles with role-based permissions and detailed activity tracking.',
      status: 'In Development',
      color: 'blue',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Security & Compliance',
      description: 'Advanced security features including audit logs, compliance reporting, and access controls.',
      status: 'Planned',
      color: 'green',
    },
    {
      icon: ChartBarIcon,
      title: 'User Analytics',
      description: 'Detailed analytics on user behavior, engagement metrics, and performance insights.',
      status: 'Planned',
      color: 'purple',
    },
    {
      icon: BellIcon,
      title: 'Smart Notifications',
      description: 'Intelligent notification system with customizable alerts and automated workflows.',
      status: 'In Development',
      color: 'orange',
    },
    {
      icon: CogIcon,
      title: 'Bulk Operations',
      description: 'Efficiently manage multiple users with bulk actions, imports, and automated processes.',
      status: 'Planned',
      color: 'indigo',
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Insights',
      description: 'Machine learning insights for user engagement, performance predictions, and recommendations.',
      status: 'Research',
      color: 'pink',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Development':
        return 'bg-blue-100 text-blue-800';
      case 'Planned':
        return 'bg-green-100 text-green-800';
      case 'Research':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeatureColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      pink: 'text-pink-600 bg-pink-100',
    };
    return colors[color as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100">
        <div className="relative">
          {/* Floating Icons */}
          <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-500 rounded-full opacity-10 animate-bounce"></div>
          <div className="absolute -top-2 -right-8 w-12 h-12 bg-purple-500 rounded-full opacity-10 animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-6 left-1/2 w-20 h-20 bg-indigo-500 rounded-full opacity-10 animate-bounce" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <UsersIcon className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced User Management
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              We're building something amazing! Our advanced user management system will revolutionize how you handle users, permissions, and analytics.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <ClockIcon className="h-5 w-5" />
              <span className="font-semibold">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We're Building</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our development team is working hard to create the most comprehensive user management system 
            for AI-powered hiring platforms. Here's what you can expect:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingFeatures.map((feature, index) => (
            <div
              key={index}
              className="relative p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getFeatureColor(feature.color)}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                      {feature.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Development Timeline</h2>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          <div className="space-y-8">
            <div className="relative flex items-center space-x-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                <CheckIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Phase 1: Foundation</h3>
                <p className="text-gray-600">Basic user management infrastructure and core features</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                  Completed
                </span>
              </div>
            </div>
            
            <div className="relative flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg relative z-10 animate-pulse">
                <CogIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Phase 2: Advanced Features</h3>
                <p className="text-gray-600">Role-based permissions, bulk operations, and security enhancements</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                  In Progress
                </span>
              </div>
            </div>
            
            <div className="relative flex items-center space-x-6">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center shadow-lg relative z-10">
                <SparklesIcon className="h-8 w-8 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Phase 3: AI Integration</h3>
                <p className="text-gray-600">AI-powered insights, recommendations, and automated workflows</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                  Planned
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stay Updated */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Want to be the first to know when these features are ready? We'll notify you as soon as 
          the advanced user management system is available.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          />
          <button className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Notify Me
          </button>
        </div>
      </div>

      {/* Current Basic Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Basic User Profiles</h3>
              <p className="text-gray-600 text-sm">View and manage basic user information and roles</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Role Management</h3>
              <p className="text-gray-600 text-sm">Assign and manage user roles (Admin, HR, Candidate)</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Activity Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor user login activity and basic engagement</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">User Authentication</h3>
              <p className="text-gray-600 text-sm">Secure login and session management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonUsers;