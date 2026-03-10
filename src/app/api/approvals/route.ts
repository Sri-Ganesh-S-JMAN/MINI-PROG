import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { requestId, status } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Verify the approver exists
    const approver = await prisma.user.findUnique({
      where: { id: parseInt(user.userId, 10) },
      include: { role: true },
    });

    if (!approver) {
      return NextResponse.json(
        { error: "Approver not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Allow only ADMIN or AGENT to approve
    if (
      approver.role.name !== "ADMIN" &&
      approver.role.name !== "AGENT"
    ) {
      return NextResponse.json(
        { error: "Only ADMIN or AGENT can approve requests" },
        { status: 403 }
      );
    }

    // 3️⃣ Find the asset request
    const request = await prisma.assetRequest.findUnique({
      where: { id: Number(requestId) },
      include: {
        asset: true,
        user: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Asset request not found" },
        { status: 404 }
      );
    }

    // 4️⃣ Create approval record
    await prisma.approval.create({
      data: {
        requestId: request.id,
        approvedById: approver.id,
        status: status,
      },
    });

    // 5️⃣ If rejected
    if (status === "REJECTED") {
      const updated = await prisma.assetRequest.update({
        where: { id: request.id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({
        message: "Request rejected",
        request: updated,
      });
    }

    // 6️⃣ Approve and allocate asset

    const updatedRequest = await prisma.assetRequest.update({
      where: { id: request.id },
      data: { status: "ALLOCATED" },
    });

    // create allocation record
    await prisma.assetAllocation.create({
      data: {
        assetId: request.assetId,
        userId: request.userId,
      },
    });

    // update asset status
    await prisma.asset.update({
      where: { id: request.assetId },
      data: { status: "ALLOCATED" },
    });

    return NextResponse.json({
      message: "Request approved and asset allocated",
      request: updatedRequest,
    });

  } catch (error) {
    console.error("APPROVAL ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}