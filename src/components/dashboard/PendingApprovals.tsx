// ─── PendingApprovals Component ──────────────────────────────────────────────
"use client";
import React from "react";
import Link from "next/link";
import { Approval, ApprovalStatus } from "@/types/dashboard";
import { ArrowUpRight, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";

interface PendingApprovalsProps {
  approvals: Approval[];
}

const statusConfig: Record<ApprovalStatus, { icon: React.FC<{ className?: string }>; label: string; className: string }> = {
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  },
  escalated: {
    icon: AlertTriangle,
    label: "Escalated",
    className: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  },
};

const typeColors: Record<string, string> = {
  Deployment: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  Finance: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300",
  Access: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  Contract: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300",
  Procurement: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
};

function getDueBadge(dueDate: Date | undefined | null, status: ApprovalStatus) {
  if (status !== "pending" || !dueDate) return null;
  const parsed = new Date(dueDate);
  if (isNaN(parsed.getTime())) return null;
  if (isPast(parsed)) return <span className="text-xs font-medium text-rose-500">Overdue</span>;
  return (
    <span className="text-xs text-slate-400">Due {formatDistanceToNow(parsed, { addSuffix: true })}</span>
  );
}

export function PendingApprovals({ approvals }: PendingApprovalsProps) {
  const sorted = [...approvals].sort((a, b) => {
    const order: ApprovalStatus[] = ["pending", "escalated", "approved", "rejected"];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Approvals</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pending actions requiring your review</p>
        </div>
        <Link
          href="/approvals"
          className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
        >
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {sorted.map((approval) => {
          const s = statusConfig[approval.status];
          const StatusIcon = s.icon;
          const typeColor = typeColors[approval.type] ?? "bg-slate-100 text-slate-600";

          return (
            <Link
              key={approval.id}
              href={`/approvals/${approval.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className={`p-1.5 rounded-lg ${s.className} shrink-0`}>
                <StatusIcon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-mono text-slate-400 shrink-0">{approval.id}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {approval.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor}`}>
                    {approval.type}
                  </span>
                  <span className="text-xs text-slate-400">by {approval.requestedBy}</span>
                  {getDueBadge(approval.dueDate, approval.status)}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}