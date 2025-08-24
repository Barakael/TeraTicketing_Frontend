// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// User types
export interface User {
  id: number;
  name: string;
  email?: string;
  role?: 'admin' | 'department_leader' | 'troubleshooter';
  department?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
}

// Category, Status, Priority, Department entities
export interface Category {
  id: number;
  name: string;
}

export interface Status {
  id: number;
  name: string;
}

export interface Priority {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
  leader?: User;
  members?: User[];
  description?: string;
}

// Comment entity
export interface Comment {
  id: number;
  comment: string;
  created_at: string;
  user?: User;
}

// Ticket entity matching API response
export interface Ticket {
  id: number;
  title: string;
  description: string;
  category_id: number;
  status_id: number;
  priority_id: number;
  department_id: number;
  assigned_to: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  category: Category;
  status: Status;
  priority: Priority;
  department: Department;
  assignedTo: User;
  comments: Comment[];
}

// Ticket update request payload
export interface TicketUpdateRequest {
  title?: string;
  description?: string;
  category_id?: number;
  status_id?: number;
  priority_id?: number;
  department_id?: number;
  assigned_to?: number;
  merge_description?: boolean;
  append_description?: string;
}

// Legacy types for backward compatibility
export interface LegacyTicket {
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
  comments: LegacyComment[];
  attachments?: Attachment[];
  timeToResolution?: number;
}

export interface LegacyComment {
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