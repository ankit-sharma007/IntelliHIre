import React, { useState, useRef, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useChat } from '../../contexts/ChatContext';

const ChatWidget: React.FC = () => {
  const {
    conversations,
    activeConversation,
    messages,
    isOpen,
    openChat,
    closeChat,
    sendMessage,
    markAsRead,
  } = useChat();

  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeConversation) {
      sendMessage(activeConversation, newMessage.trim());
      setNewMessage('');
    }
  };

  const activeConversationData = conversations.find(conv => conv.id === activeConversation);
  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : 'w-80 h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            <span className="font-medium">
              {activeConversationData ? 'Chat' : 'Messages'}
            </span>
            {conversations.length > 0 && (
              <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded-full">
                {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-indigo-500 rounded"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <button
              onClick={closeChat}
              className="p-1 hover:bg-indigo-500 rounded"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Conversations List or Active Chat */}
            {!activeConversation ? (
              <div className="p-4 h-80 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Click on any user profile to start chatting</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                        onClick={() => {
                          // setActiveConversation(conversation.id);
                          markAsRead(conversation.id);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                User {conversation.participants[0]}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {activeMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p>Start your conversation</p>
                    </div>
                  ) : (
                    activeMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === 'current_user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.senderId === 'current_user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === 'current_user' ? 'text-indigo-200' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;