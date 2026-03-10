// ─── ActivityFeed Component ──────────────────────────────────────────────────
import React from "react";
import { ActivityItem } from "@/types/dashboard";
import { Ticket, CheckSquare, MessageSquare, RefreshCw, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const activityConfig = {
  ticket_created: { icon: PlusCircle, color: "text-black", bg: "bg-gray-100" },
  ticket_updated: { icon: RefreshCw, color: "text-gray-700", bg: "bg-gray-50" },
  approval_requested: { icon: CheckSquare, color: "text-gray-900", bg: "bg-gray-100" },
  approval_resolved: { icon: CheckSquare, color: "text-black", bg: "bg-transparent border border-gray-200" },
  comment_added: { icon: MessageSquare, color: "text-gray-500", bg: "bg-gray-50" },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-base font-semibold text-black">Activity Feed</h2>
        <p className="text-xs text-gray-500 mt-0.5">Real-time updates from your team</p>
      </div>

      <div className="px-6 pb-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />

          <div className="space-y-4">
            {activities.map((activity, i) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <div key={activity.id} className="flex gap-4 relative">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10 ring-2 ring-white`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 min-w-0">
                    <p className="text-sm text-black leading-snug">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-gray-500">
                        {activity.user}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
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