/**
 * SLA (Service Level Agreement) utilities
 */

// Define Ticket interface locally for compatibility
interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdById: number;
  assignedToId: number | null;
  slaDeadline: Date;
  slaHours: number;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type SLAStatus = "on_track" | "at_risk" | "breached" | "resolved";

// SLA response times in hours
const SLA_HOURS: Record<Priority, number> = {
  CRITICAL: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};

/**
 * Calculate SLA deadline based on priority
 */
export function calculateSLADeadline(priority: string): Date {
  const hours = SLA_HOURS[priority as Priority] ?? 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Get SLA hours for a priority
 */
export function getSLAHours(priority: Priority): number {
  return SLA_HOURS[priority] ?? 24;
}

/**
 * Get SLA status based on deadline and resolution time
 */
export function getSLAStatus(
  slaDeadline: Date | string,
  resolvedAt: Date | string | null
): SLAStatus {
  if (resolvedAt) {
    return "resolved";
  }

  const deadline = new Date(slaDeadline);
  const now = new Date();
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursRemaining <= 0) {
    return "breached";
  }

  // At risk if less than 25% of time remaining
  const totalHours = SLA_HOURS.MEDIUM; // Using medium as baseline
  if (hoursRemaining < totalHours * 0.25) {
    return "at_risk";
  }

  return "on_track";
}

/**
 * Format SLA time left as human-readable string
 */
export function formatSLATimeLeft(
  slaDeadline: Date | string,
  resolvedAt: Date | string | null
): string {
  if (resolvedAt) {
    return "Resolved";
  }

  const deadline = new Date(slaDeadline);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "SLA Breached";
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}

/**
 * Legacy function for compatibility
 */
export default function slaCheck(ticket: Ticket): [number, number, boolean] {
  const creationTime = ticket.createdAt;
  const now = new Date();

  const durationInHours = (now.getTime() - creationTime.getTime()) / (1000 * 60 * 60);
  const limit = ticket.slaHours;

  return [durationInHours, limit, durationInHours <= limit];
}

