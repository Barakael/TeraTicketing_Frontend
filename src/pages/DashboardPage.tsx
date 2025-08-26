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
import { useTickets } from "../contexts/TicketContext";
import StatsCard from "../components/dashboard/StatsCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import useAnalytics from "../hooks/useAnalytics";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { analytics, loading, error } = useAnalytics();
  const { tickets } = useTickets();

  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [viewRange, setViewRange] = useState<"7" | "30">("7");

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
    completedTickets: 0,
    averageResolutionTime: 0,
    ticketsByPriority: { critical: 0, high: 0, medium: 0, low: 0 },
    ticketsByStatus: {} as Record<string, number>,
    resolutionRate: 0,
    workloadDistribution: {},
  };
  const userName = user?.name ?? "User";

  // Build datasets for bar graphs (Category & Department) with week/month toggle
  const now = new Date();
  const startDate = new Date(
    now.getTime() - (viewRange === "7" ? 7 : 30) * 24 * 60 * 60 * 1000
  );

  const filteredTickets = (tickets as any[] | undefined)?.filter((t: any) => {
    const created = new Date(t?.created_at || t?.createdAt || now);
    return created >= startDate && created <= now;
  }) || [];

  const aggregateCounts = (
    items: any[],
    nameSelector: (t: any) => string | undefined
  ) => {
    const counts: Record<string, number> = {};
    items.forEach((t) => {
      const name = nameSelector(t) || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = entries.length ? entries[0][1] : 0;
    return { entries, max };
  };

  const categoryAgg = aggregateCounts(filteredTickets, (t) => t?.category?.name);
  const departmentAgg = aggregateCounts(filteredTickets, (t) => t?.department?.name);

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
      title: "Completed Tickets",
      value: safeAnalytics.completedTickets,
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
        {/* Tickets by Category (Bar Graph with week/month toggle) */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-indigo-100 dark:border-slate-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tickets by Category
            </h3>
            <div className="flex items-center space-x-2">
              <button
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  viewRange === "7"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-700 text-white border-transparent shadow"
                    : "bg-white/60 dark:bg-slate-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setViewRange("7")}
              >
                This Week
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  viewRange === "30"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow"
                    : "bg-white/60 dark:bg-slate-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setViewRange("30")}
              >
                This Month
              </button>
            </div>
          </div>
          {categoryAgg.entries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
          ) : (
            <div className="space-y-3">
              {categoryAgg.entries.map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/70 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${(count as number / (categoryAgg.max || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tickets by Department (Bar Graph with week/month toggle) */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-emerald-100 dark:border-slate-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tickets by Department
            </h3>
            <div className="flex items-center space-x-2">
              <button
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  viewRange === "7"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow"
                    : "bg-white/60 dark:bg-slate-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setViewRange("7")}
              >
                This Week
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  viewRange === "30"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow"
                    : "bg-white/60 dark:bg-slate-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setViewRange("30")}
              >
                This Month
              </button>
            </div>
          </div>
          {departmentAgg.entries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
          ) : (
            <div className="space-y-3">
              {departmentAgg.entries.map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/70 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${(count as number / (departmentAgg.max || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
