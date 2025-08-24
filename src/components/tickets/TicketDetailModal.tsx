import React, { useState, useEffect } from "react";
import { X, Edit, Save, Calendar, Tag } from "lucide-react";
import { Ticket, TicketUpdateRequest } from "../../types";
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
  const [editedTicket, setEditedTicket] = useState<TicketUpdateRequest>({});
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    if (ticket) {
      // Convert ticket to update request format
      setEditedTicket({
        title: ticket.title,
        description: ticket.description,
        category_id: ticket.category_id,
        status_id: ticket.status_id,
        priority_id: ticket.priority_id,
        department_id: ticket.department_id,
        assigned_to: ticket.assigned_to,
      });
      setIsEditing(false);
    }
  }, [ticket]);

  const handleSave = async () => {
    if (!ticket) return;

    try {
      await updateTicket(ticket.id.toString(), editedTicket);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const handleCancel = () => {
    if (ticket) {
      setEditedTicket({
        title: ticket.title,
        description: ticket.description,
        category_id: ticket.category_id,
        status_id: ticket.status_id,
        priority_id: ticket.priority_id,
        department_id: ticket.department_id,
        assigned_to: ticket.assigned_to,
      });
    }
    setIsEditing(false);
  };

  if (!ticket) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-300 ${
          isOpen
            ? "opacity-100 backdrop-blur-sm"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(0, 0, 0, 0.7)",
        }}
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-scaleIn"
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
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
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
                      onChange={(e) => {
                        const newDescription = e.target.value;
                        const originalDescription = ticket.description;

                        // Auto-change status to "in_progress" (ID: 2) if description is being modified
                        let newStatusId = editedTicket.status_id;
                        if (
                          newDescription !== originalDescription &&
                          (editedTicket.status_id === 1 || // pending
                            !editedTicket.status_id)
                        ) {
                          newStatusId = 2; // in_progress
                        }

                        setEditedTicket({
                          ...editedTicket,
                          description: newDescription,
                          status_id: newStatusId,
                        });
                      }}
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
                      value={
                        editedTicket.priority_id || ticket.priority_id || ""
                      }
                      onChange={(e) =>
                        setEditedTicket({
                          ...editedTicket,
                          priority_id: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Priority</option>
                      <option value="1">Low</option>
                      <option value="2">Medium</option>
                      <option value="3">High</option>
                      <option value="4">Critical</option>
                    </select>
                  ) : (
                    <Badge
                      variant={
                        ticket.priority?.name === "critical"
                          ? "danger"
                          : ticket.priority?.name === "high"
                          ? "warning"
                          : ticket.priority?.name === "medium"
                          ? "info"
                          : "success"
                      }
                    >
                      {ticket.priority?.name || "Unknown"}
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
                      value={editedTicket.status_id || ticket.status_id || ""}
                      onChange={(e) => {
                        const newStatusId = parseInt(e.target.value);
                        setEditedTicket({
                          ...editedTicket,
                          status_id: newStatusId,
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Status</option>
                      <option value="1">Pending</option>
                      <option value="2">In Progress</option>
                      <option value="3">Completed</option>
                      <option value="4">Closed</option>
                    </select>
                  ) : (
                    <Badge
                      variant={
                        ticket.status?.name === "closed"
                          ? "default"
                          : ticket.status?.name === "completed"
                          ? "success"
                          : ticket.status?.name === "in_progress"
                          ? "warning"
                          : "info"
                      }
                    >
                      {ticket.status?.name?.replace("_", " ") || "Unknown"}
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
                      {ticket.created_by
                        ? `User ID: ${ticket.created_by}`
                        : "Unknown"}
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
                      {formatDistanceToNow(ticket.created_at)} ago
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
                      {ticket.department?.name ||
                        `Department ID: ${ticket.department_id}`}
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
                      {ticket.category?.name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <TicketComments
                ticketId={ticket.id.toString()}
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
        ticketId={ticket.id.toString()}
        currentAssignee={ticket.assignedTo}
        ticketDepartment={{
          id: ticket.department_id.toString(),
          name: ticket.department?.name || `Department ${ticket.department_id}`,
        }}
      />
    </>
  );
};

export default TicketDetailModal;
