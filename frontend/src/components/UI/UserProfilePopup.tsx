import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Modal } from './EnhancedComponents';
import { enhancedUsersAPI } from '../../services/api';

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

interface UserProfilePopupProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (userId: string) => void;
}

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({
  userId,
  isOpen,
  onClose,
  onStartChat
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await enhancedUsersAPI.getUserWithDetails(userId);
      if (response.success && response.data) {
        setUser(response.data.user || response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };  const 
getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'hr':
        return 'bg-blue-100 text-blue-800';
      case 'interviewer':
        return 'bg-indigo-100 text-indigo-800';
      case 'candidate':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartChat = () => {
    if (onStartChat && user) {
      onStartChat(user.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-sm mb-2">Error loading user details</div>
            <div className="text-gray-600 text-xs mb-4">{error}</div>
            <button
              onClick={fetchUserDetails}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="relative inline-block">
                {user.avatar ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                    src={user.avatar}
                    alt={user.fullName || `${user.firstName} ${user.lastName}`}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                    <UserIcon className="h-10 w-10 text-gray-600" />
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                  user.status === 'active' ? 'bg-green-400' : 
                  user.status === 'pending' ? 'bg-yellow-400' : 
                  user.status === 'suspended' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
              </div>
              
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </h3>
              
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                </span>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="text-center">
                <p className="text-sm text-gray-600 italic">{user.bio}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.location && (
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{user.location}</p>
                  </div>
                </div>
              )}

              {user.jobTitle && (
                <div className="flex items-center space-x-3">
                  <BriefcaseIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{user.jobTitle}</p>
                    {user.department && (
                      <p className="text-xs text-gray-500">{user.department}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {user.lastLogin && (
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Last seen {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleStartChat}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Start Chat
              </button>
              
              <a
                href={`mailto:${user.email}`}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Email
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default UserProfilePopup;