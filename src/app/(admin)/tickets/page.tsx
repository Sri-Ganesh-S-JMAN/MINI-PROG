/**
 * src/app/(app)/tickets/page.tsx
 * Ticket list page — shows all tickets relevant to the logged-in user.
 * Supports filtering by status and priority via URL query params.
 */

import { getCurrentUser } from "@/lib/auth";
import { getSLAStatus, formatSLATimeLeft } from "@/lib/sla";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { TicketStatus, Priority } from "@/types/dashboard";

const STATUS_COLORS: Record<TicketStatus, string> = {
    OPEN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-slate-100 text-slate-500",
};

const PRIORITY_COLORS: Record<Priority, string> = {
    CRITICAL: "bg-red-100 text-red-700",
    HIGH: "bg-orange-100 text-orange-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-slate-100 text-slate-500",
};

const SLA_COLORS: Record<string, string> = {
    on_track: "text-green-600",
    at_risk: "text-orange-500",
    breached: "text-red-600",
    resolved: "text-slate-400",
};

export default async function TicketsPage({
    searchParams,
}: {
    searchParams: { status?: string };
}) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const { prisma } = await import("@/lib/prisma");

    const userIdInt = parseInt(user.userId, 10);
    
    const roleFilter =
    user.roleId === 1  // USER/EMPLOYEE
        ? { createdById: userIdInt }
        : user.roleId === 5  // AGENT
            ? { assignedToId: userIdInt }
            : {};  // ADMIN (4) or MANAGER (6) - see all tickets

    const tickets = await prisma.ticket.findMany({
        where: {
            ...roleFilter,
            ...(searchParams.status ? { status: searchParams.status as TicketStatus } : {}),
        },
        include: {
            createdBy: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
            _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tickets</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
                </div>
                {user.roleId !== 5 && (  // AGENT
                    <Link href="/tickets/create" className="btn-primary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Ticket
                    </Link>
                )}
            </div>

            <div className="flex gap-1 mb-4 bg-white rounded-lg border border-slate-200 p-1 w-fit">
                <Link
                    href="/tickets"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${!searchParams.status ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                >
                    All
                </Link>
                {STATUSES.map((s: TicketStatus) => (
                    <Link
                        key={s}
                        href={`/tickets?status=${s}`}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${searchParams.status === s ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        {s.replace("_", " ")}
                    </Link>
                ))}
            </div>

            {tickets.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-slate-500 text-sm">No tickets found.</p>
                    {user.roleId !== 5 && (
                        <Link href="/tickets/create" className="btn-primary mt-4 inline-flex">Create your first ticket</Link>
                    )}
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>SLA</th>
                                <th>Assigned To</th>
                                <th>Comments</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket: any) => {
                                const slaStatus = getSLAStatus(ticket.slaDeadline, ticket.resolvedAt);
                                const slaTime = formatSLATimeLeft(ticket.slaDeadline, ticket.resolvedAt);
                                return (
                                    <tr key={ticket.id}>
                                        <td>
                                            <Link href={`/tickets/${ticket.id}`} className="font-medium text-slate-800 hover:text-brand-600 transition">
                                                {ticket.title}
                                            </Link>
                                            <p className="text-xs text-slate-400">{ticket.category}</p>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status as TicketStatus]}`}>
                                                {ticket.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority as Priority]}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`text-xs font-medium ${SLA_COLORS[slaStatus]}`}>{slaTime}</span>
                                        </td>
                                        <td className="text-sm text-slate-600">
                                            {ticket.assignedTo?.name ?? <span className="text-slate-400 italic">Unassigned</span>}
                                        </td>
                                        <td className="text-sm text-slate-500">{ticket._count.comments}</td>
                                        <td className="text-xs text-slate-400">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

