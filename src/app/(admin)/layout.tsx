// ─── Dashboard Layout ────────────────────────────────────────────────────────
// src/app/(admin)/layout.tsx
import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-black overflow-hidden font-sans">
      <AdminSidebar user={user} />

      {/* ── Main Area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white/50 pt-16 lg:pt-0">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}