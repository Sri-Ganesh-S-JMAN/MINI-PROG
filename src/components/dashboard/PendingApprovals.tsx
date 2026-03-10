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
    className: "bg-gray-100 text-black border border-gray-200",
  },
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    className: "bg-gray-50 text-gray-700 border border-gray-200",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className: "bg-transparent text-gray-500 border border-gray-200",
  },
  escalated: {
    icon: AlertTriangle,
    label: "Escalated",
    className: "bg-black text-white border border-black",
  },
};

const typeColors: Record<string, string> = {
  Deployment: "bg-gray-100 text-gray-800",
  Finance: "bg-gray-100 text-gray-800",
  Access: "bg-gray-100 text-gray-800",
  Contract: "bg-gray-100 text-gray-800",
  Procurement: "bg-gray-100 text-gray-800",
};

function getDueBadge(dueDate: Date | undefined | null, status: ApprovalStatus) {
  if (status !== "pending" || !dueDate) return null;
  const parsed = new Date(dueDate);
  if (isNaN(parsed.getTime())) return null;
  if (isPast(parsed)) return <span className="text-xs font-bold text-black border border-black px-1.5 py-0.5 rounded-sm">Overdue</span>;
  return (
    <span className="text-xs text-gray-400">Due {formatDistanceToNow(parsed, { addSuffix: true })}</span>
  );
}

export function PendingApprovals({ approvals }: PendingApprovalsProps) {
  const sorted = [...approvals].sort((a, b) => {
    const order: ApprovalStatus[] = ["pending", "escalated", "approved", "rejected"];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h2 className="text-base font-semibold text-black">Approvals</h2>
          <p className="text-xs text-gray-500 mt-0.5">Pending actions requiring your review</p>
        </div>
        <Link
          href="/approvals"
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors"
        >
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {sorted.map((approval) => {
          const s = statusConfig[approval.status];
          const StatusIcon = s.icon;
          const typeColor = typeColors[approval.type] ?? "bg-gray-50 text-gray-600";

          return (
            <Link
              key={approval.id}
              href={`/approvals/${approval.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
            >
              <div className={`p-1.5 rounded-lg ${s.className} shrink-0`}>
                <StatusIcon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-mono text-gray-400 shrink-0">{approval.id}</span>
                  <span className="text-sm font-medium text-black truncate">
                    {approval.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor}`}>
                    {approval.type}
                  </span>
                  <span className="text-xs text-gray-400">by {approval.requestedBy}</span>
                  {getDueBadge(approval.dueDate, approval.status)}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}