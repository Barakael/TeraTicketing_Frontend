import React, { useEffect, useState } from "react";
import {
  Ticket,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import StatsCard from "../components/dashboard/StatsCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import useAnalytics from "../hooks/useAnalytics";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { analytics, loading, error } = useAnalytics();

  const [wsMessages, setWsMessages] = useState<string[]>([]);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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
  const userName = user?.name ?? "User";

  // WebSocket connection (optional)
  useEffect(() => {
    const wsToken = localStorage.getItem("authToken");
    if (!wsToken) return;

    const ws = new WebSocket(`wss://your-server.com?token=${wsToken}`);

    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => setWsMessages((prev) => [...prev, event.data]);
    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, []);

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
      title: "Pending Tickets",
      value: safeAnalytics.ticketsByStatus?.pending || 0,
      change: { value: 3, type: "increase" as const, period: "last week" },
      icon: Clock,
      color: "red" as const,
    },
    {
      title: "In Progress",
      value: safeAnalytics.ticketsByStatus?.in_progress || 0,
      change: { value: 2, type: "decrease" as const, period: "last week" },
      icon: TrendingUp,
      color: "yellow" as const,
    },
    {
      title: "Closed Tickets",
      value: safeAnalytics.closedTickets,
      change: { value: 8, type: "increase" as const, period: "last month" },
      icon: BarChart3,
      color: "green" as const,
    },
    {
      title: "Resolution Rate",
      value: `${safeAnalytics.resolutionRate}%`,
      change: { value: 15, type: "increase" as const, period: "last month" },
      icon: TrendingUp,
      color: "purple" as const,
    },
    {
      title: "Avg Resolution Time",
      value: `${safeAnalytics.averageResolutionTime}h`,
      change: { value: 2, type: "decrease" as const, period: "last month" },
      icon: Clock,
      color: "blue" as const,
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getGreeting()}, {userName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening with your tickets today.
            </p>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Error loading analytics: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your tickets today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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

      {/* Analytics */}
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

        {/* Tickets by Status */}
        <div className="bg-gradient-to-r from-gray-100 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tickets by Status
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(safeAnalytics.ticketsByStatus).map(
              ([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        status === "pending"
                          ? "bg-red-500"
                          : status === "in_progress"
                          ? "bg-yellow-500"
                          : status === "completed"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {status.replace("_", " ")}
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
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Performance Metrics */}
        <div className="bg-gradient-to-r from-gray-100 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Metrics
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Resolution Rate
              </span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                {safeAnalytics.resolutionRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Avg Resolution Time
              </span>
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {safeAnalytics.averageResolutionTime}h
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Open vs Closed Ratio
              </span>
              <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {safeAnalytics.openTickets}:{safeAnalytics.closedTickets}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pending Tickets
              </span>
              <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                {safeAnalytics.ticketsByStatus?.pending || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Create New Ticket
            </span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              View Pending Tickets
            </span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              View Analytics
            </span>
          </button>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity Summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {safeAnalytics.closedTickets} tickets resolved this week
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last 7 days
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {safeAnalytics.ticketsByStatus?.pending || 0} tickets pending
                review
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Requires attention
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Average resolution time: {safeAnalytics.averageResolutionTime}{" "}
                hours
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              This month
            </span>
          </div>
        </div>
      </div>

      {/* Optional: WebSocket messages */}
      {wsMessages.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold text-gray-800 dark:text-white">
            Real-time Messages
          </h2>
          <ul className="list-disc pl-5">
            {wsMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
