import React, { useState } from 'react';
import { Send, Bot, User, MessageCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

interface ChatSession {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  status: 'active' | 'waiting' | 'closed';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isAnonymous: boolean;
}

const SupportChatPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [chatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      userName: 'Anonymous User',
      status: 'active',
      lastMessage: 'I need help with my login issue',
      lastMessageTime: '2 minutes ago',
      unreadCount: 2,
      isAnonymous: true,
    },
    {
      id: '2',
      userId: 'user123',
      userName: 'John Smith',
      userEmail: 'john.smith@company.com',
      status: 'waiting',
      lastMessage: 'The printer is still not working',
      lastMessageTime: '15 minutes ago',
      unreadCount: 1,
      isAnonymous: false,
    },
    {
      id: '3',
      userName: 'Anonymous User',
      status: 'active',
      lastMessage: 'Thank you for your help!',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      isAnonymous: true,
    },
  ]);

  const [messages] = useState<Record<string, ChatMessage[]>>({
    '1': [
      {
        id: '1',
        content: 'Hello! I need help with my login issue. I can\'t access my account.',
        sender: 'user',
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '2',
        content: 'I understand you\'re having trouble logging in. Can you tell me what error message you\'re seeing?',
        sender: 'bot',
        timestamp: new Date(Date.now() - 240000).toISOString(),
      },
      {
        id: '3',
        content: 'It says "Invalid credentials" but I\'m sure my password is correct.',
        sender: 'user',
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
    ],
    '2': [
      {
        id: '1',
        content: 'Hi, I reported a printer issue yesterday but it\'s still not working.',
        sender: 'user',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: '2',
        content: 'I see your previous ticket. Let me check the status and get back to you.',
        sender: 'bot',
        timestamp: new Date(Date.now() - 840000).toISOString(),
      },
    ],
    '3': [
      {
        id: '1',
        content: 'The issue has been resolved. Thank you for your quick response!',
        sender: 'user',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        content: 'You\'re welcome! Is there anything else I can help you with?',
        sender: 'bot',
        timestamp: new Date(Date.now() - 3540000).toISOString(),
      },
    ],
  });

  const filteredSessions = chatSessions.filter(session => {
    const matchesSearch = session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    
    // Implementation for sending message
    console.log('Sending message:', message, 'to chat:', selectedChat);
    setMessage('');
  };

  const getStatusColor = (status: ChatSession['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'waiting': return 'warning';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Chat Sessions Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Support Chats
          </h2>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedChat(session.id)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                selectedChat === session.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    {session.isAnonymous ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white text-xs font-medium">
                        {session.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {session.userName}
                    </p>
                    {session.userEmail && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.userEmail}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant={getStatusColor(session.status)} size="sm">
                    {session.status}
                  </Badge>
                  {session.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {session.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                {session.lastMessage}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {session.lastMessageTime}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {filteredSessions.find(s => s.id === selectedChat)?.userName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredSessions.find(s => s.id === selectedChat)?.isAnonymous ? 'Anonymous User' : 'Registered User'}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(filteredSessions.find(s => s.id === selectedChat)?.status || 'active')}>
                  {filteredSessions.find(s => s.id === selectedChat)?.status}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages[selectedChat]?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-xs ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      {msg.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className={`p-3 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  icon={<Send size={16} />}
                  disabled={!message.trim()}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a chat to start messaging
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a conversation from the sidebar to view and respond to messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportChatPage;