import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { X, Edit, Save, Calendar, Tag } from "lucide-react";
import { Ticket, TicketUpdateRequest, Department, Category } from "../../types";
import { useTickets } from "../../contexts/TicketContext";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import TicketAssignmentModal from "./TicketAssignmentModal";
import TicketComments from "./TicketComments";
import { formatDistanceToNow } from "../../utils/dateUtils";
import { API_BASE_URL } from "../../utils/constants";

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (ticket) {
      // Convert ticket to update request format (use numeric IDs)
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

  useEffect(() => {
    if (!isOpen) return;
    // Fetch departments and categories for editing selects
    const fetchOptions = async () => {
      try {
        const [deptRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/departments`),
          axios.get(`${API_BASE_URL}/api/categories`),
        ]);
        if (deptRes.data?.data) setDepartments(deptRes.data.data);
        if (catRes.data?.data) setCategories(catRes.data.data);
      } catch (e) {
        // Fail silently; selects will be empty
      }
    };
    fetchOptions();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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

  if (!ticket || !isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop covering entire app with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Centered modal container; pointer-events gated so backdrop clicks work */}
      <div className="fixed inset-0 grid place-items-center p-6 pointer-events-none">
        <div
          className="pointer-events-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full border border-gray-200 dark:border-gray-700"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? "Edit Ticket" : "Ticket Details"}
            </h2>
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
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: All ticket details */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    <p className="text-base text-gray-900 dark:text-white font-semibold">
                      {ticket.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedTicket.description || ""}
                      onChange={(e) => {
                        const newDescription = e.target.value;
                        const originalDescription = ticket.description;
                        let newStatusId = editedTicket.status_id;
                        if (
                          newDescription !== originalDescription &&
                          (editedTicket.status_id === 1 || !editedTicket.status_id)
                        ) {
                          newStatusId = 2;
                        }
                        setEditedTicket({
                          ...editedTicket,
                          description: newDescription,
                          status_id: newStatusId,
                        });
                      }}
                      rows={1}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  )}
                </div>

                {/* Resolution Report */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resolution Report
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedTicket.resolution_report || ticket.resolution_report || ""}
                      onChange={(e) =>
                        setEditedTicket({
                          ...editedTicket,
                          resolution_report: e.target.value,
                        })
                      }
                      rows={1}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {ticket.resolution_report || "—"}
                    </p>
                  )}
                </div>

                {/* Details grid (compact) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/40">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Ticket Details
                    </h4>
                    <div className="space-y-2 text-sm">
                       {/* Quick badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      ticket.status?.name === "closed"
                        ? "default"
                        : ticket.status?.name === "completed"
                        ? "success"
                        : ticket.status?.replace("_", " ") === "in_progress"
                        ? "warning"
                        : "info"
                    }
                  >
                    {ticket.status?.name?.replace("_", " ") || "Unknown"}
                  </Badge>
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
                    {ticket.priority?.replace("_", " ") || "Unknown"}
                  </Badge>
                  <Badge variant="default">Ticket ID: {ticket.id}</Badge>
                </div>
                      {/* <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Assigned To</span>
                        <span className="text-gray-900 dark:text-white">
                          {ticket.assignedTo?.name || "Unassigned"}
                        </span>
                      </div> */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Created By</span>
                        <span className="text-gray-900 dark:text-white">
                          {ticket.created_by ? `User ID: ${ticket.created_by}` : "Guest User"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Created</span>
                        <span className="text-gray-900 dark:text-white flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDistanceToNow(ticket.created_at)} ago
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/40">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Classification
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="block text-gray-500 dark:text-gray-400 mb-1">Department</span>
                        {isEditing ? (
                          <select
                            value={editedTicket.department_id || ticket.department_id ||  ""}
                            onChange={(e) =>
                              setEditedTicket({
                                ...editedTicket,
                                department_id: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Select Department</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-900 dark:text-white flex items-center gap-2">
                            <Tag size={14} className="text-gray-400" />
                            {ticket.department?.name || `Department ID: ${ticket.department_id}`}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="block text-gray-500 dark:text-gray-400 mb-1">Category</span>
                        {isEditing ? (
                          <select
                            value={editedTicket.category_id || ticket.category_id ||  ""}
                            onChange={(e) =>
                              setEditedTicket({
                                ...editedTicket,
                                category_id: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-900 dark:text-white flex items-center gap-2">
                            <Tag size={14} className="text-gray-400" />
                            {ticket.category?.name || "Unknown"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline edit controls */}
                {isEditing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={editedTicket.priority_id || ticket.priority_id || ""}
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
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={editedTicket.status_id || ticket.status_id || ""}
                        onChange={(e) => {
                          const newStatusId = parseInt(e.target.value);
                          setEditedTicket({ ...editedTicket, status_id: newStatusId });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Status</option>
                        <option value="1">Pending</option>
                        <option value="2">In Progress</option>
                        <option value="3">Completed</option>
                        <option value="4">Closed</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Comments */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/40 h-full">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Comments
                </h4>
                <TicketComments
                  ticketId={ticket.id.toString()}
                  comments={ticket.comments || []}
                  onCommentAdded={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {createPortal(modal, document.body)}
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
