import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useRealTime } from '../../contexts/RealTimeContext';
import ClickableUserProfile from '../UI/ClickableUserProfile';
import { useChat } from '../../contexts/ChatContext';
import {
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  UserIcon,
  XMarkIcon,
  CommandLineIcon,
  BoltIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';

interface ModernSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCommandPalette: () => void;
  onQuickActions: () => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ 
  open, 
  setOpen, 
  onCommandPalette, 
  onQuickActions 
}) => {
  const { user, hasRole } = useAuth();
  const { currentTheme, preferences } = useTheme();
  const { isConnected, onlineUsers } = useRealTime();
  const { startChat } = useChat();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Applications', href: '/applications', icon: DocumentTextIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Messages', href: '/messages', icon: EnvelopeIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon, roles: ['admin', 'hr'] },
    { name: 'Talent Pool', href: '/talent-pool', icon: UserGroupIcon, roles: ['admin', 'hr'] },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, roles: ['admin', 'hr'] },
    { 
      name: 'Users', 
      href: '/users', 
      icon: UsersIcon, 
      roles: ['admin', 'hr'],
      children: [
        { name: 'All Users', href: '/users', icon: UsersIcon, roles: ['admin', 'hr'] },
        { name: 'Roles & Permissions', href: '/users/roles', icon: ShieldCheckIcon, roles: ['admin'] },
        { name: 'Activity Monitor', href: '/users/activity', icon: ClockIcon, roles: ['admin'] },
      ]
    },
    { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['admin'] },
    { name: 'Profile', href: '/profile', icon: UserIcon, roles: ['admin', 'hr', 'candidate'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.some(role => hasRole(role))
  ).map(item => ({
    ...item,
    children: item.children?.filter(child => 
      child.roles.some(role => hasRole(role))
    )
  }));

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const quickActions = [
    { name: 'Command Palette', shortcut: '⌘K', action: onCommandPalette, icon: CommandLineIcon },
    { name: 'Quick Actions', shortcut: '⌘J', action: onQuickActions, icon: BoltIcon },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      <Transition
        show={open}
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div 
          className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      </Transition>

      {/* Sidebar */}
      <Transition
        show={open || window.innerWidth >= 1024}
        enter="transition ease-in-out duration-300 transform"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <div className={`fixed inset-y-0 left-0 z-50 ${collapsed ? 'w-20' : 'w-72'} transform transition-all duration-300 ease-in-out lg:translate-x-0`}>
          {/* Sidebar Background */}
          <div className="flex h-full flex-col overflow-hidden bg-white shadow-xl border-r border-gray-200">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
              {!collapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Hiring Platform</h1>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className="text-xs text-gray-500">{isConnected ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bars3Icon className="h-4 w-4 text-gray-500" />
                </button>
                
                <button
                  onClick={() => setOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            {!collapsed && (
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.name}
                      onClick={action.action}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <action.icon className="h-4 w-4" />
                      <span className="hidden sm:block">{action.shortcut}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                  const isExpanded = expandedItems.includes(item.name);
                  const hasChildren = item.children && item.children.length > 0;
                  
                  return (
                    <div key={item.name}>
                      {hasChildren ? (
                        <button
                          onClick={() => toggleExpanded(item.name)}
                          className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <item.icon
                            className={`h-5 w-5 flex-shrink-0 ${
                              collapsed ? 'mx-auto' : 'mr-3'
                            } ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}
                          />
                          {!collapsed && (
                            <>
                              <span className="truncate flex-1 text-left">{item.name}</span>
                              {isExpanded ? (
                                <ChevronDownIcon className="h-4 w-4 ml-2" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 ml-2" />
                              )}
                            </>
                          )}
                        </button>
                      ) : (
                        <NavLink
                          to={item.href}
                          className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          <item.icon
                            className={`h-5 w-5 flex-shrink-0 ${
                              collapsed ? 'mx-auto' : 'mr-3'
                            } ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}
                          />
                          {!collapsed && (
                            <span className="truncate">{item.name}</span>
                          )}
                          
                          {!collapsed && isActive && (
                            <div className="ml-auto">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </NavLink>
                      )}
                      
                      {/* Submenu */}
                      {hasChildren && isExpanded && !collapsed && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children?.map((child) => {
                            const childIsActive = location.pathname === child.href;
                            return (
                              <NavLink
                                key={child.name}
                                to={child.href}
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                  childIsActive
                                    ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                                onClick={() => setOpen(false)}
                              >
                                <child.icon
                                  className={`h-4 w-4 flex-shrink-0 mr-3 ${
                                    childIsActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                  }`}
                                />
                                <span className="truncate">{child.name}</span>
                                
                                {childIsActive && (
                                  <div className="ml-auto">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  </div>
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* User Profile */}
            <div className="border-t border-gray-200 p-2">
              {user && (
                <ClickableUserProfile
                  user={{
                    id: (user as any).id || (user as any)._id || 'current-user',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    fullName: user.fullName,
                    email: user.email || '',
                    role: user.role || 'candidate',
                    status: 'active',
                    avatar: (user as any).avatar || (user as any).profilePicture,
                    department: (user as any).department,
                    jobTitle: (user as any).jobTitle,
                  }}
                  size="md"
                  showName={!collapsed}
                  showRole={!collapsed}
                  showStatus={true}
                  onStartChat={startChat}
                  className="w-full"
                />
              )}
              {!collapsed && onlineUsers.length > 0 && (
                <div className="flex items-center justify-center space-x-1 mt-2 text-xs text-green-600">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>{onlineUsers.length} online</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
};

export default ModernSidebar;