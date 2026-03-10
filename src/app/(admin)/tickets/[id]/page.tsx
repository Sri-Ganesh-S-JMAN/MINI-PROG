"use client";
/**
 * src/app/(app)/tickets/[id]/page.tsx
 * Ticket detail page — shows full ticket info, SLA status, comments,
 * and controls for agents/admins to reassign or change status.
 */

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { TicketDetail, TicketStatus, Priority, Role } from "@/types/dashboard";
import { getSLAStatus, formatSLATimeLeft } from "@/lib/sla";
import { DeleteTicketButton } from "@/components/dashboard/DeleteTicketButton";

const STATUS_COLORS: Record<TicketStatus, string> = {
    OPEN: "bg-white border border-gray-200 text-gray-900",
    IN_PROGRESS: "bg-gray-100 border border-gray-200 text-gray-900",
    RESOLVED: "bg-gray-900 text-white",
    CLOSED: "bg-gray-50 border border-gray-200 text-gray-500",
};
const PRIORITY_COLORS: Record<Priority, string> = {
    CRITICAL: "bg-red-50 border border-red-200 text-red-700",
    HIGH: "bg-gray-100 border border-gray-200 text-gray-900",
    MEDIUM: "bg-white border border-gray-200 text-gray-900",
    LOW: "bg-gray-50 border border-gray-200 text-gray-500",
};

function normalizeStatus(value: string): TicketStatus {
    return value.toUpperCase() as TicketStatus;
}

function normalizePriority(value: string): Priority {
    return value.toUpperCase() as Priority;
}
const SLA_BG: Record<string, string> = {
    on_track: "bg-white border-gray-200 text-gray-900",
    at_risk: "bg-orange-50 border-orange-200 text-orange-700",
    breached: "bg-red-50 border-red-200 text-red-700",
    resolved: "bg-gray-50 border-gray-200 text-gray-500",
    closed: "bg-gray-50 border-gray-200 text-gray-400",
};

export default function TicketDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [userRole, setUserRole] = useState<Role>("EMPLOYEE");
    const [userId, setUserId] = useState("");

    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
    const [comment, setComment] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [confirmClose, setConfirmClose] = useState(false);
    const [agentSearch, setAgentSearch] = useState("");
    const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);

    useEffect(() => {
        fetch("/api/auth/me").then((r) => r.json()).then((d: { user?: { role: Role; userId: string } }) => {
            if (d.user) {
                setUserRole(d.user.role);
                setUserId(d.user.userId);
            }
        }).catch(() => { });
    }, []);

    useEffect(() => {
        fetch(`/api/tickets/${id}`)
            .then((r) => r.json())
            .then((d: { ticket: TicketDetail }) => { setTicket(d.ticket); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!agentDropdownOpen) return;
        const close = () => setAgentDropdownOpen(false);
        document.addEventListener("click", close, { once: true });
        return () => document.removeEventListener("click", close);
    }, [agentDropdownOpen]);

    useEffect(() => {
        if (userRole !== "EMPLOYEE") {
            fetch("/api/users?role=AGENT")
                .then((r) => r.json())
                .then((d: { users?: { id: string; name: string }[] }) => setAgents(d.users ?? []));
        }
    }, [userRole]);

    async function updateTicket(data: Partial<{ status: string; assignedToId: string | null }>) {
        setSaving(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const updated = await res.json();
            if (res.ok) setTicket(updated.ticket);
        } finally {
            setSaving(false);
        }
    }

    async function handleComment(e: FormEvent) {
        e.preventDefault();
        setError("");
        if (!comment.trim()) return;

        const res = await fetch(`/api/tickets/${id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: comment, isInternal }),
        });

        if (res.ok) {
            const data = await res.json();
            setTicket((prev: any) => prev
                ? { ...prev, comments: [...prev.comments, data.comment] }
                : prev
            );
            setComment("");
        } else {
            setError("Failed to post comment.");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="card p-8 text-center">
                <p className="text-slate-500">Ticket not found.</p>
                <Link href="/tickets" className="btn-primary mt-4 inline-flex">Back to tickets</Link>
            </div>
        );
    }

    const isClosed = ticket.status === "CLOSED";
    const slaStatus = isClosed ? "closed" : getSLAStatus(new Date(ticket.slaDeadline), ticket.resolvedAt ? new Date(ticket.resolvedAt) : null);
    const slaTime = isClosed ? "Closed" : formatSLATimeLeft(new Date(ticket.slaDeadline), ticket.resolvedAt ? new Date(ticket.resolvedAt) : null);

    const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const isStaff = userRole === "ADMIN" || userRole === "AGENT";

    return (
        <div className="max-w-4xl">
            {confirmClose && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h2 className="text-base font-semibold text-gray-900 mb-1">Close this ticket?</h2>
                        <p className="text-sm text-gray-500 mb-6">This will lock the ticket. No further comments or status changes will be allowed.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmClose(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setConfirmClose(false); updateTicket({ status: "CLOSED" }); }}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors"
                            >
                                Close Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Link href="/tickets" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Tickets
            </Link>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    <div className="card p-6">
                        <div className="flex items-start justify-between gap-4 mb-5 border-b border-gray-100 pb-5">
                            <div className="flex-1">
                                <h1 className="text-xl font-semibold tracking-tight text-gray-900">{ticket.title}</h1>
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[normalizeStatus(ticket.status)]}`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[normalizePriority(ticket.priority)]}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">{ticket.category}</span>
                                </div>
                            </div>
                            {(userRole === "ADMIN" || ticket.createdById.toString() === userId) && (
                                <DeleteTicketButton ticketId={ticket.id} redirectAfter={true} />
                            )}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                        <div className="mt-5 pt-4 text-xs text-gray-400 flex flex-wrap gap-4 border-t border-gray-50">
                            <span>By <strong className="text-gray-700 font-medium">{ticket.createdBy.name}</strong></span>
                            <span>Created {new Date(ticket.createdAt).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="font-semibold text-gray-900 mb-5 tracking-tight">
                            Comments ({ticket.comments.length})
                        </h2>

                        {ticket.comments.length === 0 ? (
                            <p className="text-gray-400 text-sm italic py-4">No comments yet.</p>
                        ) : (
                            <div className="space-y-5 mb-8">
                                {ticket.comments.map((c: any) => (
                                    <div
                                        key={c.id}
                                        className={`flex gap-3.5 ${c.isInternal ? "opacity-75" : ""}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                            <span className="text-gray-600 text-xs font-semibold">
                                                {c.user?.name?.charAt(0).toUpperCase() || "?"}
                                            </span>
                                        </div>
                                        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3.5">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900">{c.user?.name || "Unknown"}</span>
                                                <span className="text-xs text-gray-500 capitalize">{c.user?.role?.name?.toLowerCase() || "user"}</span>
                                                {c.isInternal && (
                                                    <span className="text-[10px] font-medium bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wide">Internal</span>
                                                )}
                                                <span className="text-xs text-gray-400 ml-auto">
                                                    {new Date(c.createdAt).toLocaleString(undefined, {
                                                        month: "short", day: "numeric", hour: "numeric", minute: "numeric"
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isClosed && (
                            <p className="text-xs text-gray-400 italic pt-4 border-t border-gray-100">This ticket is closed and no longer accepts comments.</p>
                        )}
                        <form onSubmit={handleComment} className={`space-y-4 pt-4 border-t border-gray-100 ${isClosed ? "hidden" : ""}`}>
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none shadow-sm transition-shadow"
                                rows={3}
                                placeholder="Write a comment…"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="flex items-center justify-between">
                                {isStaff ? (
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isInternal}
                                            onChange={(e) => setIsInternal(e.target.checked)}
                                            className="accent-black h-4 w-4 border-gray-300 rounded"
                                        />
                                        Internal note (hidden from employee)
                                    </label>
                                ) : <div />}
                                <button
                                    type="submit"
                                    className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    disabled={!comment.trim()}
                                >
                                    Post Comment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className={`card p-4 border ${SLA_BG[slaStatus]}`}>
                        <p className="text-xs font-medium uppercase tracking-wide mb-1">SLA Status</p>
                        <p className="text-lg font-bold">{slaTime}</p>
                        <p className="text-xs mt-1 opacity-75">
                            Deadline: {new Date(ticket.slaDeadline).toLocaleString()}
                        </p>
                    </div>

                    {isStaff && (
                        <div className="card p-5">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Status</p>
                            <div className="flex flex-col gap-2">
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            if (s === "CLOSED") { setConfirmClose(true); return; }
                                            updateTicket({ status: s });
                                        }}
                                        disabled={saving || ticket.status === s || (isClosed && s !== "CLOSED")}
                                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:cursor-not-allowed shadow-sm ${
                                            ticket.status === s
                                                ? "bg-black text-white border-black"
                                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                                        }`}
                                    >
                                        {s.replace("_", " ")}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isStaff && (
                        <div className="card p-5">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Assigned To</p>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => { if (!saving && !isClosed) { setAgentSearch(""); setAgentDropdownOpen((o) => !o); } }}
                                    disabled={saving || isClosed}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white shadow-sm text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <span className={ticket.assignedToId ? "text-gray-900" : "text-gray-400"}>
                                        {ticket.assignedToId ? (agents.find((a) => a.id === String(ticket.assignedToId))?.name ?? "Assigned") : "Unassigned"}
                                    </span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {agentDropdownOpen && (
                                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                        <div className="p-2 border-b border-gray-100">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Search agents…"
                                                value={agentSearch}
                                                onChange={(e) => setAgentSearch(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                        </div>
                                        <ul className="max-h-48 overflow-y-auto">
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => { updateTicket({ assignedToId: null }); setAgentDropdownOpen(false); }}
                                                    className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50"
                                                >
                                                    Unassigned
                                                </button>
                                            </li>
                                            {agents
                                                .filter((a) => a.name.toLowerCase().includes(agentSearch.toLowerCase()))
                                                .map((a) => (
                                                    <li key={a.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => { updateTicket({ assignedToId: a.id }); setAgentDropdownOpen(false); }}
                                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                                                String(ticket.assignedToId) === a.id ? "font-semibold text-gray-900" : "text-gray-700"
                                                            }`}
                                                        >
                                                            {a.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            {agents.filter((a) => a.name.toLowerCase().includes(agentSearch.toLowerCase())).length === 0 && (
                                                <li className="px-3 py-2 text-sm text-gray-400 italic">No agents found</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="card p-4 space-y-2">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Details</p>
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created by</span>
                                <span className="text-slate-800 font-medium">{ticket.createdBy.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Department</span>
                                <span className="text-slate-800">{(ticket.createdBy as any).department ?? "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created</span>
                                <span className="text-slate-800">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                            {ticket.resolvedAt && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Resolved</span>
                                    <span className="text-slate-800">{new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

