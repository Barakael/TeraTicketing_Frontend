import React, { useState } from "react";
import { Calendar, Filter, Download } from "lucide-react";
import useAnalytics from "../../hooks/useAnalytics";
import StatsCard from "./StatsCard";
import {
  Ticket,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";

interface AnalyticsFilters {
  department_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const { analytics, loading, error } = useAnalytics(filters);

  const handleFilterChange = (
    key: keyof AnalyticsFilters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters((prev) => ({
      ...prev,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }));
  };

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Exporting analytics as ${format} with filters:`, filters);
    // Implementation for exporting analytics
  };

  // Null-safe fallbacks
  const safeAnalytics = analytics ?? {
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    averageResolutionTime: 0,
    ticketsByPriority: { critical: 0, high: 0, medium: 0, low: 0 },
    ticketsByStatus: {},
    resolutionRate: 0,
    workloadDistribution: {},
  };

  // Stats cards data
  const stats = [
    {
      title: "Total Tickets",
      value: safeAnalytics.totalTickets,
      change: { value: 12, type: "increase" as const, period: "last week" },
      icon: Ticket,
      color: "blue" as const,
    },
    {
      title: "Open Tickets",
      value: safeAnalytics.openTickets,
      change: { value: 5, type: "decrease" as const, period: "last week" },
      icon: Clock,
      color: "yellow" as const,
    },
    {
      title: "Resolved Tickets",
      value: safeAnalytics.closedTickets,
      change: { value: 8, type: "increase" as const, period: "last month" },
      icon: TrendingUp,
      color: "green" as const,
    },
    {
      title: "Resolution Rate",
      value: `${safeAnalytics.resolutionRate}%`,
      change: { value: 15, type: "increase" as const, period: "last month" },
      icon: BarChart3,
      color: "purple" as const,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">
          Error loading analytics: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Performance insights and ticket analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            icon={<Download size={16} />}
          >
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
            icon={<Download size={16} />}
          >
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={18} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters:
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              value={filters.department_id || ""}
              onChange={(e) =>
                handleFilterChange(
                  "department_id",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Departments</option>
              <option value="1">Software Department</option>
              <option value="2">HR</option>
              <option value="3">Finance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date || ""}
              onChange={(e) =>
                handleDateRangeChange(e.target.value, filters.end_date || "")
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date || ""}
              onChange={(e) =>
                handleDateRangeChange(filters.start_date || "", e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange("status", e.target.value || undefined)
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Priority */}
        <div className="bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tickets by Priority
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(safeAnalytics.ticketsByPriority).map(
              ([priority, count]) => (
                <div
                  key={priority}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        priority === "critical"
                          ? "bg-red-500"
                          : priority === "high"
                          ? "bg-orange-500"
                          : priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {priority}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Workload Distribution */}
        <div className="bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Workload Distribution
            </h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.keys(safeAnalytics.workloadDistribution).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                No data available
              </p>
            )}
            {Object.entries(safeAnalytics.workloadDistribution).map(
              ([person, count]) => (
                <div key={person} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {person}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (count /
                              Math.max(
                                ...Object.values(
                                  safeAnalytics.workloadDistribution
                                )
                              )) *
                              100 || 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-6">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
