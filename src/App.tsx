import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TicketProvider } from "./contexts/TicketContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Slide } from "react-toastify";

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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // Handle route changes with transitions
  useEffect(() => {
    setIsPageTransitioning(true);
    const timer = setTimeout(() => {
      setIsPageTransitioning(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated background for loading */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 dark:from-indigo-400/10 dark:to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 dark:from-cyan-400/8 dark:to-blue-400/8 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="relative">
            <LoadingSpinner size="lg" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full blur-lg opacity-20 dark:opacity-15 animate-pulse"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 animate-pulse bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Loading TeraTicketing
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Please wait while we prepare your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderLayout = (PageComponent: React.FC) => (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex transition-all duration-500 ease-in-out">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-400/8 dark:to-purple-400/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-500/15 to-pink-500/15 dark:from-indigo-400/8 dark:to-pink-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-400/5 dark:to-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-500/8 to-teal-500/8 dark:from-emerald-400/4 dark:to-teal-400/4 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-tr from-rose-500/8 to-pink-500/8 dark:from-rose-400/4 dark:to-pink-400/4 rounded-full blur-2xl animate-pulse delay-300"></div>
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out">
          <div
            className={`transition-all duration-300 ease-in-out ${
              isPageTransitioning
                ? "opacity-0 transform translate-y-4"
                : "opacity-100 transform translate-y-0"
            }`}
          >
            <div className="relative z-10">
              <PageComponent />
            </div>
          </div>
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
        element={
          isAuthenticated ? (
            renderLayout(DashboardPage)
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/department"
        element={
          isAuthenticated ? (
            renderLayout(DepartmentsPage)
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/tickets"
        element={
          isAuthenticated ? renderLayout(TicketsPage) : <Navigate to="/login" />
        }
      />
      <Route
        path="/analytics"
        element={
          isAuthenticated ? (
            renderLayout(AnalyticsPage)
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/users"
        element={
          isAuthenticated ? renderLayout(UsersPage) : <Navigate to="/login" />
        }
      />
      <Route
        path="/chat"
        element={
          isAuthenticated ? (
            renderLayout(SupportChatPage)
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            renderLayout(SettingsPage)
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/settings/:activeTab"
        element={
          isAuthenticated ? (
            renderLayout(SettingsPage)
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Redirect unknown routes */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            transition={Slide}
            limit={5}
          />
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
