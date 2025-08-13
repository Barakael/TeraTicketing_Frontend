import React, { useState } from 'react';
import { FileText, Send, Bot, User, ArrowRight } from 'lucide-react';
import { ChatMessage, PreTicketData } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const PublicTicketPage: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'chat' | 'form' | 'success'>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [ticketData, setTicketData] = useState<PreTicketData>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    description: '',
  });

  const chatSteps = [
    {
      question: "Hi! I'm here to help you create a support ticket. What type of issue are you experiencing?",
      field: 'category',
      suggestions: ['Login issues', 'Software problem', 'Hardware malfunction', 'Network connectivity', 'Account access', 'Other']
    },
    {
      question: "How urgent is this issue for you?",
      field: 'priority',
      suggestions: ['Low - Can wait a few days', 'Medium - Affects my work', 'High - Blocking my work', 'Critical - System completely down']
    },
    {
      question: "Which department do you think should handle this issue?",
      field: 'department',
      suggestions: ['IT Support', 'Technical Support', 'Account Management', 'General Support', 'Not sure']
    },
    {
      question: "Great! Now I'll need some additional information to create your ticket. Let's proceed to the contact form.",
      field: 'complete',
      suggestions: ['Continue to form']
    }
  ];

  const addMessage = (content: string, sender: 'user' | 'bot', suggestions?: string[]) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date().toISOString(),
      suggestions,
    };
    setMessages(prev => [...prev, message]);
  };

  const startChat = () => {
    setStep('chat');
    const firstStep = chatSteps[0];
    addMessage(firstStep.question, 'bot', firstStep.suggestions);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage(input, 'user');
    processUserResponse(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    addMessage(suggestion, 'user');
    processUserResponse(suggestion);
  };

  const processUserResponse = (response: string) => {
    const step = chatSteps[currentStep];
    const newTicketData = { ...ticketData, [step.field]: response };
    setTicketData(newTicketData);

    if (currentStep < chatSteps.length - 1) {
      const nextStep = chatSteps[currentStep + 1];
      setTimeout(() => {
        addMessage(nextStep.question, 'bot', nextStep.suggestions);
        setCurrentStep(currentStep + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        setStep('form');
      }, 1000);
    }
  };

  const handleSubmitTicket = () => {
    console.log('Submitting ticket:', { ...ticketData, ...formData });
    setStep('success');
  };

  const renderWelcome = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-blue-300 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-red-50 to-blue-300 dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center ">
          <img src="https://teratech.co.tz/assets/logo-4eACH_FU.png" alt="Logo" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Tera Support Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Need help? Our AI assistant will guide you through creating a support ticket to get the help you need quickly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Guided</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our chatbot helps categorize your issue for faster resolution
              </p>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Process</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Simple 3-step process to submit your support request
              </p>
            </div>
            <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expert Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your ticket will be routed to the right specialist
              </p>
            </div>
          </div>

          <Button onClick={startChat} size="lg" className="px-8">
            Get Started
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No account required • Free support • Quick response
          </p>
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-blue-300 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-red-50 to-blue-300 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Support Assistant</h3>
                <p className="text-blue-100 text-sm">Here to help create your ticket</p>
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4 shadow-lg">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-6 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className={`p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      {message.content}
                    </div>
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors duration-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button
                onClick={handleSend}
                icon={<Send size={16} />}
                disabled={!input.trim()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-blue-300 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Ticket
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please provide your contact information and ticket details
            </p>
          </div>

          <div className="space-y-6 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>

            <Input
              label="Phone Number (Optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
            />

            {/* <Input
              label="Issue Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of your issue"
              required
            /> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Detailed Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please provide detailed information about your issue..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                required
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                Ticket Summary
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <p><strong>Category:</strong> {ticketData.category}</p>
                <p><strong>Priority:</strong> {ticketData.priority}</p>
                <p><strong>Department:</strong> {ticketData.department}</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleSubmitTicket}
                className="flex-1"
                disabled={!formData.name || !formData.email || !formData.title || !formData.description}
              >
                Submit Ticket
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('chat')}
                className="flex-1"
              >
                Back to Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-2xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ticket Submitted Successfully!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your support ticket has been created and assigned to our team.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Ticket Details
            </h3>
            <div className="text-left space-y-2 text-sm">
              <p><strong>Ticket ID:</strong> #TKT-{Date.now().toString().slice(-6)}</p>
              <p><strong>Priority:</strong> {ticketData.priority}</p>
              <p><strong>Department:</strong> {ticketData.department}</p>
              <p><strong>Status:</strong> Pending Review</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            <p>We'll send updates to: <strong>{formData.email}</strong></p>
            <p>Expected response time: 2-4 business hours</p>
          </div>

          <Button onClick={() => window.location.reload()}>
            Submit Another Ticket
          </Button>
        </div>
      </div>
    </div>
  );

  switch (step) {
    case 'welcome':
      return renderWelcome();
    case 'chat':
      return renderChat();
    case 'form':
      return renderForm();
    case 'success':
      return renderSuccess();
    default:
      return renderWelcome();
  }
};

export default PublicTicketPage;