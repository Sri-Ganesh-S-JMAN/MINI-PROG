// ─── StatCard Component ──────────────────────────────────────────────────────
import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number; // positive = up, negative = down
  accentColor: string; // tailwind bg class e.g. "bg-black"
  iconBg: string; // e.g. "bg-gray-100"
  iconColor: string; // e.g. "text-black"
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
    <div className="relative bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-200 overflow-hidden group">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${accentColor}`} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-black tracking-tight leading-none mt-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          {trendPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-gray-600" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-black" />
          )}
          <span
            className={`text-xs font-medium text-gray-600`}
          >
            {Math.abs(trend)}% vs last week
          </span>
        </div>
      )}
    </div>
  );
}