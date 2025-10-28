import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useRealTime } from '../../contexts/RealTimeContext';
import ModernSidebar from './ModernSidebar';
import ModernHeader from './ModernHeader';
import CommandPalette from '../UI/CommandPalette';
import QuickActions from '../UI/QuickActions';
import { Transition } from '@headlessui/react';

const ModernLayout: React.FC = () => {
  const { user } = useAuth();
  const { preferences } = useTheme();
  const { isConnected } = useRealTime();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command/Ctrl + K for command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowCommandPalette(true);
      }
      
      // Command/Ctrl + J for quick actions
      if ((event.metaKey || event.ctrlKey) && event.key === 'j') {
        event.preventDefault();
        setShowQuickActions(true);
      }
      
      // Escape to close modals
      if (event.key === 'Escape') {
        setShowCommandPalette(false);
        setShowQuickActions(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/jobs': 'Jobs',
      '/applications': 'Applications',
      '/calendar': 'Calendar',
      '/messages': 'Messages',
      '/tasks': 'Tasks',
      '/talent-pool': 'Talent Pool',
      '/analytics': 'Analytics',
      '/users': 'User Management',
      '/settings': 'Settings',
      '/profile': 'Profile',
    };
    
    return titles[path] || 'AI Hiring Platform';
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${preferences.compactMode ? 'compact-mode' : ''}`}>
      {/* Sidebar */}
      <ModernSidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        onCommandPalette={() => setShowCommandPalette(true)}
        onQuickActions={() => setShowQuickActions(true)}
      />

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <ModernHeader 
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={getPageTitle()}
          onCommandPalette={() => setShowCommandPalette(true)}
          onQuickActions={() => setShowQuickActions(true)}
        />

        {/* Page Content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Transition
              appear
              show={true}
              enter="transition-all duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
            >
              <Outlet />
            </Transition>
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette 
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />

      {/* Quick Actions */}
      <QuickActions 
        open={showQuickActions}
        onClose={() => setShowQuickActions(false)}
      />

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-yellow-800">Reconnecting...</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button
          onClick={() => setShowQuickActions(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ModernLayout;