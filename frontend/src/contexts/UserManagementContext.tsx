import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { enhancedUsersAPI, rolesAPI, activityAPI } from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  role: 'admin' | 'hr' | 'candidate' | 'interviewer';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  avatar?: string;
  department?: string;
  jobTitle?: string;
  phone?: string;
  location?: string;
  bio?: string;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  isSystem: boolean;
  userCount: number;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  details: string;
  timestamp: string;
  category: 'authentication' | 'user_management' | 'system' | 'data' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  location?: string;
}

interface UserManagementContextType {
  // Users
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: (params?: any) => Promise<void>;
  createUser: (userData: any) => Promise<void>;
  updateUser: (id: string, userData: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  bulkAction: (action: string, userIds: string[]) => Promise<void>;
  
  // Roles
  roles: Role[];
  permissions: any[];
  fetchRoles: () => Promise<void>;
  createRole: (roleData: any) => Promise<void>;
  updateRole: (id: string, roleData: any) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  
  // Activity
  activities: ActivityLog[];
  fetchActivities: (params?: any) => Promise<void>;
  
  // Stats
  userStats: any;
  fetchUserStats: () => Promise<void>;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

interface UserManagementProviderProps {
  children: ReactNode;
}

export const UserManagementProvider: React.FC<UserManagementProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users with optional parameters
  const fetchUsers = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await enhancedUsersAPI.getUsersWithPagination(params);
      if (response.success && response.data) {
        setUsers(response.data.users || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await enhancedUsersAPI.createUser(userData);
      if (response.success && response.data?.user) {
        setUsers(prev => [...prev, response.data!.user]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (id: string, userData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await enhancedUsersAPI.updateUser(id, userData);
      if (response.success && response.data?.user) {
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...response.data!.user } : user
        ));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await enhancedUsersAPI.deleteUser(id);
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk action on users
  const bulkAction = async (action: string, userIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await enhancedUsersAPI.bulkAction(action, userIds);
      if (response.success) {
        // Refresh users after bulk action
        await fetchUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to perform bulk action');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setError(null);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        rolesAPI.getRoles(),
        rolesAPI.getPermissions()
      ]);
      
      if (rolesResponse.success && rolesResponse.data) {
        setRoles(rolesResponse.data.roles || []);
      }
      if (permissionsResponse.success && permissionsResponse.data) {
        setPermissions(permissionsResponse.data.permissions || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles');
      console.error('Error fetching roles:', err);
    }
  };

  // Create role
  const createRole = async (roleData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rolesAPI.createRole(roleData);
      if (response.success && response.data?.role) {
        setRoles(prev => [...prev, response.data!.role]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update role
  const updateRole = async (id: string, roleData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rolesAPI.updateRole(id, roleData);
      if (response.success && response.data?.role) {
        setRoles(prev => prev.map(role => 
          role.id === id ? { ...role, ...response.data!.role } : role
        ));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete role
  const deleteRole = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rolesAPI.deleteRole(id);
      if (response.success) {
        setRoles(prev => prev.filter(role => role.id !== id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities
  const fetchActivities = async (params?: any) => {
    try {
      setError(null);
      const response = await activityAPI.getActivities(params);
      if (response.success && response.data) {
        setActivities(response.data.activities || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activities');
      console.error('Error fetching activities:', err);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      setError(null);
      const response = await enhancedUsersAPI.getUserStats();
      if (response.success && response.data) {
        setUserStats(response.data || {});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user stats');
      console.error('Error fetching user stats:', err);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchUserStats();
  }, []);

  const value: UserManagementContextType = {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkAction,
    roles,
    permissions,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    activities,
    fetchActivities,
    userStats,
    fetchUserStats,
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = (): UserManagementContextType => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};

export default UserManagementContext;