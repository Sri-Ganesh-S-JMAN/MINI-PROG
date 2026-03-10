import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET ALL REQUESTS
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const whereClause = user.role === "EMPLOYEE" ? { userId: parseInt(user.userId, 10) } : {};

    const requests = await prisma.assetRequest.findMany({
      where: whereClause,
      include: {
        user: true,
        asset: true,
        approvals: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// CREATE REQUEST
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { assetId, reason } = body;

    if (!assetId || !reason) {
      return NextResponse.json(
        { error: "assetId and reason are required" },
        { status: 400 }
      );
    }

    const request = await prisma.assetRequest.create({
      data: {
        userId: parseInt(user.userId, 10),
        assetId: parseInt(assetId.toString(), 10),
        reason,
        status: "PENDING",
      },
      include: {
        user: true,
        asset: true
      }
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}