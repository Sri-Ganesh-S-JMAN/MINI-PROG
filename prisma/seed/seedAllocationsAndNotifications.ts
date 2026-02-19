import { PrismaClient } from "@prisma/client";

export default async function seedAllocationsAndNotifications(
  prisma: PrismaClient
) {
  console.log("🌱 [Final] Seeding allocations & notifications...");

  const users = await prisma.user.findMany({ select: { id: true } });
  const assets = await prisma.asset.findMany({ select: { id: true } });
  const tickets = await prisma.ticket.findMany({ select: { id: true } });
  const requests = await prisma.assetRequest.findMany({ select: { id: true, userId: true } });

  if (!users.length || !assets.length) {
    throw new Error("Missing users or assets for allocations");
  }

  // -----------------------------
  // ASSET ALLOCATIONS (180)
  // -----------------------------
  const allocations = [];

  for (let i = 0; i < 180; i++) {
    allocations.push({
      assetId: assets[i % assets.length].id,
      userId: users[i % users.length].id,
      allocatedAt: new Date(Date.now() - i * 86400000),
      returnedAt: i % 4 === 0 ? new Date() : null,
    });
  }

  await prisma.assetAllocation.createMany({
    data: allocations,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${allocations.length} asset allocations`);

  // -----------------------------
  // NOTIFICATIONS (1200+)
  // -----------------------------
  const notifications = [];

  tickets.forEach((ticket, i) => {
    notifications.push({
      userId: users[i % users.length].id,
      message: `Update on Ticket #${ticket.id}`,
      read: i % 3 === 0,
    });
  });

  requests.forEach((request, i) => {
    notifications.push({
      userId: request.userId,
      message: `Asset request #${request.id} status updated`,
      read: false,
    });
  });

  for (let i = 0; i < 500; i++) {
    notifications.push({
      userId: users[i % users.length].id,
      message: "General system notification",
      read: i % 2 === 0,
    });
  }

  await prisma.notification.createMany({
    data: notifications,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${notifications.length} notifications`);
}
