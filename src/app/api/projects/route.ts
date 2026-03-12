/**
 * GET  /api/projects  — list all projects (ADMIN only)
 * POST /api/projects  — create a project (ADMIN only)
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateProjectId } from "@/lib/projectId";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const projects = await prisma.project.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        _count: { select: { allocations: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { clientName, name, description, startDate, endDate, status } = await request.json();

    if (!clientName || !name || !startDate || !endDate) {
      return NextResponse.json({ error: "clientName, name, startDate, and endDate are required." }, { status: 400 });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json({ error: "endDate must be after startDate." }, { status: 400 });
    }

    const id = await generateProjectId(clientName);

    const project = await prisma.project.create({
      data: {
        id,
        clientName,
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status ?? "ACTIVE",
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
