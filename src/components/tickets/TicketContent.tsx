import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { Ticket } from '../types';
import { toast } from 'react-toastify';

// --- NEW/CORRECTED IMPORTS for exporting ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // The correct way to import the plugin
import * as XLSX from 'xlsx';


const API_BASE_URL = 'http://localhost:8000/api';

// Define the shape of the context value with correct function signatures
interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  createTicket: (ticketPayload: any) => Promise<boolean>;
  filterTickets: (filters: any, allTickets: Ticket[]) => Ticket[];
  searchTickets: (query: string, allTickets: Ticket[]) => Ticket[];
  exportTickets: (format: 'pdf' | 'excel', ticketIds: string[]) => void;
  mergeTickets: (id1: string, id2: string) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error('useTickets must be used within a TicketProvider');
  return context;
};

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets`);
      const fetchedTickets = response.data.data || [];
      fetchedTickets.sort((a: Ticket, b: Ticket) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTickets(fetchedTickets);
    } catch (err) {
      setError('Failed to fetch tickets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const createTicket = async (ticketPayload: any): Promise<boolean> => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/messages`, ticketPayload);
      await fetchTickets();
      toast.success('Ticket created successfully!');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create ticket';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const searchTickets = (query: string, allTickets: Ticket[]): Ticket[] => {
    if (!query) return allTickets;
    const lowercasedQuery = query.toLowerCase();
    return allTickets.filter(ticket =>
      ticket.title?.toLowerCase().includes(lowercasedQuery) ||
      ticket.description?.toLowerCase().includes(lowercasedQuery) ||
      ticket.id?.toString().includes(lowercasedQuery) ||
      ticket.user?.name?.toLowerCase().includes(lowercasedQuery) ||
      ticket.category?.name?.toLowerCase().includes(lowercasedQuery)
    );
  };

  const filterTickets = (filters: any, allTickets: Ticket[]): Ticket[] => {
    let filtered = [...allTickets];
    if (filters.status) filtered = filtered.filter(t => t.status?.name === filters.status);
    if (filters.priority) filtered = filtered.filter(t => t.priority?.name === filters.priority);
    if (filters.department) filtered = filtered.filter(t => t.department?.name === filters.department);
    return filtered;
  };

  // --- THIS IS THE FULLY CORRECTED EXPORT FUNCTION ---
  const exportTickets = (format: 'pdf' | 'excel', ticketIds: string[]) => {
    if (ticketIds.length === 0) {
      toast.warn("No tickets selected for export.");
      return;
    }
    const ticketsToExport = tickets.filter(t => ticketIds.includes(t.id));
    toast.info(`Generating ${format.toUpperCase()} for ${ticketsToExport.length} tickets...`);

    // 1. Prepare data in a structured way (array of objects)
    const processedData = ticketsToExport.map(t => ({
      ID: t.id,
      Title: t.title,
      Status: t.status?.name || 'N/A',
      Priority: t.priority?.name || 'N/A',
      Department: t.department?.name || 'N/A',
      Assignee: t.user?.name || 'Unassigned',
      "Created At": new Date(t.created_at).toLocaleString(),
    }));

    if (format === 'excel') {
      // 2. Use the robust 'json_to_sheet' method for Excel
      const worksheet = XLSX.utils.json_to_sheet(processedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
      // 3. Trigger the download
      XLSX.writeFile(workbook, `tickets_export_${Date.now()}.xlsx`);
      toast.success("Excel file generated!");

    } else if (format === 'pdf') {
      const doc = new jsPDF();
      // 4. Use the imported 'autoTable' function for PDF
      autoTable(doc, {
        head: [["ID", "Title", "Status", "Priority", "Department", "Assignee", "Created At"]],
        body: processedData.map(Object.values), // Convert object values to an array for the body
      });
      // 5. Trigger the download
      doc.save(`tickets_export_${Date.now()}.pdf`);
      toast.success("PDF file generated!");
    }
  };

  const mergeTickets = (id1: string, id2: string) => {
    console.log(`Merging ticket ${id1} with ${id2}`);
    toast.info(`Merging tickets... (Feature not implemented)`);
  };

  const value = { tickets, loading, error, fetchTickets, createTicket, filterTickets, searchTickets, exportTickets, mergeTickets };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};