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
  });
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Fixed: Use the correct function signatures
  const displayedTickets = useMemo(() => {
    let filtered = tickets;

    // Apply search filter
    if (searchQuery) {
      filtered = searchTickets(searchQuery);
    }

    // Apply other filters
    filtered = filterTickets(filters);

    return filtered;
  }, [searchQuery, filters, tickets, searchTickets, filterTickets]);

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
    setSelectedTickets((prev) =>
      prev.includes(ticket.id)
        ? prev.filter((id) => id !== ticket.id)
        : [...prev, ticket.id]
    );
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const ticketsToExport =
        selectedTickets.length > 0
          ? selectedTickets
          : displayedTickets.map((t) => t.id);
      await exportTickets(format, ticketsToExport);
      toast.success(`${format.toUpperCase()} export completed successfully!`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    }
  };

  const handleMerge = () => {
    if (selectedTickets.length === 2) {
      mergeTickets(selectedTickets[0], selectedTickets[1]);
      setSelectedTickets([]);
    } else {
      toast.error("Please select exactly two tickets to merge.");
    }
  };

  const handleTicketCreate = async (chatbotData: PreTicketData) => {
    if (!user) return;

    const payload = {
      title: chatbotData.description || "New Ticket",
      description: chatbotData.description || "",
      priority:
        (chatbotData.priority as "low" | "medium" | "high" | "critical") ||
        "medium",
      department: chatbotData.department || "",
      category: chatbotData.category || "",
      assignedTo: undefined,
      createdBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as "admin" | "department_leader" | "troubleshooter",
        department: user.department,
        isActive: user.isActive || true,
        createdAt: user.createdAt || new Date().toISOString(),
      },
    };

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

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                      selected={selectedTickets.includes(ticket.id)}
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
    </div>
  );
};

export default TicketsPage;
