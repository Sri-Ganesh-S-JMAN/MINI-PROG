// ─── Dashboard Types ────────────────────────────────────────────────────────

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  reporter: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface Approval {
  id: string;
  title: string;
  requestedBy: string;
  approver: string;
  status: ApprovalStatus;
  type: string;
  createdAt: Date;
  dueDate?: Date;
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

