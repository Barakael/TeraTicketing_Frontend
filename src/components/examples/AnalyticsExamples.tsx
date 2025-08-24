import React from "react";
import useAnalytics from "../../hooks/useAnalytics";
import LoadingSpinner from "../ui/LoadingSpinner";

// Example 1: Basic usage without filters
const BasicAnalytics = () => {
  const { analytics, loading, error } = useAnalytics();

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Basic Analytics</h3>
      <p>Total Tickets: {analytics?.totalTickets}</p>
      <p>Open Tickets: {analytics?.openTickets}</p>
      <p>Resolution Rate: {analytics?.resolutionRate}%</p>
    </div>
  );
};

// Example 2: Department-specific analytics
const DepartmentAnalytics = () => {
  const { analytics, loading, error } = useAnalytics({
    department_id: 1,
    start_date: "2025-01-01",
    end_date: "2025-01-31",
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Software Department Analytics (January 2025)</h3>
      <p>Total Tickets: {analytics?.totalTickets}</p>
      <p>Open Tickets: {analytics?.openTickets}</p>
      <p>Resolution Rate: {analytics?.resolutionRate}%</p>
    </div>
  );
};

// Example 3: High priority tickets analytics
const HighPriorityAnalytics = () => {
  const { analytics, loading, error } = useAnalytics({
    priority: "high",
    status: "in_progress",
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>High Priority In-Progress Tickets</h3>
      <p>Total Tickets: {analytics?.totalTickets}</p>
      <p>Open Tickets: {analytics?.openTickets}</p>
      <p>Resolution Rate: {analytics?.resolutionRate}%</p>
    </div>
  );
};

// Example 4: Date range analytics
const DateRangeAnalytics = () => {
  const { analytics, loading, error } = useAnalytics({
    start_date: "2025-01-01",
    end_date: "2025-03-31",
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Q1 2025 Analytics</h3>
      <p>Total Tickets: {analytics?.totalTickets}</p>
      <p>Open Tickets: {analytics?.openTickets}</p>
      <p>Resolution Rate: {analytics?.resolutionRate}%</p>
      <p>Avg Resolution Time: {analytics?.averageResolutionTime} hours</p>
    </div>
  );
};

// Example 5: Assigned user analytics
const UserAnalytics = () => {
  const { analytics, loading, error } = useAnalytics({
    assigned_to: 123,
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>User #123 Analytics</h3>
      <p>Total Tickets: {analytics?.totalTickets}</p>
      <p>Open Tickets: {analytics?.openTickets}</p>
      <p>Resolution Rate: {analytics?.resolutionRate}%</p>
    </div>
  );
};

// Combined example showing all components
const AnalyticsExamples = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Analytics Hook Examples</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg">
          <BasicAnalytics />
        </div>

        <div className="p-4 border rounded-lg">
          <DepartmentAnalytics />
        </div>

        <div className="p-4 border rounded-lg">
          <HighPriorityAnalytics />
        </div>

        <div className="p-4 border rounded-lg">
          <DateRangeAnalytics />
        </div>

        <div className="p-4 border rounded-lg">
          <UserAnalytics />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsExamples;
