import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UsersIcon,
  CogIcon,
  UserIcon,
  ChartBarIcon,
  XMarkIcon,
  CalendarIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Applications', href: '/applications', icon: DocumentTextIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Messages', href: '/messages', icon: EnvelopeIcon, roles: ['admin', 'hr', 'candidate'] },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon, roles: ['admin', 'hr'] },
    { name: 'Talent Pool', href: '/talent-pool', icon: UserGroupIcon, roles: ['admin', 'hr'] },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, roles: ['admin', 'hr'] },
    { name: 'Users', href: '/users', icon: UsersIcon, roles: ['admin', 'hr'] },
    { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['admin'] },
    { name: 'Profile', href: '/profile', icon: UserIcon, roles: ['admin', 'hr', 'candidate'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-700 ease-in-out lg:translate-x-0 lg:static lg:inset-0 relative overflow-hidden
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-20 -left-10 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-levitate"></div>
        <div className="absolute bottom-20 -right-10 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-levitate" style={{ animationDelay: '3s' }}></div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-12 transition-all duration-500 animate-gradient neon-glow">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border border-white/50"></div>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gradient-rainbow animate-glow">
                Hiring Platform
              </h1>
              <div className="text-xs text-gray-400 font-mono">v2.0.1</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    group relative flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-500 transform hover:scale-105 hover:translate-x-2 mb-2 overflow-hidden
                    ${isActive
                      ? 'text-white shadow-2xl'
                      : 'text-gray-300 hover:text-white'
                    }
                  `}
                  onClick={() => setOpen(false)}
                >
                  {/* Background */}
                  <div className={`
                    absolute inset-0 transition-all duration-500
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient neon-glow' 
                      : 'bg-white/5 group-hover:bg-gradient-to-r group-hover:from-blue-500/20 group-hover:to-purple-500/20'
                    }
                  `}></div>

                  {/* Ripple Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-shimmer"></div>
                  </div>

                  <div className="relative z-10 flex items-center w-full">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-500
                      ${isActive 
                        ? 'bg-white/20 shadow-lg backdrop-blur-sm' 
                        : 'bg-white/10 group-hover:bg-white/20 group-hover:scale-110'
                      }
                    `}>
                      <item.icon
                        className={`
                          h-5 w-5 flex-shrink-0 transition-all duration-500
                          ${isActive ? 'text-white animate-glow' : 'text-gray-400 group-hover:text-white group-hover:scale-110'}
                        `}
                      />
                    </div>
                    
                    <span className="flex-1 transition-all duration-300 group-hover:translate-x-1">
                      {item.name}
                    </span>
                    
                    {isActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                    )}
                    
                    {!isActive && (
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-90">
                        <span className="text-xs text-white">→</span>
                      </div>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;