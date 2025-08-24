import React, { useState } from "react";
import { Merge, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Ticket } from "../../types";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { toast } from "react-hot-toast";
import { useTickets } from "../../contexts/TicketContext";

interface TicketMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTickets: Ticket[];
  onMergeComplete: () => void;
}

const TicketMergeModal: React.FC<TicketMergeModalProps> = ({
  isOpen,
  onClose,
  selectedTickets,
  onMergeComplete,
}) => {
  const { mergeTickets } = useTickets();
  const [isMerging, setIsMerging] = useState(false);

  const handleMerge = async () => {
    if (selectedTickets.length !== 2) {
      toast.error("Please select exactly 2 tickets to merge");
      return;
    }

    setIsMerging(true);
    try {
      // Use the first ticket as primary, second as secondary
      await mergeTickets(selectedTickets[0].id, selectedTickets[1].id);
      toast.success("Tickets merged successfully!");
      onMergeComplete();
      onClose();
    } catch (error) {
      console.error("Error merging tickets:", error);
      toast.error("Failed to merge tickets");
    } finally {
      setIsMerging(false);
    }
  };

  if (selectedTickets.length !== 2) {
    return null;
  }

  const [primaryTicket, secondaryTicket] = selectedTickets;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Merge Tickets" size="lg">
      <div className="space-y-6">
        {/* Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">
              Merge Confirmation
            </span>
          </div>
          <p className="text-yellow-700 dark:text-yellow-300 mt-2 text-sm">
            This action will merge the secondary ticket into the primary ticket. 
            The secondary ticket will be deleted and all its data will be transferred to the primary ticket.
          </p>
        </div>

        {/* Ticket Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Ticket */}
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Primary Ticket (Will Remain)</span>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> #{primaryTicket.id}</div>
              <div><strong>Title:</strong> {primaryTicket.title}</div>
              <div><strong>Priority:</strong> {primaryTicket.priority}</div>
              <div><strong>Status:</strong> {primaryTicket.status}</div>
              <div><strong>Department:</strong> {typeof primaryTicket.department === 'string' ? primaryTicket.department : (primaryTicket.department as any)?.name || 'N/A'}</div>
            </div>
          </div>

          {/* Secondary Ticket */}
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center space-x-2 mb-3">
              <X size={16} className="text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-900 dark:text-red-100">Secondary Ticket (Will Be Deleted)</span>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> #{secondaryTicket.id}</div>
              <div><strong>Title:</strong> {secondaryTicket.title}</div>
              <div><strong>Priority:</strong> {secondaryTicket.priority}</div>
              <div><strong>Status:</strong> {secondaryTicket.status}</div>
              <div><strong>Department:</strong> {typeof secondaryTicket.department === 'string' ? secondaryTicket.department : (secondaryTicket.department as any)?.name || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Merge Strategy Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Merge Strategy</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Primary ticket will remain as the main ticket</li>
            <li>• Secondary ticket will be deleted</li>
            <li>• Comments from secondary ticket will be transferred</li>
            <li>• Higher priority will be preserved</li>
            <li>• Most recent status will be used</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button variant="outline" onClick={onClose} disabled={isMerging}>
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={isMerging}
            icon={<Merge size={16} />}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isMerging ? "Merging..." : "Confirm Merge"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TicketMergeModal;
