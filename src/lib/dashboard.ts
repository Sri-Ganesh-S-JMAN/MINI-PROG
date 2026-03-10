// ─── Dashboard Data Fetching ─────────────────────────────────────────────────
// src/lib/dashboard.ts
// All functions are server-side only (used in Server Components)

import { prisma } from "@/lib/prisma";
import { TicketStatus, RequestStatus } from "@prisma/client";

// ── Stat Cards ───────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    criticalTickets,
    pendingApprovals,
    totalApprovals,
    approvedApprovals,
    recentTickets,
    lastWeekTickets,
  ] = await Promise.all([
    // Total tickets
    prisma.ticket.count(),

    // Open tickets
    prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),

    // In progress
    prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),

    // Resolved
    prisma.ticket.count({ where: { status: TicketStatus.RESOLVED } }),

    // Critical tickets (priority = "High")
    prisma.ticket.count({
      where: {
        priority: { in: ["High", "Critical", "HIGH", "CRITICAL"] },
        status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
      },
    }),

    // Pending asset request approvals
    prisma.assetRequest.count({
      where: { status: RequestStatus.PENDING },
    }),

    // Total approvals in last 30 days
    prisma.approval.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Approved in last 30 days
    prisma.approval.count({
      where: {
        status: "APPROVED",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Tickets created this week
    prisma.ticket.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Tickets created last week (for trend)
    prisma.ticket.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  // Avg resolution time (hours) from resolved/closed tickets with SLA
  const resolvedWithSla = await prisma.ticket.findMany({
    where: {
      status: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
    },
    select: { slaHours: true },
  });

  const avgResolutionTime =
    resolvedWithSla.length > 0
      ? Math.round(
          resolvedWithSla.reduce((sum, t) => sum + t.slaHours, 0) /
            resolvedWithSla.length
        )
      : 0;

  // Trend: % change in tickets this week vs last week
  const ticketTrend =
    lastWeekTickets > 0
      ? Math.round(((recentTickets - lastWeekTickets) / lastWeekTickets) * 100)
      : 0;

  const approvalRate =
    totalApprovals > 0
      ? Math.round((approvedApprovals / totalApprovals) * 100)
      : 0;

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    criticalTickets,
    pendingApprovals,
    approvalRate,
    avgResolutionTime,
    ticketTrend,
  };
}

// ── Recent Tickets ────────────────────────────────────────────────────────────

export async function getRecentTickets(limit = 10) {
  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      createdBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  });

  return tickets.map((t) => ({
    id: `TKT-${String(t.id).padStart(3, "0")}`,
    rawId: t.id,
    title: t.title,
    description: t.description,
    status: t.status.toLowerCase() as "open" | "in_progress" | "resolved" | "closed",
    priority: t.priority.toLowerCase() as "low" | "medium" | "high" | "critical",
    assignee: t.assignedTo?.name ?? "Unassigned",
    reporter: t.createdBy.name,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    tags: [],
  }));
}

// ── Approvals ─────────────────────────────────────────────────────────────────

export async function getRecentApprovals(limit = 6) {
  const requests = await prisma.assetRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true } },
      asset: { select: { name: true } },
      approvals: {
        include: { approvedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return requests.map((r) => ({
    id: `APR-${String(r.id).padStart(3, "0")}`,
    rawId: r.id,
    title: `Asset request — ${r.asset.name}`,
    requestedBy: r.user.name,
    approver: r.approvals[0]?.approvedBy?.name ?? "Pending review",
    status: mapRequestStatus(r.status),
    type: "Asset Request",
    createdAt: r.createdAt,
    dueDate: new Date(r.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from creation
  }));
}

function mapRequestStatus(status: RequestStatus) {
  switch (status) {
    case RequestStatus.PENDING:
      return "pending" as const;
    case RequestStatus.MANAGER_APPROVED:
    case RequestStatus.ADMIN_APPROVED:
    case RequestStatus.ALLOCATED:
      return "approved" as const;
    case RequestStatus.REJECTED:
      return "rejected" as const;
    default:
      return "pending" as const;
  }
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

export async function getRecentActivity(limit = 8) {
  const [recentTickets, recentComments, recentApprovals] = await Promise.all([
    prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { createdBy: { select: { name: true } } },
    }),
    prisma.ticketComment.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { name: true } },
        ticket: { select: { id: true, title: true } },
      },
    }),
    prisma.approval.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        approvedBy: { select: { name: true } },
        request: { include: { asset: { select: { name: true } } } },
      },
    }),
  ]);

  const activities = [
    ...recentTickets.map((t) => ({
      id: `ticket-${t.id}`,
      type: "ticket_created" as const,
      title: `TKT-${String(t.id).padStart(3, "0")} created — ${t.title}`,
      user: t.createdBy.name,
      timestamp: t.createdAt,
      entityId: String(t.id),
      entityType: "ticket" as const,
    })),
    ...recentComments.map((c) => ({
      id: `comment-${c.id}`,
      type: "comment_added" as const,
      title: `Comment on TKT-${String(c.ticketId).padStart(3, "0")} — ${c.ticket.title}`,
      user: c.user.name,
      timestamp: c.createdAt,
      entityId: String(c.ticketId),
      entityType: "ticket" as const,
    })),
    ...recentApprovals.map((a) => ({
      id: `approval-${a.id}`,
      type: "approval_resolved" as const,
      title: `APR-${String(a.requestId).padStart(3, "0")} ${a.status.toLowerCase()} — ${a.request.asset.name}`,
      user: a.approvedBy.name,
      timestamp: a.createdAt,
      entityId: String(a.requestId),
      entityType: "approval" as const,
    })),
  ];

  // Sort all combined by timestamp desc, take top N
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

// ── Chart Data ────────────────────────────────────────────────────────────────

export async function getWeeklyTicketData() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();

  const results = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - (6 - i));
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const [created, resolved] = await Promise.all([
        prisma.ticket.count({
          where: { createdAt: { gte: dayStart, lte: dayEnd } },
        }),
        prisma.ticket.count({
          where: {
            status: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
            updatedAt: { gte: dayStart, lte: dayEnd },
          },
        }),
      ]);

      return {
        day: days[dayStart.getDay()],
        created,
        resolved,
      };
    })
  );

  return results;
}

export async function getTicketStatusBreakdown() {
  const [open, inProgress, resolved, closed] = await Promise.all([
    prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
    prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
    prisma.ticket.count({ where: { status: TicketStatus.RESOLVED } }),
    prisma.ticket.count({ where: { status: TicketStatus.CLOSED } }),
  ]);

  return [
    { label: "Open", value: open, color: "#000000" },          // Black
    { label: "In Progress", value: inProgress, color: "#4B5563" }, // Gray 600
    { label: "Resolved", value: resolved, color: "#9CA3AF" },      // Gray 400
    { label: "Closed", value: closed, color: "#E5E7EB" },          // Gray 200
  ];
}

export async function getTicketPriorityBreakdown() {
  const tickets = await prisma.ticket.groupBy({
    by: ["priority"],
    _count: { priority: true },
  });

  const colorMap: Record<string, string> = {
    critical: "#000000",   // Black
    high: "#374151",       // Gray 700
    medium: "#9CA3AF",     // Gray 400
    low: "#E5E7EB",        // Gray 200
  };

  return tickets.map((t) => ({
    label: t.priority.charAt(0).toUpperCase() + t.priority.slice(1).toLowerCase(),
    value: t._count.priority,
    color: colorMap[t.priority.toLowerCase()] ?? "#E5E7EB",
  }));
}