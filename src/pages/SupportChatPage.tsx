import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, MessageCircle, Search } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { ChatMessage } from "../types"; // Assuming your types are correctly defined
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { API_BASE_URL } from "../utils/constants";

// Updated ChatSession interface to match the goal
interface ChatSession {
  ticket_id: string;
  user?: { id: number; name: string };
  priority?: { id: number; name: string };
  lastMessage: string;
  lastMessageTime: string;
  isAnonymous?: boolean; // You can add logic for this if needed
}

// Updated ChatMessage to better match your API response
interface ApiMessage {
    id: number;
    ticket_id: number;
    user_id: number;
    content: string;
    is_from_chatbot: number;
    created_at: string;
    user: { id: number; name: string };
    priority: { id: number; name: string };
    // Add other fields as needed
}


const SupportChatPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const chatEndRef = useRef<HTMLDivElement | null>(null);


  // -----------------------------
  // Fetch and PROCESS chat sessions (*** THIS IS THE MAIN FIX ***)
  // -----------------------------
  const fetchChats = async () => {
    try {
      const res = await axios.get<{ data: ApiMessage[] }>(`${API_BASE_URL}/api/messages`);
      const allMessages = res.data.data;

      if (!Array.isArray(allMessages)) {
        console.error("API returned non-array for sessions:", res.data);
        return;
      }

      // Use a Map to group messages by ticket_id and find the latest one
      const sessionsMap = new Map<string, ChatSession>();

      // Sort messages by date descending to make finding the latest one easy
      const sortedMessages = allMessages.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      sortedMessages.forEach((msg) => {
        const ticketId = String(msg.ticket_id);
        
        // If we haven't created a session for this ticket yet, create one
        // Because the list is sorted, this will be the latest message
        if (!sessionsMap.has(ticketId)) {
          sessionsMap.set(ticketId, {
            ticket_id: ticketId,
            user: msg.user,
            priority: msg.priority,
            lastMessage: msg.content,
            lastMessageTime: new Date(msg.created_at).toLocaleString(), // Format time nicely
          });
        }
      });

      // Convert the Map values to an array to set the state
      const aggregatedSessions = Array.from(sessionsMap.values());
      setChatSessions(aggregatedSessions);

    } catch (err) {
      console.error("Error loading chats:", err);
    }
  };

  // -----------------------------
  // Fetch messages for selected chat (This part is already correct)
  // -----------------------------
  // New, CORRECT version
const fetchMessages = async (ticketId: string) => {
    try {
        // --- FIX: Use the dedicated route for fetching messages by ticket ID ---
        const res = await axios.get(
            `${API_BASE_URL}/api/tickets/${ticketId}/messages`
        );

        if (Array.isArray(res.data.data)) {
            // Sort messages by timestamp ascending for correct chat display
            const sorted = res.data.data.sort((a: any, b: any) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            setMessages((prev) => ({ ...prev, [ticketId]: sorted }));
        } else {
            console.error("Messages API returned non-array:", res.data.data);
            setMessages((prev) => ({ ...prev, [ticketId]: [] })); // Clear messages on error
        }
    } catch (err) {
        console.error(`Error loading messages for ticket ${ticketId}:`, err);
    }
};

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat]);

  // -----------------------------
  // Send message (Mostly correct, small enhancement)
  // -----------------------------
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    // Create a temporary message for instant UI update
    const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: message,
        sender: 'user', // Assuming the logged-in user is sending
        timestamp: new Date().toISOString(),
        user: { name: user?.name || "Me" }
    };

    setMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), tempMessage],
    }));

    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/messages`, {
        ticket_id: selectedChat,
        content: message,
        is_from_chatbot: false, // This seems to indicate an admin/agent reply
      });

      // After successful send, refresh the messages to get the real one from the server
      if (res.data?.data) {
        fetchMessages(selectedChat); 
        fetchChats(); // Also refresh sidebar to update last message
      }

    } catch (err) {
      console.error("Error sending message:", err);
      // Optional: Add logic to show an error on the temp message
    }
  };

  // -----------------------------
  // Filter chat sessions safely
  // -----------------------------
   const filteredSessions = chatSessions.filter((session) => {
    const priorityName = session.priority?.name || "";
    const userName = session.user?.name || "Unknown";
    const lastMessage = session.lastMessage || "";

    const matchesSearch =
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      priorityName.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "low": return "success";
      case "medium": return "warning";
      case "high": return "danger";
      default: return "default";
    }
  };
  
  // Find current chat details for the header
  const currentChatDetails = selectedChat ? chatSessions.find(s => s.ticket_id === selectedChat) : null;

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
                placeholder="Search by name or message..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

       <div className="flex-1 overflow-y-auto">
  {filteredSessions.map((session) => {
    const priorityName = session.priority?.name || "Unknown";
    return (
      <div
        key={session.ticket_id}
        onClick={() => setSelectedChat(session.ticket_id)}
        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
          selectedChat === session.ticket_id
            ? "bg-blue-50 dark:bg-blue-900/20 border-r-4 border-r-blue-500"
            : ""
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-10 h-9 bg-gray-400 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-medium">
                {session.user?.name?.split(" ").map((n) => n[0]).join("") || 'U'}
              </span>
            </div>
            <div className="truncate">
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {session.user?.name || "Unknown"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {session.lastMessage}
              </p>
            </div>
          </div>
          <Badge variant={getPriorityColor(priorityName)} size="sm">
            {priorityName}
          </Badge>
        </div>
        <p className="text-xs text-right text-gray-500 dark:text-gray-500 mt-1 truncate">
          {session.lastMessageTime}
        </p>
      </div>
    );
  })}
</div>

      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat && currentChatDetails ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {currentChatDetails.user?.name?.split(" ").map((n) => n[0]).join("") || 'U'}
                        </span>
                    </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                        {currentChatDetails.user?.name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ticket ID: {currentChatDetails.ticket_id}
                    </p>
                  </div>
                </div>
                <Badge variant={getPriorityColor(currentChatDetails.priority?.name)}>
                  {currentChatDetails.priority?.name || "Unknown"}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages[selectedChat]?.map((msg, index) => (
                <div
                  key={msg.id ?? `msg-${index}`} // Use index as fallback key
                  className={`flex ${
                    // Determine sender based on who is logged in
                    msg.user_id === user?.id ? "justify-end" : "justify-start"
                  }`}
                  
                >
                  <div
                    className={`flex items-start space-x-2 max-w-md ${
                      msg.user_id === user?.id ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                     <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.user_id === user?.id ? "bg-blue-600" : "bg-gray-600"
                      }`}
                    >
                      {msg.user_id === user?.id ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`p-3 rounded-lg ${
                           msg.user_id === user?.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        {msg.content}
                        
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div>
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-400"/>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Select a chat to begin
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Choose a conversation from the sidebar to view messages or send a reply.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportChatPage;