import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  InboxIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Message } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'sent'>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockMessages: Message[] = [
        {
          _id: '1',
          sender: {
            _id: '2',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'candidate',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            fullName: 'John Doe',
          },
          recipient: user!,
          subject: 'Thank you for the interview opportunity',
          content: 'Dear Hiring Team,\n\nThank you for taking the time to interview me for the Senior React Developer position. I really enjoyed our conversation about the upcoming projects and the team culture.\n\nI wanted to follow up on the next steps in the process. Please let me know if you need any additional information from me.\n\nBest regards,\nJohn Doe',
          isRead: false,
          applicationId: 'app1',
          jobId: 'job1',
          createdAt: '2024-01-16T10:30:00Z',
          updatedAt: '2024-01-16T10:30:00Z',
        },
        {
          _id: '2',
          sender: user!,
          recipient: {
            _id: '3',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'candidate',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            fullName: 'Jane Smith',
          },
          subject: 'Interview Invitation - Backend Engineer Position',
          content: 'Dear Jane,\n\nWe were impressed with your application for the Backend Engineer position. We would like to invite you for a technical interview.\n\nPlease let us know your availability for next week.\n\nBest regards,\nHiring Team',
          isRead: true,
          applicationId: 'app2',
          jobId: 'job2',
          createdAt: '2024-01-15T14:20:00Z',
          updatedAt: '2024-01-15T14:20:00Z',
        },
        {
          _id: '3',
          sender: {
            _id: '4',
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@example.com',
            role: 'candidate',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            fullName: 'Mike Johnson',
          },
          recipient: user!,
          subject: 'Question about the Product Manager role',
          content: 'Hi,\n\nI have a few questions about the Product Manager position I applied for:\n\n1. What is the team size I would be managing?\n2. Are there opportunities for remote work?\n3. What are the main challenges the team is currently facing?\n\nThank you for your time.\n\nBest,\nMike Johnson',
          isRead: true,
          applicationId: 'app3',
          jobId: 'job3',
          createdAt: '2024-01-14T09:15:00Z',
          updatedAt: '2024-01-14T09:15:00Z',
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      // Send reply - replace with actual API call
      const newMessage: Message = {
        _id: Date.now().toString(),
        sender: user!,
        recipient: selectedMessage.sender,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyText,
        isRead: false,
        applicationId: selectedMessage.applicationId,
        jobId: selectedMessage.jobId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages(prev => [newMessage, ...prev]);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSubject = message.subject.toLowerCase().includes(query);
      const matchesSender = message.sender.fullName.toLowerCase().includes(query);
      const matchesContent = message.content.toLowerCase().includes(query);
      
      if (!matchesSubject && !matchesSender && !matchesContent) {
        return false;
      }
    }
    
    if (filter === 'unread' && message.isRead) return false;
    if (filter === 'sent' && message.sender._id !== user?._id) return false;
    
    return true;
  });

  const ComposeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [composeData, setComposeData] = useState({
      recipient: '',
      subject: '',
      content: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle message composition
      console.log('Composing message:', composeData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient
              </label>
              <input
                type="email"
                value={composeData.recipient}
                onChange={(e) => setComposeData({ ...composeData, recipient: e.target.value })}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={composeData.content}
                onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.isRead && m.recipient._id === user?._id).length;

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Messages List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Compose</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="flex space-x-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-sm rounded-md flex items-center space-x-1 ${
                filter === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'sent' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sent
            </button>
          </div>
        </div>
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map(message => (
            <div
              key={message._id}
              onClick={() => {
                setSelectedMessage(message);
                if (!message.isRead && message.recipient._id === user?._id) {
                  markAsRead(message._id);
                }
              }}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedMessage?._id === message._id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-700">
                    {message.sender.firstName[0]}{message.sender.lastName[0]}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${
                      !message.isRead && message.recipient._id === user?._id ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {message.sender._id === user?._id ? `To: ${message.recipient.fullName}` : message.sender.fullName}
                    </p>
                    <div className="flex items-center space-x-1">
                      {!message.isRead && message.recipient._id === user?._id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {message.sender._id === user?._id ? (
                        <EnvelopeOpenIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-sm truncate mt-1 ${
                    !message.isRead && message.recipient._id === user?._id ? 'font-medium text-gray-900' : 'text-gray-600'
                  }`}>
                    {message.subject}
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {message.content.substring(0, 60)}...
                  </p>
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <InboxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No messages found.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Message Detail */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            {/* Message Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedMessage.sender.firstName[0]}{selectedMessage.sender.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                      <span>From: {selectedMessage.sender.fullName}</span>
                      <span>•</span>
                      <span>To: {selectedMessage.recipient.fullName}</span>
                      <span>•</span>
                      <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Message Content */}
            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="whitespace-pre-wrap text-gray-900">
                  {selectedMessage.content}
                </div>
              </div>
            </div>
            
            {/* Reply Section */}
            {selectedMessage.sender._id !== user?._id && (
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="space-y-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center justify-between">
                    <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800">
                      <PaperClipIcon className="h-4 w-4" />
                      <span>Attach File</span>
                    </button>
                    <button
                      onClick={sendReply}
                      disabled={!replyText.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a message to read</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal onClose={() => setShowCompose(false)} />
      )}
    </div>
  );
};

export default Messages;