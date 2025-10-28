import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSimpleNotifications } from '../../components/UI/SimpleNotification';
import { useRealTime } from '../../contexts/RealTimeContext';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  EyeIcon,
  SpeakerWaveIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MoonIcon,
  SunIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { settingsAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { MultiSelect, Alert, Modal, ProgressBar } from '../../components/UI/EnhancedComponents';

const EnhancedSettings: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { 
    currentTheme, 
    availableThemes, 
    preferences, 
    setTheme, 
    updatePreferences, 
    resetPreferences,
    exportPreferences,
    importPreferences 
  } = useTheme();
  const { success, error, info } = useSimpleNotifications();
  const { isConnected, connectionStatus } = useRealTime();
  
  const [activeTab, setActiveTab] = useState('appearance');
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [aiSettings, setAiSettings] = useState({
    openRouterApiKey: '',
    modelName: 'openai/gpt-4o',
    temperature: 0.7,
    maxTokens: 2000,
  });

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'accessibility', name: 'Accessibility', icon: EyeIcon },
    { id: 'ai', name: 'AI Configuration', icon: SparklesIcon },
    { id: 'account', name: 'Account', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'system', name: 'System', icon: CogIcon },
  ];

  useEffect(() => {
    fetchAISettings();
  }, []);

  const fetchAISettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      if (response.success && response.data) {
        setAiSettings(prev => ({
          ...prev,
          modelName: response.data?.settings?.modelName || 'openai/gpt-4o',
        }));
      }
    } catch (err) {
      error('Failed to fetch AI settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSettings = () => {
    const data = exportPreferences();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hiring-platform-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Settings exported successfully');
  };

  const handleImportSettings = () => {
    if (importPreferences(importData)) {
      success('Settings imported successfully');
      setShowImportModal(false);
      setImportData('');
    } else {
      error('Failed to import settings. Please check the file format.');
    }
  };

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(availableThemes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                preferences.theme === key
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span className="font-medium text-gray-900">{theme.name}</span>
              </div>
              <div className="flex space-x-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.colors.background }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.colors.surface }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>
              {preferences.theme === key && (
                <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Size</h3>
        <div className="flex space-x-4">
          {(['small', 'medium', 'large'] as const).map(size => (
            <button
              key={size}
              onClick={() => updatePreferences({ fontSize: size })}
              className={`px-4 py-2 rounded-lg border ${
                preferences.fontSize === size
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className={size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Layout Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.compactMode}
              onChange={(e) => updatePreferences({ compactMode: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">Compact mode (reduce spacing)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.animations}
              onChange={(e) => updatePreferences({ animations: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">Enable animations</span>
          </label>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Layout</h3>
        <div className="flex space-x-4 mb-4">
          {(['grid', 'list'] as const).map(layout => (
            <button
              key={layout}
              onClick={() => updatePreferences({ 
                dashboard: { ...preferences.dashboard, layout } 
              })}
              className={`px-4 py-2 rounded-lg border ${
                preferences.dashboard.layout === layout
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {layout === 'grid' ? 'Grid View' : 'List View'}
            </button>
          ))}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dashboard Widgets
          </label>
          <MultiSelect
            options={[
              { value: 'stats', label: 'Statistics Overview' },
              { value: 'recent-jobs', label: 'Recent Jobs' },
              { value: 'recent-applications', label: 'Recent Applications' },
              { value: 'calendar', label: 'Calendar Events' },
              { value: 'tasks', label: 'Pending Tasks' },
              { value: 'messages', label: 'Recent Messages' },
              { value: 'analytics', label: 'Quick Analytics' },
            ]}
            selected={preferences.dashboard.widgets}
            onChange={(widgets) => updatePreferences({ 
              dashboard: { ...preferences.dashboard, widgets } 
            })}
            placeholder="Select dashboard widgets..."
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Desktop Notifications</span>
              <p className="text-xs text-gray-500">Show browser notifications for important updates</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.desktop}
              onChange={(e) => updatePreferences({
                notifications: { ...preferences.notifications, desktop: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              <p className="text-xs text-gray-500">Receive email updates for applications and interviews</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.email}
              onChange={(e) => updatePreferences({
                notifications: { ...preferences.notifications, email: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Sound Notifications</span>
              <p className="text-xs text-gray-500">Play sound for new notifications</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.sound}
              onChange={(e) => updatePreferences({
                notifications: { ...preferences.notifications, sound: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>

      {/* Real-time Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Updates</h3>
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Connection Status: {connectionStatus}
            </p>
            <p className="text-xs text-gray-500">
              {isConnected 
                ? 'You\'ll receive real-time updates for applications, messages, and more'
                : 'Real-time updates are currently unavailable'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility Options</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">High Contrast Mode</span>
              <p className="text-xs text-gray-500">Increase contrast for better visibility</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.accessibility.highContrast}
              onChange={(e) => updatePreferences({
                accessibility: { ...preferences.accessibility, highContrast: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Reduced Motion</span>
              <p className="text-xs text-gray-500">Minimize animations and transitions</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.accessibility.reducedMotion}
              onChange={(e) => updatePreferences({
                accessibility: { ...preferences.accessibility, reducedMotion: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Screen Reader Support</span>
              <p className="text-xs text-gray-500">Enhanced support for screen readers</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.accessibility.screenReader}
              onChange={(e) => updatePreferences({
                accessibility: { ...preferences.accessibility, screenReader: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-8">
      {/* AI Configuration */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={aiSettings.openRouterApiKey}
              onChange={(e) => setAiSettings(prev => ({ ...prev, openRouterApiKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your OpenRouter API key"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Model
            </label>
            <select
              value={aiSettings.modelName}
              onChange={(e) => setAiSettings(prev => ({ ...prev, modelName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="openai/gpt-4o">GPT-4 Omni (Recommended)</option>
              <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
              <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="anthropic/claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature: {aiSettings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={aiSettings.temperature}
              onChange={(e) => setAiSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Focused</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-8">
      {/* Profile Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              defaultValue={user?.firstName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              defaultValue={user?.lastName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue={user?.phone}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Account Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Role</span>
            <span className="text-sm text-gray-900 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Member Since</span>
            <span className="text-sm text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Last Login</span>
            <span className="text-sm text-gray-900">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button className="ml-4 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      {/* Password Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Authentication</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter current password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Current Session</p>
                <p className="text-xs text-gray-500">Windows • Chrome • Your current session</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Mobile Device</p>
                <p className="text-xs text-gray-500">iOS • Safari • Last active 2 hours ago</p>
              </div>
            </div>
            <button className="text-sm text-red-600 hover:text-red-800">
              Revoke
            </button>
          </div>
        </div>
        
        <button className="mt-4 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50">
          Sign Out All Other Sessions
        </button>
      </div>

      {/* Security Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Login Notifications</span>
              <p className="text-xs text-gray-500">Get notified when someone signs into your account</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Suspicious Activity Alerts</span>
              <p className="text-xs text-gray-500">Get alerts for unusual account activity</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Auto-lock Sessions</span>
              <p className="text-xs text-gray-500">Automatically sign out after 30 minutes of inactivity</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-8">
      {/* Import/Export */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Management</h3>
        <div className="flex space-x-4">
          <button
            onClick={handleExportSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export Settings</span>
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            <span>Import Settings</span>
          </button>
          
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
          >
            <span>Reset to Default</span>
          </button>
        </div>
      </div>

      {/* System Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform Version:</span>
            <span className="font-medium">2.0.1</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">User Role:</span>
            <span className="font-medium capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Theme:</span>
            <span className="font-medium">{currentTheme.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Real-time Status:</span>
            <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {connectionStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Settings</h1>
            <p className="text-gray-600">Customize your AI hiring platform experience</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'accessibility' && renderAccessibilityTab()}
            {activeTab === 'ai' && renderAITab()}
            {activeTab === 'account' && renderAccountTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'system' && renderSystemTab()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => success('Settings saved successfully!')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Settings"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Settings JSON Data
            </label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste your exported settings JSON here..."
            />
          </div>
          
          <Alert
            type="info"
            message="Import settings from a previously exported configuration file. This will overwrite your current settings."
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowImportModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImportSettings}
            disabled={!importData.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Settings
          </button>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Settings"
        size="sm"
      >
        <div className="space-y-4">
          <Alert
            type="warning"
            title="Warning"
            message="This will reset all your settings to their default values. This action cannot be undone."
          />
          
          <p className="text-sm text-gray-600">
            Are you sure you want to reset all settings to default? This will affect:
          </p>
          
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Theme and appearance settings</li>
            <li>Notification preferences</li>
            <li>Accessibility options</li>
            <li>Dashboard layout and widgets</li>
            <li>All other customizations</li>
          </ul>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowResetModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              resetPreferences();
              success('Settings reset to default');
              setShowResetModal(false);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reset Settings
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedSettings;