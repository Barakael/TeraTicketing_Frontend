import React, { useState, useEffect } from "react";
import { X, Edit, Save, Calendar, Tag } from "lucide-react";
import { Ticket } from "../../types";
import { useTickets } from "../../contexts/TicketContext";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import TicketAssignmentModal from "./TicketAssignmentModal";
import TicketComments from "./TicketComments";
import { formatDistanceToNow } from "../../utils/dateUtils";

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  const { updateTicket } = useTickets();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<Partial<Ticket>>({});
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    if (ticket) {
      setEditedTicket(ticket);
      setIsEditing(false);
    }
  }, [ticket]);

  const handleSave = async () => {
    if (!ticket) return;

    try {
      await updateTicket(ticket.id, editedTicket);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const handleCancel = () => {
    setEditedTicket(ticket || {});
    setIsEditing(false);
  };

  if (!ticket) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } transition-opacity duration-300`}
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? "Edit Ticket" : "Ticket Details"}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  icon={<Edit size={16} />}
                >
                  Edit
                </Button>
              )}
              {isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    icon={<Save size={16} />}
                  >
                    Save
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                icon={<X size={16} />}
              >
                Close
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Ticket Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTicket.title || ""}
                      onChange={(e) =>
                        setEditedTicket({
                          ...editedTicket,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-medium">
                      {ticket.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedTicket.description || ""}
                      onChange={(e) =>
                        setEditedTicket({
                          ...editedTicket,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  {isEditing ? (
                    <select
                      value={editedTicket.priority || ticket.priority}
                      onChange={(e) =>
                        setEditedTicket({
                          ...editedTicket,
                          priority: e.target.value as
                            | "low"
                            | "medium"
                            | "high"
                            | "critical",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  ) : (
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
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      value={editedTicket.status || ticket.status}
                      onChange={(e) =>
                        setEditedTicket({
                          ...editedTicket,
                          status: e.target.value as
                            | "pending"
                            | "in_progress"
                            | "completed"
                            | "closed",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
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
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assigned To
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 dark:text-white">
                        {ticket.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAssignmentModal(true)}
                    >
                      {ticket.assignedTo ? "Reassign" : "Assign"}
                    </Button>
                  </div>
                </div>

                {/* Created By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Created By
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 dark:text-white">
                      {ticket.createdBy?.name || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Created Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Created
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {formatDistanceToNow(ticket.createdAt)} ago
                    </span>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <div className="flex items-center space-x-2">
                    <Tag size={16} className="text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {typeof ticket.department === "string"
                        ? ticket.department
                        : (ticket.department as any)?.name || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="flex items-center space-x-2">
                    <Tag size={16} className="text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {typeof ticket.category === "string"
                        ? ticket.category
                        : (ticket.category as any)?.name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <TicketComments
                ticketId={ticket.id}
                comments={ticket.comments || []}
                onCommentAdded={() => {
                  // Refresh ticket data after comment is added
                  // This will be handled by the context
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <TicketAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        ticketId={ticket.id}
        currentAssignee={ticket.assignedTo}
        ticketDepartment={{ id: ticket.department, name: ticket.department }}
      />
    </>
  );
};

export default TicketDetailModal;
