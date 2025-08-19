import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Ticket, Comment, Analytics } from '../types';
import { API_BASE_URL } from '../utils/constants';

interface TicketContextType {
  tickets: Ticket[];
  analytics: Analytics | null;
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
  if (!context) throw new Error('useTickets must be used within a TicketProvider');
  return context;
};

interface TicketProviderProps {
  children: ReactNode;
}

export const TicketProvider: React.FC<TicketProviderProps> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);

  const normalizeTicket = (ticket: any): Ticket => ({
    ...ticket,
    status: typeof ticket.status === 'string' ? ticket.status : ticket.status?.name || 'unknown',
    priority: typeof ticket.priority === 'string' ? ticket.priority : ticket.priority?.name || 'low',
    createdBy: { ...ticket.createdBy, name: ticket.createdBy?.name || 'Unknown' },
    assignedTo: ticket.assignedTo
      ? { ...ticket.assignedTo, name: ticket.assignedTo?.name || 'Unassigned' }
      : null,
    comments: ticket.comments || [],
    attachments: ticket.attachments || [],
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tickets`);
      const normalized = (res.data.data || []).map(normalizeTicket);
      setTickets(normalized);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      toast.error('Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const createTicket = async (ticketData: Partial<Ticket>) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/tickets`, ticketData);
      setTickets(prev => [normalizeTicket(res.data.data), ...prev]);
      toast.success('Ticket created successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/tickets/${ticketId}`, updates);
      setTickets(prev =>
        prev.map(t => (t.id === ticketId ? normalizeTicket(res.data.data) : t))
      );
      toast.success('Ticket updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update ticket.');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (ticketId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/tickets/${ticketId}/comments`, commentData);
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, comments: [...ticket.comments, res.data.data] }
            : ticket
        )
      );
      toast.success('Comment added successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to add comment.');
    }
  };

  const mergeTickets = async (primaryId: string, secondaryId: string) => {
    console.log('Merge tickets:', primaryId, secondaryId);
  };

  const exportTickets = async (format: 'pdf' | 'excel', ticketIds: string[]) => {
    console.log('Export tickets:', format, ticketIds);
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
    const lower = query.toLowerCase();
    return tickets.filter(
      t =>
        t.title.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower) ||
        t.category.toLowerCase().includes(lower)
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
