import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSimpleNotifications } from '../../components/UI/SimpleNotification';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  VideoCameraIcon,
  MapPinIcon,
  EllipsisHorizontalIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { CalendarEvent } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { Modal } from '../../components/UI/EnhancedComponents';
import { Menu, Transition } from '@headlessui/react';

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useSimpleNotifications();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventFilter, setEventFilter] = useState<'all' | 'interview' | 'meeting' | 'deadline' | 'reminder'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const today = new Date();
      const mockEvents: CalendarEvent[] = [
        {
          _id: '1',
          title: 'Interview with John Doe',
          description: 'Technical interview for Senior React Developer position',
          startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          type: 'interview',
          participants: [user!],
          applicationId: 'app1',
          jobId: 'job1',
          meetingLink: 'https://meet.google.com/abc-def-ghi',
          status: 'scheduled',
          createdBy: user!,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-10T09:00:00Z',
        },
        {
          _id: '2',
          title: 'Team Meeting',
          description: 'Weekly hiring team sync',
          startTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          type: 'meeting',
          participants: [user!],
          location: 'Conference Room A',
          status: 'scheduled',
          createdBy: user!,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-10T09:00:00Z',
        },
        {
          _id: '3',
          title: 'Application Deadline',
          description: 'Senior Frontend Developer position closes',
          startTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'deadline',
          participants: [user!],
          status: 'scheduled',
          createdBy: user!,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-10T09:00:00Z',
        },
        {
          _id: '4',
          title: 'Follow up with candidate',
          description: 'Check in with Sarah Wilson about offer',
          startTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'reminder',
          participants: [user!],
          status: 'scheduled',
          createdBy: user!,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-10T09:00:00Z',
        },
      ];
      
      setEvents(mockEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const filteredEvents = useMemo(() => {
    if (eventFilter === 'all') return events;
    return events.filter(event => event.type === eventFilter);
  }, [events, eventFilter]);

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return filteredEvents
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  }, [filteredEvents]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      interview: 'bg-blue-500',
      meeting: 'bg-green-500',
      deadline: 'bg-red-500',
      reminder: 'bg-yellow-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleCreateEvent = (eventData: any) => {
    const newEvent: CalendarEvent = {
      _id: Date.now().toString(),
      ...eventData,
      participants: [user!],
      status: 'scheduled' as const,
      createdBy: user!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setEvents(prev => [...prev, newEvent]);
    success('Event created successfully');
    setShowCreateModal(false);
  };

  const CreateEventModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      startTime: selectedDate ? selectedDate.toISOString().slice(0, 16) : '',
      endTime: '',
      type: 'meeting' as CalendarEvent['type'],
      location: '',
      meetingLink: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title || !formData.startTime) {
        error('Please fill in required fields');
        return;
      }
      
      handleCreateEvent({
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : new Date(new Date(formData.startTime).getTime() + 60 * 60 * 1000).toISOString(),
      });
    };

    return (
      <Modal isOpen={true} onClose={onClose} title="Create New Event" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="meeting">Meeting</option>
              <option value="interview">Interview</option>
              <option value="deadline">Deadline</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter location or leave empty for online"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Link
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  const EventModal: React.FC<{ event: CalendarEvent; onClose: () => void }> = ({ event, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{event.location}</span>
            </div>
          )}
          
          {event.meetingLink && (
            <div className="flex items-center space-x-2">
              <VideoCameraIcon className="h-4 w-4 text-gray-500" />
              <a
                href={event.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Join Meeting
              </a>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {event.participants.length} participant(s)
            </span>
          </div>
          
          {event.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Edit
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">Manage your interviews, meetings, and deadlines</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Event Filter */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FunnelIcon className="h-4 w-4" />
              <span className="text-sm">
                {eventFilter === 'all' ? 'All Events' : eventFilter.charAt(0).toUpperCase() + eventFilter.slice(1)}
              </span>
            </Menu.Button>
            
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-10">
                <div className="py-1">
                  {[
                    { value: 'all', label: 'All Events' },
                    { value: 'interview', label: 'Interviews' },
                    { value: 'meeting', label: 'Meetings' },
                    { value: 'deadline', label: 'Deadlines' },
                    { value: 'reminder', label: 'Reminders' },
                  ].map((option) => (
                    <Menu.Item key={option.value}>
                      {({ active }) => (
                        <button
                          onClick={() => setEventFilter(option.value as any)}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } ${
                            eventFilter === option.value ? 'text-blue-600 font-medium' : 'text-gray-700'
                          } flex items-center w-full px-4 py-2 text-sm`}
                        >
                          {option.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* View Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'month', label: 'Month', icon: Squares2X2Icon },
              { value: 'week', label: 'Week', icon: ViewColumnsIcon },
              { value: 'day', label: 'Day', icon: CalendarIcon },
              { value: 'agenda', label: 'Agenda', icon: ListBulletIcon },
            ].map((viewOption) => (
              <button
                key={viewOption.value}
                onClick={() => setView(viewOption.value as any)}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === viewOption.value 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <viewOption.icon className="h-4 w-4" />
                <span className="hidden sm:block">{viewOption.label}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              setSelectedDate(new Date());
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Content */}
      {view === 'agenda' ? (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingEvents.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming events</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              upcomingEvents.map(event => (
                <div
                  key={event._id}
                  onClick={() => setSelectedEvent(event)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getEventTypeColor(event.type).replace('bg-', 'bg-')}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(event.startTime).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {event.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{formatTime(event.startTime)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.meetingLink && (
                          <div className="flex items-center space-x-1">
                            <VideoCameraIcon className="h-3 w-3" />
                            <span>Online</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center text-sm font-semibold text-gray-700">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day && day.toDateString() === new Date().toDateString();
              const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (day) {
                      setSelectedDate(day);
                      setShowCreateModal(true);
                    }
                  }}
                  className={`min-h-[120px] p-2 border-b border-r border-gray-200 cursor-pointer transition-colors ${
                    day 
                      ? isCurrentMonth 
                        ? 'bg-white hover:bg-blue-50' 
                        : 'bg-gray-50 hover:bg-gray-100' 
                      : 'bg-gray-50'
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 flex items-center justify-between ${
                        isToday 
                          ? 'text-blue-600' 
                          : isCurrentMonth 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                      }`}>
                        <span className={isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}>
                          {day.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                            className={`text-xs p-1.5 rounded cursor-pointer text-white transition-all hover:scale-105 ${getEventTypeColor(event.type)}`}
                          >
                            <div className="truncate font-medium">{event.title}</div>
                            <div className="truncate opacity-75">
                              {formatTime(event.startTime)}
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 p-1 text-center bg-gray-100 rounded">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {events.slice(0, 5).map(event => (
            <div
              key={event._id}
              onClick={() => setSelectedEvent(event)}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.startTime).toLocaleDateString()} at {formatTime(event.startTime)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {event.meetingLink && <VideoCameraIcon className="h-4 w-4 text-gray-400" />}
                {event.location && <MapPinIcon className="h-4 w-4 text-gray-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Calendar;