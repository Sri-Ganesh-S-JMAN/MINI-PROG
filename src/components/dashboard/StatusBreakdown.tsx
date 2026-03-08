// ─── StatusBreakdown Component ───────────────────────────────────────────────
import React from "react";
import { ChartDataPoint } from "@/types/dashboard";

interface StatusBreakdownProps {
  title: string;
  subtitle: string;
  data: ChartDataPoint[];
  total: number;
}

export function StatusBreakdown({ title, subtitle, data, total }: StatusBreakdownProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
      <h2 className="text-base font-semibold text-slate-800 dark:text-white">{title}</h2>
      <p className="text-xs text-slate-400 mt-0.5 mb-5">{subtitle}</p>

      <div className="space-y-3">
        {data.map((item) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{pct}%</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 w-8 text-right">
                    {item.value}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400">Total</span>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{total}</span>
      </div>
    </div>
  );
}