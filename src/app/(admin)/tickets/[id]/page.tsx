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

const STATUS_COLORS: Record<TicketStatus, string> = {
    OPEN: "bg-white border border-gray-200 text-gray-900",
    open: "bg-white border border-gray-200 text-gray-900",
    IN_PROGRESS: "bg-gray-100 border border-gray-200 text-gray-900",
    in_progress: "bg-gray-100 border border-gray-200 text-gray-900",
    RESOLVED: "bg-gray-900 text-white",
    resolved: "bg-gray-900 text-white",
    CLOSED: "bg-gray-50 border border-gray-200 text-gray-500",
    closed: "bg-gray-50 border border-gray-200 text-gray-500",
};
const PRIORITY_COLORS: Record<Priority, string> = {
    CRITICAL: "bg-red-50 border border-red-200 text-red-700",
    critical: "bg-red-50 border border-red-200 text-red-700",
    HIGH: "bg-gray-100 border border-gray-200 text-gray-900",
    high: "bg-gray-100 border border-gray-200 text-gray-900",
    MEDIUM: "bg-white border border-gray-200 text-gray-900",
    medium: "bg-white border border-gray-200 text-gray-900",
    LOW: "bg-gray-50 border border-gray-200 text-gray-500",
    low: "bg-gray-50 border border-gray-200 text-gray-500",
};
const SLA_BG: Record<string, string> = {
    on_track: "bg-white border-gray-200 text-gray-900",
    at_risk: "bg-orange-50 border-orange-200 text-orange-700",
    breached: "bg-red-50 border-red-200 text-red-700",
    resolved: "bg-gray-50 border-gray-200 text-gray-500",
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

    useEffect(() => {
        fetch("/api/me").then((r) => r.json()).then((d: { role: Role; userId: string }) => {
            setUserRole(d.role);
            setUserId(d.userId);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        fetch(`/api/tickets/${id}`)
            .then((r) => r.json())
            .then((d: { ticket: TicketDetail }) => { setTicket(d.ticket); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (userRole !== "EMPLOYEE") {
            fetch("/api/admin/users?role=AGENT")
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

    const slaStatus = getSLAStatus(new Date(ticket.slaDeadline), ticket.resolvedAt ? new Date(ticket.resolvedAt) : null);
    const slaTime = formatSLATimeLeft(new Date(ticket.slaDeadline), ticket.resolvedAt ? new Date(ticket.resolvedAt) : null);

    const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const isStaff = userRole === "ADMIN" || userRole === "AGENT";

    return (
        <div className="max-w-4xl">
            <Link href="/tickets" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Tickets
            </Link>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    <div className="card p-6">
                        <div className="flex items-start gap-4 mb-5 border-b border-gray-100 pb-5">
                            <div className="flex-1">
                                <h1 className="text-xl font-semibold tracking-tight text-gray-900">{ticket.title}</h1>
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status as TicketStatus]}`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority as Priority]}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">{ticket.category}</span>
                                </div>
                            </div>
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
                                                {c.author.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3.5">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900">{c.author.name}</span>
                                                <span className="text-xs text-gray-500 capitalize">{c.author.role.toLowerCase()}</span>
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

                        <form onSubmit={handleComment} className="space-y-4 pt-4 border-t border-gray-100">
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
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white shadow-sm transition-shadow"
                                value={ticket.status}
                                onChange={(e) => updateTicket({ status: e.target.value })}
                                disabled={saving}
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                                ))}
                            </select>

                            {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                                <button
                                    onClick={() => updateTicket({ status: "RESOLVED" })}
                                    disabled={saving}
                                    className="w-full mt-4 bg-white border border-gray-200 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 shadow-sm"
                                >
                                    {saving ? "Updating..." : "Mark as Resolved"}
                                </button>
                            )}
                        </div>
                    )}

                    {isStaff && (
                        <div className="card p-5">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Assigned To</p>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white shadow-sm transition-shadow"
                                value={ticket.assignedToId ?? ""}
                                onChange={(e) => updateTicket({ assignedToId: e.target.value || null })}
                                disabled={saving}
                            >
                                <option value="">Unassigned</option>
                                {agents.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
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

