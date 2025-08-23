import React, { useEffect, useState, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ChatMessage, PreTicketData, Department, Category, Priority, UserData } from '../../types';

interface PreTicketChatbotProps {
  onTicketCreate: (data: PreTicketData) => void;
  // This prop now correctly handles both authenticated users and guests (null)
  currentUser: UserData | null;
}

const API_BASE_URL = 'http://localhost:8000/api';

const PreTicketChatbot: React.FC<PreTicketChatbotProps> = ({ onTicketCreate, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  
  const [ticketData, setTicketData] = useState<PreTicketData>({
    description: '',
    data: {
      department_id: null,
      department_text: null,
      category_id: null,
      category_text: null,
      priority_id: null,
      priority_text: null,
      created_by: null,
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);

  // --- NEW: State to hold the dynamic conversation steps and guest email ---
  const [conversationSteps, setConversationSteps] = useState<any[]>([]);
  const [guestEmail, setGuestEmail] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // --- MODIFIED: Base steps without guest-specific questions ---
  const baseSteps = [
    {
      question: "Which department should handle this?",
      field: "department",
    },
    {
      question: "What type of issue are you experiencing?",
      field: "category",
    },
    {
      question: "How urgent is this issue?",
      field: "priority",
    },
    {
      question: "Please provide a detailed description of the issue:",
      field: "description",
    },
  ];

  useEffect(() => {
    // --- MODIFIED: Logic to handle both authenticated and guest users ---
    if (currentUser) {
      // User is logged in
      addMessage(`Hi ${currentUser.name}! I'm here to help you create a support ticket.`, 'bot');
      setConversationSteps(baseSteps);
      fetchOptions(baseSteps[0].question); // Start with the first question for departments
    } else {
      // User is a guest
      const guestSteps = [
        {
          question: "To get started, please provide your email address.",
          field: "email",
        },
        ...baseSteps,
      ];
      setConversationSteps(guestSteps);
      addMessage("Hi there! I'm here to help you create a support ticket.", 'bot');
      // Ask the very first question (email) for guests
      setTimeout(() => addMessage(guestSteps[0].question, 'bot'), 500);
      fetchOptions(); // Fetch options in the background
    }
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOptions = async (firstQuestion?: string) => {
    try {
      const [deptRes, catRes, priorityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/departments`),
        axios.get(`${API_BASE_URL}/categories`),
        axios.get(`${API_BASE_URL}/priorities`),
      ]);
      
      const fetchedDepts = deptRes.data.data || [];
      setDepartments(fetchedDepts);
      setCategories(catRes.data.data || []);
      setPriorities(priorityRes.data.data || []);
      setOptionsLoaded(true);
      console.log("Fetched options:", deptRes.data, catRes.data, priorityRes.data);
      
      // If a first question is provided (for logged-in users), ask it now
      if (firstQuestion) {
        const deptSuggestions = fetchedDepts.map((d: Department) => d.name).concat('Other');
        addMessage(firstQuestion, 'bot', deptSuggestions);
      }
    } catch (err) {
      console.error("Failed to fetch options", err);
      addMessage("❌ Failed to load initial data. Please try refreshing the page.", 'bot');
    }
  };

  const addMessage = (content: string, sender: 'user' | 'bot', suggestions?: string[]) => {
    const message: ChatMessage = { id: uuidv4(), content, sender, timestamp: new Date().toISOString(), suggestions, };
    console.log("Adding message:", message);
    setMessages(prev => [...prev, message]);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    // Guest users can send messages before all options are loaded (for email step)
    if (!input.trim()) return;
    addMessage(input, 'user');
    processUserResponse(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!optionsLoaded && currentUser) return;
    addMessage(suggestion, 'user');
    processUserResponse(suggestion);
  };

  const processUserResponse = async (response: string) => {
    const step = conversationSteps[currentStep];
    if (!step) return;

    console.log("Processing response:", response, "for step:", step);

    const newTicketData: PreTicketData = { ...ticketData, data: { ...ticketData.data } };
    let nextStepIndex = currentStep + 1;

    try {
      // --- NEW: Handle the email step for guests ---
      if (step.field === 'email') {
        // Simple email validation
        if (!/\S+@\S+\.\S+/.test(response)) {
            addMessage("That doesn't look like a valid email. Please try again.", 'bot');
            return; // Stay on the current step
        }
        setGuestEmail(response);
      }
      else if (step.field === 'department') {
        const match = departments.find(d => d.name.toLowerCase() === response.toLowerCase());
        newTicketData.data.department_id = match?.id || null;
        newTicketData.data.department_text = match ? null : response;
        if (!match) nextStepIndex = currentStep + 2;
      }
      else if (step.field === 'category') {
        const match = categories.find(c => c.name.toLowerCase() === response.toLowerCase());
        newTicketData.data.category_id = match?.id || null;
        newTicketData.data.category_text = match ? null : response;
      }
      else if (step.field === 'priority') {
        const match = priorities.find(p => p.name.toLowerCase() === response.toLowerCase());
        newTicketData.data.priority_id = match?.id || null;
        newTicketData.data.priority_text = match ? null : response;
      }
      else if (step.field === 'description') {
        newTicketData.description = response;
      }

      // Set user ID if logged in, otherwise it remains null
      newTicketData.data.created_by = currentUser?.id || null;
      setTicketData(newTicketData);

      if (nextStepIndex < conversationSteps.length) {
        const nextStep = conversationSteps[nextStepIndex];
        let nextSuggestions: string[] = [];
        if (nextStep.field === 'department') nextSuggestions = departments.map(d => d.name).concat('Other');
        if (nextStep.field === 'category') nextSuggestions = categories.map(c => c.name).concat('Other');
        if (nextStep.field === 'priority') nextSuggestions = priorities.map(p => p.name).concat('Other');
        setCurrentStep(nextStepIndex);
        setTimeout(() => addMessage(nextStep.question, 'bot', nextSuggestions), 500);
      } else {
        setTimeout(async () => {
          addMessage("Perfect! Creating your ticket...", 'bot');
          try {
            setLoading(true);
            
            // --- MODIFIED: Append guest email to the description if it exists ---
            let finalDescription = newTicketData.description || 'No description provided';
            if (guestEmail) {
                finalDescription += `\n\n---\nContact Email provided by guest: ${guestEmail}`;
            }

            const payload = {
              content: finalDescription,
              is_from_chatbot: true,
              ...newTicketData.data,
              create_ticket: true,
            };
            console.log("Sending payload to create ticket:", payload);
            await axios.post(`${API_BASE_URL}/messages`, payload);

            addMessage('✅ Ticket has been created successfully!', 'bot');
            onTicketCreate(newTicketData);
          } catch (err) {
            console.error("Error during ticket creation API call:", err);
            addMessage('❌ Something went wrong while creating your ticket.', 'bot');
          } finally {
            setLoading(false);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Error processing response:", err);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3"><Bot className="w-4 h-4 text-white" /></div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Support Assistant</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Here to help with your ticket</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                {message.sender === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
              </div>
              <div>
                <div className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>{message.content}</div>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((s) => (
                      <button key={s} onClick={() => handleSuggestionClick(s)} disabled={!optionsLoaded || loading} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors duration-200 disabled:opacity-50">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={loading} />
          <Button onClick={handleSend} icon={<Send size={16} />} disabled={!input.trim() || loading} />
        </div>
      </div>
    </div>
  );
};

export default PreTicketChatbot;