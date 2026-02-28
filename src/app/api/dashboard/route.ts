<<<<<<< HEAD
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}









=======
﻿import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      // Tickets
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      recentTickets,

      // Assets
      totalAssets,
      availableAssets,
      allocatedAssets,
      inRepairAssets,
      retiredAssets,

      // Asset Requests
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      recentRequests,

      // Users
      totalUsers,

      // Notifications
      unreadNotifications,

      // Recent Activity (comments)
      recentComments,
    ] = await Promise.all([
      // Tickets
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { status: "RESOLVED" } }),
      prisma.ticket.count({ where: { status: "CLOSED" } }),
      prisma.ticket.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { name: true } },
          assignedTo: { select: { name: true } },
        },
      }),

      // Assets
      prisma.asset.count(),
      prisma.asset.count({ where: { status: "AVAILABLE" } }),
      prisma.asset.count({ where: { status: "ALLOCATED" } }),
      prisma.asset.count({ where: { status: "IN_REPAIR" } }),
      prisma.asset.count({ where: { status: "RETIRED" } }),

      // Asset Requests
      prisma.assetRequest.count(),
      prisma.assetRequest.count({ where: { status: "PENDING" } }),
      prisma.assetRequest.count({
        where: { status: { in: ["ADMIN_APPROVED", "ALLOCATED"] } },
      }),
      prisma.assetRequest.count({ where: { status: "REJECTED" } }),
      prisma.assetRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          asset: { select: { name: true, serialNo: true } },
        },
      }),

      // Users
      prisma.user.count(),

      // Notifications
      prisma.notification.count({ where: { read: false } }),

      // Recent comments
      prisma.ticketComment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          ticket: { select: { title: true } },
        },
      }),
    ]);

    return NextResponse.json({
      tickets: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        recent: recentTickets,
      },
      assets: {
        total: totalAssets,
        available: availableAssets,
        allocated: allocatedAssets,
        inRepair: inRepairAssets,
        retired: retiredAssets,
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        recent: recentRequests,
      },
      users: {
        total: totalUsers,
      },
      notifications: {
        unread: unreadNotifications,
      },
      recentActivity: recentComments,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
>>>>>>> 8a48d8c5dcba3cd0a45517314db77a09aca7963c
