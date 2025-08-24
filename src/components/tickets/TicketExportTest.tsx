import React from "react";
import { useTickets } from "../../contexts/TicketContext";
import Button from "../ui/Button";
import { Download } from "lucide-react";

const TicketExportTest: React.FC = () => {
  const { exportTickets, tickets } = useTickets();

  const handleTestExport = async (format: "pdf" | "excel") => {
    try {
      // Export all tickets for testing
      const allTicketIds = tickets.map((ticket) => ticket.id);
      await exportTickets(format, allTicketIds);
    } catch (error) {
      console.error(`Export test failed for ${format}:`, error);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Export Test (Debug)
      </h3>
      <div className="flex space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTestExport("excel")}
          icon={<Download size={16} />}
        >
          Test Excel Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTestExport("pdf")}
          icon={<Download size={16} />}
        >
          Test PDF Export
        </Button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Total tickets available: {tickets.length}
      </p>
    </div>
  );
};

export default TicketExportTest;

