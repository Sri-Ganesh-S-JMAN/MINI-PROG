import type { Priority } from "@/types/dashboard";

// SLA response times in hours (kept local so this module is self-contained).
// Matches the values used in the tickets API and rendered bundle.
const SLA_HOURS: Record<Priority, number> = {
    CRITICAL: 4,
    HIGH: 8,
    MEDIUM: 24,
    LOW: 72,
};
export type SLAStatus = "on_track" | "at_risk" | "breached" | "resolved";
export function calculateSLADeadline(priority: Priority): Date {
    const hours = SLA_HOURS[priority as Priority];
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hours);
    return deadline;
}
export function getSLAStatus(
    deadline: Date,
    resolvedAt: Date | null
): SLAStatus {
    if (resolvedAt) return "resolved";

    const now = new Date();
    const msLeft = deadline.getTime() - now.getTime();
    const hoursLeft = msLeft / (1000 * 60 * 60);

    if (hoursLeft < 0) return "breached";
    if (hoursLeft < 2) return "at_risk";
    return "on_track";
}
export function formatSLATimeLeft(
    deadline: Date,
    resolvedAt: Date | null
): string {
    if (resolvedAt) return "Resolved";

    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const absDiff = Math.abs(diffMs);
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    return diffMs < 0 ? `${timeStr} overdue` : `${timeStr} left`;
}
