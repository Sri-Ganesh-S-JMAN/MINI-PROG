import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // TICKETS
  const totalTickets = await prisma.ticket.count();
  const ticketStatusCounts = await prisma.ticket.groupBy({
    by: ["status"],
    _count: { status: true }
  });

  // SLA BREACHES
  const now = new Date();
  const tickets = await prisma.ticket.findMany();
  const slaBreaches = tickets.filter(ticket => {
    const expiry = new Date(ticket.createdAt);
    expiry.setHours(expiry.getHours() + ticket.slaHours);
    return expiry < now && ticket.status !== "RESOLVED";
  }).length;

  // ASSETS
  const totalAssets = await prisma.asset.count();
  const allocatedAssets = await prisma.asset.count({
    where: { status: "ALLOCATED" }
  });

  // ASSET REQUESTS
  const pendingRequests = await prisma.assetRequest.count({
    where: { status: "PENDING" }
  });

  // NOTIFICATIONS
  const unreadNotifications = await prisma.notification.count({
    where: { read: false }
  });

  return NextResponse.json({
    tickets: { totalTickets, ticketStatusCounts, slaBreaches },
    assets: { totalAssets, allocatedAssets },
    requests: { pendingRequests },
    notifications: { unreadNotifications }
  });
}
