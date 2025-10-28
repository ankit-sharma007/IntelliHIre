import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export interface SimpleNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

interface SimpleNotificationItemProps {
  notification: SimpleNotification;
  onRemove: (id: string) => void;
}

const SimpleNotificationItem: React.FC<SimpleNotificationItemProps> = ({ 
  notification, 
  onRemove 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
      notification.onClose?.();
    }, 300);
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-400',
          title: 'text-green-800',
          message: 'text-green-700',
          IconComponent: CheckCircleIcon,
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          IconComponent: XCircleIcon,
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          IconComponent: ExclamationTriangleIcon,
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          IconComponent: InformationCircleIcon,
        };
    }
  };

  const styles = getStyles();
  const { IconComponent } = styles;

  return (
    <div
      className={`
        max-w-sm w-full ${styles.container} border rounded-lg shadow-lg pointer-events-auto
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${styles.icon}`} />
          </div>
          <div className="ml-3 flex-1">
            {notification.title && (
              <p className={`text-sm font-medium ${styles.title}`}>
                {notification.title}
              </p>
            )}
            <p className={`text-sm ${styles.message} ${notification.title ? 'mt-1' : ''}`}>
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleRemove}
              className={`inline-flex rounded-md p-1.5 ${styles.icon} hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600`}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SimpleNotificationContainerProps {
  notifications: SimpleNotification[];
  onRemove: (id: string) => void;
}

export const SimpleNotificationContainer: React.FC<SimpleNotificationContainerProps> = ({
  notifications,
  onRemove,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <SimpleNotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

// Simple notification context

interface SimpleNotificationContextType {
  notifications: SimpleNotification[];
  addNotification: (notification: Omit<SimpleNotification, 'id'>) => string;
  removeNotification: (id: string) => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

const SimpleNotificationContext = createContext<SimpleNotificationContextType | undefined>(undefined);

export const useSimpleNotifications = () => {
  const context = useContext(SimpleNotificationContext);
  if (!context) {
    throw new Error('useSimpleNotifications must be used within a SimpleNotificationProvider');
  }
  return context;
};

export const SimpleNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);

  const addNotification = useCallback((notification: Omit<SimpleNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: SimpleNotification = {
      id,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => {
    return addNotification({ type: 'success', message, title });
  }, [addNotification]);

  const error = useCallback((message: string, title?: string) => {
    return addNotification({ type: 'error', message, title, duration: 7000 });
  }, [addNotification]);

  const warning = useCallback((message: string, title?: string) => {
    return addNotification({ type: 'warning', message, title });
  }, [addNotification]);

  const info = useCallback((message: string, title?: string) => {
    return addNotification({ type: 'info', message, title });
  }, [addNotification]);

  const value: SimpleNotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <SimpleNotificationContext.Provider value={value}>
      {children}
      <SimpleNotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </SimpleNotificationContext.Provider>
  );
};