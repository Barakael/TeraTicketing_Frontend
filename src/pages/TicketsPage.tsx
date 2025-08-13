import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTickets } from '../contexts/TicketContext';
import { useAuth } from '../contexts/AuthContext';
import { Ticket } from '../types';
import Button from '../components/ui/Button';
import TicketCard from '../components/tickets/TicketCard';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketDetailModal from '../components/tickets/TicketDetailModal';
import Modal from '../components/ui/Modal';
import PreTicketChatbot from '../components/chat/PreTicketChatbot';

const TicketsPage: React.FC = () => {
  const { tickets, filterTickets, searchTickets, exportTickets, mergeTickets, createTicket } = useTickets();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    assignedTo: '',
    dateRange: '',
  });
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);

  const displayedTickets = searchQuery 
    ? searchTickets(searchQuery)
    : filterTickets(filters);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetail(true);
  };

  const handleTicketSelect = (ticket: Ticket, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedTickets(prev => 
      prev.includes(ticket.id) 
        ? prev.filter(id => id !== ticket.id)
        : [...prev, ticket.id]
    );
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    exportTickets(format, selectedTickets.length > 0 ? selectedTickets : tickets.map(t => t.id));
  };

  const handleMerge = () => {
    if (selectedTickets.length === 2) {
      mergeTickets(selectedTickets[0], selectedTickets[1]);
      setSelectedTickets([]);
    }
  };

  const handleTicketCreate = async (ticketData: any) => {
    await createTicket({
      ...ticketData,
      createdBy: user!,
    });
    setShowChatbot(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track support tickets
          </p>
        </div>
        <div className="flex space-x-3">
          <Button className='bg-blue-600 text-white'
            variant="outline"
            onClick={() => setShowChatbot(true)}
            icon={<Plus size={18} />}
          >
            New Ticket (Chat)
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets by title, description, or category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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
          {displayedTickets.length === 0 ? (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={handleTicketClick}
                  onSelect={(ticket, event) => handleTicketSelect(ticket, event)}
                  selected={selectedTickets.includes(ticket.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        title="Create New Ticket"
        size="lg"
      >
        <PreTicketChatbot onTicketCreate={handleTicketCreate} />
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