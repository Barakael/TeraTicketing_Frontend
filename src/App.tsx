import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TicketProvider } from "./contexts/TicketContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { slide } from "react-toastify";

import LoginPage from "./pages/LoginPage";
import PublicTicketPage from "./pages/PublicTicketPage";
import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import UsersPage from "./pages/UsersPage";
import SupportChatPage from "./pages/SupportChatPage";
import SettingsPage from "./pages/SettingsPage";

import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import DepartmentsPage from "./pages/DepartmentsPage";

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderLayout = (PageComponent: React.FC) => (
    <div className="h-screen bg-gradient-to-tr from-white to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <PageComponent />
        </main>
      </div>
    </div>
  );

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/public-ticket" element={<PublicTicketPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? renderLayout(DashboardPage) : <Navigate to="/login" />}
      />
      <Route
        path="/department"
        element={isAuthenticated ? renderLayout(DepartmentsPage) : <Navigate to="/login" />}
      />
      <Route
        path="/tickets"
        element={isAuthenticated ? renderLayout(TicketsPage) : <Navigate to="/login" />}
      />
      <Route
        path="/analytics"
        element={isAuthenticated ? renderLayout(AnalyticsPage) : <Navigate to="/login" />}
      />
      <Route
        path="/users"
        element={isAuthenticated ? renderLayout(UsersPage) : <Navigate to="/login" />}
      />
      <Route
        path="/chat"
        element={isAuthenticated ? renderLayout(SupportChatPage) : <Navigate to="/login" />}
      />
      <Route
        path="/settings/:tab"
        element={isAuthenticated ? renderLayout(SettingsPage) : <Navigate to="/login" />}
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <AppContent />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored"  />
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
