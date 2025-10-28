import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  EyeIcon,
  FunnelIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { DataTable } from '../../components/UI/EnhancedComponents';
import { useDebounce } from '../../hooks/useAdvancedHooks';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  sessionId: string;
  category: 'authentication' | 'user_management' | 'system' | 'data' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  lastActivity: string;
  ipAddress: string;
  device: string;
  browser: string;
  location?: string;
  isActive: boolean;
  duration: number;
}

const UserActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [dateRange, setDateRange] = useState('today');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Mock data - replace with API calls
    const mockActivities: ActivityLog[] = [
      {
        id: '1',
        userId: '1',
        userName: 'John Smith',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        action: 'User Login',
        details: 'Successful login from Chrome browser',
        timestamp: '2024-01-15T10:30:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, NY',
        sessionId: 'sess_123',
        category: 'authentication',
        severity: 'low',
      },
      {
        id: '2',
        userId: '2',
        userName: 'Sarah Johnson',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        action: 'User Created',
        details: 'Created new user: Mike Chen',
        timestamp: '2024-01-15T10:25:00Z',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'San Francisco, CA',
        sessionId: 'sess_124',
        category: 'user_management',
        severity: 'medium',
      },
      {
        id: '3',
        userId: '1',
        userName: 'John Smith',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        action: 'Settings Updated',
        details: 'Updated system notification settings',
        timestamp: '2024-01-15T10:20:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, NY',
        sessionId: 'sess_123',
        category: 'system',
        severity: 'low',
      },
      {
        id: '4',
        userId: '3',
        userName: 'Mike Chen',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        action: 'Failed Login Attempt',
        details: 'Multiple failed login attempts detected',
        timestamp: '2024-01-15T10:15:00Z',
        ipAddress: '203.0.113.1',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        location: 'Unknown',
        sessionId: '',
        category: 'security',
        severity: 'high',
      },
      {
        id: '5',
        userId: '2',
        userName: 'Sarah Johnson',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        action: 'Data Export',
        details: 'Exported user data to CSV',
        timestamp: '2024-01-15T10:10:00Z',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'San Francisco, CA',
        sessionId: 'sess_124',
        category: 'data',
        severity: 'medium',
      },
    ];

    const mockSessions: UserSession[] = [
      {
        id: 'sess_123',
        userId: '1',
        userName: 'John Smith',
        startTime: '2024-01-15T10:30:00Z',
        lastActivity: '2024-01-15T11:45:00Z',
        ipAddress: '192.168.1.100',
        device: 'Desktop',
        browser: 'Chrome 120.0',
        location: 'New York, NY',
        isActive: true,
        duration: 75,
      },
      {
        id: 'sess_124',
        userId: '2',
        userName: 'Sarah Johnson',
        startTime: '2024-01-15T09:15:00Z',
        lastActivity: '2024-01-15T11:30:00Z',
        ipAddress: '192.168.1.101',
        device: 'MacBook Pro',
        browser: 'Safari 17.0',
        location: 'San Francisco, CA',
        isActive: true,
        duration: 135,
      },
      {
        id: 'sess_125',
        userId: '3',
        userName: 'Mike Chen',
        startTime: '2024-01-15T08:00:00Z',
        lastActivity: '2024-01-15T10:00:00Z',
        ipAddress: '192.168.1.102',
        device: 'iPhone',
        browser: 'Safari Mobile',
        location: 'Seattle, WA',
        isActive: false,
        duration: 120,
      },
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setSessions(mockSessions);
      setLoading(false);
    }, 1000);
  }, [setActivities]);

  const filteredActivities = activities.filter((activity: ActivityLog) => {
    const matchesSearch = activity.userName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || activity.category === selectedCategory;
    const matchesSeverity = !selectedSeverity || activity.severity === selectedSeverity;
    
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication':
        return 'bg-blue-100 text-blue-800';
      case 'user_management':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-indigo-100 text-indigo-800';
      case 'data':
        return 'bg-green-100 text-green-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('mobile')) {
      return DevicePhoneMobileIcon;
    }
    return ComputerDesktopIcon;
  };

  const activityColumns = [
    {
      key: 'user',
      label: 'User',
      render: (value: any, activity: ActivityLog) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {activity.userAvatar ? (
              <img className="h-8 w-8 rounded-full object-cover" src={activity.userAvatar} alt={activity.userName} />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-600" />
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
            <div className="text-sm text-gray-500">{activity.ipAddress}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (value: any, activity: ActivityLog) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{activity.action}</div>
          <div className="text-sm text-gray-500">{activity.details}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: any, activity: ActivityLog) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
          {activity.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value: any, activity: ActivityLog) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(activity.severity)}`}>
          {activity.severity.charAt(0).toUpperCase() + activity.severity.slice(1)}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (value: any, activity: ActivityLog) => (
        <div className="text-sm text-gray-900">
          {new Date(activity.timestamp).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: any, activity: ActivityLog) => (
        <div className="flex items-center space-x-1">
          <GlobeAltIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{activity.location || 'Unknown'}</span>
        </div>
      ),
    },
  ];

  const sessionColumns = [
    {
      key: 'user',
      label: 'User',
      render: (value: any, session: UserSession) => (
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-gray-900">{session.userName}</div>
        </div>
      ),
    },
    {
      key: 'device',
      label: 'Device',
      render: (value: any, session: UserSession) => {
        const DeviceIcon = getDeviceIcon(session.device);
        return (
          <div className="flex items-center space-x-2">
            <DeviceIcon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm text-gray-900">{session.device}</div>
              <div className="text-sm text-gray-500">{session.browser}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, session: UserSession) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {session.isActive ? 'Active' : 'Ended'}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (value: any, session: UserSession) => (
        <div className="text-sm text-gray-900">
          {Math.floor(session.duration / 60)}h {session.duration % 60}m
        </div>
      ),
    },
    {
      key: 'startTime',
      label: 'Started',
      render: (value: any, session: UserSession) => (
        <div className="text-sm text-gray-900">
          {new Date(session.startTime).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      render: (value: any, session: UserSession) => (
        <div className="text-sm text-gray-900">
          {new Date(session.lastActivity).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: any, session: UserSession) => (
        <div className="flex items-center space-x-1">
          <GlobeAltIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{session.location || 'Unknown'}</span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Activity Monitor</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track user activities, sessions, and security events
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Activities</dt>
                  <dd className="text-lg font-medium text-gray-900">{activities.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sessions.filter(s => s.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Security Events</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activities.filter((a: ActivityLog) => a.category === 'security').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Session</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length)}m
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'activity', name: 'Activity Log', icon: ClockIcon },
              { id: 'sessions', name: 'User Sessions', icon: ComputerDesktopIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'activity' && (
          <div className="p-6">
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  <option value="">All Categories</option>
                  <option value="authentication">Authentication</option>
                  <option value="user_management">User Management</option>
                  <option value="system">System</option>
                  <option value="data">Data</option>
                  <option value="security">Security</option>
                </select>
                
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <DataTable
              data={filteredActivities}
              columns={activityColumns}
              emptyMessage="No activities found"
            />
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="p-6">
            <DataTable
              data={sessions}
              columns={sessionColumns}
              emptyMessage="No sessions found"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivity;