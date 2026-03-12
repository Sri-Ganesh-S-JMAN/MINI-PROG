/**
 * GET  /api/projects/[id]/allocations  — list allocations for project (ADMIN only)
 * POST /api/projects/[id]/allocations  — add allocation to project (ADMIN only)
 *
 * Hard 100% cap: sums all overlapping allocations for the user in the given date range.
 * Returns 400 if adding the new percentage would exceed 100%.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const allocations = await prisma.projectAllocation.findMany({
      where: { projectId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ allocations });
  } catch (error) {
    console.error("[GET /api/projects/[id]/allocations]", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id: projectId } = await params;
    const { userId, percentage, startDate, endDate } = await request.json();

    if (!userId || percentage === undefined || !startDate || !endDate) {
      return NextResponse.json({ error: "userId, percentage, startDate, and endDate are required." }, { status: 400 });
    }

    if (percentage <= 0 || percentage > 100) {
      return NextResponse.json({ error: "Percentage must be between 1 and 100." }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json({ error: "endDate must be after startDate." }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    // Check existing overlapping allocations for this user
    const overlapping = await prisma.projectAllocation.findMany({
      where: {
        userId: parseInt(userId, 10),
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    const totalAllocated = overlapping.reduce((sum, a) => sum + a.percentage, 0);

    if (totalAllocated + percentage > 100) {
      return NextResponse.json(
        {
          error: `User is already ${totalAllocated}% allocated during this period. Adding ${percentage}% would exceed 100%.`,
          allocated: totalAllocated,
          available: Math.max(0, 100 - totalAllocated),
        },
        { status: 400 }
      );
    }

    const allocation = await prisma.projectAllocation.create({
      data: {
        projectId,
        userId: parseInt(userId, 10),
        percentage,
        startDate: start,
        endDate: end,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ allocation }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects/[id]/allocations]", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
