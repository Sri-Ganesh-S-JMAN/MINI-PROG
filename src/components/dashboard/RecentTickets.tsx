// ─── RecentTickets Component ─────────────────────────────────────────────────
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Ticket, TicketStatus, TicketPriority } from "@/types/dashboard";
import { ArrowUpRight, Clock, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentTicketsProps {
  tickets: Ticket[];
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    className: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-700",
  },
};

const priorityConfig: Record<TicketPriority, { dot: string; label: string }> = {
  critical: { dot: "bg-rose-500", label: "Critical" },
  high: { dot: "bg-orange-500", label: "High" },
  medium: { dot: "bg-amber-400", label: "Medium" },
  low: { dot: "bg-slate-400", label: "Low" },
};

export function RecentTickets({ tickets }: RecentTicketsProps) {
  const [filter, setFilter] = useState<TicketStatus | "all">("all");

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Recent Tickets</h2>
          <p className="text-xs text-slate-400 mt-0.5">Latest activity across all queues</p>
        </div>
        <Link
          href="/tickets"
          className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
        >
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
        {(["all", "open", "in_progress", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === s
                ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-10">No tickets found</p>
        ) : (
          filtered.map((ticket) => {
            const priority = priorityConfig[ticket.priority];
            const status = statusConfig[ticket.status];
            return (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                {/* Priority dot */}
                <div className={`w-2 h-2 rounded-full ${priority.dot} shrink-0`} title={priority.label} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">
                      {ticket.id}
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {ticket.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(ticket.updatedAt, { addSuffix: true })}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:block">
                      {ticket.assignee}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}