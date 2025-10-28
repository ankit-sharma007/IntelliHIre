import axios, { AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  User, 
  Job, 
  Application, 
  Settings,
  LoginCredentials,
  RegisterData,
  JobFilters,
  ApplicationFilters,
  UserFilters,
  PaginationInfo
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> =>
    api.post('/auth/login', credentials).then(res => res.data),
  
  register: (data: RegisterData): Promise<ApiResponse<{ token: string; user: User }>> =>
    api.post('/auth/register', data).then(res => res.data),
  
  getProfile: (): Promise<ApiResponse<{ user: User }>> =>
    api.get('/auth/me').then(res => res.data),
  
  updateProfile: (data: Partial<User>): Promise<ApiResponse<{ user: User }>> =>
    api.put('/auth/profile', data).then(res => res.data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> =>
    api.put('/auth/change-password', data).then(res => res.data),
  
  logout: (): Promise<ApiResponse> =>
    api.post('/auth/logout').then(res => res.data),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params?: JobFilters & { page?: number; limit?: number }): Promise<ApiResponse<{ jobs: Job[]; pagination: PaginationInfo }>> =>
    api.get('/jobs', { params }).then(res => res.data),
  
  getJob: (id: string): Promise<ApiResponse<{ job: Job; hasApplied?: boolean }>> =>
    api.get(`/jobs/${id}`).then(res => res.data),
  
  createJob: (data: Partial<Job>): Promise<ApiResponse<{ job: Job }>> =>
    api.post('/jobs', data).then(res => res.data),
  
  updateJob: (id: string, data: Partial<Job>): Promise<ApiResponse<{ job: Job }>> =>
    api.put(`/jobs/${id}`, data).then(res => res.data),
  
  deleteJob: (id: string): Promise<ApiResponse> =>
    api.delete(`/jobs/${id}`).then(res => res.data),
  
  updateJobStatus: (id: string, status: string): Promise<ApiResponse<{ job: Job }>> =>
    api.put(`/jobs/${id}/status`, { status }).then(res => res.data),
  
  getJobApplications: (id: string): Promise<ApiResponse<{ job: Partial<Job>; applications: Application[]; count: number }>> =>
    api.get(`/jobs/${id}/applications`).then(res => res.data),
  
  getMyJobs: (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ jobs: Job[]; pagination: PaginationInfo }>> =>
    api.get('/jobs/my/posted', { params }).then(res => res.data),
  
  getJobStats: (): Promise<ApiResponse<any>> =>
    api.get('/jobs/stats').then(res => res.data),
};

// Applications API
export const applicationsAPI = {
  getApplications: (params?: ApplicationFilters & { page?: number; limit?: number }): Promise<ApiResponse<{ applications: Application[]; pagination: PaginationInfo }>> =>
    api.get('/applications', { params }).then(res => res.data),
  
  getApplication: (id: string): Promise<ApiResponse<{ application: Application }>> =>
    api.get(`/applications/${id}`).then(res => res.data),
  
  createApplication: (data: { jobId: string; coverLetter?: string; expectedSalary?: { amount: number; currency: string }; availabilityDate?: string; noticePeriod?: string }): Promise<ApiResponse<{ application: Application }>> =>
    api.post('/applications', data).then(res => res.data),
  
  updateApplicationStatus: (id: string, status: string, reason?: string): Promise<ApiResponse<{ application: Application }>> =>
    api.put(`/applications/${id}/status`, { status, reason }).then(res => res.data),
  
  addHRNote: (id: string, note: string, isPrivate?: boolean): Promise<ApiResponse<{ application: Application }>> =>
    api.post(`/applications/${id}/notes`, { note, isPrivate }).then(res => res.data),
  
  withdrawApplication: (id: string): Promise<ApiResponse<{ application: Application }>> =>
    api.put(`/applications/${id}/withdraw`).then(res => res.data),
  
  getMyApplications: (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ applications: Application[]; pagination: PaginationInfo }>> =>
    api.get('/applications/my/applications', { params }).then(res => res.data),
  
  getApplicationStats: (): Promise<ApiResponse<any>> =>
    api.get('/applications/stats').then(res => res.data),
};

// Interview API
export const interviewAPI = {
  getInterview: (applicationId: string): Promise<ApiResponse<any>> =>
    api.get(`/interviews/application/${applicationId}`).then(res => res.data),
  
  submitAnswer: (applicationId: string, data: { questionId: string; answer: string }): Promise<ApiResponse<any>> =>
    api.post(`/interviews/application/${applicationId}/answer`, data).then(res => res.data),
  
  generateReport: (applicationId: string): Promise<ApiResponse<any>> =>
    api.post(`/interviews/application/${applicationId}/generate-report`).then(res => res.data),
  
  getReport: (applicationId: string): Promise<ApiResponse<any>> =>
    api.get(`/interviews/application/${applicationId}/report`).then(res => res.data),
  
  generateQuestions: (jobId: string, questionCount?: number): Promise<ApiResponse<any>> =>
    api.post(`/interviews/job/${jobId}/generate-questions`, { questionCount }).then(res => res.data),
};

// Users API
export const usersAPI = {
  getUsers: (params?: UserFilters & { page?: number; limit?: number }): Promise<ApiResponse<{ users: User[]; pagination: PaginationInfo }>> =>
    api.get('/users', { params }).then(res => res.data),
  
  getUser: (id: string): Promise<ApiResponse<{ user: User }>> =>
    api.get(`/users/${id}`).then(res => res.data),
  
  updateUser: (id: string, data: Partial<User>): Promise<ApiResponse<{ user: User }>> =>
    api.put(`/users/${id}`, data).then(res => res.data),
  
  deleteUser: (id: string): Promise<ApiResponse> =>
    api.delete(`/users/${id}`).then(res => res.data),
  
  activateUser: (id: string): Promise<ApiResponse<{ user: User }>> =>
    api.put(`/users/${id}/activate`).then(res => res.data),
  
  getUsersByRole: (role: string): Promise<ApiResponse<{ users: User[]; count: number }>> =>
    api.get(`/users/role/${role}`).then(res => res.data),
  
  changeUserRole: (id: string, role: string): Promise<ApiResponse<{ user: User }>> =>
    api.put(`/users/${id}/role`, { role }).then(res => res.data),
  
  getUserStats: (): Promise<ApiResponse<any>> =>
    api.get('/users/stats').then(res => res.data),
};

// Settings API
export const settingsAPI = {
  getSettings: (): Promise<ApiResponse<{ settings: Settings }>> =>
    api.get('/settings').then(res => res.data),
  
  updateAISettings: (data: { openRouterApiKey: string; modelName: string }): Promise<ApiResponse<any>> =>
    api.put('/settings/ai', data).then(res => res.data),
  
  testAIConnection: (): Promise<ApiResponse<any>> =>
    api.post('/settings/ai/test').then(res => res.data),
  
  updateInterviewSettings: (data: any): Promise<ApiResponse<any>> =>
    api.put('/settings/interview', data).then(res => res.data),
  
  updateApplicationSettings: (data: any): Promise<ApiResponse<any>> =>
    api.put('/settings/application', data).then(res => res.data),
  
  updateSystemSettings: (data: any): Promise<ApiResponse<any>> =>
    api.put('/settings/system', data).then(res => res.data),
  
  updateSecuritySettings: (data: any): Promise<ApiResponse<any>> =>
    api.put('/settings/security', data).then(res => res.data),
  
  getPublicSettings: (): Promise<ApiResponse<{ settings: any }>> =>
    api.get('/settings/public').then(res => res.data),
};

// Roles API
export const rolesAPI = {
  getRoles: (): Promise<ApiResponse<{ roles: any[] }>> =>
    api.get('/roles').then(res => res.data),
  
  getPermissions: (): Promise<ApiResponse<{ permissions: any[] }>> =>
    api.get('/roles/permissions').then(res => res.data),
  
  createRole: (data: any): Promise<ApiResponse<{ role: any }>> =>
    api.post('/roles', data).then(res => res.data),
  
  updateRole: (id: string, data: any): Promise<ApiResponse<{ role: any }>> =>
    api.put(`/roles/${id}`, data).then(res => res.data),
  
  deleteRole: (id: string): Promise<ApiResponse> =>
    api.delete(`/roles/${id}`).then(res => res.data),
};

// Activity API
export const activityAPI = {
  getActivities: (params?: any): Promise<ApiResponse<{ activities: any[]; pagination: any }>> =>
    api.get('/activity', { params }).then(res => res.data),
  
  getActivityStats: (timeframe?: string): Promise<ApiResponse<any>> =>
    api.get('/activity/stats', { params: { timeframe } }).then(res => res.data),
  
  getSessions: (): Promise<ApiResponse<{ sessions: any[] }>> =>
    api.get('/activity/sessions').then(res => res.data),
  
  logActivity: (data: any): Promise<ApiResponse<{ activity: any }>> =>
    api.post('/activity/log', data).then(res => res.data),
  
  cleanupLogs: (days?: number): Promise<ApiResponse<any>> =>
    api.delete('/activity/cleanup', { params: { days } }).then(res => res.data),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: any): Promise<ApiResponse<{ notifications: any[]; pagination: any }>> =>
    api.get('/notifications', { params }).then(res => res.data),
  
  getUnreadCount: (): Promise<ApiResponse<{ unreadCount: number; recentNotifications: any[] }>> =>
    api.get('/notifications/unread').then(res => res.data),
  
  createNotification: (data: any): Promise<ApiResponse<{ notification: any }>> =>
    api.post('/notifications', data).then(res => res.data),
  
  broadcastNotification: (data: any): Promise<ApiResponse<{ notificationCount: number }>> =>
    api.post('/notifications/broadcast', data).then(res => res.data),
  
  markAsRead: (id: string): Promise<ApiResponse<{ notification: any }>> =>
    api.put(`/notifications/${id}/read`).then(res => res.data),
  
  markAllAsRead: (): Promise<ApiResponse<{ markedCount: number }>> =>
    api.put('/notifications/read-all').then(res => res.data),
  
  bulkMarkAsRead: (notificationIds: string[]): Promise<ApiResponse<{ markedCount: number }>> =>
    api.put('/notifications/bulk-read', { notificationIds }).then(res => res.data),
  
  deleteNotification: (id: string): Promise<ApiResponse> =>
    api.delete(`/notifications/${id}`).then(res => res.data),
  
  cleanupNotifications: (days?: number): Promise<ApiResponse<any>> =>
    api.delete('/notifications/cleanup', { params: { days } }).then(res => res.data),
  
  getNotificationStats: (): Promise<ApiResponse<any>> =>
    api.get('/notifications/admin/stats').then(res => res.data),
};

// Enhanced Users API with new endpoints
export const enhancedUsersAPI = {
  ...usersAPI,
  
  bulkAction: (action: string, userIds: string[]): Promise<ApiResponse<{ affectedCount: number }>> =>
    api.post('/users/bulk', { action, userIds }).then(res => res.data),
  
  getUserActivity: (id: string, params?: any): Promise<ApiResponse<{ activities: any[]; pagination: any }>> =>
    api.get(`/users/${id}/activity`, { params }).then(res => res.data),
  
  updateUserSession: (id: string, sessionData: any): Promise<ApiResponse> =>
    api.post(`/users/${id}/session`, sessionData).then(res => res.data),
  
  createUser: (data: any): Promise<ApiResponse<{ user: any }>> =>
    api.post('/users', data).then(res => res.data),
  
  getUsersWithPagination: (params?: any): Promise<ApiResponse<{ users: any[]; totalPages: number; currentPage: number; total: number }>> =>
    api.get('/users', { params }).then(res => res.data),
  
  getUserWithDetails: (id: string): Promise<ApiResponse<any>> =>
    api.get(`/users/${id}`).then(res => res.data),
};

export default api;