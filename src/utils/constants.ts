export const PRIORITY_COLORS = {
  low: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
  medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
  high: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
  critical: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
};

export const STATUS_COLORS = {
  pending: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
  in_progress: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
  completed: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
  closed: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
};

export const ROLE_PERMISSIONS = {
  admin: {
    canCreateUsers: true,
    canManageSettings: true,
    canViewAllTickets: true,
    canDeleteTickets: true,
    canMergeTickets: true,
    canExportData: true,
  },
  department_leader: {
    canCreateUsers: false,
    canManageSettings: false,
    canViewAllTickets: true,
    canDeleteTickets: false,
    canMergeTickets: true,
    canExportData: true,
  },
  troubleshooter: {
    canCreateUsers: false,
    canManageSettings: false,
    canViewAllTickets: false,
    canDeleteTickets: false,
    canMergeTickets: false,
    canExportData: false,
  },
};

export const API_BASE_URL = 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  LOGIN: '${API_BASE_URL}/api/auth/login',
  LOGOUT: '${API_BASE_URL}/api/auth/logout',
  TICKETS: '${API_BASE_URl}/api/tickets',
  USERS: '${API_BASE_URl}/api/users',
  COMMENTS: '${API_BASE_URl}/api/comments',
  ANALYTICS: '${API_BASE_URl}/api/analytics',
  EXPORT: '${API_BASE_URl}/api/export',
};