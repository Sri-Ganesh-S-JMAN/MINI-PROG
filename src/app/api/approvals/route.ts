import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { requestId, approvedById, status } = body;

    if (!requestId || !approvedById || !status) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const request = await prisma.assetRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // create approval record
    await prisma.approval.create({
      data: {
        requestId,
        approvedById,
        status,
      },
    });

    let newStatus = request.status;

    if (status === "REJECTED") {
      newStatus = "REJECTED";
    }

    if (status === "APPROVED" && request.status === "PENDING") {
      newStatus = "MANAGER_APPROVED";
    }

    if (status === "APPROVED" && request.status === "MANAGER_APPROVED") {
      newStatus = "ADMIN_APPROVED";
    }

    const updated = await prisma.assetRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
    });

    // if admin approved → allocate asset
    if (newStatus === "ADMIN_APPROVED") {
      await prisma.assetAllocation.create({
        data: {
          assetId: request.assetId,
          userId: request.userId,
        },
      });

      await prisma.asset.update({
        where: { id: request.assetId },
        data: { status: "ALLOCATED" },
      });

      await prisma.assetRequest.update({
        where: { id: requestId },
        data: { status: "ALLOCATED" },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Approval failed" },
      { status: 500 }
    );
  }
}