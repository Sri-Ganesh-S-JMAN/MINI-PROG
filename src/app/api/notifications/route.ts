// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET → Fetch notifications for a user
 * (Person 6 dashboard + Navbar use this)
 */
export async function GET(req: Request) {
  const userId = Number(req.headers.get("x-user-id")); // from auth later

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notifications);
}

/**
 * POST → Create notification
 * Used by Ticket, Asset, Approval modules
 */
export async function POST(req: Request) {
  const body = await req.json();

  const notification = await prisma.notification.create({
    data: {
      message: body.message,
      userId: body.userId,
    },
  });

  return NextResponse.json(notification);
}
