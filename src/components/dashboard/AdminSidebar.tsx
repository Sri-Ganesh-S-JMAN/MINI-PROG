"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Box,
  ClipboardList,
  Users as UsersIcon,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { CurrentUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tickets", icon: Ticket, label: "Tickets" },
  { href: "/assets", icon: Box, label: "Asset" },
  { href: "/asset-requests", icon: ClipboardList, label: "Asset Requests" },
  { href: "/users", icon: UsersIcon, label: "Users" },
];

interface AdminSidebarProps {
  user: CurrentUser | null;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "AD";

  return (
    <>
      {/* ── Top bar (Mobile Only) ── */}
      <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 w-full fixed top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            className="text-gray-500 hover:text-black p-1 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-medium text-black">JDESK</span>
        </div>
      </header>

      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex shadow-sm lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-black text-lg tracking-tight">
              JDESK
            </span>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-black transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            // Role-based visibility logic
            // ADMIN and MANAGER can see everything
            // EMPLOYEE and AGENT can only see Tickets and Asset Requests
            const isUserOrAgent = user?.role === "EMPLOYEE" || user?.role === "AGENT";
            const isAllowedForUser = href === "/tickets" || href === "/asset-requests";

            if (isUserOrAgent && !isAllowedForUser) {
               return null; // Skip rendering unauthorized tabs
            }

            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group
                  ${active
                    ? "bg-gray-100 text-black shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-black" : "text-gray-400 group-hover:text-black transition-colors"}`} />
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user profile & logout strip */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 shrink-0 flex flex-col gap-3">
          {user && (
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border border-gray-300">
                <span className="text-sm font-medium text-black">
                  {initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-black transition-all duration-200 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
