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
const SLA_BG: Record<string, string> = {
    on_track: "bg-green-50 border-green-200 text-green-700",
    at_risk: "bg-orange-50 border-orange-200 text-orange-700",
    breached: "bg-red-50 border-red-200 text-red-700",
    resolved: "bg-slate-50 border-slate-200 text-slate-500",
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
                        <div className="flex items-start gap-3 mb-4">
                            <div className="flex-1">
                                <h1 className="text-xl font-semibold text-slate-800">{ticket.title}</h1>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status as TicketStatus]}`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority as Priority]}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="text-xs text-slate-400">{ticket.category}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                        <div className="mt-4 text-xs text-slate-400 flex gap-4">
                            <span>By <strong className="text-slate-600">{ticket.createdBy.name}</strong></span>
                            <span>Created {new Date(ticket.createdAt).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="font-medium text-slate-800 mb-4">
                            Comments ({ticket.comments.length})
                        </h2>

                        {ticket.comments.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">No comments yet.</p>
                        ) : (
                            <div className="space-y-4 mb-6">
                                {ticket.comments.map((c: any) => (
                                    <div
                                        key={c.id}
                                        className={`flex gap-3 ${c.isInternal ? "opacity-75" : ""}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-brand-700 text-xs font-semibold">
                                                {c.author.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-800">{c.author.name}</span>
                                                <span className="text-xs text-slate-400 capitalize">{c.author.role.toLowerCase()}</span>
                                                {c.isInternal && (
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Internal</span>
                                                )}
                                                <span className="text-xs text-slate-400">
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleComment} className="space-y-3">
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <textarea
                                className="input resize-none"
                                rows={3}
                                placeholder="Write a comment…"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            {isStaff && (
                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isInternal}
                                        onChange={(e) => setIsInternal(e.target.checked)}
                                        className="accent-brand-600"
                                    />
                                    Internal note (hidden from employee)
                                </label>
                            )}
                            <button type="submit" className="btn-primary" disabled={!comment.trim()}>
                                Post Comment
                            </button>
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
                        <div className="card p-4">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Status</p>
                            <select
                                className="input"
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
                                    className="btn-primary w-full mt-3 text-xs"
                                >
                                    {saving ? "Updating..." : "Mark as Resolved"}
                                </button>
                            )}
                        </div>
                    )}

                    {isStaff && (
                        <div className="card p-4">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Assigned To</p>
                            <select
                                className="input"
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

