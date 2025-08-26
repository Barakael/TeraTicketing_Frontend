import React, { useState, useEffect } from "react";
import { Clock, User, MessageCircle, Paperclip } from "lucide-react";
import { Ticket } from "../../types";
import Badge from "../ui/Badge";
import { cn } from "../../utils/cn";
import { formatDistanceToNow } from "../../utils/dateUtils";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
  onSelect?: (ticket: Ticket, event: React.MouseEvent) => void;
  selected?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onClick,
  onSelect,
  selected,
}) => {
  const [commentCount, setCommentCount] = useState<number>(
    ticket.comments?.length || 0
  );
  const [attachmentCount, setAttachmentCount] = useState<number>(
    ticket.attachments?.length || 0
  );

  // Fetch comment count from API when component mounts
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/tickets/${ticket.id}/comments`
        );
        const comments = response.data.data.comments || [];
        setCommentCount(comments.length);

        // Calculate total attachments from all comments
        const totalAttachments = comments.reduce(
          (total: number, comment: any) => {
            return total + (comment.attachments?.length || 0);
          },
          0
        );
        setAttachmentCount(totalAttachments);
      } catch (error) {
        console.error("Error fetching comment count:", error);
        // Fallback to the passed comments length
        setCommentCount(ticket.comments?.length || 0);
        setAttachmentCount(ticket.attachments?.length || 0);
      }
    };

    fetchCommentCount();
  }, [ticket.id, ticket.comments?.length, ticket.attachments?.length]);

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, string> = {
      low: "🟢",
      medium: "🟡 ",
      high: "🟠",
      critical: "🔴",
    };
    return icons[priority] || "🟢";
  };

  return (
    <div
      className={cn(
        "bg-blue-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all duration-200 hover:shadow-2xl shadow-md",
        selected && "ring-2 ring-blue-500 dark:ring-blue-400"
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
              ticket.priority === "critical"
                ? "danger"
                : ticket.priority === "high"
                ? "warning"
                : ticket.priority === "medium"
                ? "info"
                : "success"
            }
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
          >
            {ticket.status?.replace("_", " ") || "Unknown"}
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
            <span>
              {ticket.createdBy?.name
                ? ticket.createdBy.name === "Unknown" ||
                  ticket.createdBy.name === "Guest"
                  ? "Guest"
                  : ticket.createdBy.name
                : "Guest"}
            </span>
          </div>
          {ticket.assignedTo && (
            <div className="flex items-center space-x-1">
              <span>→</span>
              <span>{ticket.assignedTo?.name || "Unassigned"}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {commentCount > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle size={14} />
              <span>{commentCount}</span>
            </div>
          )}
          {attachmentCount > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip size={14} />
              <span>{attachmentCount}</span>
            </div>
          )}
          <div
            className="flex items-center space-x-1"
            title={`Created ${formatDistanceToNow(ticket.createdAt)} ago`}
          >
            <Clock size={14} />
            <span>{formatDistanceToNow(ticket.createdAt)} ago</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {typeof ticket.department === "string"
              ? ticket.department
              : (ticket.department as any)?.name || "N/A"}{" "}
            •{" "}
            {typeof ticket.category === "string"
              ? ticket.category
              : (ticket.category as any)?.name || "N/A"}
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
