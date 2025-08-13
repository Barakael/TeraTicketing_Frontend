import React from 'react';
import { Bell, Search, Menu, Sun, Moon, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className="h-16 bg-gradient-to-r from-gray-100 to-indigo-100 dark:from-gray-900 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          icon={<Menu size={18} />}
        >
          {sidebarCollapsed ? '' : 'Menu'}
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
        />
        
        <Button
          variant="ghost"
          size="sm"
          icon={<Bell size={18} />}
        />

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="py-2">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;