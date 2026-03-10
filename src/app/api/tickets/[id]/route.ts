/**
 * src/app/api/tickets/[id]/route.ts
 * GET    /api/tickets/[id]  — get ticket detail with comments
 * PATCH  /api/tickets/[id]  — update status, priority, assignee
 * DELETE /api/tickets/[id]  — delete ticket (Admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createNotifications } from "@/lib/notifications";

// GET
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const ticketId = parseInt(id, 10);
        
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
                comments: {
                    include: { user: { select: { id: true, name: true, role: true } } },
                    orderBy: { createdAt: "asc" },
                    where: user.role === "EMPLOYEE" ? { isInternal: false } : {},
                },
            },
        });

        if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

        if (user.role === "EMPLOYEE" && ticket.createdById !== parseInt(user.userId, 10)) {
            return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error("[GET /api/tickets/[id]]", error);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}

// PATCH
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (user.role === "EMPLOYEE") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

        const { id } = await params;
        const ticketId = parseInt(id, 10);
        const body = await request.json();
        const { status, priority, assignedToId } = body;

        const existing = await prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!existing) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

        const resolvedAt =
            status === "RESOLVED" && existing.status !== "RESOLVED"
                ? new Date()
                : (status && status !== "RESOLVED" && existing.status === "RESOLVED")
                    ? null
                    : existing.resolvedAt;

        const ticket = await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                ...(status ? { status } : {}),
                ...(priority ? { priority } : {}),
                ...(assignedToId !== undefined ? { assignedToId: assignedToId ? parseInt(assignedToId, 10) : null } : {}),
                resolvedAt,
            },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
                comments: {
                    include: { user: { select: { id: true, name: true, role: true } } },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        const notifyUserIds: string[] = [];

        if (status && status !== existing.status) {
            notifyUserIds.push(existing.createdById.toString());
        }

        if (assignedToId && assignedToId !== existing.assignedToId?.toString()) {
            notifyUserIds.push(assignedToId);
        }

        if (notifyUserIds.length > 0) {
            const messages: Record<string, string> = {
                status: `Ticket "${existing.title}" status changed to ${status}.`,
                assign: `Ticket "${existing.title}" has been assigned to you.`,
            };

            await createNotifications(
                notifyUserIds,
                {
                    message: status ? messages.status : messages.assign,
                    ticketId: ticket.id,
                }
            );
        }

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error("[PATCH /api/tickets/[id]]", error);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}

// DELETE
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const { id } = await params;
        const ticketId = parseInt(id, 10);

        const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!existingTicket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

        // Allow deletion only if user is ADMIN or the original creator
        if (user.role !== "ADMIN" && existingTicket.createdById !== parseInt(user.userId, 10)) {
            return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        // Delete associated comments first to avoid foreign key constraint errors
        await prisma.ticketComment.deleteMany({ where: { ticketId } });
        await prisma.ticket.delete({ where: { id: ticketId } });
        return NextResponse.json({ message: "Ticket deleted." });
    } catch (error) {
        console.error("[DELETE /api/tickets/[id]]", error);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}

