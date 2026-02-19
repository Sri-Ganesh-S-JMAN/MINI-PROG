import { PrismaClient, AssetStatus } from "@prisma/client";

/**
 * SECTION 2
 * Assets
 */
export default async function seedAssets(
  prisma: PrismaClient
) {
  console.log("🌱 [Section 2] Seeding assets...");

  const assetsData = [];

  // ---- LAPTOPS (80) ----
  for (let i = 1; i <= 80; i++) {
    assetsData.push({
      name: `Laptop ${i}`,
      serialNo: `LAP-${1000 + i}`,
      status:
        i % 10 === 0 ? AssetStatus.IN_REPAIR : AssetStatus.AVAILABLE,
    });
  }

  // ---- DESKTOPS (60) ----
  for (let i = 1; i <= 60; i++) {
    assetsData.push({
      name: `Desktop ${i}`,
      serialNo: `DESK-${2000 + i}`,
      status:
        i % 15 === 0 ? AssetStatus.RETIRED : AssetStatus.AVAILABLE,
    });
  }

  // ---- MONITORS (50) ----
  for (let i = 1; i <= 50; i++) {
    assetsData.push({
      name: `Monitor ${i}`,
      serialNo: `MON-${3000 + i}`,
      status: AssetStatus.AVAILABLE,
    });
  }

  // ---- PRINTERS (20) ----
  for (let i = 1; i <= 20; i++) {
    assetsData.push({
      name: `Printer ${i}`,
      serialNo: `PRN-${4000 + i}`,
      status:
        i % 5 === 0 ? AssetStatus.IN_REPAIR : AssetStatus.AVAILABLE,
    });
  }

  // ---- NETWORK DEVICES (20) ----
  for (let i = 1; i <= 20; i++) {
    assetsData.push({
      name: `Network Device ${i}`,
      serialNo: `NET-${5000 + i}`,
      status: AssetStatus.AVAILABLE,
    });
  }

  // ---- MISC IT EQUIPMENT (30) ----
  for (let i = 1; i <= 30; i++) {
    assetsData.push({
      name: `IT Equipment ${i}`,
      serialNo: `IT-${6000 + i}`,
      status:
        i % 8 === 0 ? AssetStatus.RETIRED : AssetStatus.AVAILABLE,
    });
  }

  await prisma.asset.createMany({
    data: assetsData,
    skipDuplicates: true,
  });

  console.log(`✅ [Section 2] Seeded ${assetsData.length} assets`);
}
