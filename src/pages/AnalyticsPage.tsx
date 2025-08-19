import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock, Users, Download } from 'lucide-react';
import { useTickets } from '../contexts/TicketContext';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/dashboard/StatsCard';
import Button from '../components/ui/Button';

const AnalyticsPage: React.FC = () => {
  const { analytics } = useTickets();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Null safety
  const safeAnalytics = analytics ?? {
    averageResolutionTime: 0,
    resolutionRate: 0,
    totalTickets: 0,
    workloadDistribution: {},
    ticketsByPriority: { critical: 0, high: 0, medium: 0, low: 0 },
  };
  const userName = user?.name ?? 'User';

  const performanceMetrics = [
    {
      title: 'Average Resolution Time',
      value: `${safeAnalytics.averageResolutionTime}h`,
      change: { value: 15, type: 'decrease' as const, period: 'last month' },
      icon: Clock,
      color: 'blue' as const,
    },
    {
      title: 'Resolution Rate',
      value: `${safeAnalytics.resolutionRate}%`,
      change: { value: 8, type: 'increase' as const, period: 'last month' },
      icon: TrendingUp,
      color: 'green' as const,
    },
    {
      title: 'Active Troubleshooters',
      value: Object.keys(safeAnalytics.workloadDistribution).length,
      change: { value: 2, type: 'increase' as const, period: 'last week' },
      icon: Users,
      color: 'purple' as const,
    },
    {
      title: 'Tickets This Month',
      value: safeAnalytics.totalTickets,
      change: { value: 12, type: 'increase' as const, period: 'last month' },
      icon: BarChart3,
      color: 'yellow' as const,
    },
  ];

  const handleExportAnalytics = (format: 'pdf' | 'excel') => {
    console.log(`Exporting analytics as ${format}`);
    // Implementation for exporting analytics
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Performance insights and ticket analytics
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button
            variant="outline"
            onClick={() => handleExportAnalytics('pdf')}
            icon={<Download size={16} />}
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportAnalytics('excel')}
            icon={<Download size={16} />}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <StatsCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume Trend */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ticket Volume Trend
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
              <p>Chart visualization would be implemented here</p>
              <p className="text-sm">Using Chart.js or similar library</p>
            </div>
          </div>
        </div>

        {/* Resolution Time by Priority */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resolution Time by Priority
          </h3>
          <div className="space-y-4">
            {Object.entries(safeAnalytics.ticketsByPriority).map(([priority, count]) => {
              const avgTime =
                priority === 'critical'
                  ? 2
                  : priority === 'high'
                  ? 8
                  : priority === 'medium'
                  ? 24
                  : 48;
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {priority}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({count} tickets)
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {avgTime}h avg
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Team Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Team Member
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Assigned
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Completed
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Avg. Time
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(safeAnalytics.workloadDistribution).map(([person, assigned]) => {
                const completed = Math.floor(assigned * 0.8);
                const avgTime = Math.floor(Math.random() * 20) + 10;
                const performance = Math.floor((completed / assigned) * 100);

                return (
                  <tr key={person} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{person}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{assigned}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{completed}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{avgTime}h</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              performance >= 80
                                ? 'bg-green-500'
                                : performance >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${performance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {performance}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
