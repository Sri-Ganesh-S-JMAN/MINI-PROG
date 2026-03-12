/**
 * GET /api/my-projects
 * Returns all project allocations for the currently logged-in user.
 * Accessible to any authenticated user.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = parseInt(user.userId, 10);

    const allocations = await prisma.projectAllocation.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            clientName: true,
            status: true,
            startDate: true,
            endDate: true,
            description: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ allocations });
  } catch (error) {
    console.error("[GET /api/my-projects]", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
