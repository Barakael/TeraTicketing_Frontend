import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TicketProvider } from './contexts/TicketContext';
import LoginPage from './pages/LoginPage';
import PublicTicketPage from './pages/PublicTicketPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/UsersPage';
import SupportChatPage from './pages/SupportChatPage';
import SettingsPage from './pages/SettingsPage';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { cn } from './utils/cn';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPublicTicket, setShowPublicTicket] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if user wants to access public ticket creation
  if (showPublicTicket || window.location.pathname === '/public-ticket') {
    return <PublicTicketPage />;
  }

  if (showLoginPage || window.location.pathname === '/login') {
    return <LoginPage />;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <PublicTicketPage />
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowLoginPage(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200"
          >
           Login (Registered Users)
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'users':
        return <UsersPage />;
      case 'chat':
        return <SupportChatPage />;
      case 'settings-profile':
      case 'settings-permissions':
      case 'settings-system':
        return <SettingsPage activeTab={activeTab} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-tr from-white to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <AppContent />
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;