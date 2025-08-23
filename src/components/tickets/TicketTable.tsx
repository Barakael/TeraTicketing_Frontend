import React from 'react';
import { Ticket } from '../../types';
import Badge from '../ui/Badge';
import { format } from 'date-fns';

interface TicketTableProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onTicketSelect: (ticket: Ticket, event: React.MouseEvent | React.ChangeEvent) => void; // Allow ChangeEvent
  selectedTickets: string[];
}

const TicketTable: React.FC<TicketTableProps> = ({ tickets, onTicketClick, onTicketSelect, selectedTickets }) => {
  const getPriorityColor = (priorityName?: string) => {
    switch (priorityName?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">
                {/* Note: Logic for a "select all" checkbox would go here if needed */}
                <input id="checkbox-all" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
              </div>
            </th>
            <th scope="col" className="px-6 py-3">Ticket ID</th>
            <th scope="col" className="px-6 py-3">Title</th>
            <th scope="col" className="px-6 py-3">Priority</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Department</th>
            <th scope="col" className="px-6 py-3">Category</th>
            <th scope="col" className="px-6 py-3">Assignee</th>
            <th scope="col" className="px-6 py-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => onTicketClick(ticket)}
              className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
            >
              <td className="w-4 p-4">
                <div className="flex items-center">
                  {/* --- THIS IS THE FIX --- */}
                  {/* Switched from onClick to onChange for the checkbox input */}
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedTickets.includes(ticket.id)}
                    onChange={(e) => onTicketSelect(ticket, e)} // Use onChange
                    onClick={(e) => e.stopPropagation()} // Keep stopPropagation on onClick
                  />
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Ticket #{ticket.id}</td>
              <td className="px-6 py-4">{ticket.title}</td>
              <td className="px-6 py-4">
                <Badge variant={getPriorityColor(ticket.priority?.name)}>{ticket.priority?.name || 'N/A'}</Badge>
              </td>
              <td className="px-6 py-4">{ticket.status?.name || 'N/A'}</td>
              <td className="px-6 py-4">{ticket.department?.name || 'N/A'}</td>
              <td className="px-6 py-4">{ticket.category?.name || 'N/A'}</td>
              <td className="px-6 py-4">{ticket.user?.name || 'Unassigned'}</td>
              <td className="px-6 py-4">{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;