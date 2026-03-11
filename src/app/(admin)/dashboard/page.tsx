import React from "react";
import { Ticket, CheckSquare, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTickets } from "@/components/dashboard/RecentTickets";
import { PendingApprovals } from "@/components/dashboard/PendingApprovals";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { StatusBreakdown } from "@/components/dashboard/StatusBreakdown";
import {
  getDashboardStats,
  getRecentTickets,
  getRecentApprovals,
  getRecentActivity,
  getWeeklyTicketData,
  getTicketStatusBreakdown,
  getTicketPriorityBreakdown,
} from "@/lib/dashboard";
 
export const metadata = {
  title: "Dashboard — MINI-PROG",
  description: "Overview of tickets, approvals, and system status",
};
 
export const revalidate = 60;
 
export default async function DashboardPage() {
  const [
    stats,
    tickets,
    approvals,
    activity,
    weeklyData,
    statusBreakdown,
    priorityBreakdown,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentTickets(8),
    getRecentApprovals(6),
    getRecentActivity(8),
    getWeeklyTicketData(),
    getTicketStatusBreakdown(),
    getTicketPriorityBreakdown(),
  ]);
 
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
 
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <div className="max-w-7xl mx-auto py-8">
 
        <div className="mb-8 px-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">{today}</p>
          <h1 className="text-3xl font-bold text-black tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Activity across your workspace today.
          </p>
        </div>
 
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Open Tickets"
            value={stats.openTickets}
            subtitle={`of ${stats.totalTickets} total`}
            icon={Ticket}
            trend={stats.ticketTrend}
            accentColor="bg-black"
            iconBg="bg-gray-100"
            iconColor="text-black"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="awaiting action"
            icon={CheckSquare}
            accentColor="bg-gray-400"
            iconBg="bg-gray-100"
            iconColor="text-black"
          />
          <StatCard
            title="Critical Issues"
            value={stats.criticalTickets}
            subtitle="need immediate attention"
            icon={AlertTriangle}
            accentColor="bg-gray-800"
            iconBg="bg-gray-100"
            iconColor="text-black"
          />
           <StatCard
            title="New SLA Updates (hrs)"
            value={`${stats.avgResolutionTime}h`}
            subtitle="avg SLA across resolved tickets"
            icon={Clock}
            accentColor="bg-gray-300"
            iconBg="bg-gray-100"
            iconColor="text-black"
          />
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <WeeklyChart data={weeklyData} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="#000000" strokeWidth="3.5"
                    strokeDasharray={`${stats.approvalRate} ${100 - stats.approvalRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-black">
                  {stats.approvalRate}%
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Approval Rate</p>
                <p className="text-lg font-bold text-black mt-1">{stats.approvalRate}% approved</p>
                <p className="text-xs text-gray-400 mt-0.5">over the past 30 days</p>
              </div>
            </div>
            <div className="bg-black rounded-xl p-6 text-white shadow-sm border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Resolved</p>
              </div>
              <p className="text-4xl font-bold tracking-tight">{stats.resolvedTickets}</p>
              <p className="text-sm text-gray-400 mt-1">tickets resolved</p>
            </div>
          </div>
        </div>
 
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatusBreakdown
            title="By Status"
            subtitle="Ticket distribution across lifecycle stages"
            data={statusBreakdown}
            total={stats.totalTickets}
          />
          <StatusBreakdown
            title="By Priority"
            subtitle="Ticket distribution by urgency level"
            data={priorityBreakdown}
            total={stats.totalTickets}
          />
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentTickets tickets={tickets} />
          </div>
          <div className="flex flex-col gap-4">
            <PendingApprovals approvals={approvals} />
            <ActivityFeed activities={activity} />
          </div>
        </div>
 
      </div>
    </div>
  );
}