import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SimpleNotificationProvider } from './components/UI/SimpleNotification';
import { ThemeProvider } from './contexts/ThemeContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import { UserManagementProvider } from './contexts/UserManagementContext';
import { ChatProvider } from './contexts/ChatContext';
import ChatWidget from './components/UI/ChatWidget';
import ModernLayout from './components/Layout/ModernLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Jobs from './pages/Jobs/Jobs';
import JobDetails from './pages/Jobs/JobDetails';
import CreateJob from './pages/Jobs/CreateJob';
import Applications from './pages/Applications/Applications';
import ApplicationDetails from './pages/Applications/ApplicationDetails';
import Interview from './pages/Interview/Interview';
import InterviewReport from './pages/Interview/InterviewReport';
import Users from './pages/Users/Users';
import UserProfile from './pages/Users/UserProfile';
import RoleManagement from './pages/Users/RoleManagement';
import UserActivity from './pages/Users/UserActivity';
import Settings from './pages/Settings/Settings';
import EnhancedSettings from './pages/Settings/EnhancedSettings';
import Profile from './pages/Profile/Profile';
import Analytics from './pages/Analytics/Analytics';
import Calendar from './pages/Calendar/Calendar';
import TalentPool from './pages/TalentPool/TalentPool';
import Tasks from './pages/Tasks/Tasks';
import Messages from './pages/Messages/Messages';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import NotificationContainer from './components/Notifications/NotificationContainer';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SimpleNotificationProvider>
              <RealTimeProvider>
                <UserManagementProvider>
                  <ChatProvider>
                <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <ModernLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="jobs/create" element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <CreateJob />
                  </ProtectedRoute>
                } />
                <Route path="jobs/:id" element={<JobDetails />} />
                <Route path="applications" element={<Applications />} />
                <Route path="applications/:id" element={<ApplicationDetails />} />
                <Route path="interview/:applicationId" element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Interview />
                  </ProtectedRoute>
                } />
                <Route path="interview/:applicationId/report" element={<InterviewReport />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="messages" element={<Messages />} />
                <Route path="tasks" element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <Tasks />
                  </ProtectedRoute>
                } />
                <Route path="talent-pool" element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <TalentPool />
                  </ProtectedRoute>
                } />
                <Route path="analytics" element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <Users />
                  </ProtectedRoute>
                } />
                <Route path="users/:id" element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="users/roles" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <RoleManagement />
                  </ProtectedRoute>
                } />
                <Route path="users/activity" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserActivity />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EnhancedSettings />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <NotificationContainer />
            <ChatWidget />
                </div>
                  </ChatProvider>
                </UserManagementProvider>
              </RealTimeProvider>
            </SimpleNotificationProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;