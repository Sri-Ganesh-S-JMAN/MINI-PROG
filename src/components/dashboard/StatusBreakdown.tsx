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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-base font-semibold text-black">{title}</h2>
      <p className="text-xs text-gray-500 mt-0.5 mb-5">{subtitle}</p>

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
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{pct}%</span>
                  <span className="text-sm font-medium text-black w-8 text-right">
                    {item.value}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">Total</span>
        <span className="text-sm font-bold text-black">{total}</span>
      </div>
    </div>
  );
}