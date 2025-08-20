import React, { useState, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { API_BASE_URL } from '../utils/constants';

interface ChatSession {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  status: { id: number; name: string } | string; // status can be object from API
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

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

  // -----------------------------
  // Fetch chat sessions from API
  // -----------------------------
  const fetchChats = async () => {
    try {
      const res = await axios.get('${API_BASE_URL}/api/messages'); // replace with your chat API
      if (Array.isArray(res.data.data)) {
        setChatSessions(res.data.data);
      } else {
        console.error('API returned non-array:', res.data.data);
      }
    } catch (err) {
      console.error('Error loading chats:', err);
    }
  };

  // -----------------------------
  // Fetch messages for a selected chat
  // -----------------------------
  const fetchMessages = async (chatId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages?chat_id=${chatId}`);
      if (Array.isArray(res.data.data)) {
        setMessages((prev) => ({ ...prev, [chatId]: res.data.data }));
      } else {
        console.error('Messages API returned non-array:', res.data.data);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) fetchMessages(selectedChat);
  }, [selectedChat]);

  // -----------------------------
  // Send message to API
  // -----------------------------
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const res = await axios.post('${API_BASE_URL}/api/messages', {
        chat_id: selectedChat,
        content: message,
        is_from_chatbot: false,
        user_id: user?.id,
      });

      // Append new message to state
      setMessages((prev) => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), res.data.data],
      }));

      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // -----------------------------
  // Filter chat sessions
  // -----------------------------
  const filteredSessions = chatSessions.filter((session) => {
    const statusName =
      typeof session.status === 'string' ? session.status : session.status?.name || '';
    const matchesSearch =
      session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusName === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'waiting':
        return 'warning';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Sidebar */}
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
          {filteredSessions.map((session) => {
            const statusName =
              typeof session.status === 'string' ? session.status : session.status?.name || '';
            return (
              <div
                key={session.id}
                onClick={() => setSelectedChat(session.id)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  selectedChat === session.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      {session.isAnonymous ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-white text-xs font-medium">
                          {session.userName?.split(' ').map((n) => n[0]).join('')}
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
                    <Badge variant={getStatusColor(statusName)} size="sm">
                      {statusName}
                    </Badge>
                    {session.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">{session.unreadCount}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                  {session.lastMessage}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{session.lastMessageTime}</p>
              </div>
            );
          })}
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
                      {filteredSessions.find((s) => s.id === selectedChat)?.userName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredSessions.find((s) => s.id === selectedChat)?.isAnonymous
                        ? 'Anonymous User'
                        : 'Registered User'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={getStatusColor(
                    (filteredSessions.find((s) => s.id === selectedChat)?.status as any)?.name ||
                      'default'
                  )}
                >
                  {(filteredSessions.find((s) => s.id === selectedChat)?.status as any)?.name ||
                    'Unknown'}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages[selectedChat]?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-xs ${
                      msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`p-3 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
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
                Choose a conversation from the sidebar to view messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportChatPage;
