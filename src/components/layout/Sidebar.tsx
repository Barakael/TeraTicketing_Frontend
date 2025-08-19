import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Ticket, Users, BarChart3, Settings, MessageCircle, ChevronDown, User, Shield, Database, Layers } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed }) => {
  const { user } = useAuth();
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'department_leader', 'troubleshooter'], path: '/dashboard' },
    { id: 'tickets', label: 'Tickets', icon: Ticket, roles: ['admin', 'department_leader', 'troubleshooter'], path: '/tickets' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'department_leader'], path: '/analytics' },
    { id: 'users', label: 'Users', icon: Users, roles: ['admin'], path: '/users' },
    { id: 'department', label: 'Departments', icon: Layers, roles: ['admin'], path: '/department' },
    { id: 'chat', label: 'Support Chat', icon: MessageCircle, roles: ['admin', 'department_leader', 'troubleshooter'], path: '/chat' },
  ];

  const settingsItems = [
    { id: 'profile', label: 'Profile', icon: User, roles: ['admin', 'department_leader', 'troubleshooter'], path: '/settings/profile' },
    { id: 'permissions', label: 'Permissions', icon: Shield, roles: ['admin'], path: '/settings/permissions' },
    { id: 'system', label: 'System Settings', icon: Database, roles: ['admin'], path: '/settings/system' },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role || 'troubleshooter'));
  const filteredSettingsItems = settingsItems.filter(item => item.roles.includes(user?.role || 'troubleshooter'));

  const handleItemClick = (itemId: string, path: string) => {
    setActiveTab(itemId);
    navigate(path);
  };

  const handleSettingsClick = () => setSettingsExpanded(!settingsExpanded);

  return (
    <div className={cn('h-full bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300',
      collapsed ? 'w-20' : 'w-64')}>
      
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && <img src="https://teratech.co.tz/assets/logo-4eACH_FU.png" alt="Logo" />}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => handleItemClick(item.id, item.path)}
              className={cn('w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                activeTab === item.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800')}>
              <Icon size={18} /> {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Settings */}
        {filteredSettingsItems.length > 0 && (
          <div>
            <button onClick={handleSettingsClick}
              className={cn('w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                settingsExpanded || activeTab.startsWith('settings') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800')}>
              <Settings size={18} /> {!collapsed && <>
                <span>Settings</span>
                <ChevronDown size={16} className={cn('ml-auto transition-transform duration-200', settingsExpanded && 'rotate-180')} />
              </>}
            </button>

            {!collapsed && settingsExpanded && (
              <div className="mt-2 space-y-1 pl-10">
                {filteredSettingsItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => handleItemClick(`settings-${item.id}`, item.path)}
                      className={cn('w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                        activeTab === `settings-${item.id}` ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')}>
                      <Icon size={16} /> <span>{item.label}</span>
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
