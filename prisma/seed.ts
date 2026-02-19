import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import seedRolesAndUsers from "./seed/seedRolesAndUsers";
import seedAssets from "./seed/seedAssets";
import seedTickets from "./seed/seedTickets";
import seedTicketComments from "./seed/seedTicketComments";
import seedAssetRequests from "./seed/seedAssetRequests";
import seedAllocationsAndNotifications from "./seed/seedAllocationsAndNotifications";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting database seeding...");

  await seedRolesAndUsers(prisma);
  await seedAssets(prisma);
  await seedTickets(prisma);
  await seedTicketComments(prisma);
  await seedAssetRequests(prisma);
  await seedAllocationsAndNotifications(prisma);

  console.log("🎉 Database seeding completed successfully");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
