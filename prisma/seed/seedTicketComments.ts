import { PrismaClient } from "@prisma/client";
/**
 * SECTION 3B
 * Ticket Comments
 */
export default async function seedTicketComments(
  prisma: PrismaClient
) {
  console.log("🌱 [Section 3B] Seeding ticket comments...");

  const tickets = await prisma.ticket.findMany({
    select: { id: true },
  });

  const users = await prisma.user.findMany({
    select: { id: true },
  });

  if (tickets.length === 0 || users.length === 0) {
    throw new Error("Tickets or users missing. Seed previous sections first.");
  }

  const commentsData:any = [];

  tickets.forEach((ticket, index) => {
    const commentsCount = (index % 5) + 2; // 2–6 comments per ticket

    for (let i = 0; i < commentsCount; i++) {
      const author = users[(index + i) % users.length];

      commentsData.push({
        message: `Comment ${i + 1} on ticket ${ticket.id}. Follow-up update provided.`,
        ticketId: ticket.id,
        userId: author.id,
      });
    }
  });

  await prisma.ticketComment.createMany({
    data: commentsData,
    skipDuplicates: true,
  });

  console.log(`✅ [Section 3B] Seeded ${commentsData.length} ticket comments`);
}
