import React, { useState, useEffect, useRef } from 'react';
import { FileText, Send, Bot, User, ArrowRight, Check } from 'lucide-react';
import { ChatMessage, PreTicketData, Department, Category, Priority } from '../types'; // Assuming types are correctly imported
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Necessary for unique message IDs

const API_BASE_URL = 'http://localhost:8000/api';

const PublicTicketPage: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'chat' | 'form' | 'success'>('welcome');
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
      user_id: null,
    },
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  
  const [guestEmail, setGuestEmail] = useState<string>(''); // Initialize as empty string
  const [finalTicketInfo, setFinalTicketInfo] = useState({ id: '', priority: '', department: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    description: '',
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const baseSteps = [
    { question: "Which department should handle this issue?", field: "department" },
    { question: "What type of issue are you experiencing?", field: "category" },
    { question: "How urgent is this issue for you?", field: "priority" },
    { question: "Please provide a detailed description of the issue:", field: "description" },
  ];
  
  const fullChatSteps = [
    { question: "Hi! To get started, what is your email address?", field: "email", suggestions: [] },
    ...baseSteps
  ];
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
      if (step === 'chat') {
          fetchOptions();
      }
  }, [step]);


  const fetchOptions = async () => {
    try {
      const [deptRes, catRes, priorityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/departments`),
        axios.get(`${API_BASE_URL}/categories`),
        axios.get(`${API_BASE_URL}/priorities`),
      ]);
      setDepartments(deptRes.data.data || []);
      setCategories(catRes.data.data || []);
      setPriorities(priorityRes.data.data || []);
      setOptionsLoaded(true);
    } catch (err) {
      console.error("Failed to fetch options", err);
      addMessage("❌ Failed to load categories and departments.", 'bot');
    }
  };

  const getSuggestionsForStep = (field: string): string[] => {
    switch(field) {
        case 'category': return categories.map(c => c.name).concat('Other');
        case 'priority': return priorities.map(p => p.name).concat('Other');
        case 'department': return departments.map(d => d.name).concat('Not sure');
        default: return [];
    }
  }

  const addMessage = (content: string, sender: 'user' | 'bot', suggestions?: string[]) => {
    const message: ChatMessage = { id: uuidv4(), content, sender, timestamp: new Date().toISOString(), suggestions };
    setMessages(prev => [...prev, message]);
  };

  const startChat = () => {
    setStep('chat');
    addMessage("Welcome! Starting the ticket process.", 'bot');
    setTimeout(() => {
        const firstStep = fullChatSteps[0];
        addMessage(firstStep.question, 'bot');
    }, 500);
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    addMessage(input, 'user');
    processUserResponse(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (loading) return;
    addMessage(suggestion, 'user');
    processUserResponse(suggestion);
  };

  const processUserResponse = (response: string) => {
    const stepInfo = fullChatSteps[currentStep];
    const newTicketData: PreTicketData = { ...ticketData, data: { ...ticketData.data } };
    let nextStepIndex = currentStep + 1;

    if (stepInfo.field === 'email') {
        if (!/\S+@\S+\.\S+/.test(response)) {
            addMessage("That doesn't look like a valid email. Please try again.", 'bot');
            return;
        }
        setGuestEmail(response);
        setFormData(prev => ({...prev, email: response})); 
    }
    else if (stepInfo.field === 'department' || stepInfo.field === 'category' || stepInfo.field === 'priority') {
        let optionsList: { id: number; name: string }[] = [];
        let idKey: keyof PreTicketData['data'] = 'department_id';
        let textKey: keyof PreTicketData['data'] = 'department_text';
        
        if (stepInfo.field === 'department') { optionsList = departments; idKey = 'department_id'; textKey = 'department_text'; }
        else if (stepInfo.field === 'category') { optionsList = categories; idKey = 'category_id'; textKey = 'category_text'; }
        else if (stepInfo.field === 'priority') { optionsList = priorities; idKey = 'priority_id'; textKey = 'priority_text'; }
        
        const match = optionsList.find(item => item.name.toLowerCase() === response.toLowerCase());
        
        (newTicketData.data as any)[idKey] = match?.id || null;
        (newTicketData.data as any)[textKey] = match ? null : response;

        if (stepInfo.field === 'department' && !match) {
            nextStepIndex = currentStep + 2;
        }
    } 
    else if (stepInfo.field === 'description') {
        newTicketData.description = response;
    }
    
    setTicketData(newTicketData);

    if (nextStepIndex < fullChatSteps.length) {
      const nextStep = fullChatSteps[nextStepIndex];
      setCurrentStep(nextStepIndex);
      const nextSuggestions = getSuggestionsForStep(nextStep.field);
      setTimeout(() => {
        addMessage(nextStep.question, 'bot', nextSuggestions);
      }, 500);
    } else {
      setTimeout(() => {
        handleSubmitTicket(newTicketData);
      }, 1000);
    }
  };

  const handleSubmitTicket = async (dataToSubmit: PreTicketData) => {
    setLoading(true);
    addMessage("Creating your ticket...", 'bot');

    const description = dataToSubmit.description || 'No description provided by chat.';
    const title = `New Public Ticket: ${description.substring(0, 40)}${description.length > 40 ? '...' : ''}`;
    
    // --- THIS IS THE FIX ---
    // The payload must include the 'guest_email' field to pass backend validation.
    const payload = {
        title: title,
        content: description,
        guest_email: guestEmail, // Added the required field
        is_from_chatbot: true,
        user_id: null,
        department_id: dataToSubmit.data.department_id,
        department_text: dataToSubmit.data.department_text,
        category_id: dataToSubmit.data.category_id,
        category_text: dataToSubmit.data.category_text,
        priority_id: dataToSubmit.data.priority_id,
        priority_text: dataToSubmit.data.priority_text,
        create_ticket: true,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/messages/public`, payload);

      const ticketId = res.data?.data?.ticket?.id || uuidv4().slice(0, 6).toUpperCase();
      const priority = priorities.find(p => p.id === payload.priority_id)?.name || payload.priority_text;
      const department = departments.find(d => d.id === payload.department_id)?.name || payload.department_text;

      setFinalTicketInfo({ id: ticketId, priority: priority || 'N/A', department: department || 'N/A' });

      addMessage("✅ Ticket created successfully!", 'bot');
      setTimeout(() => {
        setStep('success');
      }, 1500);

    } catch (error) {
      console.error("Error submitting ticket:", axios.isAxiosError(error) ? error.response?.data : error);
      const errorMessage = (axios.isAxiosError(error) && error.response?.data?.message) || 'An unknown error occurred.';
      addMessage(`❌ Sorry, there was a problem creating your ticket: `, 'bot');
    } finally {
      setLoading(false);
    }
  };

  // --- ALL YOUR RENDER FUNCTIONS ARE UNTOUCHED ---

  const renderWelcome = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-blue-300 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-red-50 to-blue-300 dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center "><img src="https://teratech.co.tz/assets/logo-4eACH_FU.png" alt="Logo" /></div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tera Support Center</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Need help? Our AI assistant will guide you through creating a support ticket to get the help you need quickly.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg shadow-lg"><div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3"><Bot className="w-6 h-6 text-white" /></div><h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Guided</h3><p className="text-sm text-gray-600 dark:text-gray-400">Our chatbot helps categorize your issue for faster resolution</p></div>
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg shadow-lg"><div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3"><ArrowRight className="w-6 h-6 text-white" /></div><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Process</h3><p className="text-sm text-gray-600 dark:text-gray-400">Simple 3-step process to submit your support request</p></div>
            <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg shadow-lg"><div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3"><User className="w-6 h-6 text-white" /></div><h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expert Support</h3><p className="text-sm text-gray-600 dark:text-gray-400">Your ticket will be routed to the right specialist</p></div>
          </div>
          <Button onClick={startChat} size="lg" className="px-8">Get Started</Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">No account required • Free support • Quick response</p>
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-blue-300 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-red-50 to-blue-300 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-4 text-white"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><Bot className="w-5 h-5" /></div><div><h3 className="font-semibold">Support Assistant</h3><p className="text-blue-100 text-sm">Here to help create your ticket</p></div></div></div>
          <div className="h-96 overflow-y-auto p-4 space-y-4 shadow-lg">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'}`}>{message.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-6 h-4 text-white" />}</div>
                  <div>
                    <div className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>{message.content}</div>
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.suggestions.map((suggestion, index) => (<button key={index} onClick={() => handleSuggestionClick(suggestion)} disabled={loading} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors duration-200">{suggestion}</button>))}
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
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={loading ? "Creating ticket..." : "Type your message..."} onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={loading} />
              <Button onClick={handleSend} icon={<Send size={16} />} disabled={!input.trim() || loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => ( <div></div> );

  const renderSuccess = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-2xl mb-6"><Check className="w-10 h-10 text-white" /></div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ticket Submitted Successfully!</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Your support ticket has been created and our team will get back to you shortly.</p>
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Ticket Details</h3>
            <div className="text-left space-y-2 text-sm">
              <p><strong>Ticket ID:</strong> #{finalTicketInfo.id}</p>
              <p><strong>Priority:</strong> {finalTicketInfo.priority}</p>
              <p><strong>Department:</strong> {finalTicketInfo.department}</p>
              <p><strong>Status:</strong> Open</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            <p>We'll send all updates to your email: <strong>{guestEmail}</strong></p>
            <p>Expected response time: 2-4 business hours</p>
          </div>
          <Button onClick={() => window.location.reload()}>Submit Another Ticket</Button>
        </div>
      </div>
    </div>
  );

  switch (step) {
    case 'welcome': return renderWelcome();
    case 'chat': return renderChat();
    case 'form': return renderForm();
    case 'success': return renderSuccess();
    default: return renderWelcome();
  }
};

export default PublicTicketPage;  