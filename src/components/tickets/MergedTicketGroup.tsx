import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Merge,
  Users,
  Calendar,
} from "lucide-react";
import { Ticket } from "../../types";
import Badge from "../ui/Badge";
import { cn } from "../../utils/cn";
import { formatDistanceToNow } from "../../utils/dateUtils";

interface MergedTicketGroupProps {
  mergedTicket: Ticket;
  sourceTickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onTicketSelect?: (
    ticket: Ticket,
    event: React.MouseEvent | React.ChangeEvent
  ) => void;
  selected?: boolean;
}

const MergedTicketGroup: React.FC<MergedTicketGroupProps> = ({
  mergedTicket,
  sourceTickets,
  onTicketClick,
  onTicketSelect,
  selected,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, string> = {
      low: "🟢",
      medium: "🟡",
      high: "🟠",
      critical: "🔴",
    };
    return icons[priority] || "🟢";
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-4 mb-4">
      {/* Main Merged Ticket */}
      <div
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg",
          selected && "ring-2 ring-blue-500 dark:ring-blue-400"
        )}
        onClick={() => onTicketClick(mergedTicket)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {onTicketSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onTicketSelect(mergedTicket, e as any)}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            <span className="text-lg">
              {getPriorityIcon(mergedTicket.priority)}
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              #{mergedTicket.id}
            </span>
            <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
              <Merge size={14} />
              <span className="text-xs font-medium">MERGED</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge
              variant={
                mergedTicket.priority === "critical"
                  ? "danger"
                  : mergedTicket.priority === "high"
                  ? "warning"
                  : mergedTicket.priority === "medium"
                  ? "info"
                  : "success"
              }
            >
              {mergedTicket.priority}
            </Badge>
            <Badge
              variant={
                mergedTicket.status === "closed"
                  ? "default"
                  : mergedTicket.status === "completed"
                  ? "success"
                  : mergedTicket.status === "in_progress"
                  ? "warning"
                  : "info"
              }
            >
              {mergedTicket.status?.replace("_", " ") || "Unknown"}
            </Badge>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {mergedTicket.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {mergedTicket.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{mergedTicket.createdBy?.name || "Unknown"}</span>
            </div>
            {mergedTicket.assignedTo && (
              <div className="flex items-center space-x-1">
                <span>→</span>
                <span>{mergedTicket.assignedTo?.name || "Unassigned"}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{formatDistanceToNow(mergedTicket.createdAt)} ago</span>
          </div>
        </div>
      </div>

      {/* Source Tickets Toggle */}
      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="text-sm font-medium">
            Source Tickets ({sourceTickets.length})
          </span>
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            {sourceTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => onTicketClick(ticket)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {getPriorityIcon(ticket.priority)}
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      #{ticket.id}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white line-clamp-1">
                      {ticket.title}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Badge
                      variant={
                        ticket.priority === "critical"
                          ? "danger"
                          : ticket.priority === "high"
                          ? "warning"
                          : ticket.priority === "medium"
                          ? "info"
                          : "success"
                      }
                      size="sm"
                    >
                      {ticket.priority}
                    </Badge>
                    <Badge
                      variant={
                        ticket.status === "closed"
                          ? "default"
                          : ticket.status === "completed"
                          ? "success"
                          : ticket.status === "in_progress"
                          ? "warning"
                          : "info"
                      }
                      size="sm"
                    >
                      {ticket.status?.replace("_", " ") || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MergedTicketGroup;

