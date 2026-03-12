/**
 * GET /api/users/[id]/availability
 * Returns how much % a user already has allocated in a given date range,
 * and how much is still available (100 - allocated).
 *
 * Query params:
 *   startDate    (required) ISO date string
 *   endDate      (required) ISO date string
 *   excludeAllocationId  (optional) int — excludes a specific allocation (used during edit)
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const userId = parseInt(id, 10);

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const excludeIdStr = searchParams.get("excludeAllocationId");

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: "startDate and endDate are required." }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
    }

    const excludeId = excludeIdStr ? parseInt(excludeIdStr, 10) : undefined;

    const overlapping = await prisma.projectAllocation.findMany({
      where: {
        userId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    const allocated = overlapping.reduce((sum, a) => sum + a.percentage, 0);
    const available = Math.max(0, 100 - allocated);

    return NextResponse.json({ allocated, available });
  } catch (error) {
    console.error("[GET /api/users/[id]/availability]", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
