// ─── ActivityFeed Component ──────────────────────────────────────────────────
import React from "react";
import { ActivityItem } from "@/types/dashboard";
import { Ticket, CheckSquare, MessageSquare, RefreshCw, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const activityConfig = {
  ticket_created: { icon: PlusCircle, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
  ticket_updated: { icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  approval_requested: { icon: CheckSquare, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
  approval_resolved: { icon: CheckSquare, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  comment_added: { icon: MessageSquare, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-700/40" },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Activity Feed</h2>
        <p className="text-xs text-slate-400 mt-0.5">Real-time updates from your team</p>
      </div>

      <div className="px-6 pb-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />

          <div className="space-y-4">
            {activities.map((activity, i) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <div key={activity.id} className="flex gap-4 relative">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10 ring-2 ring-white dark:ring-slate-900`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {activity.user}
                      </span>
                      <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}