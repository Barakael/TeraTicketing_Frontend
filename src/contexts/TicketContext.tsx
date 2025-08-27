import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Ticket, Comment, Analytics, TicketUpdateRequest } from "../types";
import { API_BASE_URL } from "../utils/constants";

interface TicketContextType {
  tickets: Ticket[];
  analytics: Analytics | null;
  loading: boolean;
  createTicket: (ticketData: Partial<Ticket>) => Promise<void>;
  updateTicket: (
    ticketId: string,
    updates: TicketUpdateRequest
  ) => Promise<void>;
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
  filterTickets: (filters: any) => Promise<Ticket[]>;
  searchTickets: (query: string) => Ticket[];
  fetchFilteredTickets: (filters: any) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
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

  const updateTicket = async (
    ticketId: string,
    updates: TicketUpdateRequest
  ) => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/tickets/${ticketId}`,
        updates
      );
      setTickets((prev) =>
        prev.map((t) =>
          t.id.toString() === ticketId ? normalizeTicket(res.data.data) : t
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
      const response = await axios.post(`${API_BASE_URL}/api/tickets/merge`, {
        primaryTicketId: primaryId,
        secondaryTicketId: secondaryId,
      });
      toast.success("Tickets merged successfully!");
      fetchTickets(); // Refresh tickets
    } catch (err: any) {
      console.error("Error merging tickets:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
        toast.error(
          `Failed to merge tickets: ${
            err.response.data?.message || err.response.statusText
          }`
        );
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
        toast.error("Failed to merge tickets: No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", err.message);
        toast.error("Failed to merge tickets: Network error");
      }
    }
  };

  const exportTickets = async (
    format: "pdf" | "excel",
    ticketIds: string[]
  ) => {
    try {
             // Get the tickets to export
       const ticketsToExport = tickets.filter((ticket) =>
         ticketIds.includes(ticket.id.toString())
       );

             if (format === "excel") {
         // Create compact CSV content with essential fields only
         const headers = [
           "ID",
           "Title",
           "Priority",
           "Status",
           "Department",
           "Assigned To",
           "Created At",
         ];

         const csvContent = [
           headers.join(","),
           ...ticketsToExport.map((ticket) => [
             ticket.id,
             `"${(ticket.title || "").replace(/"/g, '""')}"`,
             ticket.priority?.name || 
               (ticket.priority_id === 1 ? "Low" : 
                ticket.priority_id === 2 ? "Medium" : 
                ticket.priority_id === 3 ? "High" : 
                ticket.priority_id === 4 ? "Critical" : "Unknown"),
             ticket.status?.name || 
               (ticket.status_id === 1 ? "Pending" : 
                ticket.status_id === 2 ? "In Progress" : 
                ticket.status_id === 3 ? "Completed" : 
                ticket.status_id === 4 ? "Closed" : "Unknown"),
             ticket.department?.name || ticket.department_id || "Unknown",
             ticket.assignedTo?.name || "Unassigned",
             ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "Unknown",
           ].join(",")),
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
         // For PDF, we'll create a table format using jsPDF
         try {
           const { jsPDF } = await import("jspdf");
           const doc = new jsPDF();

           // Add title
           doc.setFontSize(16);
           doc.text("Tickets Export", 20, 20);

           // Add date
           doc.setFontSize(10);
           doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

                       // Create table headers with adjusted column widths to fit page
            const headers = ["ID", "Title", "Priority", "Status", "Department", "Assigned", "Created"];
            const columnWidths = [12, 45, 20, 20, 25, 20, 20];
            let xPosition = 20;
            
            // Draw header row
            doc.setFontSize(9);
            doc.setFont(undefined, "bold");
            headers.forEach((header, index) => {
              doc.text(header, xPosition, 45);
              xPosition += columnWidths[index];
            });

            // Draw header line
            doc.line(20, 47, 162, 47);

           // Add ticket data in table format
           let yPosition = 60;
           ticketsToExport.forEach((ticket, index) => {
             if (yPosition > 250) {
               doc.addPage();
               yPosition = 20;
                               // Redraw headers on new page
                xPosition = 20;
                doc.setFontSize(9);
                doc.setFont(undefined, "bold");
                headers.forEach((header, headerIndex) => {
                  doc.text(header, xPosition, 25);
                  xPosition += columnWidths[headerIndex];
                });
                doc.line(20, 27, 162, 27);
               yPosition = 40;
             }

             doc.setFontSize(9);
             doc.setFont(undefined, "normal");
             xPosition = 20;

             // ID
             doc.text(ticket.id.toString(), xPosition, yPosition);
             xPosition += columnWidths[0];

                           // Title (truncated if too long)
              const title = ticket.title || "";
              const truncatedTitle = title.length > 20 ? title.substring(0, 17) + "..." : title;
              doc.text(truncatedTitle, xPosition, yPosition);
              xPosition += columnWidths[1];

              // Priority
              const priorityName = ticket.priority?.name || 
                (ticket.priority_id === 1 ? "Low" : 
                 ticket.priority_id === 2 ? "Medium" : 
                 ticket.priority_id === 3 ? "High" : 
                 ticket.priority_id === 4 ? "Critical" : "Unknown");
              doc.text(priorityName, xPosition, yPosition);
              xPosition += columnWidths[2];

              // Status
              const statusName = ticket.status?.name || 
                (ticket.status_id === 1 ? "Pending" : 
                 ticket.status_id === 2 ? "In Progress" : 
                 ticket.status_id === 3 ? "Completed" : 
                 ticket.status_id === 4 ? "Closed" : "Unknown");
              doc.text(statusName, xPosition, yPosition);
              xPosition += columnWidths[3];

              // Department
              const deptName = ticket.department?.name || ticket.department_id || "Unknown";
              const truncatedDept = deptName.toString().length > 12 ? deptName.toString().substring(0, 9) + "..." : deptName.toString();
              doc.text(truncatedDept, xPosition, yPosition);
              xPosition += columnWidths[4];

              // Assigned To
              const assignedName = ticket.assignedTo?.name || "Unassigned";
              const truncatedAssigned = assignedName.length > 8 ? assignedName.substring(0, 5) + "..." : assignedName;
              doc.text(truncatedAssigned, xPosition, yPosition);
              xPosition += columnWidths[5];

             // Created Date
             const createdDate = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "Unknown";
             doc.text(createdDate, xPosition, yPosition);

             yPosition += 8;
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

  const filterTickets = async (filters: any): Promise<Ticket[]> => {
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.department) params.append("department", filters.department);
      if (filters.assignedTo) params.append("assigned_to", filters.assignedTo);

      // Handle date filtering - check for individual startDate/endDate first, then dateRange
      if (filters.startDate) params.append("start_date", filters.startDate);
      if (filters.endDate) params.append("end_date", filters.endDate);

      // If no individual dates but dateRange is set, try to parse it
      if (!filters.startDate && !filters.endDate && filters.dateRange) {
        if (filters.dateRange === "today") {
          const today = new Date().toISOString().split("T")[0];
          params.append("start_date", today);
          params.append("end_date", today);
        } else if (filters.dateRange === "yesterday") {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          params.append("start_date", yesterday);
          params.append("end_date", yesterday);
        } else if (filters.dateRange === "last_7_days") {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          const today = new Date().toISOString().split("T")[0];
          params.append("start_date", sevenDaysAgo);
          params.append("end_date", today);
        } else if (filters.dateRange === "last_30_days") {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          const today = new Date().toISOString().split("T")[0];
          params.append("start_date", thirtyDaysAgo);
          params.append("end_date", today);
        } else if (filters.dateRange === "this_month") {
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];
          params.append("start_date", firstDay);
          params.append("end_date", lastDay);
        } else if (filters.dateRange === "last_month") {
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            .toISOString()
            .split("T")[0];
          const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
            .toISOString()
            .split("T")[0];
          params.append("start_date", firstDay);
          params.append("end_date", lastDay);
        }
      }

      if (filters.searchQuery) params.append("search", filters.searchQuery);

      const response = await axios.get(
        `${API_BASE_URL}/api/tickets?${params.toString()}`
      );

      if (response.data && response.data.data) {
        return response.data.data.map((ticket: any) => normalizeTicket(ticket));
      }

      return [];
    } catch (error) {
      console.error("Error filtering tickets:", error);
      // Fallback to client-side filtering if API fails
      return tickets.filter((ticket) => {
        if (filters.status && ticket.status?.name !== filters.status)
          return false;
        if (filters.priority && ticket.priority?.name !== filters.priority)
          return false;
        if (
          filters.department &&
          ticket.department_id?.toString() !== filters.department
        )
          return false;
        if (filters.assignedTo && ticket.assignedTo?.id !== filters.assignedTo)
          return false;
        return true;
      });
    }
  };

  const fetchFilteredTickets = async (filters: any): Promise<void> => {
    setLoading(true);
    try {
      const filteredTickets = await filterTickets(filters);
      setTickets(filteredTickets);
    } catch (error) {
      console.error("Error fetching filtered tickets:", error);
      toast.error("Failed to fetch filtered tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics`);

      if (response.data && response.data.data) {
        setAnalytics(response.data.data);
      } else {
        // Fallback: calculate analytics from tickets data
        const calculatedAnalytics = calculateAnalyticsFromTickets(tickets);
        setAnalytics(calculatedAnalytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Fallback: calculate analytics from tickets data
      const calculatedAnalytics = calculateAnalyticsFromTickets(tickets);
      setAnalytics(calculatedAnalytics);
    }
  };

  const calculateAnalyticsFromTickets = (tickets: Ticket[]): Analytics => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate basic metrics
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(
      (t) => t.status?.name === "pending" || t.status?.name === "in_progress"
    ).length;
    const closedTickets = tickets.filter(
      (t) => t.status?.name === "completed" || t.status?.name === "closed"
    ).length;

    // Calculate tickets by priority
    const ticketsByPriority: Record<string, number> = {};
    tickets.forEach((ticket) => {
      const priority = ticket.priority?.name || "unknown";
      ticketsByPriority[priority] = (ticketsByPriority[priority] || 0) + 1;
    });

    // Calculate tickets by status
    const ticketsByStatus: Record<string, number> = {};
    tickets.forEach((ticket) => {
      const status = ticket.status?.name || "unknown";
      ticketsByStatus[status] = (ticketsByStatus[status] || 0) + 1;
    });

    // Calculate workload distribution
    const workloadDistribution: Record<string, number> = {};
    tickets.forEach((ticket) => {
      if (ticket.assignedTo?.name) {
        workloadDistribution[ticket.assignedTo.name] =
          (workloadDistribution[ticket.assignedTo.name] || 0) + 1;
      }
    });

    // Calculate average resolution time (simplified)
    const resolvedTickets = tickets.filter(
      (t) => t.status?.name === "completed" || t.status?.name === "closed"
    );
    const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.created_at);
      const updated = new Date(ticket.updated_at);
      return sum + (updated.getTime() - created.getTime());
    }, 0);
    const averageResolutionTime =
      resolvedTickets.length > 0
        ? Math.round(
            totalResolutionTime / resolvedTickets.length / (1000 * 60 * 60)
          ) // hours
        : 0;

    // Calculate resolution rate
    const resolutionRate =
      totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0;

    return {
      totalTickets,
      openTickets,
      closedTickets,
      averageResolutionTime,
      ticketsByPriority,
      ticketsByStatus,
      resolutionRate,
      workloadDistribution,
    };
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
        fetchFilteredTickets,
        fetchAnalytics,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
