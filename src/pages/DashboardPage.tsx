import React, { useEffect, useState } from 'react';
import { Ticket, Users, Clock, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { useTickets } from '../contexts/TicketContext';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/dashboard/StatsCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { analytics } = useTickets();
  const { user } = useAuth();

  const [wsMessages, setWsMessages] = useState<string[]>([]);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Null-safe fallbacks
  const safeAnalytics = analytics ?? {
    newTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    totalTickets: 0,
    ticketsByPriority: { critical: 0, high: 0, medium: 0, low: 0 },
    workloadDistribution: {},
  };
  const userName = user?.name ?? 'User';

  // WebSocket connection (optional)
  useEffect(() => {
    const wsToken = localStorage.getItem('authToken');
    if (!wsToken) return;

    const ws = new WebSocket(`wss://your-server.com?token=${wsToken}`);

    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => setWsMessages(prev => [...prev, event.data]);
    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (err) => console.error('WebSocket error:', err);

    return () => ws.close();
  }, []);

  // Stats cards data
  const stats = [
    { title: 'New Tickets', value: safeAnalytics.newTickets, change: { value: 12, type: 'increase' as const, period: 'last week' }, icon: Ticket, color: 'blue' as const },
    { title: 'Open Tickets', value: safeAnalytics.openTickets, change: { value: 5, type: 'decrease' as const, period: 'last week' }, icon: Clock, color: 'yellow' as const },
    { title: 'Resolved Tickets', value: safeAnalytics.closedTickets, change: { value: 8, type: 'increase' as const, period: 'last month' }, icon: TrendingUp, color: 'green' as const },
    { title: 'Total Tickets', value: safeAnalytics.totalTickets, change: { value: 15, type: 'decrease' as const, period: 'last month' }, icon: BarChart3, color: 'purple' as const },
  ];

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

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Priority */}
        <div className="bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets by Priority</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(safeAnalytics.ticketsByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      priority === 'critical'
                        ? 'bg-red-500'
                        : priority === 'high'
                        ? 'bg-orange-500'
                        : priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{priority}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Distribution */}
        <div className="bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workload Distribution</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.keys(safeAnalytics.workloadDistribution).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            )}
            {Object.entries(safeAnalytics.workloadDistribution).map(([person, count]) => (
              <div key={person} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{person}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(count / Math.max(...Object.values(safeAnalytics.workloadDistribution))) * 100 || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-6">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optional: WebSocket messages */}
      {wsMessages.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold text-gray-800 dark:text-white">Real-time Messages</h2>
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
