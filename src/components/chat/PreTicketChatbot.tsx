import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage, PreTicketData } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface PreTicketChatbotProps {
  onTicketCreate: (data: PreTicketData) => void;
}

const PreTicketChatbot: React.FC<PreTicketChatbotProps> = ({ onTicketCreate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm here to help you create a support ticket. What issue are you experiencing?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Login issues',
        'Software problem',
        'Hardware malfunction',
        'Network connectivity',
        'Other'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [ticketData, setTicketData] = useState<PreTicketData>({});
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      question: "What type of issue are you experiencing?",
      field: 'category',
      suggestions: ['Login issues', 'Software problem', 'Hardware malfunction', 'Network connectivity', 'Other']
    },
    {
      question: "How urgent is this issue?",
      field: 'priority',
      suggestions: ['Low - Can wait', 'Medium - Affects work', 'High - Blocking work', 'Critical - System down']
    },
    {
      question: "Which department should handle this?",
      field: 'department',
      suggestions: ['IT', 'HR', 'Finance', 'Operations']
    },
    {
      question: "Please provide a detailed description of the issue:",
      field: 'description',
      suggestions: []
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
    const step = steps[currentStep];
    const newTicketData = { ...ticketData, [step.field]: response };
    setTicketData(newTicketData);

    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1];
      setTimeout(() => {
        addMessage(nextStep.question, 'bot', nextStep.suggestions);
        setCurrentStep(currentStep + 1);
      }, 500);
    } else {
      setTimeout(() => {
        addMessage(
          "Perfect! I have all the information needed. I'll create your support ticket now.",
          'bot'
        );
        setTimeout(() => {
          onTicketCreate(newTicketData);
        }, 1000);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Support Assistant</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Here to help with your ticket</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-600'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-3 h-3 text-white" />
                ) : (
                  <Bot className="w-3 h-3 text-white" />
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
  );
};

export default PreTicketChatbot;