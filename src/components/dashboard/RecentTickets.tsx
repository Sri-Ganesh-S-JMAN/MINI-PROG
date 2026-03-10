// ─── RecentTickets Component ─────────────────────────────────────────────────
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Ticket } from "@/types/dashboard";
import { ArrowUpRight, Clock, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentTicketsProps {
  tickets: Ticket[];
}

type LowercaseTicketStatus = "open" | "in_progress" | "resolved" | "closed";
type LowercasePriority = "low" | "medium" | "high" | "critical";

const statusConfig: Record<LowercaseTicketStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-black text-white border border-black",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-gray-100 text-gray-800 border border-gray-200",
  },
  resolved: {
    label: "Resolved",
    className: "bg-gray-50 text-gray-600 border border-gray-200",
  },
  closed: {
    label: "Closed",
    className: "bg-transparent text-gray-500 border border-gray-200",
  },
};

const priorityConfig: Record<LowercasePriority, { dot: string; label: string }> = {
  critical: { dot: "bg-black", label: "Critical" },
  high: { dot: "bg-gray-700", label: "High" },
  medium: { dot: "bg-gray-400", label: "Medium" },
  low: { dot: "bg-gray-200", label: "Low" },
};

export function RecentTickets({ tickets }: RecentTicketsProps) {
  const [filter, setFilter] = useState<LowercaseTicketStatus | "all">("all");

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h2 className="text-base font-semibold text-black">Recent Tickets</h2>
          <p className="text-xs text-gray-500 mt-0.5">Latest activity across all queues</p>
        </div>
        <Link
          href="/tickets"
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors"
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
                ? "bg-black text-white"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black"
            }`}
          >
            {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No tickets found</p>
        ) : (
          filtered.map((ticket) => {
            const priority = priorityConfig[ticket.priority];
            const status = statusConfig[ticket.status];
            return (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                {/* Priority dot */}
                <div className={`w-2 h-2 rounded-full ${priority.dot} shrink-0`} title={priority.label} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-gray-400 shrink-0">
                      {ticket.id}
                    </span>
                    <span className="text-sm font-medium text-black truncate">
                      {ticket.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(ticket.updatedAt, { addSuffix: true })}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {ticket.assignee}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}