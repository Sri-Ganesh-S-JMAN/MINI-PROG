// ─── Dashboard Types ────────────────────────────────────────────────────────

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated";
export type Role = "USER" | "EMPLOYEE" | "AGENT" | "ADMIN" | "MANAGER";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  assignee: string;
  reporter: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface TicketDetail {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: string;
  category: string;
  createdById: number;
  assignedToId: number | null;
  slaDeadline: string | Date;
  slaHours: number;
  resolvedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  assignedTo: {
    id: number;
    name: string;
    email: string;
  } | null;
  comments: Array<{
    id: number;
    content: string;
    message: string;
    ticketId: number;
    userId: number;
    authorId: number | null;
    isInternal: boolean;
    createdAt: string | Date;
    user: {
      id: number;
      name: string;
      role: {
        id: number;
        name: string;
      };
    };
  }>;
}

export interface Approval {
  id: string;
  title: string;
  requestedBy: string;
  approver: string;
  status: ApprovalStatus;
  type: string;
  createdAt: Date;
  dueDate: Date;
  notes?: string;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  pendingApprovals: number;
  criticalTickets: number;
  approvalRate: number;
  avgResolutionTime: number; // in hours
  ticketTrend: number; // percentage change
}

export interface ActivityItem {
  id: string;
  type: "ticket_created" | "ticket_updated" | "approval_requested" | "approval_resolved" | "comment_added";
  title: string;
  user: string;
  timestamp: Date;
  entityId: string;
  entityType: "ticket" | "approval";
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;

}

