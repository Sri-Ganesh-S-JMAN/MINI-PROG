// ─── StatCard Component ──────────────────────────────────────────────────────
import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number; // positive = up, negative = down
  accentColor: string; // tailwind bg class e.g. "bg-amber-500"
  iconBg: string; // e.g. "bg-amber-500/10"
  iconColor: string; // e.g. "text-amber-500"
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor,
  iconBg,
  iconColor,
}: StatCardProps) {
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor} rounded-t-2xl`} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white leading-none mt-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          {trendPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          )}
          <span
            className={`text-xs font-semibold ${
              trendPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {Math.abs(trend)}% vs last week
          </span>
        </div>
      )}
    </div>
  );
}