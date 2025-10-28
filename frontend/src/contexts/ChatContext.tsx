import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: string | null;
  messages: Record<string, ChatMessage[]>;
  isOpen: boolean;
  startChat: (userId: string) => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (conversationId: string, message: string) => void;
  markAsRead: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isOpen, setIsOpen] = useState(false);

  const startChat = (userId: string) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(userId)
    );

    if (existingConversation) {
      setActiveConversation(existingConversation.id);
    } else {
      // Create new conversation
      const newConversation: ChatConversation = {
        id: `conv_${Date.now()}`,
        participants: [userId], // Current user will be added by the system
        unreadCount: 0,
        updatedAt: new Date().toISOString()
      };
      
      setConversations(prev => [...prev, newConversation]);
      setActiveConversation(newConversation.id);
      setMessages(prev => ({ ...prev, [newConversation.id]: [] }));
    }
    
    setIsOpen(true);
  };

  const openChat = () => {
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const sendMessage = (conversationId: string, message: string) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'current_user', // This would be the current user's ID
      receiverId: 'other_user', // This would be determined from conversation participants
      message,
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, lastMessage: newMessage, updatedAt: new Date().toISOString() }
        : conv
    ));
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  const value: ChatContextType = {
    conversations,
    activeConversation,
    messages,
    isOpen,
    startChat,
    openChat,
    closeChat,
    sendMessage,
    markAsRead,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;