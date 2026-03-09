/**
 * src/app/api/tickets/[id]/comments/route.ts
 * GET  /api/tickets/[id]/comments — list comments
 * POST /api/tickets/[id]/comments — add a comment
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createNotifications } from "@/lib/notifications";

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ticketId = parseInt(params.id, 10);

    const comments = await prisma.ticketComment.findMany({
        where: {
            ticketId: ticketId,
            isInternal: user.role === "EMPLOYEE" ? false : undefined,
        },
        include: { 
            user: { select: { id: true, name: true, role: true } },
            ticket: { select: { title: true } }
        },
        orderBy: { createdAt: "asc" },
    });

    const mappedComments = comments.map((c: any) => ({
        id: c.id,
        content: c.content || c.message || "",
        message: c.message,
        ticketId: c.ticketId,
        authorId: c.userId,
        isInternal: c.isInternal,
        createdAt: c.createdAt,
        author: {
            id: c.user.id,
            name: c.user.name,
            role: c.user.role.name as "EMPLOYEE" | "AGENT" | "ADMIN",
        },
    }));

    return NextResponse.json({ comments: mappedComments });
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const ticketId = parseInt(params.id, 10);
        const { content, isInternal } = await request.json();
        
        if (!content?.trim()) {
            return NextResponse.json({ error: "Comment content is required." }, { status: 400 });
        }

        const internal = (user.role !== "EMPLOYEE") && !!isInternal;

        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

        const comment = await prisma.ticketComment.create({
            data: {
                content,
                message: content,
                isInternal: internal,
                ticketId: ticketId,
                userId: parseInt(user.userId, 10),
            },
            include: { 
                user: { select: { id: true, name: true, role: true } }
            },
        });

        const notifyIds = [ticket.createdById, ticket.assignedToId]
            .filter((id): id is number => !!id && id !== parseInt(user.userId, 10))
            .map(id => id.toString());

        if (notifyIds.length > 0) {
            await createNotifications(notifyIds, {
                message: `${user.name} commented on ticket "${ticket.title}".`,
                ticketId: ticket.id,
            });
        }

        const responseComment = {
            id: comment.id,
            content: comment.content || comment.message || "",
            message: comment.message,
            ticketId: comment.ticketId,
            authorId: comment.userId,
            isInternal: comment.isInternal,
            createdAt: comment.createdAt,
            author: {
                id: comment.user.id,
                name: comment.user.name,
                role: comment.user.role.name as "EMPLOYEE" | "AGENT" | "ADMIN",
            },
        };

        return NextResponse.json({ comment: responseComment }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/tickets/[id]/comments]", error);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}

