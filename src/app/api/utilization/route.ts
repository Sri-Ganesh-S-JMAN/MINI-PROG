/**
 * GET /api/utilization
 * Returns a 4-week utilization grid: this week + next 3 weeks.
 * For each user, sums overlapping allocation percentages per week.
 * ADMIN only.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { format } from "date-fns";

/** Returns the Monday of the week containing `date` */
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, …
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekRanges(count: number) {
  const now = new Date();
  const thisMonday = getMondayOf(now);
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(thisMonday);
    start.setDate(start.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end, label: `${format(start, "MMM d")} – ${format(end, "MMM d")}` };
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const weeks = getWeekRanges(4);

    // Fetch all users and their allocations that overlap any of the 4 weeks
    const weekStart = weeks[0].start;
    const weekEnd = weeks[weeks.length - 1].end;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { name: true } },
        projectAllocations: {
          where: {
            startDate: { lte: weekEnd },
            endDate: { gte: weekStart },
          },
          select: { percentage: true, startDate: true, endDate: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const rows = users.map((u) => {
      const weekTotals = weeks.map(({ start, end }) => {
        const total = u.projectAllocations
          .filter((a) => a.startDate <= end && a.endDate >= start)
          .reduce((sum, a) => sum + a.percentage, 0);
        return Math.round(total * 10) / 10; // round to 1 decimal
      });

      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        role: u.role.name,
        weekTotals,
      };
    });

    return NextResponse.json({
      weeks: weeks.map((w) => w.label),
      rows,
    });
  } catch (error) {
    console.error("[GET /api/utilization]", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
