export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'department_leader' | 'troubleshooter';
  department?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'closed';
  category: string;
  department: string;
  assignedTo?: User;
  createdBy: User;
  targetedSystem?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  comments: Comment[];
  attachments?: Attachment[];
  timeToResolution?: number;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Department {
  id: string;
  name: string;
  leader: User;
  members: User[];
  description?: string;
}

export interface Analytics {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  averageResolutionTime: number;
  ticketsByPriority: Record<string, number>;
  ticketsByStatus: Record<string, number>;
  resolutionRate: number;
  workloadDistribution: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  suggestions?: string[];
}

export interface PreTicketData {
  category?: string;
  priority?: string;
  department?: string;
  description?: string;
}