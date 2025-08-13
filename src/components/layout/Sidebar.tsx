import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings, 
  MessageCircle,
  ChevronDown,
  User,
  Shield,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize(); // set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'department_leader', 'troubleshooter'] },
    { id: 'tickets', label: 'Tickets', icon: Ticket, roles: ['admin', 'department_leader', 'troubleshooter'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'department_leader'] },
    { id: 'users', label: 'Users', icon: Users, roles: ['admin'] },
    { id: 'chat', label: 'Support Chat', icon: MessageCircle, roles: ['admin', 'department_leader', 'troubleshooter'] },
  ];

  const settingsItems = [
    { id: 'profile', label: 'Profile Settings', icon: User, roles: ['admin', 'department_leader', 'troubleshooter'] },
    { id: 'permissions', label: 'Permissions', icon: Shield, roles: ['admin'] },
    { id: 'system', label: 'System Settings', icon: Database, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role || 'troubleshooter'));
  const filteredSettingsItems = settingsItems.filter(item => item.roles.includes(user?.role || 'troubleshooter'));

  const handleItemClick = (itemId: string) => setActiveTab(itemId);
  const handleSettingsClick = () => !collapsed && setSettingsExpanded(!settingsExpanded);

  return (
    <div
      className={cn(
        'h-full bg-gradient-to-tl from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300',
        'w-20', // small screens always collapsed
        collapsed ? 'md:w-20' : 'md:w-64' // md+ screens toggle
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <img src="https://teratech.co.tz/assets/logo-4eACH_FU.png" alt="Logo" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                activeTab === item.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {filteredSettingsItems.length > 0 && (
          <div>
            <button
              onClick={handleSettingsClick}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                settingsExpanded || activeTab.startsWith('settings')
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <Settings size={18} />
              {!collapsed && (
                <>
                  <span>Settings</span>
                  <ChevronDown 
                    size={16} 
                    className={cn(
                      'ml-auto transition-transform duration-200',
                      settingsExpanded && 'rotate-180'
                    )}
                  />
                </>
              )}
            </button>

            {!collapsed && settingsExpanded && (
              <div className="mt-2 space-y-1 pl-10">
                {filteredSettingsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(`settings-${item.id}`)}
                      className={cn(
                        'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                        activeTab === `settings-${item.id}`
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
