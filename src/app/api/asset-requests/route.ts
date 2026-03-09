import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET ALL REQUESTS
export async function GET() {
  try {
    const requests = await prisma.assetRequest.findMany({
      include: {
        user: true,
        asset: true,
        approvals: true,
      },
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
    const body = await req.json();

    const { userId, assetId, reason } = body;

    if (!userId || !assetId || !reason) {
      return NextResponse.json(
        { error: "userId, assetId and reason are required" },
        { status: 400 }
      );
    }

    const request = await prisma.assetRequest.create({
      data: {
        userId,
        assetId,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}