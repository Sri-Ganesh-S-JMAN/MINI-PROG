import { PrismaClient, RequestStatus, ApprovalStatus } from "@prisma/client";

export default async function seedAssetRequests(
  prisma: PrismaClient
) {
  console.log("🌱 [Final] Seeding asset requests & approvals...");

  const employees = await prisma.user.findMany({
    where: { role: { name: "EMPLOYEE" } },
    select: { id: true },
  });

  const managers = await prisma.user.findMany({
    where: { role: { name: "MANAGER" } },
    select: { id: true },
  });

  const admins = await prisma.user.findMany({
    where: { role: { name: "ADMIN" } },
    select: { id: true },
  });

  const assets = await prisma.asset.findMany({
    where: { status: "AVAILABLE" },
    select: { id: true },
  });

  if (!employees.length || !managers.length || !admins.length || !assets.length) {
    throw new Error("Missing prerequisite data for asset requests");
  }

  // -----------------------------
  // ASSET REQUESTS (250)
  // -----------------------------
  const requests = [];

  for (let i = 0; i < 250; i++) {
    requests.push({
      userId: employees[i % employees.length].id,
      assetId: assets[i % assets.length].id,
      status:
        i % 5 === 0
          ? RequestStatus.REJECTED
          : i % 4 === 0
          ? RequestStatus.ADMIN_APPROVED
          : i % 3 === 0
          ? RequestStatus.MANAGER_APPROVED
          : RequestStatus.PENDING,
    });
  }

  await prisma.assetRequest.createMany({
    data: requests,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${requests.length} asset requests`);

  // -----------------------------
  // APPROVALS (Managers + Admins)
  // -----------------------------
  const createdRequests = await prisma.assetRequest.findMany();

  const approvals:any = [];

  createdRequests.forEach((request, index) => {
    if (request.status === RequestStatus.MANAGER_APPROVED || request.status === RequestStatus.ADMIN_APPROVED) {
      approvals.push({
        requestId: request.id,
        approvedById: managers[index % managers.length].id,
        status: ApprovalStatus.APPROVED,
      });
    }

    if (request.status === RequestStatus.ADMIN_APPROVED) {
      approvals.push({
        requestId: request.id,
        approvedById: admins[index % admins.length].id,
        status: ApprovalStatus.APPROVED,
      });
    }

    if (request.status === RequestStatus.REJECTED) {
      approvals.push({
        requestId: request.id,
        approvedById: managers[index % managers.length].id,
        status: ApprovalStatus.REJECTED,
      });
    }
  });

  await prisma.approval.createMany({
    data: approvals,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${approvals.length} approvals`);
}
