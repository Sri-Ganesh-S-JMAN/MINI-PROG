/**
 * src/app/(app)/tickets/page.tsx
 * Ticket list page — shows all tickets relevant to the logged-in user.
 * Supports filtering by status and priority via URL query params.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getCurrentUser } from "@/lib/auth";
import { getSLAStatus, formatSLATimeLeft } from "@/lib/sla";
import { DeleteTicketButton } from "@/components/dashboard/DeleteTicketButton";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { TicketStatus, Priority } from "@/types/dashboard";

const STATUS_COLORS: Record<string, string> = {
    OPEN: "bg-white border border-gray-200 text-gray-900",
    open: "bg-white border border-gray-200 text-gray-900",
    IN_PROGRESS: "bg-gray-100 border border-gray-200 text-gray-900",
    in_progress: "bg-gray-100 border border-gray-200 text-gray-900",
    RESOLVED: "bg-gray-900 text-white",
    resolved: "bg-gray-900 text-white",
    CLOSED: "bg-gray-50 border border-gray-200 text-gray-500",
    closed: "bg-gray-50 border border-gray-200 text-gray-500",
};

const PRIORITY_COLORS: Record<string, string> = {
    CRITICAL: "bg-red-50 border border-red-200 text-red-700",
    critical: "bg-red-50 border border-red-200 text-red-700",
    HIGH: "bg-gray-100 border border-gray-200 text-gray-900",
    high: "bg-gray-100 border border-gray-200 text-gray-900",
    MEDIUM: "bg-white border border-gray-200 text-gray-900",
    medium: "bg-white border border-gray-200 text-gray-900",
    LOW: "bg-gray-50 border border-gray-200 text-gray-500",
    low: "bg-gray-50 border border-gray-200 text-gray-500",
};

const SLA_COLORS: Record<string, string> = {
    on_track: "text-gray-900",
    at_risk: "text-amber-600",
    breached: "text-red-600",
    resolved: "text-gray-400",
};

export default async function TicketsPage(
    props: { searchParams: Promise<{ status?: string; page?: string }> }
) {
    const searchParams = await props.searchParams;
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const { prisma } = await import("@/lib/prisma");

    const userIdInt = parseInt(user.userId, 10);
    
    const roleFilter =
        ["ADMIN", "MANAGER"].includes(user.role)
            ? {}  // Admins see all
            : user.role === "AGENT"
                ? { assignedToId: userIdInt }
                : { createdById: userIdInt }; // Regular users only see their own

    const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
    const itemsPerPage = 50;
    const whereClause = {
        ...roleFilter,
        ...(searchParams.status ? { status: (searchParams.status as string).toUpperCase() as any } : {}),
    };

    const tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
            createdBy: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
            _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
    });

    const totalTickets = await prisma.ticket.count({
        where: whereClause,
    });
    const totalPages = Math.ceil(totalTickets / itemsPerPage);

    const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Tickets</h1>
                    <p className="text-sm text-gray-500 mt-1">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
                </div>
                {user.role !== "AGENT" && (
                    <Link href="/tickets/create" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Ticket
                    </Link>
                )}
            </div>

            <div className="flex gap-1 mb-6 bg-gray-50/50 rounded-lg border border-gray-200 p-1 w-max">
                <Link
                    href="/tickets"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${!searchParams.status ? "bg-white text-black shadow-sm border border-gray-200" : "text-gray-500 hover:text-black hover:bg-gray-100"
                        }`}
                >
                    All
                </Link>
                {STATUSES.map((s: string) => (
                    <Link
                        key={s}
                        href={`/tickets?status=${s}`}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${searchParams.status === s ? "bg-white text-black shadow-sm border border-gray-200" : "text-gray-500 hover:text-black hover:bg-gray-100"
                            }`}
                    >
                        {s.replace("_", " ")}
                    </Link>
                ))}
            </div>

            {tickets.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">No tickets found.</p>
                    {user.role !== "AGENT" && (
                        <Link href="/tickets/create" className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Create your first ticket</Link>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Priority</th>
                                    <th className="px-6 py-3">SLA</th>
                                    <th className="px-6 py-3">Assigned To</th>
                                    <th className="px-6 py-3">Comments</th>
                                    <th className="px-6 py-3">Created</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-600">
                                {tickets.map((ticket: any) => {
                                    const slaStatus = getSLAStatus(ticket.slaDeadline, ticket.resolvedAt);
                                    const slaTime = formatSLATimeLeft(ticket.slaDeadline, ticket.resolvedAt);
                                    return (
                                        <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-0 py-0">
                                                <Link href={`/tickets/${ticket.id}`} className="block px-6 py-4">
                                                    <span className="font-medium text-gray-900 group-hover:text-black transition">
                                                        {ticket.title}
                                                    </span>
                                                    <p className="text-xs text-gray-400 mt-0.5">{ticket.category}</p>
                                                </Link>
                                            </td>
                                            <td className="px-0 py-0">
                                                <Link href={`/tickets/${ticket.id}`} className="block px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status as string]}`}>
                                                        {ticket.status.replace("_", " ")}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-0 py-0">
                                                <Link href={`/tickets/${ticket.id}`} className="block px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority as string]}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-0 py-0">
                                                <Link href={`/tickets/${ticket.id}`} className="block px-6 py-4">
                                                    <span className={`text-xs font-medium ${SLA_COLORS[slaStatus]}`}>{slaTime}</span>
                                                </Link>
                                            </td>
                                            <td className="px-0 py-0 text-sm text-gray-600">
                                                <Link href={`/tickets/${ticket.id}`} className="block px-6 py-4">
                                                    {ticket.assignedTo?.name ?? <span className="text-gray-400 italic">Unassigned</span>}
                                                </Link>
                                            </td>
                                            <td className="px-0 py-0 text-sm text-gray-500">
                                                <Link href={`/tickets/${ticket.id}`} className="block px-6 py-4">
                                                    {ticket._count.comments}
                                                </Link>
                                            </td>
                                            <td className="px-0 py-0 text-xs text-gray-400">
                                                <Link href={`/tickets/${ticket.id}`} className="block px-6 py-4">
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {(user.role === "ADMIN" || ticket.createdById === userIdInt) && (
                                                    <DeleteTicketButton ticketId={ticket.id} />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, totalTickets)}</span> of <span className="font-semibold text-gray-900">{totalTickets}</span> tickets
                    </p>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/tickets?${new URLSearchParams({ ...(searchParams.status ? { status: searchParams.status } : {}), page: String(currentPage - 1) })}`}
                            className={`px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium transition-colors shadow-sm ${currentPage <= 1 ? "opacity-50 pointer-events-none text-gray-400 bg-gray-50" : "text-gray-700 bg-white hover:bg-gray-50"}`}
                        >
                            Previous
                        </Link>
                        <Link
                            href={`/tickets?${new URLSearchParams({ ...(searchParams.status ? { status: searchParams.status } : {}), page: String(currentPage + 1) })}`}
                            className={`px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium transition-colors shadow-sm ${currentPage >= totalPages ? "opacity-50 pointer-events-none text-gray-400 bg-gray-50" : "text-gray-700 bg-white hover:bg-gray-50"}`}
                        >
                            Next
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

