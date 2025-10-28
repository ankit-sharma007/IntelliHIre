import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSimpleNotifications } from './SimpleNotification';
import {
  MagnifyingGlassIcon,
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
  PlusIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  category: 'Navigation' | 'Actions' | 'Quick Access';
  keywords: string[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { success } = useSimpleNotifications();
  const [query, setQuery] = useState('');

  const commands: Command[] = useMemo(() => [
    // Navigation
    { 
      id: 'nav-dashboard', 
      name: 'Go to Dashboard', 
      description: 'View your main dashboard',
      icon: HomeIcon, 
      action: () => navigate('/dashboard'),
      category: 'Navigation',
      keywords: ['dashboard', 'home', 'overview']
    },
    { 
      id: 'nav-jobs', 
      name: 'Go to Jobs', 
      description: 'Browse and manage job postings',
      icon: BriefcaseIcon, 
      action: () => navigate('/jobs'),
      category: 'Navigation',
      keywords: ['jobs', 'positions', 'openings']
    },
    { 
      id: 'nav-applications', 
      name: 'Go to Applications', 
      description: 'View job applications',
      icon: DocumentTextIcon, 
      action: () => navigate('/applications'),
      category: 'Navigation',
      keywords: ['applications', 'candidates', 'resumes']
    },
    { 
      id: 'nav-calendar', 
      name: 'Go to Calendar', 
      description: 'View your calendar and schedule',
      icon: CalendarIcon, 
      action: () => navigate('/calendar'),
      category: 'Navigation',
      keywords: ['calendar', 'schedule', 'meetings', 'interviews']
    },
    { 
      id: 'nav-messages', 
      name: 'Go to Messages', 
      description: 'View your messages',
      icon: EnvelopeIcon, 
      action: () => navigate('/messages'),
      category: 'Navigation',
      keywords: ['messages', 'chat', 'communication']
    },
    
    // Actions (Admin/HR only)
    ...(hasRole(['admin', 'hr']) ? [
      { 
        id: 'action-create-job', 
        name: 'Create New Job', 
        description: 'Post a new job opening',
        icon: PlusIcon, 
        action: () => navigate('/jobs/create'),
        category: 'Actions' as const,
        keywords: ['create', 'job', 'post', 'new', 'opening']
      },
      { 
        id: 'nav-tasks', 
        name: 'Go to Tasks', 
        description: 'Manage your tasks',
        icon: ClipboardDocumentListIcon, 
        action: () => navigate('/tasks'),
        category: 'Navigation' as const,
        keywords: ['tasks', 'todo', 'assignments']
      },
      { 
        id: 'nav-talent-pool', 
        name: 'Go to Talent Pool', 
        description: 'Browse candidate database',
        icon: UserGroupIcon, 
        action: () => navigate('/talent-pool'),
        category: 'Navigation' as const,
        keywords: ['talent', 'pool', 'candidates', 'database']
      },
      { 
        id: 'nav-analytics', 
        name: 'Go to Analytics', 
        description: 'View hiring analytics',
        icon: ChartBarIcon, 
        action: () => navigate('/analytics'),
        category: 'Navigation' as const,
        keywords: ['analytics', 'reports', 'metrics', 'data']
      },
      { 
        id: 'nav-users', 
        name: 'Go to Users', 
        description: 'Manage users',
        icon: UsersIcon, 
        action: () => navigate('/users'),
        category: 'Navigation' as const,
        keywords: ['users', 'team', 'management']
      },
    ] : []),

    // Admin only
    ...(hasRole('admin') ? [
      { 
        id: 'nav-settings', 
        name: 'Go to Settings', 
        description: 'Configure system settings',
        icon: CogIcon, 
        action: () => navigate('/settings'),
        category: 'Navigation' as const,
        keywords: ['settings', 'configuration', 'admin']
      },
    ] : []),

    // Quick Access
    { 
      id: 'quick-profile', 
      name: 'View Profile', 
      description: 'Go to your profile page',
      icon: UserIcon, 
      action: () => navigate('/profile'),
      category: 'Quick Access',
      keywords: ['profile', 'account', 'personal']
    },
    { 
      id: 'quick-search-jobs', 
      name: 'Search Jobs', 
      description: 'Search through job postings',
      icon: MagnifyingGlassIcon, 
      action: () => {
        navigate('/jobs');
        success('Navigated to Jobs - Use the search bar to find specific positions');
      },
      category: 'Quick Access',
      keywords: ['search', 'find', 'jobs', 'positions']
    },
  ], [navigate, hasRole, success]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    
    const lowerQuery = query.toLowerCase();
    return commands.filter(command => 
      command.name.toLowerCase().includes(lowerQuery) ||
      command.description.toLowerCase().includes(lowerQuery) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });
    return groups;
  }, [filteredCommands]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            handleClose();
          }
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredCommands, selectedIndex]);

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

  const handleCommandClick = (command: Command) => {
    command.action();
    handleClose();
  };

  return (
    <Transition appear show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
                {/* Search Input */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for commands..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full border-0 bg-transparent py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:ring-0 text-lg"
                    autoFocus
                  />
                </div>

                {/* Commands List */}
                <div className="max-h-96 overflow-y-auto border-t border-gray-200">
                  {Object.keys(groupedCommands).length === 0 ? (
                    <div className="px-6 py-14 text-center text-sm text-gray-500">
                      No commands found for "{query}"
                    </div>
                  ) : (
                    <div className="py-2">
                      {Object.entries(groupedCommands).map(([category, commands]) => (
                        <div key={category}>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {category}
                          </div>
                          {commands.map((command, index) => {
                            const globalIndex = filteredCommands.indexOf(command);
                            const isSelected = globalIndex === selectedIndex;
                            
                            return (
                              <button
                                key={command.id}
                                onClick={() => handleCommandClick(command)}
                                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 ${
                                  isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                }`}
                              >
                                <command.icon className={`h-5 w-5 mr-3 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-400'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-medium ${
                                    isSelected ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                    {command.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {command.description}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">
                          ↑↓
                        </kbd>
                        <span>Navigate</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">
                          ↵
                        </kbd>
                        <span>Select</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">
                          esc
                        </kbd>
                        <span>Close</span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {filteredCommands.length} commands
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CommandPalette;