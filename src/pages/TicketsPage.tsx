import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { useTickets } from "../contexts/TicketContext";
import { useAuth } from "../contexts/AuthContext";
import { Ticket, PreTicketData } from "../types";
import Button from "../components/ui/Button";
import TicketCard from "../components/tickets/TicketCard";
import TicketFilters from "../components/tickets/TicketFilters";
import TicketDetailModal from "../components/tickets/TicketDetailModal";
import Modal from "../components/ui/Modal";
import PreTicketChatbot from "../components/chat/PreTicketChatbot";
import TicketTable from "../components/tickets/TicketTable";
import Pagination from "../components/ui/Pagination";
import TicketMergeModal from "../components/tickets/TicketMergeModal";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 9;

const TicketsPage: React.FC = () => {
  const {
    tickets = [],
    filterTickets,
    searchTickets,
    exportTickets,
    mergeTickets,
    createTicket,
  } = useTickets();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    department: "",
    assignedTo: "",
    dateRange: "",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const [displayedTickets, setDisplayedTickets] = useState<Ticket[]>([]);

  // Fetch filtered tickets when filters or search query changes
  useEffect(() => {
    const fetchFilteredTickets = async () => {
      try {
        let filtered = tickets;

        // Apply search filter first
        if (searchQuery) {
          filtered = searchTickets(searchQuery);
        }

        // Apply client-side filtering
        filtered = applyClientSideFilters(filtered, filters);

        // Apply sorting
        filtered = sortTickets(filtered, filters.sortBy, filters.sortOrder);
        
        setDisplayedTickets(filtered);
      } catch (error) {
        console.error("Error fetching filtered tickets:", error);
        // Fallback to client-side filtering and sorting
        let filtered = tickets;
        if (searchQuery) {
          filtered = searchTickets(searchQuery);
        }
        filtered = applyClientSideFilters(filtered, filters);
        filtered = sortTickets(filtered, filters.sortBy, filters.sortOrder);
        setDisplayedTickets(filtered);
      }
    };

    fetchFilteredTickets();
  }, [searchQuery, filters, tickets, searchTickets]);

  // Client-side filtering function
  const applyClientSideFilters = (ticketsToFilter: Ticket[], currentFilters: any): Ticket[] => {
    return ticketsToFilter.filter((ticket) => {
      // Status filter - check status.name if available, otherwise check status_id
      if (currentFilters.status) {
        const ticketStatus = ticket.status?.name || ticket.status_id?.toString();
        if (ticketStatus !== currentFilters.status) {
          return false;
        }
      }
      
      // Priority filter - check priority.name if available, otherwise check priority_id
      if (currentFilters.priority) {
        const ticketPriority = ticket.priority?.name || ticket.priority_id?.toString();
        if (ticketPriority !== currentFilters.priority) {
          return false;
        }
      }
      
      // Department filter - check department.name if available, otherwise check department_id
      if (currentFilters.department) {
        const ticketDepartment = ticket.department?.name || ticket.department_id?.toString();
        if (ticketDepartment !== currentFilters.department) {
          return false;
        }
      }
      
      // Assigned to filter
      if (currentFilters.assignedTo && ticket.assignedTo?.id !== currentFilters.assignedTo) {
        return false;
      }
      
      // Date range filter
      if (currentFilters.dateRange || currentFilters.startDate || currentFilters.endDate) {
        const ticketDate = new Date(ticket.created_at);
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        
        if (currentFilters.startDate) {
          startDate = new Date(currentFilters.startDate);
        } else if (currentFilters.dateRange) {
          const now = new Date();
          switch (currentFilters.dateRange) {
            case "today":
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
              break;
            case "yesterday":
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
              endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              break;
            case "last_7_days":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
              break;
            case "last_30_days":
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
              break;
            case "this_month":
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              break;
            case "last_month":
              startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              endDate = new Date(now.getFullYear(), now.getMonth(), 0);
              break;
          }
        }
        
        if (currentFilters.endDate) {
          endDate = new Date(currentFilters.endDate);
        }
        
        if (startDate && endDate) {
          if (ticketDate < startDate || ticketDate >= endDate) {
            return false;
          }
        }
      }
      
      return true;
    });
  };

  // Sorting function
  const sortTickets = (ticketsToSort: Ticket[], sortBy: string, sortOrder: "asc" | "desc"): Ticket[] => {
    return [...ticketsToSort].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "updatedAt":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case "priority":
          // Handle both priority object and priority_id
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          if (a.priority?.name && b.priority?.name) {
            aValue = priorityOrder[a.priority.name as keyof typeof priorityOrder] || 0;
            bValue = priorityOrder[b.priority.name as keyof typeof priorityOrder] || 0;
          } else {
            aValue = a.priority_id || 0;
            bValue = b.priority_id || 0;
          }
          break;
        case "status":
          // Handle both status object and status_id
          const statusOrder = { pending: 1, in_progress: 2, completed: 3, closed: 4 };
          if (a.status?.name && b.status?.name) {
            aValue = statusOrder[a.status.name as keyof typeof statusOrder] || 0;
            bValue = statusOrder[b.status.name as keyof typeof statusOrder] || 0;
          } else {
            aValue = a.status_id || 0;
            bValue = b.status_id || 0;
          }
          break;
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  const totalPages = Math.ceil(displayedTickets.length / ITEMS_PER_PAGE);
  const currentTickets = displayedTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetail(true);
  };

  const handleTicketSelect = (
    ticket: Ticket,
    event: React.MouseEvent | React.ChangeEvent
  ) => {
    if ("stopPropagation" in event) {
      event.stopPropagation();
    }
    const ticketId = ticket.id.toString();
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const ticketsToExport =
        selectedTickets.length > 0
          ? selectedTickets
          : displayedTickets.map((t) => t.id.toString());
      await exportTickets(format, ticketsToExport);
      toast.success(`${format.toUpperCase()} export completed successfully!`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    }
  };

  const handleMerge = () => {
    if (selectedTickets.length === 2) {
      setShowMergeModal(true);
    } else {
      toast.error("Please select exactly two tickets to merge.");
    }
  };

  const handleMergeComplete = () => {
    setSelectedTickets([]);
    setShowMergeModal(false);
  };

  const handleTicketCreate = async (chatbotData: PreTicketData) => {
    if (!user) return;

    const payload = {
      title: chatbotData.description || "New Ticket",
      description: chatbotData.description || "",
      // Map priority string to an ID if needed; fallback to medium (2)
      priority_id:
        chatbotData.priority === "critical"
          ? 4
          : chatbotData.priority === "high"
          ? 3
          : chatbotData.priority === "low"
          ? 1
          : 2,
      department_id: chatbotData.department ? parseInt(chatbotData.department) : undefined,
      category_id: chatbotData.category ? parseInt(chatbotData.category) : undefined,
      assigned_to: undefined,
      created_by: user.id,
    } as any;

    try {
      await createTicket(payload);
      setShowChatbot(false);
      toast.success("Ticket created successfully!");
    } catch {
      toast.error("Failed to create ticket");
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track support tickets
          </p>
        </div>
        <div className="flex space-x-3 items-center">
          <div className="hidden md:flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              icon={<LayoutGrid size={16} />}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              icon={<List size={16} />}
            >
              List
            </Button>
          </div>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-800 shadow-2xl"
            variant="outline"
            onClick={() => setShowChatbot(true)}
            icon={<Plus size={18} />}
          >
            New Ticket
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-700 dark:to-slate-700 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets by ID, title, or assignee..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <TicketFilters
          filters={filters}
          onFilterChange={setFilters}
          onExport={handleExport}
          onMerge={handleMerge}
          selectedCount={selectedTickets.length}
        />

        <div className="p-6">
          {currentTickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tickets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={handleTicketClick}
                      onSelect={handleTicketSelect}
                      selected={selectedTickets.includes(ticket.id.toString())}
                    />
                  ))}
                </div>
              ) : (
                <TicketTable
                  tickets={currentTickets}
                  onTicketClick={handleTicketClick}
                  onTicketSelect={handleTicketSelect}
                  selectedTickets={selectedTickets}
                />
              )}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        title="Create New Ticket"
        size="lg"
      >
        <PreTicketChatbot
          currentUser={
            user
              ? {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  department: user.department
                    ? {
                        id: user.department,
                        name: user.department,
                      }
                    : undefined,
                }
              : null
          }
          onTicketCreate={handleTicketCreate}
        />
      </Modal>

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={showTicketDetail}
        onClose={() => {
          setShowTicketDetail(false);
          setSelectedTicket(null);
        }}
      />

      <TicketMergeModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        selectedTickets={tickets.filter((t) =>
          selectedTickets.includes(t.id.toString())
        )}
        onMergeComplete={handleMergeComplete}
      />
    </div>
  );
};

export default TicketsPage;
