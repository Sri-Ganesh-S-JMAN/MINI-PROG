import { prisma } from "../src/lib/prisma";
import seedRolesAndUsers from "./seed/seedRolesAndUsers";
import seedAssets from "./seed/seedAssets";
import seedTickets from "./seed/seedTickets";
import seedTicketComments from "./seed/seedTicketComments";
import seedAssetRequests from "./seed/seedAssetRequests";
import seedAllocationsAndNotifications from "./seed/seedAllocationsAndNotifications";

async function main() {
  console.log("🌱 Starting full database seeding...");

  await seedRolesAndUsers(prisma);
  await seedAssets(prisma);
  await seedTickets(prisma);
  await seedTicketComments(prisma);
  await seedAssetRequests(prisma);
  await seedAllocationsAndNotifications(prisma);

  console.log("✅ Full database seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
