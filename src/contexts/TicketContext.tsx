import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ticket, Comment, Analytics } from '../types';
import { mockTickets, mockAnalytics } from '../utils/mockData';

interface TicketContextType {
  tickets: Ticket[];
  analytics: Analytics;
  loading: boolean;
  createTicket: (ticketData: Partial<Ticket>) => Promise<void>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  mergeTickets: (primaryId: string, secondaryId: string) => Promise<void>;
  exportTickets: (format: 'pdf' | 'excel', ticketIds: string[]) => Promise<void>;
  filterTickets: (filters: any) => Ticket[];
  searchTickets: (query: string) => Ticket[];
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

interface TicketProviderProps {
  children: ReactNode;
}

export const TicketProvider: React.FC<TicketProviderProps> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [analytics, setAnalytics] = useState<Analytics>(mockAnalytics);
  const [loading, setLoading] = useState(false);

  const createTicket = async (ticketData: Partial<Ticket>) => {
    setLoading(true);
    // Simulate API call
    const newTicket: Ticket = {
      id: Date.now().toString(),
      title: ticketData.title || '',
      description: ticketData.description || '',
      priority: ticketData.priority || 'medium',
      status: 'pending',
      category: ticketData.category || 'general',
      department: ticketData.department || 'IT',
      createdBy: ticketData.createdBy!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };
    
    setTickets(prev => [newTicket, ...prev]);
    setLoading(false);
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
        : ticket
    ));
  };

  const addComment = async (ticketId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            comments: [...ticket.comments, newComment],
            updatedAt: new Date().toISOString()
          }
        : ticket
    ));
  };

  const mergeTickets = async (primaryId: string, secondaryId: string) => {
    // Implementation for merging tickets
    console.log('Merging tickets:', primaryId, secondaryId);
  };

  const exportTickets = async (format: 'pdf' | 'excel', ticketIds: string[]) => {
    // Implementation for exporting tickets
    console.log('Exporting tickets:', format, ticketIds);
  };

  const filterTickets = (filters: any): Ticket[] => {
    return tickets.filter(ticket => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.department && ticket.department !== filters.department) return false;
      if (filters.assignedTo && ticket.assignedTo?.id !== filters.assignedTo) return false;
      return true;
    });
  };

  const searchTickets = (query: string): Ticket[] => {
    const lowercaseQuery = query.toLowerCase();
    return tickets.filter(ticket =>
      ticket.title.toLowerCase().includes(lowercaseQuery) ||
      ticket.description.toLowerCase().includes(lowercaseQuery) ||
      ticket.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <TicketContext.Provider 
      value={{
        tickets,
        analytics,
        loading,
        createTicket,
        updateTicket,
        addComment,
        mergeTickets,
        exportTickets,
        filterTickets,
        searchTickets,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};