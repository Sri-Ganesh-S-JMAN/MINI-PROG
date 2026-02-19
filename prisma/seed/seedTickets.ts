import { PrismaClient, TicketStatus } from "@prisma/client";

/**
 * SECTION 3A
 * Tickets
 */
export default async function seedTickets(
  prisma: PrismaClient
) {
  console.log("🌱 [Section 3A] Seeding tickets...");

  const employees = await prisma.user.findMany({
    where: { role: { name: "EMPLOYEE" } },
    select: { id: true },
  });

  const agents = await prisma.user.findMany({
    where: { role: { name: "AGENT" } },
    select: { id: true },
  });

  if (employees.length === 0 || agents.length === 0) {
    throw new Error("Employees or Agents missing. Seed Section 1 first.");
  }

  const ticketsData = [];

  for (let i = 1; i <= 500; i++) {
    const createdBy = employees[i % employees.length];
    const assignedTo = i % 4 === 0 ? null : agents[i % agents.length];

    ticketsData.push({
      title: `Issue #${i}: System Problem`,
      description: `Detailed description for issue ${i}. User reports abnormal system behavior.`,
      status:
        i % 6 === 0
          ? TicketStatus.CLOSED
          : i % 4 === 0
          ? TicketStatus.RESOLVED
          : i % 2 === 0
          ? TicketStatus.IN_PROGRESS
          : TicketStatus.OPEN,
      priority:
        i % 3 === 0 ? "HIGH" : i % 3 === 1 ? "MEDIUM" : "LOW",
      createdById: createdBy.id,
      assignedToId: assignedTo?.id ?? null,
      slaHours: i % 3 === 0 ? 24 : i % 3 === 1 ? 48 : 72,
    });
  }

  await prisma.ticket.createMany({
    data: ticketsData,
    skipDuplicates: true,
  });

  console.log(`✅ [Section 3A] Seeded ${ticketsData.length} tickets`);
}
