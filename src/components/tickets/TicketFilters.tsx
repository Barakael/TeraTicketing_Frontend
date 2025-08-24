import React from "react";
import { Filter, Download, Merge } from "lucide-react";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";

interface TicketFiltersProps {
  filters: {
    status: string;
    priority: string;
    department: string;
    assignedTo: string;
    dateRange: string;
  };
  onFilterChange: (filters: any) => void;
  onExport: (format: "pdf" | "excel") => void;
  onMerge: () => void;
  selectedCount: number;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
  filters,
  onFilterChange,
  onExport,
  onMerge,
  selectedCount,
}) => {
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "closed", label: "Closed" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priority" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const departmentOptions = [
    { value: "", label: "All Departments" },
    { value: "software department", label: "software department" },
    { value: "HR", label: "HR" },
    { value: "Finance", label: "Finance" },
    { value: "Operations", label: "Operations" },
  ];

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters:
          </span>
        </div>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.department}
          onChange={(e) => handleFilterChange("department", e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {departmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex items-center space-x-2 ml-auto">
          {selectedCount > 0 && (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCount} selected
              </span>
              {selectedCount === 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMerge}
                  icon={<Merge size={16} />}
                >
                  Merge
                </Button>
              )}
            </>
          )}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("pdf")}
              icon={<Download size={16} />}
            >
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("excel")}
              icon={<Download size={16} />}
            >
              Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;
