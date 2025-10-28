import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSimpleNotifications } from './SimpleNotification';
import {
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

interface QuickActionsProps {
  open: boolean;
  onClose: () => void;
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
  roles: string[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { success } = useSimpleNotifications();

  const quickActions: QuickAction[] = [
    {
      id: 'create-job',
      name: 'Create Job',
      description: 'Post a new job opening',
      icon: PlusIcon,
      action: () => {
        navigate('/jobs/create');
        success('Navigated to Create Job');
      },
      color: 'bg-blue-500 hover:bg-blue-600',
      roles: ['admin', 'hr'],
    },
    {
      id: 'view-applications',
      name: 'View Applications',
      description: 'Review recent applications',
      icon: DocumentTextIcon,
      action: () => {
        navigate('/applications');
        success('Navigated to Applications');
      },
      color: 'bg-green-500 hover:bg-green-600',
      roles: ['admin', 'hr', 'candidate'],
    },
    {
      id: 'schedule-interview',
      name: 'Schedule Interview',
      description: 'Schedule a new interview',
      icon: CalendarIcon,
      action: () => {
        navigate('/calendar');
        success('Navigated to Calendar - Click "New Event" to schedule an interview');
      },
      color: 'bg-purple-500 hover:bg-purple-600',
      roles: ['admin', 'hr'],
    },
    {
      id: 'send-message',
      name: 'Send Message',
      description: 'Compose a new message',
      icon: EnvelopeIcon,
      action: () => {
        navigate('/messages');
        success('Navigated to Messages - Click "Compose" to send a message');
      },
      color: 'bg-orange-500 hover:bg-orange-600',
      roles: ['admin', 'hr', 'candidate'],
    },
    {
      id: 'browse-talent',
      name: 'Browse Talent',
      description: 'Search talent pool',
      icon: UserGroupIcon,
      action: () => {
        navigate('/talent-pool');
        success('Navigated to Talent Pool');
      },
      color: 'bg-indigo-500 hover:bg-indigo-600',
      roles: ['admin', 'hr'],
    },
    {
      id: 'view-analytics',
      name: 'View Analytics',
      description: 'Check hiring metrics',
      icon: ChartBarIcon,
      action: () => {
        navigate('/analytics');
        success('Navigated to Analytics');
      },
      color: 'bg-pink-500 hover:bg-pink-600',
      roles: ['admin', 'hr'],
    },
    {
      id: 'manage-tasks',
      name: 'Manage Tasks',
      description: 'View and update tasks',
      icon: ClipboardDocumentListIcon,
      action: () => {
        navigate('/tasks');
        success('Navigated to Tasks');
      },
      color: 'bg-teal-500 hover:bg-teal-600',
      roles: ['admin', 'hr'],
    },
    {
      id: 'browse-jobs',
      name: 'Browse Jobs',
      description: 'View available positions',
      icon: BriefcaseIcon,
      action: () => {
        navigate('/jobs');
        success('Navigated to Jobs');
      },
      color: 'bg-cyan-500 hover:bg-cyan-600',
      roles: ['admin', 'hr', 'candidate'],
    },
  ];

  const filteredActions = quickActions.filter(action =>
    action.roles.some(role => hasRole(role))
  );

  const handleActionClick = (action: QuickAction) => {
    action.action();
    onClose();
  };

  return (
    <Transition appear show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </Dialog.Title>
                  <p className="text-sm text-gray-500 mt-1">
                    Quickly navigate to common tasks and features
                  </p>
                </div>

                {/* Actions Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className="group relative p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left"
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                            <action.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                              {action.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-white border border-gray-300 rounded">
                          ⌘
                        </kbd>
                        <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-white border border-gray-300 rounded">
                          J
                        </kbd>
                        <span>Quick Actions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-white border border-gray-300 rounded">
                          esc
                        </kbd>
                        <span>Close</span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {filteredActions.length} actions available
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

export default QuickActions;