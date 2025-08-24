import React, { useState, useEffect } from "react";
import { User, Users, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTickets } from "../../contexts/TicketContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

interface TicketAssignmentModalProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
  currentAssignee?: any;
  ticketDepartment?: any; // Add ticket department prop
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  currentWorkload?: number;
  maxWorkload?: number;
  workloadPercentage?: number;
  specializations?: string[];
}

const TicketAssignmentModal: React.FC<TicketAssignmentModalProps> = ({
  ticketId,
  isOpen,
  onClose,
  currentAssignee,
  ticketDepartment,
}) => {
  const { user } = useAuth();
  const { assignTicket } = useTickets();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [assignmentNote, setAssignmentNote] = useState("");

  // Fetch troubleshooters from API when modal opens
  useEffect(() => {
    if (isOpen && ticketDepartment) {
      fetchTroubleshooters();
    }
  }, [isOpen, ticketDepartment]);

  const fetchTroubleshooters = async () => {
    setFetchingUsers(true);
    try {
      // Use the correct API endpoint for assignable troubleshooters
      const params = new URLSearchParams({
        department_id: ticketDepartment?.id || "",
        include_workload: "true",
        exclude_user_id: currentAssignee?.id || "",
      });

      const response = await axios.get(
        `${API_BASE_URL}/api/users/assignable-troubleshooters?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Handle different response structures
      let users = [];
      if (response.data.success && response.data.data) {
        users = response.data.data;
      } else if (response.data.data) {
        users = response.data.data;
      } else if (Array.isArray(response.data)) {
        users = response.data;
      } else {
        console.error("Unexpected API response structure:", response.data);
        toast.error("Unexpected API response format");
        setAvailableUsers([]);
        return;
      }

      // API already returns the correct troubleshooters for the department
      const filteredUsers = users.filter(
        (user: any) => user.isActive !== false
      );

      setAvailableUsers(filteredUsers);

      if (filteredUsers.length === 0) {
        toast.info(
          `No troubleshooters found in ${
            ticketDepartment?.name || "this department"
          }`
        );
      }
    } catch (error: any) {
      console.error("Error fetching troubleshooters:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch troubleshooters";
      toast.error(errorMessage);
      setAvailableUsers([]);
    } finally {
      setFetchingUsers(false);
    }
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.isActive &&
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error("Please select a troubleshooter to assign the ticket to");
      return;
    }

    setLoading(true);
    try {
      await assignTicket(ticketId, selectedUserId, assignmentNote);
      toast.success("Ticket assigned successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to assign ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    setLoading(true);
    try {
      await assignTicket(ticketId, null, "Ticket unassigned");
      toast.success("Ticket unassigned successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to unassign ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Ticket" size="md">
      <div className="space-y-6">
        {/* Department Info */}
        {ticketDepartment && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Department: {ticketDepartment.name}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Showing assignable troubleshooters with workload information
            </p>
          </div>
        )}

        {/* Current Assignment */}
        {currentAssignee && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Currently Assigned To:
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  {currentAssignee.name}
                </p>
                <p className="text-sm text-green-700 dark:text-green-200">
                  {currentAssignee.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div>
          <Input
            label="Search Troubleshooters"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            icon={<Users size={16} />}
          />
        </div>

        {/* Available Users */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Available Troubleshooters
            </h3>
            {fetchingUsers && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                <span>Loading...</span>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {fetchingUsers ? (
              <div className="text-center py-8">
                <Loader2
                  size={32}
                  className="animate-spin text-gray-400 mx-auto mb-4"
                />
                <p className="text-gray-500 dark:text-gray-400">
                  Loading troubleshooters...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No troubleshooters found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {searchQuery
                    ? "Try a different search term"
                    : "No troubleshooters available in this department"}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUserId === user.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                    {user.currentWorkload !== undefined && (
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              user.currentWorkload >= user.maxWorkload! * 0.8
                                ? "bg-red-500"
                                : user.currentWorkload >=
                                  user.maxWorkload! * 0.6
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (user.currentWorkload / user.maxWorkload!) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {user.currentWorkload}/{user.maxWorkload} tickets
                        </span>
                      </div>
                    )}
                    {user.specializations &&
                      user.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.specializations.slice(0, 2).map((spec) => (
                            <span
                              key={spec}
                              className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                            >
                              {spec}
                            </span>
                          ))}
                          {user.specializations.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{user.specializations.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                  {selectedUserId === user.id && (
                    <Check size={20} className="text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assignment Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assignment Note (Optional)
          </label>
          <textarea
            value={assignmentNote}
            onChange={(e) => setAssignmentNote(e.target.value)}
            placeholder="Add a note about this assignment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          {currentAssignee && (
            <Button
              variant="outline"
              onClick={handleUnassign}
              disabled={loading}
              icon={<X size={16} />}
            >
              Unassign
            </Button>
          )}
          <Button
            onClick={handleAssign}
            disabled={loading || !selectedUserId || fetchingUsers}
            icon={<Check size={16} />}
          >
            {loading ? "Assigning..." : "Assign Ticket"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TicketAssignmentModal;
