// ─── WeeklyChart Component ───────────────────────────────────────────────────
"use client";
import React, { useState } from "react";

interface WeeklyDataPoint {
  day: string;
  created: number;
  resolved: number;
}

interface WeeklyChartProps {
  data: WeeklyDataPoint[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const max = Math.max(...data.flatMap((d) => [d.created, d.resolved]), 1);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Ticket Activity</h2>
          <p className="text-xs text-slate-400 mt-0.5">Created vs resolved this week</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Created</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Resolved</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-36">
        {data.map((d, i) => {
          const createdH = Math.round((d.created / max) * 100);
          const resolvedH = Math.round((d.resolved / max) * 100);
          const isHov = hovered === i;

          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHov && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg z-10 whitespace-nowrap">
                  <div>Created: <strong>{d.created}</strong></div>
                  <div>Resolved: <strong>{d.resolved}</strong></div>
                </div>
              )}
              <div className="relative w-full flex items-end justify-center gap-0.5 h-28">
                <div
                  className={`flex-1 rounded-t-md transition-all duration-300 ${isHov ? "bg-blue-500" : "bg-blue-400"}`}
                  style={{ height: `${createdH}%`, minHeight: "4px" }}
                />
                <div
                  className={`flex-1 rounded-t-md transition-all duration-300 ${isHov ? "bg-emerald-500" : "bg-emerald-400"}`}
                  style={{ height: `${resolvedH}%`, minHeight: "4px" }}
                />
              </div>
              <span className={`text-xs font-medium transition-colors ${isHov ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}