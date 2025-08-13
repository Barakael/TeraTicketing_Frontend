import { Ticket, User, Analytics } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Tera Admin',
    email: 'testadmin@tera.com',
    role: 'admin',
    department: 'IT',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Tera Leader',
    email: 'leader@tera.com',
    role: 'department_leader',
    department: 'IT',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Tera Troubleshooter',
    email: 'troubleshooter@tera.com',
    role: 'troubleshooter',
    department: 'IT',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockTickets: Ticket[] = [
  {
    id: '1',  
    title: 'Email server not responding',
    description: 'The email server has been down for 2 hours. Users cannot send or receive emails.',
    priority: 'critical',
    status: 'in_progress',
    category: 'server',
    department: 'IT',
    assignedTo: mockUsers[2],
    createdBy: mockUsers[0],
    targetedSystem: 'Email Server',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    comments: [
      {
        id: '1',
        ticketId: '1',
        userId: '2',
        user: mockUsers[2],
        content: 'Investigating the issue. Appears to be a database connection problem.',
        createdAt: '2024-01-15T11:00:00Z',
        isInternal: false,
      }
    ],
  },
  {
    id: '2',
    title: 'Password reset request',
    description: 'User cannot access their account and needs password reset.',
    priority: 'medium',
    status: 'pending',
    category: 'account',
    department: 'IT',
    createdBy: mockUsers[1],
    targetedSystem: 'User Management',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    comments: [],
  },
  {
    id: '3',
    title: 'Printer offline in Room 205',
    description: 'The printer in conference room 205 is showing as offline.',
    priority: 'low',
    status: 'completed',
    category: 'hardware',
    department: 'IT',
    assignedTo: mockUsers[2],
    createdBy: mockUsers[1],
    targetedSystem: 'Printer Network',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    resolvedAt: '2024-01-15T08:00:00Z',
    timeToResolution: 18, // hours
    comments: [
      {
        id: '2',
        ticketId: '3',
        userId: '3',
        user: mockUsers[2],
        content: 'Fixed the network connection. Printer is now online.',
        createdAt: '2024-01-15T08:00:00Z',
        isInternal: false,
      }
    ],
  },
  {
    id: '4',
    title: 'Password reset request',
    description: 'User cannot access their account and needs password reset.',
    priority: 'medium',
    status: 'pending',
    category: 'account',
    department: 'IT',
    createdBy: mockUsers[1],
    targetedSystem: 'User Management',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    comments: [],
  },
];

export const mockAnalytics: Analytics = {
  totalTickets: 45,
  openTickets: 12,
  closedTickets: 33,
  in_progress:10,
  newTickets: 8, //within 24hrs
  averageResolutionTime: 20.5, // hours
  ticketsByPriority: {
    low: 7,
    medium: 13,
    high: 17,
    critical: 8,
  },
  ticketsByStatus: {
    pending: 8,
    in_progress: 4,
    completed: 2,
    closed: 31,
  },
  resolutionRate: 85,
  workloadDistribution: {
    'IT department': 15,
    'VTS department': 12,
    'Accounting and Finances': 8,
  },
};