import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSimpleNotifications } from '../UI/SimpleNotification';
import ClickableUserProfile from '../UI/ClickableUserProfile';
import { useChat } from '../../contexts/ChatContext';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  CommandLineIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

interface ModernHeaderProps {
  onMenuClick: () => void;
  pageTitle: string;
  onCommandPalette: () => void;
  onQuickActions: () => void;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  onMenuClick,
  pageTitle,
  onCommandPalette,
  onQuickActions,
}) => {
  const { user, logout } = useAuth();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { success } = useSimpleNotifications();
  const { startChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search when shown
  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      success(`Searching for: ${searchQuery}`);
      // Implement global search functionality
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
    success(`Theme changed to ${availableThemes[themeName].name}`);
  };

  const notifications = [
    { id: 1, title: 'New Application', message: 'John Doe applied for Senior Developer', time: '2m ago', unread: true },
    { id: 2, title: 'Interview Scheduled', message: 'Interview with Jane Smith at 3 PM', time: '1h ago', unread: true },
    { id: 3, title: 'Application Reviewed', message: 'Mike Johnson\'s application was reviewed', time: '3h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              {showSearch ? (
                <form onSubmit={handleSearch} className="relative">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery.trim()) {
                        setShowSearch(false);
                      }
                    }}
                    placeholder="Search jobs, candidates, applications..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Search...</span>
                  <div className="ml-auto flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
                      ⌘
                    </kbd>
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
                      K
                    </kbd>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <button
              onClick={onCommandPalette}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Command Palette (⌘K)"
            >
              <CommandLineIcon className="h-5 w-5 text-gray-600" />
            </button>

            {/* Theme Switcher */}
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                {currentTheme.name === 'Dark' ? (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                ) : (
                  <SunIcon className="h-5 w-5 text-gray-600" />
                )}
              </Menu.Button>
              
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
                  <div className="py-1">
                    {Object.entries(availableThemes).map(([key, theme]) => (
                      <Menu.Item key={key}>
                        {({ active }) => (
                          <button
                            onClick={() => handleThemeChange(key)}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            <div
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: theme.colors.primary }}
                            />
                            {theme.name}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Notifications */}
            <Menu as="div" className="relative">
              <Menu.Button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <BellIcon className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Menu.Button>
              
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <Menu.Item key={notification.id}>
                        {({ active }) => (
                          <div
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } px-4 py-3 border-b border-gray-100 last:border-b-0`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-500 font-medium">
                      View all notifications
                    </button>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* User Profile & Menu */}
            <div className="flex items-center space-x-2">
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
                  size="sm"
                  showName={false}
                  showRole={false}
                  showStatus={false}
                  onStartChat={startChat}
                  className="!p-1"
                />
              )}
              
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </Menu.Button>
              
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/profile"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <UserIcon className="h-4 w-4 mr-3" />
                          Profile
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/settings"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <CogIcon className="h-4 w-4 mr-3" />
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-100 my-1" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;