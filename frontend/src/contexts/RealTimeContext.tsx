import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSimpleNotifications } from '../components/UI/SimpleNotification';

interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
}

interface RealTimeContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  subscribe: (eventType: string, callback: (data: any) => void) => () => void;
  emit: (eventType: string, data: any) => void;
  onlineUsers: string[];
  lastActivity: number;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

// Mock WebSocket implementation for demonstration
class MockWebSocket {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

  constructor(private userId: string) {}

  connect(onStatusChange: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) {
    this.onStatusChange = onStatusChange;
    this.connectionStatus = 'connecting';
    onStatusChange('connecting');

    // Simulate connection
    setTimeout(() => {
      this.connectionStatus = 'connected';
      onStatusChange('connected');
      this.startMockEvents();
    }, 1000);
  }

  disconnect() {
    this.connectionStatus = 'disconnected';
    this.onStatusChange?.('disconnected');
  }

  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  emit(eventType: string, data: any) {
    // In a real implementation, this would send to the server
    console.log('Emitting event:', eventType, data);
  }

  private startMockEvents() {
    // Simulate real-time events
    const events = [
      { type: 'application_status_changed', interval: 30000 },
      { type: 'new_message', interval: 45000 },
      { type: 'interview_scheduled', interval: 60000 },
      { type: 'user_online', interval: 20000 },
      { type: 'job_application_received', interval: 40000 },
    ];

    events.forEach(({ type, interval }) => {
      setInterval(() => {
        if (this.connectionStatus === 'connected') {
          this.simulateEvent(type);
        }
      }, interval);
    });
  }

  private simulateEvent(type: string) {
    const mockData = this.generateMockData(type);
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(mockData));
    }
  }

  private generateMockData(type: string) {
    switch (type) {
      case 'application_status_changed':
        return {
          applicationId: `app_${Math.random().toString(36).substr(2, 9)}`,
          oldStatus: 'pending',
          newStatus: 'under-review',
          jobTitle: 'Senior React Developer',
          candidateName: 'John Doe'
        };
      case 'new_message':
        return {
          messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
          from: 'Jane Smith',
          subject: 'Interview Follow-up',
          preview: 'Thank you for the interview opportunity...'
        };
      case 'interview_scheduled':
        return {
          interviewId: `int_${Math.random().toString(36).substr(2, 9)}`,
          candidateName: 'Mike Johnson',
          jobTitle: 'Product Manager',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      case 'user_online':
        return {
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          userName: 'Sarah Wilson',
          status: 'online'
        };
      case 'job_application_received':
        return {
          applicationId: `app_${Math.random().toString(36).substr(2, 9)}`,
          jobTitle: 'UX Designer',
          candidateName: 'Alex Chen',
          submittedAt: new Date().toISOString()
        };
      default:
        return {};
    }
  }
}

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, info, warning } = useSimpleNotifications();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [websocket, setWebsocket] = useState<MockWebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const ws = new MockWebSocket(user._id);
    setWebsocket(ws);

    ws.connect(setConnectionStatus);

    return () => {
      ws.disconnect();
    };
  }, [user]);

  // Set up real-time event handlers
  useEffect(() => {
    if (!websocket || connectionStatus !== 'connected') return;

    const unsubscribers: (() => void)[] = [];

    // Application status changes
    unsubscribers.push(
      websocket.subscribe('application_status_changed', (data) => {
        info(`Application status updated: ${data.jobTitle}`, 'Application Update');
        setLastActivity(Date.now());
      })
    );

    // New messages
    unsubscribers.push(
      websocket.subscribe('new_message', (data) => {
        info(`New message from ${data.from}: ${data.preview}`, 'New Message');
        setLastActivity(Date.now());
      })
    );

    // Interview scheduled
    unsubscribers.push(
      websocket.subscribe('interview_scheduled', (data) => {
        success(`Interview scheduled with ${data.candidateName} for ${data.jobTitle}`, 'Interview Scheduled');
        setLastActivity(Date.now());
      })
    );

    // User online status
    unsubscribers.push(
      websocket.subscribe('user_online', (data) => {
        setOnlineUsers(prev => {
          if (data.status === 'online' && !prev.includes(data.userId)) {
            return [...prev, data.userId];
          } else if (data.status === 'offline') {
            return prev.filter(id => id !== data.userId);
          }
          return prev;
        });
      })
    );

    // New job applications
    unsubscribers.push(
      websocket.subscribe('job_application_received', (data) => {
        success(`New application from ${data.candidateName} for ${data.jobTitle}`, 'New Application');
        setLastActivity(Date.now());
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [websocket, connectionStatus, info, success]);

  // Connection status notifications
  useEffect(() => {
    switch (connectionStatus) {
      case 'connected':
        success('Connected to real-time updates');
        break;
      case 'disconnected':
        warning('Disconnected from real-time updates');
        break;
      case 'error':
        warning('Connection error - some features may not work properly');
        break;
    }
  }, [connectionStatus, success, warning, websocket, user]);

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!websocket) {
      return () => {};
    }
    return websocket.subscribe(eventType, callback);
  }, [websocket]);

  const emit = useCallback((eventType: string, data: any) => {
    if (websocket) {
      websocket.emit(eventType, data);
    }
  }, [websocket]);

  const value: RealTimeContextType = {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    subscribe,
    emit,
    onlineUsers,
    lastActivity,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

// Hook for specific real-time features
export const useRealTimeFeature = (feature: 'applications' | 'messages' | 'interviews' | 'users') => {
  const { subscribe, emit, isConnected } = useRealTime();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected) return;

    const eventTypes = {
      applications: ['application_status_changed', 'job_application_received'],
      messages: ['new_message', 'message_read'],
      interviews: ['interview_scheduled', 'interview_completed'],
      users: ['user_online', 'user_offline']
    };

    const unsubscribers = eventTypes[feature].map(eventType =>
      subscribe(eventType, (newData) => {
        setData(prev => [newData, ...prev.slice(0, 49)]); // Keep last 50 items
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [feature, subscribe, isConnected]);

  const sendUpdate = useCallback((eventType: string, data: any) => {
    emit(eventType, data);
  }, [emit]);

  return {
    data,
    loading,
    sendUpdate,
    isConnected
  };
};