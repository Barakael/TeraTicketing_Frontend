import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Ticket, Comment, Analytics } from "../types";
import { API_BASE_URL } from "../utils/constants";

interface TicketContextType {
  tickets: Ticket[];
  analytics: Analytics | null;
  loading: boolean;
  createTicket: (ticketData: Partial<Ticket>) => Promise<void>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  addComment: (
    ticketId: string,
    comment: {
      content: string;
      isInternal: boolean;
      userId: string;
      user: any;
    }
  ) => Promise<void>;
  mergeTickets: (primaryId: string, secondaryId: string) => Promise<void>;
  exportTickets: (
    format: "pdf" | "excel",
    ticketIds: string[]
  ) => Promise<void>;
  filterTickets: (filters: any) => Ticket[];
  searchTickets: (query: string) => Ticket[];
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context)
    throw new Error("useTickets must be used within a TicketProvider");
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
    title: ticket.title || "Untitled",
    description: ticket.description || "",
    category: ticket.category || "",
    department: ticket.department || "",
    status:
      typeof ticket.status === "string"
        ? ticket.status
        : ticket.status?.name || "pending",
    priority:
      typeof ticket.priority === "string"
        ? ticket.priority
        : ticket.priority?.name || "low",
    createdBy: {
      id: ticket.createdBy?.id || "",
      name: ticket.createdBy?.name || "Unknown",
      email: ticket.createdBy?.email || "",
      role: ticket.createdBy?.role || "troubleshooter",
      isActive: ticket.createdBy?.isActive ?? true,
      createdAt: ticket.createdBy?.createdAt || new Date().toISOString(),
    },
    assignedTo: ticket.assignedTo
      ? {
          id: ticket.assignedTo.id || "",
          name: ticket.assignedTo?.name || "Unassigned",
          email: ticket.assignedTo?.email || "",
          role: ticket.assignedTo?.role || "troubleshooter",
          isActive: ticket.assignedTo?.isActive ?? true,
          createdAt: ticket.assignedTo?.createdAt || new Date().toISOString(),
        }
      : undefined,
    comments: ticket.comments || [],
    attachments: ticket.attachments || [],
    createdAt:
      ticket.createdAt || ticket.created_at || new Date().toISOString(),
    updatedAt:
      ticket.updatedAt || ticket.updated_at || new Date().toISOString(),
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tickets`);
      console.log("Raw ticket data:", res.data.data?.[0]); // Debug: log first ticket structure
      const normalized = (res.data.data || []).map(normalizeTicket);
      setTickets(normalized);
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      toast.error("Failed to fetch tickets.");
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
      const res = await axios.post(`${API_BASE_URL}/api/messages`, ticketData);

      // Check if the response has the expected structure
      if (res.data && res.data.data) {
        const newTicket = normalizeTicket(res.data.data);
        setTickets((prev) => [newTicket, ...prev]);
        toast.success("Ticket created successfully!");
      } else {
        // If the response doesn't have the expected structure, create a mock ticket
        const mockTicket: Ticket = {
          id: Date.now().toString(),
          title: ticketData.title || "New Ticket",
          description: ticketData.description || "",
          priority: ticketData.priority || "medium",
          status: "pending",
          category: ticketData.category || "",
          department: ticketData.department || "",
          createdBy: ticketData.createdBy || {
            id: "",
            name: "Unknown",
            email: "",
            role: "troubleshooter",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          assignedTo: ticketData.assignedTo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
          attachments: [],
        };
        setTickets((prev) => [mockTicket, ...prev]);
        toast.success("Ticket created successfully!");
      }
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      toast.error("Failed to create ticket.");
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/tickets/${ticketId}`,
        updates
      );
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? normalizeTicket(res.data.data) : t
        )
      );
      toast.success("Ticket updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update ticket.");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (
    ticketId: string,
    comment: {
      content: string;
      isInternal: boolean;
      userId: string;
      user: any;
    }
  ) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/tickets/${ticketId}/comments`,
        comment
      );
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, comments: [...ticket.comments, res.data.data] }
            : ticket
        )
      );
      toast.success("Comment added successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to add comment.");
    }
  };

  const mergeTickets = async (primaryId: string, secondaryId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/tickets/merge`, {
        primaryTicketId: primaryId,
        secondaryTicketId: secondaryId,
      });
      toast.success("Tickets merged successfully!");
      fetchTickets(); // Refresh tickets
    } catch (err: any) {
      console.error("Error merging tickets:", err);
      toast.error("Failed to merge tickets.");
    }
  };

  const exportTickets = async (
    format: "pdf" | "excel",
    ticketIds: string[]
  ) => {
    try {
      // Get the tickets to export
      const ticketsToExport = tickets.filter((ticket) =>
        ticketIds.includes(ticket.id)
      );

      if (format === "excel") {
        // Create CSV content
        const headers = [
          "ID",
          "Title",
          "Description",
          "Priority",
          "Status",
          "Department",
          "Category",
          "Created By",
          "Assigned To",
          "Created At",
          "Updated At",
        ];

        const csvContent = [
          headers.join(","),
          ...ticketsToExport.map((ticket) =>
            [
              ticket.id,
              `"${ticket.title.replace(/"/g, '""')}"`,
              `"${ticket.description.replace(/"/g, '""')}"`,
              ticket.priority,
              ticket.status,
              ticket.department,
              ticket.category,
              ticket.createdBy.name,
              ticket.assignedTo?.name || "Unassigned",
              ticket.createdAt,
              ticket.updatedAt,
            ].join(",")
          ),
        ].join("\n");

        // Create and download file
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `tickets-export-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Excel export completed successfully!");
      } else if (format === "pdf") {
        // For PDF, we'll create a simple text-based PDF using jsPDF
        // First, let's check if jsPDF is available
        try {
          const { jsPDF } = await import("jspdf");
          const doc = new jsPDF();

          // Add title
          doc.setFontSize(16);
          doc.text("Tickets Export", 20, 20);

          // Add date
          doc.setFontSize(10);
          doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

          let yPosition = 50;
          ticketsToExport.forEach((ticket, index) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }

            doc.setFontSize(12);
            doc.setFont(undefined, "bold");
            doc.text(`Ticket ${index + 1}: ${ticket.title}`, 20, yPosition);

            yPosition += 8;
            doc.setFontSize(10);
            doc.setFont(undefined, "normal");
            doc.text(`ID: ${ticket.id}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Priority: ${ticket.priority}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Status: ${ticket.status}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Department: ${ticket.department}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Created by: ${ticket.createdBy.name}`, 20, yPosition);
            yPosition += 6;
            doc.text(
              `Assigned to: ${ticket.assignedTo?.name || "Unassigned"}`,
              20,
              yPosition
            );
            yPosition += 6;
            doc.text(
              `Created: ${new Date(ticket.createdAt).toLocaleDateString()}`,
              20,
              yPosition
            );
            yPosition += 12;

            // Add description (truncated)
            const description =
              ticket.description.length > 100
                ? ticket.description.substring(0, 100) + "..."
                : ticket.description;
            doc.text(`Description: ${description}`, 20, yPosition);
            yPosition += 15;
          });

          // Save the PDF
          doc.save(
            `tickets-export-${new Date().toISOString().split("T")[0]}.pdf`
          );
          toast.success("PDF export completed successfully!");
        } catch (pdfError) {
          console.error("PDF generation error:", pdfError);
          toast.error(
            "PDF export failed. Please install jsPDF or use Excel export."
          );
        }
      }
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error(`Failed to export ${format.toUpperCase()}`);
      throw err;
    }
  };

  const filterTickets = (filters: any): Ticket[] => {
    return tickets.filter((ticket) => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.priority && ticket.priority !== filters.priority)
        return false;
      if (filters.department && ticket.department !== filters.department)
        return false;
      if (filters.assignedTo && ticket.assignedTo?.id !== filters.assignedTo)
        return false;
      return true;
    });
  };

  const searchTickets = (query: string): Ticket[] => {
    const lower = query.toLowerCase();
    return tickets.filter(
      (t) =>
        (t.title?.toLowerCase() || "").includes(lower) ||
        (t.description?.toLowerCase() || "").includes(lower) ||
        (t.category?.toLowerCase() || "").includes(lower)
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
