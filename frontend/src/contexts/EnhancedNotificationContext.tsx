import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export interface EnhancedNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showProgress?: boolean;
  onClose?: () => void;
}

interface NotificationContextType {
  notifications: EnhancedNotification[];
  addNotification: (notification: Omit<EnhancedNotification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  success: (message: string, options?: Partial<EnhancedNotification>) => string;
  error: (message: string, options?: Partial<EnhancedNotification>) => string;
  warning: (message: string, options?: Partial<EnhancedNotification>) => string;
  info: (message: string, options?: Partial<EnhancedNotification>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useEnhancedNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useEnhancedNotifications must be used within an EnhancedNotificationProvider');
  }
  return context;
};

interface NotificationItemProps {
  notification: EnhancedNotification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (notification.persistent || !notification.duration) return;

    const startTime = Date.now();
    const duration = notification.duration;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;
      
      setProgress(progressPercent);
      
      if (remaining <= 0) {
        handleRemove();
      }
    };

    const interval = setInterval(updateProgress, 50);
    return () => clearInterval(interval);
  }, [notification.duration, notification.persistent]);

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
      notification.onClose?.();
    }, 300);
  }, [notification.id, notification.onClose, onRemove]);

  const getIcon = () => {
    const iconClass = "h-6 w-6";
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-400`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-400`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-400`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClass} text-blue-400`} />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getProgressColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'info':
        return 'bg-blue-400';
    }
  };

  return (
    <div
      className={`relative max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ${
        isRemoving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {notification.title && (
              <p className="text-sm font-semibold text-gray-900 leading-5">
                {notification.title}
              </p>
            )}
            <p className={`text-sm text-gray-700 leading-5 ${notification.title ? 'mt-1' : ''}`}>
              {notification.message}
            </p>
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      action.style === 'primary'
                        ? 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleRemove}
              className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {notification.showProgress && !notification.persistent && notification.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className={`h-full transition-all duration-75 ease-linear ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

interface NotificationContainerProps {
  position: EnhancedNotification['position'];
  notifications: EnhancedNotification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position,
  notifications,
  onRemove
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-0 right-0';
      case 'top-left':
        return 'top-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'top-center':
        return 'top-0 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-0 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-0 right-0';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div
      className={`fixed z-50 p-6 space-y-4 ${getPositionClasses()}`}
      style={{ maxWidth: '420px' }}
    >
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export const EnhancedNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);

  const addNotification = useCallback((notification: Omit<EnhancedNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: EnhancedNotification = {
      id,
      duration: 5000,
      position: 'top-right',
      showProgress: true,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = useCallback((message: string, options?: Partial<EnhancedNotification>) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);

  const error = useCallback((message: string, options?: Partial<EnhancedNotification>) => {
    return addNotification({ 
      type: 'error', 
      message, 
      duration: 8000, // Longer duration for errors
      persistent: false,
      ...options 
    });
  }, [addNotification]);

  const warning = useCallback((message: string, options?: Partial<EnhancedNotification>) => {
    return addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);

  const info = useCallback((message: string, options?: Partial<EnhancedNotification>) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);

  // Group notifications by position
  const notificationsByPosition = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(notification);
    return acc;
  }, {} as Record<string, EnhancedNotification[]>);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {Object.entries(notificationsByPosition).map(([position, positionNotifications]) => (
        <NotificationContainer
          key={position}
          position={position as EnhancedNotification['position']}
          notifications={positionNotifications}
          onRemove={removeNotification}
        />
      ))}
    </NotificationContext.Provider>
  );
};