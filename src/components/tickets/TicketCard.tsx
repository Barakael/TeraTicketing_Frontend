import React from 'react';
import { Clock, User, MessageCircle, Paperclip } from 'lucide-react';
import { Ticket } from '../../types';
import Badge from '../ui/Badge';
import { cn } from '../../utils/cn';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
  onSelect?: (ticket: Ticket, event: React.MouseEvent) => void;
  selected?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick, onSelect, selected }) => {
  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, string> = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    };
    return icons[priority] || '🟢';
  };

  return (
    <div
      className={cn(
        'bg-blue-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all duration-200 hover:shadow-2xl shadow-md',
        selected && 'ring-2 ring-blue-500 dark:ring-blue-400'
      )}
      onClick={() => onClick(ticket)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(ticket, e as any)}
              onClick={(e) => e.stopPropagation()}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          )}
          <span className="text-lg">{getPriorityIcon(ticket.priority)}</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            #{ticket.id}
          </span>
        </div>
        <div className="flex space-x-2">
          <Badge
            variant={
              ticket.priority === 'critical'
                ? 'danger'
                : ticket.priority === 'high'
                ? 'warning'
                : ticket.priority === 'medium'
                ? 'info'
                : 'success'
            }
          >
            {ticket.priority}
          </Badge>
          <Badge
            variant={
              ticket.status === 'closed'
                ? 'default'
                : ticket.status === 'completed'
                ? 'success'
                : ticket.status === 'in_progress'
                ? 'warning'
                : 'info'
            }
          >
            {ticket.status?.replace('_', ' ') || 'Unknown'}
          </Badge>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {ticket.title}
      </h3>

      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User size={14} />
            <span>{ticket.createdBy?.name || 'Unknown'}</span>
          </div>
          {ticket.assignedTo && (
            <div className="flex items-center space-x-1">
              <span>→</span>
              <span>{ticket.assignedTo?.name || 'Unassigned'}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {ticket.comments?.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle size={14} />
              <span>{ticket.comments.length}</span>
            </div>
          )}
          {ticket.attachments?.length > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip size={14} />
              <span>{ticket.attachments.length}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{formatDistanceToNow(ticket.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {ticket.department?.name || 'N/A'} • {ticket.category?.name || 'N/A'}
          </span>
          {ticket.targetedSystem && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              {ticket.targetedSystem}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
