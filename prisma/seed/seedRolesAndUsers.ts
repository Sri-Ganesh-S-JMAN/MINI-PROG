import { PrismaClient } from "@prisma/client";

/**
 * SECTION 1
 * Roles + Users
 */
export default async function seedRolesAndUsers(
  prisma: PrismaClient
) {
  console.log("🌱 [Section 1] Seeding roles...");

  // ---- ROLES ----
  await prisma.role.createMany({
    data: [
      { name: "ADMIN" },
      { name: "AGENT" },
      { name: "MANAGER" },
      { name: "EMPLOYEE" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Roles seeded");

  // Fetch role IDs
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const agentRole = await prisma.role.findUnique({ where: { name: "AGENT" } });
  const managerRole = await prisma.role.findUnique({ where: { name: "MANAGER" } });
  const employeeRole = await prisma.role.findUnique({ where: { name: "EMPLOYEE" } });

  if (!adminRole || !agentRole || !managerRole || !employeeRole) {
    throw new Error("❌ Required roles not found after creation");
  }

  console.log("🌱 [Section 1] Seeding users...");

  const usersData = [];

  // ---- ADMINS (5) ----
  for (let i = 1; i <= 5; i++) {
    usersData.push({
      name: `Admin User ${i}`,
      email: `admin${i}@itsm.com`,
      password: "hashed_password",
      roleId: adminRole.id,
    });
  }

  // ---- MANAGERS (20) ----
  for (let i = 1; i <= 20; i++) {
    usersData.push({
      name: `Manager ${i}`,
      email: `manager${i}@itsm.com`,
      password: "hashed_password",
      roleId: managerRole.id,
    });
  }

  // ---- AGENTS (50) ----
  for (let i = 1; i <= 50; i++) {
    usersData.push({
      name: `Support Agent ${i}`,
      email: `agent${i}@itsm.com`,
      password: "hashed_password",
      roleId: agentRole.id,
    });
  }

  // ---- EMPLOYEES (300) ----
  for (let i = 1; i <= 300; i++) {
    usersData.push({
      name: `Employee ${i}`,
      email: `employee${i}@company.com`,
      password: "hashed_password",
      roleId: employeeRole.id,
    });
  }

  await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true,
  });

  console.log(`✅ [Section 1] Seeded ${usersData.length} users`);
}
