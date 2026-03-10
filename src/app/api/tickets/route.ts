/**
 * src/app/api/tickets/route.ts
 * GET  /api/tickets  — list tickets (scoped by role)
 * POST /api/tickets  — create a new ticket
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateSLADeadline } from "@/lib/sla";
import { createNotification } from "@/lib/notifications";

// SLA hours mapping
const SLA_HOURS: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 8,
    MEDIUM: 24,
    LOW: 72,
};

// GET: List tickets
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as string | undefined;
        const priority = searchParams.get("priority") as string | undefined;
        const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
        const limit = 20;

        const userIdInt = parseInt(user.userId, 10);
        
        const roleFilter =
            ["ADMIN", "MANAGER"].includes(user.role)
                ? {}  // Admins see all
                : user.role === "AGENT"
                    ? { assignedToId: userIdInt }
                    : { createdById: userIdInt }; // Regular users only see their own

        const where = {
            ...roleFilter,
            ...(status ? { status: status.toUpperCase() as any } : {}),
            ...(priority ? { priority: priority.toUpperCase() as any } : {}),
        };

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                include: {
                    createdBy: { select: { id: true, name: true } },
                    assignedTo: { select: { id: true, name: true } },
                    _count: { select: { comments: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.ticket.count({ where }),
        ]);

        return NextResponse.json({ tickets, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error("[GET /api/tickets]", error);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}

// POST: Create ticket
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, description, priority, category } = await request.json();

        if (!title || !description || !priority || !category) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        const slaDeadline = calculateSLADeadline(priority);
        const slaHours = SLA_HOURS[priority] ?? 24;

        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority,
                category,
                slaDeadline,
                slaHours,
                createdById: parseInt(user.userId, 10),
            },
        });

        const admins = await prisma.user.findMany({ where: { role: { name: "ADMIN" } } });
        await Promise.all(
            admins.map((admin: any) =>
                createNotification({
                    userId: admin.id,
                    message: `New ticket: "${title}" was submitted by ${user.name}.`,
                    ticketId: ticket.id,
                })
            )
        );

        return NextResponse.json({ ticket }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/tickets]", error);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}

