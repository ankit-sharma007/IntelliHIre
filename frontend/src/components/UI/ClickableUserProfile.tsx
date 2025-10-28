import React, { useState } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import UserProfilePopup from './UserProfilePopup';

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
}

interface ClickableUserProfileProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
  showRole?: boolean;
  showStatus?: boolean;
  className?: string;
  onStartChat?: (userId: string) => void;
}

const ClickableUserProfile: React.FC<ClickableUserProfileProps> = ({
  user,
  size = 'md',
  showName = true,
  showRole = false,
  showStatus = false,
  className = '',
  onStartChat
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getRoleColor = (role: string) => {
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
        return 'bg-green-400';
      case 'inactive':
        return 'bg-gray-400';
      case 'pending':
        return 'bg-yellow-400';
      case 'suspended':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const handleClick = () => {
    setShowPopup(true);
  };

  const userName = user.fullName || `${user.firstName} ${user.lastName}`;

  return (
    <>
      <div
        className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors ${className}`}
        onClick={handleClick}
      >
        <div className="relative flex-shrink-0">
          {user.avatar ? (
            <img
              className={`${sizeClasses[size]} rounded-full object-cover`}
              src={user.avatar}
              alt={userName}
            />
          ) : (
            <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center`}>
              <UserIcon className={`${size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'} text-gray-600`} />
            </div>
          )}
          
          {showStatus && (
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
          )}
        </div>

        {(showName || showRole) && (
          <div className="flex-1 min-w-0">
            {showName && (
              <div className={`font-medium text-gray-900 truncate ${textSizeClasses[size]}`}>
                {userName}
              </div>
            )}
            {showRole && (
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <UserProfilePopup
        userId={user.id}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onStartChat={onStartChat}
      />
    </>
  );
};

export default ClickableUserProfile;