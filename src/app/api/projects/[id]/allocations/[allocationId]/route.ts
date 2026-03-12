/**
 * PATCH  /api/projects/[id]/allocations/[allocationId]  — update allocation (ADMIN only)
 * DELETE /api/projects/[id]/allocations/[allocationId]  — remove allocation (ADMIN only)
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; allocationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { allocationId } = await params;
    const allocationIdInt = parseInt(allocationId, 10);

    const existing = await prisma.projectAllocation.findUnique({ where: { id: allocationIdInt } });
    if (!existing) return NextResponse.json({ error: "Allocation not found." }, { status: 404 });

    const body = await request.json();
    const percentage = body.percentage ?? existing.percentage;
    const startDate = body.startDate ? new Date(body.startDate) : existing.startDate;
    const endDate = body.endDate ? new Date(body.endDate) : existing.endDate;

    if (percentage <= 0 || percentage > 100) {
      return NextResponse.json({ error: "Percentage must be between 1 and 100." }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: "endDate must be after startDate." }, { status: 400 });
    }

    // Check overlapping allocations excluding the current one
    const overlapping = await prisma.projectAllocation.findMany({
      where: {
        userId: existing.userId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        id: { not: allocationIdInt },
      },
    });

    const totalAllocated = overlapping.reduce((sum, a) => sum + a.percentage, 0);

    if (totalAllocated + percentage > 100) {
      return NextResponse.json(
        {
          error: `User is already ${totalAllocated}% allocated during this period. Setting ${percentage}% would exceed 100%.`,
          allocated: totalAllocated,
          available: Math.max(0, 100 - totalAllocated),
        },
        { status: 400 }
      );
    }

    const updated = await prisma.projectAllocation.update({
      where: { id: allocationIdInt },
      data: { percentage, startDate, endDate },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ allocation: updated });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]/allocations/[allocationId]]", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; allocationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { allocationId } = await params;
    const allocationIdInt = parseInt(allocationId, 10);

    const existing = await prisma.projectAllocation.findUnique({ where: { id: allocationIdInt } });
    if (!existing) return NextResponse.json({ error: "Allocation not found." }, { status: 404 });

    await prisma.projectAllocation.delete({ where: { id: allocationIdInt } });

    return NextResponse.json({ message: "Allocation removed." });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]/allocations/[allocationId]]", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
