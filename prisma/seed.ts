import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.role.createMany({
    data: [
      { name: "Admin" },
      { name: "Agent" },
      { name: "Employee" },
    ],
    skipDuplicates: true,
  });

  console.log("Roles seeded ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
